---
categories: Dev
cover: ../post_images/vLLM.jpg
date: 2025-06-09 21:58:37
description: 本文会介绍著名的开源推理框架 vLLM（v1）和其在昇腾上的插件。
tags: [Python, Large Language Model]
title: vLLM 推理引擎和 Ascend 插件
updated: 2025-12-03
---

## vLLM V1 Block

本章节基于 [v0.9.0 分支的 V1 版本](https://github.com/vllm-project/vllm/tree/releases/v0.9.0/vllm/v1/core)，自底向上分析 vLLM 灵魂特性 KV Cache Page Attention 中的块（Block）管理。这块内容可以参考 kaiyuan 详细的分析：[vLLM 的 prefix cache 为何零开销](https://zhuanlan.zhihu.com/p/1896927732027335111)。

### 底层：KVCacheBlock 和 FreeKVCacheBlockQueue

最底层的 **KVCacheBlock** 使用了引用计数和双向链表，其中 block_hash=None 指的是未满块（暂未哈希）。

```python
class KVCacheBlock:
    # Block ID, ranging from 0 to num_gpu_blocks - 1.
    block_id: int
    # Reference count.
    ref_cnt: int = 0
    # The hash of the block composed of (block hash, tuple of token IDs).
    # It is only available when the block is full.
    _block_hash: Optional[BlockHashType] = None

    # Used to construct a doubly linked list for free blocks.
    # These two attributes should only be manipulated by FreeKVCacheBlockQueue.
    prev_free_block: Optional["KVCacheBlock"] = None
    next_free_block: Optional["KVCacheBlock"] = None
```

**FreeKVCacheBlockQueue** 是 V1 架构里十分出彩的结构设计，内部维护了一个 blocks 列表和 head/tail 指针，支持 `remove(any_existing_block)`、`append(new_end_block)`、`pop_left(front_block)`的双向链表基本操作。其内含的设计哲学是：**设计一个结构体来统一维护无引用计数（相关请求均已结束）但未来可能可复用的这批块**。新请求尝试复用时也会尝试去这个队列里（用哈希）匹配，匹配成功则可复用此块结果，无需重新计算 KV Cache；申请新块时，如果存量空块不足，可以再从这个链表里淘汰一些旧块。

```python
class FreeKVCacheBlockQueue:
    def __init__(self, blocks: list[KVCacheBlock]) -> None:
        self.num_free_blocks = len(blocks)

        # Initialize the doubly linked list of free blocks.
        self.free_list_head: Optional[KVCacheBlock] = blocks[0]
        self.free_list_tail: Optional[KVCacheBlock] = blocks[-1]
        for i in range(self.num_free_blocks):
            if i > 0:
                blocks[i].prev_free_block = blocks[i - 1]
            if i < self.num_free_blocks - 1:
                blocks[i].next_free_block = blocks[i + 1]
```

官方称这里用到了 Zero-Overhead Prefix Caching 技术，因为双向链表会带来如下好处：

1. 复用成功时支持 $O(1)$ 移除这个块。
2. 天然支持 LRU 淘汰策略，即释放请求时将块塞入队尾、征用空间时将队首块取出。

### 中层：BlockPool

**BlockPool** 结构体用 blocks 列表维护全量块信息，用 **free_block_queue** 维护上述空闲但可复用的双向队列，并维护 **cached_block_hash_to_block** 字典用来从块哈希映射到块本身。根据官方的描述，他们保留了可能出现哈希值相同的场景，辅助用 block_id 来保证索引唯一，这一点我甚感奇怪。

```python
class BlockPool:
    """BlockPool that manages KVCacheBlocks.
    It provides methods to allocate, free and cache the kv cache blocks. The
    free_block_queue stores the free blocks in eviction order to enable
    allocation, free, and cache eviction. The cached_block_hash_to_block
    maps between block hash and cached block to support finding cached blocks
    by their block hash.
    """

    def __init__(
        self,
        num_gpu_blocks: int,
        enable_caching: bool,
        enable_kv_cache_events: bool = False,
    ):
        assert isinstance(num_gpu_blocks, int) and num_gpu_blocks > 0
        self.num_gpu_blocks = num_gpu_blocks
        self.enable_caching = enable_caching
        self.blocks: list[KVCacheBlock] = [
            KVCacheBlock(idx) for idx in range(num_gpu_blocks)
        ]
        self.free_block_queue = FreeKVCacheBlockQueue(self.blocks)
        self.cached_block_hash_to_block: dict[BlockHashType, dict[
            int, KVCacheBlock]] = defaultdict(dict)
        self.null_block = self.free_block_queue.popleft()
        self.enable_kv_cache_events = enable_kv_cache_events
        self.kv_event_queue: list[KVCacheEvent] = []
```

**BlockPool** 提供以下几个关键方法：

+ `get_cached_block(block_hash)`：利用映射表查找特定哈希的块，若命中多个则默认返回第一个。
+ `cache_full_blocks(request, cached_blocks, goal_blocks, ...)`：将一段完整块进行哈希运算并保存下来。哈希函数可自定义，默认是 sha256。这里加了个优化，当前请求在尝试匹配时可能已经算过一遍前缀哈希了，参数里支持传入缓存结果 `block_hashes`，函数会从未缓存处开始计算。吐槽一下 request 这个参数，BlockPool 不应该感知请求的具体结构，而应拆解成所需的内容（主要是用来哈希）。
+ `get_new_blocks(num_blocks)`：新征用指定个块。从 free_block_queue 队首取出 num_blocks 个块并把它们的引用计数 $+1$。若某些块已存在哈希值，需要清空并从 cached_block_hash_to_block 中移除。
+ `touch(blocks)`：表示征用 blocks 列表里的块（暂时不能被释放），用于当前请求命中哈希的场景。做法是遍历 blocks 列表进行引用计数 $+1$，若从 $0$ 变 $1$ 则需从 free_block_queue 里移除。
+ `free_blocks(ordered_blocks)`：将 ordered_blocks 列表里的块释放，用于当前请求已结束的场景。按顺序遍历 ordered_blocks 列表进行引用计数 $-1$，若从 $1$ 变 $0$ 则需插入 free_block_queue 尾部。

注意到 **BlockPool** 里还维护了 **KVCacheEvent** 事件列表。当新保存哈希块或从映射表中移除哈希块时，分别会触发 BlockStored 和 BlockRemoved 事件，并记录所有相关参数。

### 上层：SingleTypeKVCacheManager

**SingleTypeKVCacheManager** 是包装了 BlockPool 的上层结构。之所以加了 *SingleType* 这个怪前缀，应该是为了兼容不同类型 KV Cache（这个类会根据传入的单个 KVCacheSpec 处理单个类型），目前实现了两个派生类 **FullAttentionManager** 和 **SlidingWindowManager**。

```python
def __init__(
        self,
        kv_cache_spec: KVCacheSpec,
        block_pool: BlockPool,
        use_eagle: bool,
        num_kv_cache_groups: int,
        caching_hash_fn: Callable,
    ) -> None:
        self.block_size = kv_cache_spec.block_size
        self.kv_cache_spec = kv_cache_spec
        self.block_pool = block_pool
        # use_eagle=True 时 find_longest_cache_hit() 需要特殊处理
        self.use_eagle = use_eagle
        self.req_to_blocks: defaultdict[str, list[KVCacheBlock]] = defaultdict(list)
        self.num_cached_block: dict[str, int] = {}
        self.num_kv_cache_groups = num_kv_cache_groups
        self.caching_hash_fn = caching_hash_fn
```

除了核心的 BlockPool 实例之外，SingleTypeKVCacheManager 会维护两个字典：

+ `self.req_to_blocks`：记录从请求到已开辟块列表的映射，官方注释说用于请求结束时定位待释放块。
+ `self.num_cached_block`：记录每个请求已缓存的块数。官方注释提到只会记录 Running 状态的请求，不记录 Reempted 状态的请求。

我认为从这层开始感知请求是比较合理的。不过这两个字典会让人很迷惑，因为后者就像是前者取 `len()`。分析代码后发现两者并不是实时同步的：`self.req_to_blocks` 会忠实地记录**每个请求已复用的或新开辟的块**，而 `self.num_cached_block` 仅会计数 **每个请求中已进入可复用哈希阶段的块数**。

SingleTypeKVCacheManager 核心方法如下：

```python
# 根据请求 tokens 总数（包括本次已命中的或之前已分配空间的）和本次命中的块列表，判断要新分配多少块。
def get_num_blocks_to_allocate(self, request_id: str, num_tokens: int, new_computed_blocks: list[KVCacheBlock]) -> int:
    num_required_blocks = cdiv(num_tokens, self.block_size)
    # 我理解在实际场景下，减掉的两者不可能同时超过 0。
    num_new_blocks = (num_required_blocks - len(new_computed_blocks) -len(self.req_to_blocks[request_id]))
    # 需要补上那些命中但引用计数 =0 的块，这些块其实在 FreeKVCacheBlockQueue 里，所以需显式新建。
    num_evictable_computed_blocks = sum(blk.ref_cnt == 0 for blk in new_computed_blocks)
    return ((num_new_blocks + num_evictable_computed_blocks) * self.num_kv_cache_groups)

# 保存本次请求命中哈希的块列表，更新内部的 self.req_blocks 和 self.num_cached_block。
def save_new_computed_blocks(self, request_id: str, new_computed_blocks: list[KVCacheBlock]) -> None:
    if request_id not in self.num_cached_block:
        # 这个分支表示新请求，记录 Prefill 利用成功的哈希块
        req_blocks = self.req_to_blocks[request_id]
        assert len(req_blocks) == 0
        # 这里 self.req_blocks 和 self.num_cached_block 是同步更新的
        req_blocks.extend(new_computed_blocks)
        self.num_cached_block[request_id] = len(new_computed_blocks)
    else:
        # 这个分支表示已有请求（即 Decode），所以不会再复用哈希块
        assert len(new_computed_blocks) == 0

# 真正根据请求 tokens 总数分配新块（基于已经做了上述函数更新内部状态）
def allocate_new_blocks(self, request_id: str, num_tokens: int) -> list[KVCacheBlock]:
    req_blocks = self.req_to_blocks[request_id]
    num_required_blocks = cdiv(num_tokens, self.block_size)
    num_new_blocks = num_required_blocks - len(req_blocks)
    if num_new_blocks <= 0:
        return []
    else:
        new_blocks = self.block_pool.get_new_blocks(num_new_blocks * self.num_kv_cache_groups)
        # 这里只是新分配块，所以不会更新 self.num_cached_block
        req_blocks.extend(new_blocks)
        return new_blocks

# 把当前请求未缓存的部分给缓存
def cache_blocks(self, request: Request, block_hashes: list[BlockHashType], num_tokens: int) -> None:
    num_cached_blocks = self.num_cached_block[request.request_id]
    num_full_blocks = num_tokens // self.block_size

    self.block_pool.cache_full_blocks(
        request=request,
        blocks=self.req_to_blocks[request.request_id],
        block_hashes=block_hashes,
        num_cached_blocks=num_cached_blocks,
        num_full_blocks=num_full_blocks,
        block_size=self.block_size,
        hash_fn=self.caching_hash_fn,
    )
    self.num_cached_block[request.request_id] = num_full_blocks

# 把和某个请求相关的所有信息全部清空
def free(self, request_id: str) -> None:
    req_blocks = self.req_to_blocks.pop(request_id, [])
    # free_blocks 接收的列表是有顺序的
    ordered_blocks = reversed(req_blocks)
    self.block_pool.free_blocks(ordered_blocks)
    self.num_cached_block.pop(request_id, None)
```

SingleTypeKVCacheManager 的子类会提供不同 cache 命中功能的函数。以 FullAttentionManager 为例：

```python
def find_longest_cache_hit(self, block_hashes: list[BlockHashType], max_length: int) -> list[KVCacheBlock]:
    computed_blocks: list[KVCacheBlock] = []
    max_num_blocks = max_length // self.block_size
    for i in range(max_num_blocks):
        block_hash = block_hashes[i]
        if cached_block := self.block_pool.get_cached_block(block_hash):
            computed_blocks.append(cached_block)
        else:
            break
    if self.use_eagle and len(computed_blocks) > 0:
        computed_blocks.pop()
    return computed_blocks
```

### 封装层：KVCacheManager

KVCacheManager 包装了更多的业务相关的语义，比如感知 Page Attention 里的 block_size 和 block_number，定义哈希函数、日志和监控。单从块管理角度来说，在核心的 SingleTypeKVCacheManager 字段基础上额外维护了一个 `self.req_to_block_hashes` 字段，用来缓存同一个请求在不同函数调用时的哈希值，减少冗余计算。

```python
class KVCacheManager:
    def __init__(
        self,
        kv_cache_config: KVCacheConfig,
        max_model_len: int,
        enable_caching: bool = True,
        caching_hash_algo: str = "builtin",
        use_eagle: bool = False,
        log_stats: bool = False,
        enable_kv_cache_events: bool = False,
    ) -> None:
        assert len(kv_cache_config.kv_cache_groups) == 1
        kv_cache_spec = kv_cache_config.kv_cache_groups[0].kv_cache_spec
        self.block_size = kv_cache_spec.block_size
        self.num_gpu_blocks = kv_cache_config.num_blocks
        self.max_model_len = max_model_len

        self.enable_caching = enable_caching
        self.caching_hash_fn = sha256 if caching_hash_algo == "sha256" else hash
        self.use_eagle = use_eagle
        self.log_stats = log_stats
        self.prefix_cache_stats = PrefixCacheStats() if log_stats else None
        self.block_pool = BlockPool(self.num_gpu_blocks, enable_caching, enable_kv_cache_events)
        self.single_type_manager = get_manager_for_kv_cache_spec(
            kv_cache_spec=kv_cache_spec,
            block_pool=self.block_pool,
            use_eagle=self.use_eagle,
            num_kv_cache_groups=1,
            caching_hash_fn=self.caching_hash_fn,
        )
        self.req_to_block_hashes: defaultdict[str, list[BlockHashType]] = defaultdict(list)
```

核心函数只有两个，正好覆盖了 Prefix Cache 的前缀查询和正式分配两大功能。

```python
def get_computed_blocks(self, request: Request) -> tuple[KVCacheBlocks, int]:
    # 不使用 Prefix Cache 的场景
    if (not self.enable_caching or request.sampling_params.prompt_logprobs is not None):
        return KVCacheBlocks.create_empty(), 0
    
    block_hashes = self.req_to_block_hashes[request.request_id]
    if not block_hashes:
        block_hashes = hash_request_tokens(self.caching_hash_fn, self.block_size, request)
        self.req_to_block_hashes[request.request_id] = block_hashes

    if self.log_stats:
        assert self.prefix_cache_stats is not None
        self.prefix_cache_stats.requests += 1

    # 若所有 tokens 命中，需减少一个 token 保证至少跑一次。这里实现得比较糙，在块粒度上 -1。
    max_cache_hit_length = request.num_tokens - 1
    computed_blocks = self.single_type_manager.find_longest_cache_hit(block_hashes, max_cache_hit_length)
    num_computed_tokens = len(computed_blocks) * self.block_size
    if self.log_stats:
        assert self.prefix_cache_stats is not None
        self.prefix_cache_stats.queries += request.num_tokens
        self.prefix_cache_stats.hits += num_computed_tokens
    return KVCacheBlocks(computed_blocks), num_computed_tokens

def allocate_slots(
    self,
    request: Request,
    # 本次新增（未复用）的 token 数量
    num_new_tokens: int,
    # 本次新复用的 token 数量（一定是 new_computed_blocks 的 block_size 倍）
    num_new_computed_tokens: int = 0,
    new_computed_blocks: Optional[KVCacheBlocks] = None,
    num_draft_tokens: int = 0,
    num_lookahead_tokens: int = 0,
    delay_cache_blocks: bool = False,
) -> Optional[KVCacheBlocks]:
    if num_new_tokens == 0:
        raise ValueError("num_new_tokens must be greater than 0")
    if new_computed_blocks is not None:
        new_computed_block_list = new_computed_blocks.blocks
    else:
        new_computed_block_list = []
    num_computed_tokens = (request.num_computed_tokens + num_new_computed_tokens)
    num_tokens_need_slot = min(num_computed_tokens + num_new_tokens + num_lookahead_tokens, self.max_model_len)
    num_blocks_to_allocate = (
        self.single_type_manager.get_num_blocks_to_allocate(
            request_id=request.request_id,
            num_tokens=num_tokens_need_slot,
            new_computed_blocks=new_computed_block_list,
        ))
    if num_blocks_to_allocate > self.block_pool.get_num_free_blocks():
        return None
    if self.enable_caching:
        self.block_pool.touch(new_computed_block_list)
    else:
        assert not new_computed_block_list, ("Computed blocks should be empty when prefix caching is disabled")
    # 通过 num_blocks_to_allocate 判定后才会正式分配 block
    self.single_type_manager.save_new_computed_blocks(request.request_id, new_computed_block_list)
    new_blocks = self.single_type_manager.allocate_new_blocks(request.request_id, num_tokens_need_slot)
    # 特殊场景下仅复用哈希块，但不利用本次新增的块
    if not self.enable_caching or delay_cache_blocks:
        return KVCacheBlocks(new_blocks)
    # 正式利用本次新增的块
    self.single_type_manager.cache_blocks(
        request, self.req_to_block_hashes[request.request_id],
        num_computed_tokens + num_new_tokens - num_draft_tokens)

    return KVCacheBlocks(new_blocks)
```

这段代码有个 trick 的点是：`allocate_slots()` 在开辟完新块后，就会直接尝试把新的完整块的哈希利用起来。考虑接连到来的两个请求，如果它们的 tokens 列表完全相同，后者在逻辑上会直接复用前者的哈希块，但前者在 GPU worker runner 处其实还没算出来。针对这个疑惑的分析如下：

+ 由于 Python 的 GIL 特性，每个 EngineCore 下的 Scheduler 会单线程处理并发请求，并发上没有问题。
+ 在 GPU Worker Runner 执行时，即便两个请求处于同一个 batch，它们应该会各自触发 forward 计算对应的 KV Cache，并尝试对同一个 GPU block list 进行相同内容的写入操作，也没有问题。

## vLLM V1 Scheduler

处理 running 队列逻辑（分块 Prefill 或 Decode 场景）： 

1. 记 `num_new_tokens` 是本次计划新增处理的 tokens 数，`num_draft_tokens` 表示包含这些 token 里有多少是属于投机解码的 tokens 数。 
2. 调用 `kv_cache_manager.allocate_slots()` 获得新分配的 block id 列表，核心参数是上述两个。 
3. 如果无法分配 block，就弹出 running 队列末端请求、调用 `kv_cache_manager.free(request)` 回收资源、将其标记为抢占并移入 waiting 队列，并重复 2 操作。如果弹出的是当前请求则 break。 

如果没有被抢占的任务遗留，处理 waiting 队列逻辑（Prefill 场景） ：

1. 调用 `kv_cache_manager.get_computed_blocks(request)`，获得可复用的 block 数和对应 token 数。 
2. 调用 `connector.get_num_new_matched_tokens(request, 已能复用 token 数)`，获得额外能复用的 token 数和 `load_kv_async` 标记。 
3. 调用 `kv_cache_manager.allocate_slots()` 获得新分配的 block id 列表，核心参数包括需要分配 KV Cache 空间的新 token 数（即使是 connector 可复用的），本地可复用的 block 数和 token 数（不包含 connector 可复用的）。如果有 `load_kv_async=true`，则传入的 `delay_cache_blocks=true`，表示新分配的 block 暂停立即 cache 的过程。 
4. 如果 connector 可复用，调用 `connector.update_state_after_alloc()`，参数包括总 block 数量（包括上一步开辟的新 block 数量）和刚才已计算出的 connector 可复用的 token 数量。 
5. 将当前 request 移出 waiting 队列。如果 `load_kv_async=true`， 移入 skipped_waiting_requests 队列并 continue；否则移入 running 队列。 
6. 记录 `num_scheduled_tokens[request_id]` 为需要新算的 token 数（不包括 connector 可复用的）。记录 `request.num_computed_tokens` 为复用的 token 数（包括 connector 可复用的）。 

收尾工作：

1. 将 skipped_waiting_requests 队列移入 waiting 队列最靠前的位置。 
2. 如果 running 队列里有任务，任取一个调用 `kv_cache_manager.get_num_common_prefix_blocks()`，计算出 `num_common_prefix_blocks` 记录进 `scheduler_output` 
3. 包装 `scheduler_output` 并调用 `connector.build_connector_meta(scheduler_output)`。 
4. 触发 `kv_cache_manager.take_events()`。 
5. 将每个 `request.num_computed_tokens` 更新上其 `num_scheduled_token`。

## vLLM V1 EngineCore 和 Executor

EngineCore 初始化：

1. 根据 executor_class 初始化 model_executor。 
2. 执行 `self._initialize_kv_caches()`：从 model_executor 里调用 `get_kv_cache_specs()` 和 `determine_available_memory()` 获取每个设备信息，取可行 block 最小值。这些函数会通过 rpc 调用每个worker 的 `determine_available_memory()` 和每个 worker_runner 的 `get_kv_cache_specs()`。 
3. 调用 model_executor 的 `initialize_from_config()`。这个函数通过 rpc 调用每个设备的 model_runner 的 `initialize_kv_cache()` 函数。 
4. 初始化 scheduler。

## vLLM V1 WorkerRunner



## Ascend
