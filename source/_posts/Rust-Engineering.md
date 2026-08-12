---
categories: Lang
cover: ../post_images/Rust.jpg
date: 2026-05-20 08:28:52
description: 记录了我对 Rust 语言的系统性学习。
tags: [Digest, Rust]
title: Rust 进阶
updated: 2026-05-20
---

这篇博文我将详细介绍 Rust 这门语言。从创建本博客至此刻大更新（2026-5），我的 Rust 开发经验已是四年有余了——我认为它是互联网厂商泛工程开发中最合适的语言。根据我的体验，它至少拥有以下优点：

+   好用的语言特性。可提高安全性的强语言类型、提高开发效率的自动类型推导、成熟的流操作等等。
+   舒适的开发环境。VSCode+RA，rust-fmt 和 rust-clippy 等工具让代码开发成为一种享受。
+   良好的异步引擎。不用基于麻烦的回调或 Webflux，像同步代码一样写异步！
+   高效。据传 Rust 和 C 的代码速度比是 1.07:1。这个特性让 Rust 能用在量化交易系统和链上系统。
+   安全。这是 Rust 被吹得最多的一点，诸如“内存绝对安全“、”只要过编译就罕有 bug”。我对这个特性的认知比较保守：至少，Rust 拥有一个强大的编译器，借用检查、生命周期等机制能有效降低内存泄漏的可能性。
+   优秀的包管理系统和良好的生态。Cargo 不能说是最强的包管理系统，但肯定是好用者之一。

Rust 的缺点不多，体感最强烈的是编译速度太慢。~~一般我敲入编译或测试的命令时就会去茶水间打水~~。

【这篇文章完成度较低，将不定期更新】

## Unsafe 编程

unsafe 关键字可以修饰函数、代码块、trait 定义和 impl 块。

+ 用 unsafe 修饰的 trait 在 impl 的时候必须也加上 unsafe，不能和 safe 的混合使用。
+ unsafe 函数以为这个函数在某些场景下安全、某些场景下不安全，其调用必须在 unsafe 上下文中。和其他语言交互的 ffi 函数 `extern "C"` 会被隐式地带上 unsafe 修饰。
+ unsafe block 指需要使用 unsafe 代码作为内部实现（且当前上下文已经满足安全条件），如解裸指针。

### 裸指针

裸指针为基本原生类型，分 `*const T` 和 `*mut T` 表示是否能修改指向数据。

+ 没有生命周期，不会自动执行任何内存安全检查，不保证指向有效的内存。
+ 不能实现任何自动清理功能（不能自动 drop）。注意 `*ptr = data` 会调用旧值的 drop。
+ 允许为空，用 `ptr::NonNull<T>` 表示非空且协变的可变裸指针。
+ 不支持隐式转换，需要用 `as` 关键字转换。
+ 只能在 unsafe 上下文中解引用。

裸指针的获取方式：直接获取、`Box::into_raw()`、`std::ptr::addr_of!()`、从 C 中传递。

```rust
let my_num: i32 = 10;
let my_num_ptr: *const i32 = &my_num;
let mut my_speed: i32 = 88;
let mut my_speed_ptr: *mut i32 = &mut my_speed;

let my_speed: Box<i32> = Box::new(88);
let my_speed: *mut i32 = Box::into_raw(my_speed);
unsafe {
    drop(Box::from_raw(my_speed));
}
```

ptr 模块常用的安全抽象方法：

```rust
// 会按字节对齐的 T 的大小计算偏移量，内部没有做边界检查
pub const unsafe fn offset<T>(self, count: isize) -> *const T / *mut T
pub const unsafe fn add<T>(self, count: usize) -> *const T / *mut T
// 按位复制，复制位数为 count*size_of::<T>()
pub const unsafe fn copy<T>(src: *const T, dst: *mut T, count: usize)
// 在不读取或 Drop 旧值的情况下覆盖内存位置；要求内存地址对 T 对齐，否则用 write_unaligned。
// 如果是敏感信息，建议用 std::ptr::write_volatile() 函数。
pub const unsafe fn write<T>(dst: *mut T, src: T)
// 和 write 类似，额外返回旧值。更推荐使用 std::mem::replace
pub const unsafe fn replace<T>(dst: *mut T, src: T) -> T
// 从指针指向内存读取一个值，但不改变所有权；要求内存地址对 T 对齐，否则用 read_unaligned。
pub const unsafe fn read<T>(src: *const T) -> T
// 要求 x 和 y 都初始化且对 T 对齐，两者指向位置可能重叠。更推荐使用 std::mem::swap
pub const unsafe fn swap<T>(x: *mut T, y: *mut T)
```

### 内存布局

如果一个结构体实现了 Sized，就在编译时有了确定的大小和对齐量，可以使用 `std::mem::size_of()`  和 `std::mem::align_of()` 计算对应的类型大小和对齐量。用 `repr` 更换对齐方式。

+ **结构体和元组** 布局规则一致：对齐量等于所有成员中对齐量的最大值，成员之间可能会留空隙。
+ **枚举** 的 Tag 固定占一个字节，占用空间是每个成员的布局最大值加上一字节（没有优化的情况下）。
+ **Option** 类型有特殊的优化，可以用零值表示 None，从而压缩掉 Tag 的字节。

| repr 规则     | 含义                                                         |
| ------------- | ------------------------------------------------------------ |
| default       | Rust 默认排布风格，不保证成员的排列顺序和稳定性。            |
| `C`           | C 风格排布，无优化。成员有序，会根据对齐量填空隙，枚举类型是枚举值和 union 两段 |
| `packed(n)`   | 在基本对齐规则上，将结构体的对齐量减少到 `n`，成员之间的间隙按新对齐量填充。 |
| `align(n)`    | 在基本对齐规则上，保证结构体的对齐量至少是 `n`（`n` 是 2 的幂次）。 |
| `<int_type>`  | 声明枚举类型的 tag 的存储类型                                |
| `transparent` | 用于单成员的结构体/枚举，表明内外有相同的内存布局。          |

Union 类型通常只用于和 C 交互，所有字段共享同一段存储，对某个字段的 mut 引用等价于对整个结构体。

Union 类型可以实现 Drop Trait，但其所有字段类型必须满足以下之一：实现了 Copy Trait 的类型， `&T` 或者 `&mut T` 类型，`ManuallyDrop<T>` 类型，以上类型组成的元组或数组类型。

对 Union 类型的成员变量 **读操作** 必须 unsafe，包括常见的模式匹配来读取。

### FFI

FFI（*Foreign Function Interface*）是一种编程技术，允许在一个语言中调用另一个语言便携的函数。Rust 的 FFI 特点是安全和高效。Rust 提供了丰富的类型和抽象来安全地、无额外开销地处理 C 语言的数据和函数。

ABI（*Application Binary Interface*）定义了函数调用细节（包括参数传递、返回值和寄存器等），调用双方要同时遵守。Rust 中的 FFI 安全性主要依赖于正确的 ABI 和正确的类型转换：函数签名（参数类型、参数顺序和返回类型）需要完全一致；数据布局要保持一致，Rust 结构体用 `#[repr(C)]`  表示 C 布局；交互时对象的生命周期需要正确地手动管理；Rust 的 Panic 和 C++ 的异常是互相不兼容的，在 ABI 边界要处理好所有异常。

用 `extern <abi>` 声明 FFI 时的 ABI，常见的包括：

+ `Rust`：Rust 自身的函数，可以认为 `fn f()` 带有 `extern "Rust"`。
+ `C`：与 C 交互的标准 ABI，`extern fn f()` 时的默认值。
+ `stdcall`：部分与 Win32 强相关的与 C 交互的 ABI。
+ `system`：一般等价于 `C`，在不同系统里自动转化（如 Win32 系统里相当于 `stdcall`）。

类型对照表：

| C 类型                                    | Rust 类型                      |
| ----------------------------------------- | ------------------------------ |
| `void`                                    | `()`                           |
| `void *`                                  | `*mut c_void`                  |
| `int8_t, uint8_t, int16_t, ..., uint64_t` | `i8, u8, i16, ..., u64`        |
| `float, double`                           | `f32, f64`                     |
| `char, unsigned char, signed char`        | `c_char, c_uchar, c_schar`     |
| `(unsigned) short/int/long/long long`     | `c_(u)short/int/long/longlong` |
| `size_t, ptrdiff_t`                       | `usize, isize`                 |
| `char *, const char *`                    | `*mut c_char, *const c_char`   |
| `struct, union, enum`                     | `struct, union, enum/i32`      |

Rust 里的 `String` 和 `&str` 表示一定有效的 UTF-8 字符串数据。

+ `ffi::CString` 用于表示传递给 C 的字符串，末尾带有 `\0`，对应的切片是 `CStr`。
+ `ffi::OsString` 用于表示平台原生字符串类型，对应的切片是 `OsStr`：Windows 系统中是非零的 16 位值的任意序列，一般为 UTF-16；Unix 系统中由非零字节组成的 8 位值的任意序列，一般为 UTF-8。

智能指针、宽指针和函数在 Rust 和 C 转换时需要和 `*mut c_void` 交互，可用 Box 中转。

```rust
pub extern "C" fn create_my_struct_for_c(value: i32) -> *mut c_void {
	let mu_struct = MyStruct { value };
    let boxed: Box<dyn MyTrait> = Box::new(my_struct);
    Box::into_raw(boxed) as *mut c_void
}
pub extern "C" fn call_back_from_c(closure: *mut c_void) where F: FnOnce {
    let closure = Box<F> = unsafe { Box::from_raw(closure as *mut F) };
    closure();
}
```

`MaybeUninit<T>` 是 Rust 标准库提供的结构，表示可能没有被初始化的内存，适合和 C 交互。

```rust
let mut x = MaybeUninit::<i32>::uninit();
unsafe {
	x.as_mut_ptr().write(5); // 如果不执行这句话，会导致未定义行为。
}
let x_init = unsafe { x.assume_init(); }; 
```

`ManuallyDrop<T>` 是 Rust 标准库提供的包装类型，用于阻止其包装的类型 T 的析构函数的自动调用。

`GlobalAlloc` 是 Rust 中用于自定义内存分配器的 trait，当前仅能全局替换所有类型的分配方式。

## Async 异步编程

Rust 的异步模型基于“协作式多任务”和“零成本抽象”。与 Go 的 goroutine 包含独立栈不同，Rust 的 `async` 函数在编译期会被转换为一个实现了 `Future` trait 的状态机。这个状态机是无栈的（Stackless），它将跨越 `await` 点的局部变量保存在一个匿名结构体中，因此在内存分配上极其高效。

### Pin 和 UnPin

参考资料：[Pin Module](https://doc.rust-lang.org/std/pin/index.html)，[Pin-Rust Async Book](https://rust-lang.github.io/async-book/04_pinning/01_chapter.html)

引入 pin 和 unpin 主要为了解决自引用结构在内存中被移动导致悬垂指针的问题。

`Unpin` 是一种 trait，表示类型能够安全地在内存中移动。Rust 的类型默认会加上 `Unpin` 这个 trait，所以标准库中绝大部分类型都是 `Unpin` 的。异步编程里 `async/await` 产生的 `Future` 类是典型的 `!Unpin`。

`Pin<P>` 是一种包裹类，意为 `P` 指向的地址 `T` 不会发生移动，常用来解决自引用的场景。注意只有当  `T:!Unpin` 时 `Pin<P>` 的功能才生效，即对 `Unpin` 的类型套上 `Pin` 后依然能正常将其移动。

`Pin` 的实现原理可从源码中窥得一二。简单来说，`Pin` 占有了 `P` 指向地址的可变引用，外界只能通过 `unsafe` 的方式改变/移动它。如果我们通过把 `Pin<&mut T>.as_mut()` 传入 `std::mem::swap(a, b)`  来尝试移动呢？注意到 `Pin` 不允许 `!Unpin` 结构进行 `get_mut()`，而 `as_mut()` 的返回结果也被包裹成  `Pin`，所以编译不通过。从源码中也能看出，若 `T` 是 `Unpin` 类型，`Pin<'a, T>` 完全等价于 `&'a mut T`，能正常进行移动。

```rust
impl<P> Pin<P> where P: Deref, <P as Deref>::Target: Unpin
pub fn new(pointer: P) -> Pin<P> 
pub fn into_inner(pin: Pin<P>) -> P

impl<P> Pin<P> where P: Deref
pub unsafe fn new_unchecked(pointer: P) -> Pin<P>
pub fn as_ref(&self) -> Pin<&<P as Deref>::Target>

impl<P> Pin<P> where P: DerefMut
pub fn as_mut(&mut self) -> Pin<&mut <P as Deref>::Target>

impl<P> Pin<P> where P: DerefMut, <P as Deref>::Target: Sized
pub fn set(&mut self, value: <P as Deref>::Target) 

impl<'a, T> Pin<&'a T> where T: ?Sized
pub fn get_ref(self) -> &'a T

impl<'a, T> Pin<&'a mut T> where T: ?Sized
pub fn get_mut(self) -> &'a mut T where T: Unpin
pub unsafe fn get_unchecked_mut(self) -> &'a mut T

impl<T> Pin<&'static T> where T: ?Sized
pub fn static_ref(r: &'static T) -> Pin<&'static T>
```

如果想标记一个类型是 `!Unpin` 的，目前 stable 版本中只能添加 `std::marker::PhantomPinned` 来达成。

### Future, Context 与 Waker

在 Rust 标准库中，异步的基石是 `Future` trait。标准库只定义了异步的接口，并不提供执行这些异步任务的运行时（Runtime）。

```rust
pub trait Future {
    type Output;
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}

pub enum Poll<T> {
    Ready(T),
    Pending,
}

```

注意 `poll` 方法的签名接受 `Pin<&mut Self>`，这正是因为编译器生成的状态机结构体中，通常包含指向自身其他字段的引用（跨越 `await` 的局部变量）。`Pin` 保证了这个状态机在内存中不会被移动，从而避免悬垂指针。

Rust 的 Future 是惰性（Lazy）的，如果没有任何东西去 `poll` 它，代码根本就不会执行。执行器（Executor）通过不断调用 `poll` 来推动状态机流转。

* 当 `poll` 返回 `Poll::Ready(val)`，说明异步任务已完成，返回结果。
* 当 `poll` 返回 `Poll::Pending`，说明当前任务在等待某些 IO 或事件，无法继续。此时，它必须将 `cx` 中的 `Waker` 注册到某个事件源上。
* `Waker` 是一个唤醒句柄。当底层的 IO 事件就绪时（例如网卡收到数据），底层驱动会调用 `waker.wake()`。
* 执行器接收到唤醒信号后，会把这个 Future 重新放回就绪队列，准备下一次 `poll`。

### 运行时 Runtime

既然标准库不提供 Runtime，生态中就涌现了如 `tokio`、`async-std` 和 `smol` 等第三方运行时。它们通常采用 Reactor-Executor 模型：

* 反应器 Reactor：负责监听底层操作系统的异步事件（如 Linux 的 `epoll`、macOS 的 `kqueue`、Windows 的 `IOCP`）。当 IO 阻塞时，Future 会把 `Waker` 挂载到 Reactor 上。IO 就绪时，Reactor 触发 `Waker`。
* 执行器 Executor：负责任务调度。它维护着任务队列，不断取出就绪的任务去执行（调用 `poll`）。

以 `tokio` 为例，它默认使用工作窃取（Work-Stealing）调度器。每个系统线程有一个本地的等候队列，当自己的任务处理完后，会去其他线程的队列里“偷”一半任务过来执行，从而实现极高并发下的负载均衡。

### Async Trait 与 AFIT

在面向对象和模块化工程中，我们经常需要在 Trait 中定义异步函数。但在 Rust 1.75 之前，Trait 是不支持直接写 `async fn` 的。因为 `async fn` 实际上返回一个隐藏的、编译器生成的 `impl Future` 类型，而早期的 Trait 不支持返回这样的未命名类型（大小不确定）。

早期工程中广泛使用了 `async-trait` 这个库。它的原理是将返回的 `Future` 强行 Box 到堆上（`Pin<Box<dyn + Future Send>>`），从而实现了动态分发。代价是：每次调用异步 Trait 方法都会产生一次堆分配，这在极端性能敏感的场景下违背了“零成本抽象”。

```rust
// 使用宏（Rust 1.75 以前的工程规范）
#[async_trait::async_trait]
pub trait Fetcher {
    async fn fetch(&self, url: &str) -> String;
}
// 宏展开后大致类似于：
pub trait Fetcher {
    fn fetch<'a>(&'a self, url: &'a str) -> Pin<Box<dyn Future<Output = String> + Send + 'a>>;
}

```

从 Rust 1.75 开始，官方稳定了 *Async fn in traits* 特性，底层依赖于 *Return Position Impl Trait In Trait* 机制。现在可以直接在 Trait 中写 `async fn`，不再需要引入宏，也消除了运行时的堆分配开销。

```rust
// Rust 1.75+ 原生支持
pub trait Fetcher {
    async fn fetch(&self, url: &str) -> String;
}
```

> **注意：** 目前原生的 AFIT 返回的 Future 默认并没有加上 `Send` 约束，这意味着在多线程执行器（如 `tokio::spawn`）中使用时可能会报错。在工程中，如果需要跨线程调度，可以通过 trait bounds 来约束，例如使用 `trait Fetcher: Send { ... }` 结合未来的 `impl Trait + Send` 语法。在完全稳定之前，部分复杂的工程接口仍然会混合使用 `#[async_trait]`。

## serde 和 serde_json

[serde](https://serde.rs/) 用于将 Rust 结构体序列化和反序列化，serde_json 则专注于和 Json 的交互。 

作用在结构体某个字段上的常见标记：

```rust
#[serde(rename = "name")]    // 将序列化和反序列化的名字重命名成 name
#[serde(rename(serialize = "ser_name", deserialize = "de_name"))]
#[serde(default)]            // 若该字段未出现则调用类型的 Default 方法
#[serde(default = "path")]   // 若该字段未出现则调用 path 指向的函数
#[serde(borrow)]             // 执行 zero-copy 反序列化，经典场景是反序列化成 &str
#[serde(skip)]               // 该字段跳过序列化和反序列化
#[serde(skip_deserializing)] // 默认调用 Default，也可以配合 default = "path"
#[serde(skip_serializing_if = "path")]  // e.g. "Option::is_none"
#[serde(serialize_with = "path")]    // 指定该字段的序列化方法，要求不能已实现 Serialize
#[serde(deserialize_with = "path")]  // 指定该字段的反序列方法，要求不能已实现 Deserialize
#[serde(borrow)]                     // 从原始数据里 borrow 而非新建
```

作用在结构体或 enum 外层的常见标记：

```rust
#[serde(rename = "name")]          // 修改整个结构体/enum 的名字
#[serde(rename_all = "...")]       // lowercase, UPPERCASE, PascalCase, camelCase, snake_case, SCREAMING_SNAKE_CASE, kebab-case, SCREAMING-KEBAB-CASE
#[serde(rename_all(serialize = "...", deserialize = "..."))])]
#[serde(deny_unknown_fields)]      // 遇到未知字段时会报错（暂不支持和 flatten 一起用）
```

对于 [enum](https://serde.rs/enum-representations.html)，默认使用 externally tagged 进行解析，也就是把每种类型名作为 map 的 key 来解析。

```rust
#[serde(tag = "type")]             // internally tagged，类型名放在名为 type 的 key 下。
#[serde(tag = "t", content = "c")] // adjacently tagged，额外把成员内容放在 content 下。
#[serde(untagged)]                 // 不再序列化 enum 的类型，直接平铺每个成员的内容
```

有一个关于 `&str` 进行反序列化的坑。由于转化成 Rust 的 `&str` 后长度缩小了，`str` 的表示失败会 unwrap。解决方法是全程使用 `String`。如果真的想优化内存，可以使用 `Cow<&str>` + `#[serde(borrow)]`。

```rust
#[derive(serde::Deserialize)]
struct Foo<'a> {
    a: &'a str,
}
serde_json::from_str::<Foo>(r#"{"a":"123"}"#).unwrap();      // no problem
serde_json::from_str::<Foo>(r#"{"a":"123\n"}"#).unwrap();    // unwrap
```

用 ` serde_json::to_string` 对 struct 序列化时结果是唯一的，字段之间会按定义顺序排序。但是如果字段里有无序结构（如 HashMap），则不能保证序列化结果的唯一性。

```rust
let v = json!({
    "name": "John",
    "phones": ["110", "120"],
})                                             // Construct Value
let v: Value = serde_json::from_str(data)?;    // Json String -> Value
let p: Persion = serde_json::from_str(data)?;  // Json String -> Struct
let s = v2.to_string();                        // Value -> Json String
let j = serde_json::to_string(&p)?;            // Struct -> Json String
```

测试时，常常需要比较 `Value` 和某 rust 结构（String 或 Hashmap 等）。可以使用 `json!()` 包裹后者。

## Cargo Insta

Insta 库是 Rust 测试里比较好用的库，能够为结果生成类似快照的内容，系统性地管理测试的输出文件。当第一次测试或结果有更新时会生成 `.snap.new` 为后缀的文件，归档后会生成 `.snap` 为后缀的文件。

```
assert_snapshot!()
assert_debug_snapshot!()
assert_yaml_snapshot!()
assert_ron_snapshot!()
assert_json_snapshot!()
assert_compact_json_snapshot!()
```

使用 `cargo install cargo-insta` 安装 insta 的命令行工具，便于管理 snapshots 文件。

```bash
cargo-insta review                               # review all pending snapshots
cargo-insta review --snapshot [snapshotname]     # review specific snapshot
cargo-insta accept/reject                        # accept or reject snapshot(s)
cargo-insta pending-snapshorts                   # list all pending snapshots
cargo-insta test --accept                        # run tests and accept all snapshorts
cargo-insta test --accept-unseen                 # run tests and accept new snapshorts
```

Insta `glob!` 宏支持一次管理多个文件，用 [globset](https://docs.rs/globset/latest/globset/) 通配。生成的 snapshots 文件名字包含`test_file_path`，`test_function` 和 `input_path` 三部分，其中 `input_path` 会取所有读取的文件的 lcp 的后面部分。

```rust
use std::fs;

glob!("inputs/*.txt", |path| {
    let input = fs::read_to_string(path).unwrap();
    assert_json_snapshot!(input.to_uppercase());
});
```