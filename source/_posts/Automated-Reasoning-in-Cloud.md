---
categories: Study
cover: ../post_images/Automated-Reasoning-in-Cloud.png
date: 2025-01-07 21:49:18
description: 本文将概述几篇云上形式化验证的论文。本文关注的重点方向包括：可满足性模理论的工程实践；AWS IAM Policy；AWS IAM Access；Analyzer 产品和背后用到的技术，特别是 AWS 的内部服务 Zelkova。
tags: [Review, Automated Reasoning]
title: 云上形式化验证论文走读
updated: 2025-12-18
---

本文会总结一些形式化验证相关的论文，大部分源于 amazon.science 里的 [Automated Reasoning](https://www.amazon.science/research-areas/automated-reasoning) 分类。

本文关注的重点方向包括：

+ 可满足性模理论（[**S**atisfiability **M**odulo **T**heories](https://en.wikipedia.org/wiki/Satisfiability_modulo_theories)）的工程实践。
+ AWS [IAM Policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)（下面的表格会梳理本文对于常见术语的中文表达）。
+ AWS [IAM Access Analyzer](https://aws.amazon.com/cn/iam/access-analyzer/) 的产品和背后用到的技术，特别是 AWS 的内部服务 Zelkova。

| 英语术语    | 中文术语  | 含义                                                         |
| ----------- | --------- | ------------------------------------------------------------ |
| *Policy*    | 策略      | 用于形式化表达一组 IAM 授权，是由 *Statement* 构成的一个数组 |
| *Statement* | 语句      | 构成策略数组的元素，包含 *Effect*, *Action*, *Conditon*, *Resource* 等维度 |
| *Effect*    | 效果      | Allow 和 Deny 二选一，表示本条 *Statement* 是授权语义和拒绝语义 |
| *Action*    | 权限      | 表示本条 *Statement* 关联的授权或拒绝的权限点                |
| *Resource*  | 资源      | 表示本条 *Statement* 关联的授权或拒绝的资源                  |
| *Condition* | 条件      | 表示本条 *Statement* 关联的授权或拒绝的条件；AWS 提供丰富了的条件键 |
| *Match*     | 命中/匹配 | 表示一组请求是否同时满足本条 *Statement* 的 *Action*, *Resource* 和 *Condition* |

AWS 策略的总体规则：当一组真实请求命中至少一条 Allow 语句且没有命中任何 Deny 语句则鉴权通过。

| 会议或期刊名                                                 | CCF 评级 |
| ------------------------------------------------------------ | -------- |
| **C**omputer **A**ided **V**erification                      | A        |
| Conference on **O**bject-**O**riented **P**rogramming **S**ystems, **L**anguages, and **A**pplications | A        |
| **Usenix Security** Symposium                                | A        |
| Theory and Applications of **Sat**isfiability Testing        | B        |
| **F**ormal **M**ethods in **C**omputer-**A**ided Design      | C        |

## **A**utomated **R**easoning **C**hecks

ICLR2026 Under Review, AWS, Sam Bayless: https://openreview.net/forum?id=aMIkbx81Em

#### 简介

提出了名为 **A**utomated **R**easoning **C**hecks 的二阶段系统，为大模型的输出设置 *guardrails*。它会判断大模型的输出是否合法（*valid*），并能达到非常高（$99\%$）的可靠性（*soundness*）。

![](Automated-Reasoning-in-Cloud/automated-reasoning-checks-1.jpg)

#### 阶段一 Policy Model Creator

阶段一简称 **PMC**，总体分为 *Automated Formalizing* 和 *Policy Model Vetting* 两个过程。

*Automated Formalizing* 会把自然语言规则文档（*NL Policy Document*）转化成形式化规则（*Policy Model*）。

1. 将整个自然语言规则文档分解成若干部分（*text span*），每个部分各自用 LLM 转化成 SMTLIB 格式的数据类型（*datatypes*）、变量（*variables*）和逻辑规则（*rules*）。注意这里的 *datatypes* 指的是不是原生数据类型，而是复合数据结构的定义。如果这个过程发生转化失败，会收集失败原因并进行基于 LLM 的循环修复。
2. 将每个部分的结果整合成完整的形式化规则。先按照余弦相似度为不同部分生成的变量名进行聚类，同一类里的变量名会共享（相同场景）或重命名（不同场景）；接着会进一步聚合 *rules* 并消除重复内容。

根据附录里举的例子，对于一份 $274$ 页的现实的策略规则文档（每页约 $500$ 个 token），变量数量、类型数量和逻辑规则数量随页数近似成线性增长的关系，全篇总数约为 $(2k,1.5k,0.6k)$。

*Policy Model Vetting* 会让领域专家参与进来修复 Policy Model 中的歧义和错误。

+ *Linting*：用类似 Linter 的方式系统性地检查 Policy Model 的完整性和一致性，汇报给用户。检查项包括：每个变量是否都在逻辑规则里出现，观察逻辑规则代入 SMTLIB 后是否有冲突等。
+ *Inspection*：类似 Code Review 的方式把 Policy Model 呈现给用户检查。专业用户看 SMTLIB 格式的内容，非专业用户看经过转化的结构化英语（格式例如 `if xxx then xxx`）。建议会被交给 LLM 来处理和修复。
+ *Testing*：类似于 Unit Test 的方式来验证 Policy Model。总体有两种途径：一是由用户提供一些基于自然语言的问题-答案对，让阶段二的 AV 来运行；二是直接让 SMT Solver 基于 Policy Model 的状态空间来系统性地遍历和构造一些具有 provably-correct 结果的测试数据，注意此时不需要经过 AV。出错后要用户参与修复。

#### 阶段二 Answer Verifier

阶段二简称 **AV**，利用 LLM 把自然语言的询问和待验证结果转化成形式化的前提-结论对（*premise*-*conclusion* *pair*），代入 PMC 验证 $P \Rightarrow C$ 是否成立。注意 AV 会冗余地调用 $k$ 个 LLM，来量化转化 $\langle P,C\rangle$ 的置信度。设 Policy Model 是 $\mathcal{M}$，待验证前提是 $P$，待验证结论是 $C$，可能得结果列举如下。TranslationAmbiguous 会给出至少两种不一致的结果，而后四种结果会给出 SMTLIB 的详细信息供第三方定理证明器来验证。

![](Automated-Reasoning-in-Cloud/automated-reasoning-checks-2.jpg)

| 结果名                        | 含义                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| *NoTranslations*/*TooComplex* | 无法转化                                                     |
| *TranslationAmbiguous*        | $k$ 个 LLM 的转化结果里，无置信度超过阈值的                  |
| *Impossible*                  | $\mathcal{M} \models \lnot P$：前提已经和模型抵触            |
| *Invalid*                     | $\mathcal{M} \land P \models \lnot C$：在模型和前提成立的情况下结论一定不成立 |
| *Satisfiable*                 | $\mathcal{M} \land P \nvDash C, \mathcal{M} \land P \nvDash \lnot C$：模型和前提成立的情况下无法判断结论 |
| *Valid*                       | $\mathcal{M} \land P \models C$：模型和前提成立的情况下结论一定成立 |

#### 实验结果

第一个实验用的是 ConditionalQA 数据集（*Sun 2022*）的扩展版。原数据只有 `valid` 和 `not_answerable` 两个标签，后者对应本文定义的 *NoTranslations* 标签，前者除了构成 *Valid* 标签外会构造出其他标签：移除条件构成 *Satisfiable*，取反声明构成 *Invalid*，合并互斥的条件构成 *Impossible*。拓展后有 $349$ 个正类和 $173$ 个负类。

ARC 在上述数据集上测试端到端的指标。为了计算准确率、召回率、F1 等传统指标，定义 *Valid* 场景为正类 、其他所有结果为负类。ARC 的目标是在严格控制 FP 数量的情况下最大化召回率，最关心的指标是 *Soundness*，定义为 $S=1-\frac{\text{\#False Positive}}{\text{\#examples}}$，表示有多少应该被识别出来的 NotValid 被错误地识别为 Valid 的测例的比例。

从下表来看，ARC 最严格 *threshold=3/3* 版本能够达到 $S=99.2\%$，但是召回率只有可怜的 $15.6\%$；随着 ensamble 阈值的下降，召回率最高能回升到 $31.7\%$，但远不及 LLMaJ 和 RefCheker。

![](Automated-Reasoning-in-Cloud/automated-reasoning-checks-3.jpg)

考虑到 ConditionalQA 策略不够复杂， AWS 后续在自己收集的航班退款的数据集上做实验。对 带/不带 *Policy Model Vetting* 步骤的 ARC 的效果，前者比后者在各项数据上都有进步。

+ *NoTranslations* 和 *TranslationAmbiguous* 意味着有变量需要新增或者修复。
+ *Impossible* 意味着 Policy Model 构建时有细微的不一致性需要修正。一个典型的场景是，左下 Question 的ARC 判定为 Impossible（前提不成立），原因是策略规则文档建模时：前文提到某种状态下一定不能退款，但其实在下文中有例外场景，LLM 在建模前文时有局限性直接把前文建模成对应的逻辑语句导致矛盾。

```
If your flight operated and you didn’t travel, you’re not entitled to a refund.
...
several special circumstances under which passengers may indeed qualify for a refund even if their flight operated.
```

![](Automated-Reasoning-in-Cloud/automated-reasoning-checks-4.jpg)

ARC 不但可用于 QA 对的校验，还可将其结果喂给 LLM 来循环生成更高质量的结果。作者将 ARC *threshold=3/3* 判定的 Non-Valid 结果进行了 $10$ 轮的修正画出了右上的折线图，Valid 比例可以从 $10.8\%$ 上升至 $43.9\%$。

## Progent

2025, Tianneng Shi: [Progent: Programmable Privilege Control for LLM Agents](https://arxiv.org/pdf/2504.11703)

#### 简介

LLM Agent 在调用工具完成用户任务时，常因权限过度而面临严重安全风险，如间接提示注入（*indirect prompt injection*）、记忆库投毒（*memory/knowledge base poisoning*）或恶意工具调用（*malicious tools*），可能导致未授权交易或数据泄露。作者提出了首个专为 LLM Agent 设计的权限控制框架 **Progent**，其定义了一套 DSL 机制来配置 Allow/Deny 策略，支持遇到安全问题时阻断或询问用户，并支持随着 Agent 状态动态更新策略，仅需极少适配即可集成到 Agent 中。实验表明其在 AgentDojo、ASB 和 AgentPoison 等基准上能将攻击成功率降至 0%，同时保持了 Agent 工作的有效性。作者还研究了如何用 LLM 辅助生成本文定义的 DSL 策略。

![](Automated-Reasoning-in-Cloud/progent-1.jpg)

#### 原理

**工作模型**：原始工作流（左侧）：接收到用户初始请求 $o_0$ 后，Agent 不断根据上一轮结果 $o_{i-1}$ 生成新的工具操作 $c_i$ 和新的结果 $o_i$。Progent（右侧）：在工具调用指令上封装一个装饰器函数，用于拦截风险性行为。

![](Automated-Reasoning-in-Cloud/progent-2.jpg)

**威胁模型**：假设用户和初始要求 $o_0$ 总是善意的。假设攻击者不能改变 Agent 的内在逻辑，如基模型或系统提示词。攻击者可以植入恶意工具 $\mathcal{T}$，或通过控制环境 $\mathcal{E}$ 来改变 $o_i(i>0)$（包括提示词注入和记忆/知识库污染）。Progent 只专注于防护 Agent 在执行上述工具调用相关时的攻击，而且其无法防御那些在完成用户任务所需最小权限内实施的攻击，例如偏好操纵攻击（*preference manipulation attacks*）。

**Progent DSL**：针对一个 Agent 可配置一个策略集合 $\mathcal{P}$，里面每条策略 $P \in \mathcal{P}$ 用来描述某个指定工具达成某个条件时的约束。策略支持基本的布尔、字符串和数组运算。额外引入优先级 *priority* 和如下两个概念：

+ 回退 *fallback*：forbid 效果激活时采取的回退模式。Progent 从以下三种可能中选择了第三种：1. 立即终止整个 Agent 流程；2. 让用户手动决策；3. 返回错误信息并让流程继续进行。
+ 更新 *update*：往策略集合 $\mathcal{P}$ 里新增特定的策略。  

**Progent 辅助工具**：提供 type checker 和 condition analyzer 两个辅助工具，前者用来检查策略表达式的合法性，后者会枚举任意两个策略 $P_i,P_j\in \mathcal{P}$，若它们的条件有交集（调用 Z3 判断 $e_i \land e_j \ne \empty$）则会给出警告。

![](Automated-Reasoning-in-Cloud/progent-3.jpg)

**Progent 鉴权流程**：针对某次工具调用包装一个装饰器函数。将 $\mathcal{P}$ 中所有目标为 $t$ 的策略按优先级排序（同等级 Deny 优先），依次枚举每一条策略 $P_i$，一旦当前环境取值和工具参数 $(v,p)$ 满足 $e_i$，就触发 $P_i$ 的 fallback 和 update 流程并推出。注意这里和传统鉴权不一样，高级别策略 Allow 后也会屏蔽后续低级策略的 Forbid。

**Progent 实现**：使用 JSON Schema 来实现 Progent，用到了 python 的 `jsonschema` 库来实现校验。

#### 实验结果

**AgentDojo**：提示词注入攻击的 SOTA 的数据集，内容涵盖了银行交易、Slack聊天、旅行预订、工作空间四类。                                                                                                                                                                                                                                                                                                                                                       

Progent 根据工具是否操作敏感信息来分为 write 和 read 两类，针对前者设置一些限定若干表达可信边界的参数的策略。除了 Progent 外，作者对比了四个 AgentDojo 论文里提到的方法和两个 SOTA 的方法作为对比：

| 防御名                         | 防御描述                                                   |
| ------------------------------ | ---------------------------------------------------------- |
| `repeat_user_prompt`           | 每一次工具调用之后重喂一遍完整原始用户指令，防止被结果带跑 |
| `spotlighting_with_delimiting` | 用特殊符号把返回结果圈起来，告诉模型别信里面的指令         |
| `tool_filter`                  | 先决定“允许用哪些工具”，再执行任务                         |
| `transformers_pi_detector`     | 用训练好的 DeBERTa 分类器检测提示是否有注入攻击            |
| `DataSentinel`                 | 用博弈论思想训练的注入检测器                               |
| `Llama Prompt Guard 2`         | Llama 团队提供的工业级提示注入检测检测器                   |

从结果来看，Progent 在保持高水平有效性的同时，把 **A**ttack **S**uccess **R**ate 从 $40\%$ 降到了 $0\%$。ASR 同样较低的 `tool_filter` 在有效性上大打折扣，主要因为它是粗粒度的工具筛选。个人评价：虽然 Progent 和其他工具的对比优势巨大，但作者在完成策略编写的过程中肯定会去参考一些经典攻击范式，泛用性有待进一步验证；而且从附录里公布的 Progent 在银行交易场景编写的策略来看（只设置了 $10$ 组策略，全都不带 fallback 和 update，且 non-trivial 的复杂策略只有 $3$ 组），达成 $0\%$ 不需要用太多 fancy 的设置，让人怀疑数据有点弱。

![](Automated-Reasoning-in-Cloud/progent-4.jpg)

若非特殊说明，实验所用的 Agent 的底层 LLM 默认都是 *gpt-4o*。作者尝试在 AgentDojo 数据集上更换模型：

+ 无论是什么基模型，Progent 都能保持很高的有效性和 $0\%$ 的 ASR。
+ 基模型之间的结果差距很大，*claude-sonnet-4* 和 *Meta-SecAlign-70B* 看起来做了安全方面的加固。

**ASB**：Agent Sandbox Benchmark，考虑攻击者可利用恶意工具的数据集。

除了 Progent 外，作者对比了三个 ASB 论文里提到的方法（和之前的很类似，都是基于提示词的方法）：

| 防御名                     | 防御描述                             |
| -------------------------- | ------------------------------------ |
| `delimiters_defense`       | 只执行被 delimiters 包裹的用户请求   |
| `ob_sandwich_defense`      | 在工具返回后，再强调一次用户目标     |
| `instructional_prevention` | 重写用户请求，并要求忽略其他一切指令 |

结果和第一个实验类似，Progent 在保持高水平有效性的同时，把 ASR 降低到了 $0\%$。

![](Automated-Reasoning-in-Cloud/progent-5.jpg)

**EHRAgent+AgentPoison**：EHRAgent 是面向医疗场景的代码型 Agent，典型工作场景是客户提一个诉求，其生成 Python/SQL 代码进行数据库查询；AgentPoison 是一种数据/环境投毒攻击，植入类似 DeleteDB 的命令。

Progent 配置了禁止高危数据库操作（如 DeleteDB、SQLInterpreter）的策略。从结果上来看，ASR 依然能成功降到 $0\%$，而且由于 Progent 没有限制常规的查询操作，有效性得到了保证。

## IP Counting in Public Access

FMCAD 2024, AWS, Loris D'Antoni: [Projective model counting for IP addresses in access control policies](https://www.amazon.science/publications/projective-model-counting-for-ip-addresses-in-access-control-policies)

**简介**：Zelkova 想根据“授权的 IP 数量是否超过特定阈值”来判断策略是否是 Public Access。论文基于 *bounded projective IP-counting problem* 提出了两种编码方式，使得 99.999% 的策略都能在 3s 内出解。

![](Automated-Reasoning-in-Cloud/ip-count.png)

**IP 等价类**：一个很自然的想法。由于策略里每条针对 IP 的 Condition 一定是 CIDR 格式，且真实场景里用户策略不会太长，可以借助离散化的思想，把 $2^{32}$ 个 IP 位向量（这里只考虑 IPv4）划分成一个个连续段。

**基础编码方式**：设 IP 的等价类是 $S_1,S_2,\dots,S_n$，各自的大小为 $|S_i|$。再设 $s_i$ 为 $S_i$ 的代表元（$s_i \in S_i$）。用 $\varphi_p(\mathbf{x},ip)$ 表示策略 $p$ 在一个特定 IP 取值下的构成的约束关系。构造一个计数器 counter，依次枚举每一个等价类 $S_i$，将约束 $\varphi_p(\mathbf{x},ip=s_i)$ 代入 SMT 求解器，若有解则 counter 累加 $|S_i|$，观察其是否超过 threshold。

**方式一：Arithmetic Approach**。论文认为同时支持 arithmetic 和 string 理论的 SMT 求解器（如 CVC5, Z3 等主流求解器）经过如下一次编码和求解即可完成阈值判断。我认为这 $n$ 个场景需要单独求解才能确保正确性，没有完全理解这种编码方式。难道论文是通过将每一个 $\varphi_p(\mathbf{x})$ 里的所有变量都复制一份来做到互不干扰？
$$
\left(\sum_{i=1}^n 
\begin{cases}
|S_i|  \quad &\text{if }~\exists \mathbf{x}.~\varphi_p(\mathbf{x},ip) \\
0  &\text{otherwise}
\end{cases}\right) \ge \text{thresold}
$$
**方式二：Arithmetic-free Approach**。对于不支持 arithmetic 的求解器（如 AWS 自研的 [NFA2SAT](#NFA2SAT)），论文先用背包找到所有 IP 等价类的极小集 $\{T_1,T_2,\dots,T_m\}$，即 $\forall_{i\ne j} T_i \not \subseteq T_j$ 且 $\forall_i (\sum _{S_j \in T_i} |S_j|) \ge \text{thresold}$。再将这些极小集按前一种方式构建约束即可，这样就规避了所有涉及 arithmetic 的操作。

## SMT-D

FMCAD 2024, AWS, Clark Barrett: [SMT-D: New Strategies for Portfolio-Based SMT Solving](https://www.amazon.science/publications/smt-d-new-strategies-for-portfolio-based-smt-solving): 

#### 简介

论文提出了名为 **SMT-D** 的基于 CVC5 实例的 Portfolio 框架，主打基于 *Clause Sharing* 的规则分享机制，叠加上 *Delayed Sharing* 和 *Guided Randomization* 两种特性，总体效果好于基于 OPENSMT2 实例的 SMTS。

+ SMTS 同时支持 *Clause Sharing* 和 *Partition* 机制，本论文做 SMTS 实验时没有开启 *Partition* 的开关。
+ CVC5-P 仅支持 *Partition* 机制，本论文做 CVC5-P 实验时默认保持了这一机制。
+ 从第二张图单实例对比中可以看出 OPENSMT2 好于 CVC5，但加了 64 节点的分享后 SMT-D 超过了 SMTS。

![](Automated-Reasoning-in-Cloud/smt-d-1.png)

![](Automated-Reasoning-in-Cloud/smt-d-2.png)

| 术语                   | 解释                                                         |
| ---------------------- | ------------------------------------------------------------ |
| *Delayed Sharing*      | 强制要求每个求解器在 preprocessing 阶段后才能分享 *lemma*    |
| *Guided Randomization* | 观察到随着集群规模的增大，配置各异的求解器能唯一学到的规则数量趋于饱和。将集群分成 normal 和 noisy 两块，后者拥有更激进的参数配置且只导入导出更短的 *lemma*。 |
| CS / CS-GR             | 仅带有 *Clause Sharing* / 同时带有 *Clause Sharing* 和 *Guided Randomization* |
| PAR-2                  | SAT 竞赛的计分方式，统计所有实例的用时之和，超时（ $>1200s$） 有双倍惩罚。 |
| SMT-D                  | 当前混合求解器框架的 SOTA（SMT COMP 22 Cloud Track）         |

#### 框架

论文抽象了中心化的 Controller 负责信息交换和监控，底下每个 Worker 能互相分享学到的新规则（*lemma*）。

+ Controller 用 python 实现 ，gRPC 通信（便于跨场景），交互格式选用宽松但是直观的 SMTLIB。
+ Controller 用 “上一次发送至今的间隔” 和 “待发送的 lemma 队列长度” 两个维度来决定 `shouldSend` 函数。实测发现即收即发的效果不错，因为使用的 CVC5 每秒钟支持导入超过 $1000$ 条 *lemma*，即使是 64 实例的求解器集群，在 $|lemma| \le 8$ 的筛选规则下只有 $1/214$ 个测试数据会达到瓶颈。
+ 用 *lemma* 里的子句数量来衡量价值。每个求解器不会分享包含新变量的 *lemma*。
+ normal 集群和 noisy 集群数量各占 $(75\%,25\%)$，CVC5 用来控制随机性地 `rnd_freq` 参数，前者默认后者开到 $75\%$。前者的导入导出阈值是 $\le 8$，后者的导入阈值 $=1$ 导出阈值 $\le 4$。

![](Automated-Reasoning-in-Cloud/smt-d-3.png)

## NFA2SAT with Concatenation

FMCAD 2024, AWS, Kevin Lotz: [Solving String Constraints with Concatenation Using SAT](https://www.amazon.science/publications/solving-string-constraints-with-concatenation-using-sat)

## Reduce Privilege for Policy

OOPSLA 2024, AWS, Loris D'Antoni: [Automatically reducing privilege for access control policies](https://www.amazon.science/publications/automatically-reducing-privilege-for-access-control-policies)

#### 简介

本文专注于 AWS 策略生成场景，即给出原始策略和一些已通过的请求集合，IAM-PolicyRefiner 会生成一个满足最小化权限的新策略 。本论文提出了三个评价维度，最大的特色是将 *Readability* 这个感性的维度给量化。

| 维度          | 粗略解释                                                 |
| ------------- | -------------------------------------------------------- |
| *Readability* | 策略的可读性，即让新策略在字面量尽可能的和原来保持接近。 |
| *Soundness*   | 策略的合理性，即能让已通过的请求仍然保持正确授权。       |
| *Tightness*   | 策略的紧密性，即满足前两个条件下授权语义越小越好。       |

IAM-PolicyRefiner 的整体流程是：读取 AWS Cloud Trail 里所有鉴权通过的请求，找到每个请求对应的授权策略里第一条匹配的语句，计算该语句 $s$ 的搜索空间 $\mathcal{S}_s$。这些搜索空间的并集即构成了所有 *Readability* 的策略集。整个 IAM-PolicyRefiner 用 $\sim 3000$ 行 Scala 实现，利用其 map 和 reduce 做到并行，结果如下：

![](Automated-Reasoning-in-Cloud/reduce-privilege.png)

#### Abstraction 和 Well-Behaved 的定义

为了方便阐述论文的推理细节，本文约定以下记号：

| 符号                     | 概念                                                         |
| ------------------------ | ------------------------------------------------------------ |
| $M(s)$                   | 语句 $s$ 能匹配的请求（Request） 集合                        |
| $e$                      | 表示一条语句的效果是 Allow 还是 Deny                         |
| $\Psi:V \to \text{pred}$ | 表示一条语句的具体约束，将所有变量映射成断言                 |
| $C$                      | 待匹配的请求（Request）的总集                                |
| $A$                      | 所有尝试去匹配这些请求的策略全集                             |
| $\Sigma,\sigma,\Sigma^*$ | 单个字符的集合，不含通配符的字符串，不含通配符的字符串总集   |
| $pat,\mathcal{L}(pat)$   | 正则约束，正则约束匹配的所有不含通配符的字符串集合           |
| $\Omega(\sigma,pat)$     | $\sigma$ 匹配 $pat$ 的所有情况构成的数组，每个元素是不同正则项对应的元组 |

下面在策略集合 $A$ 上考虑一种偏序关系 $\sqsubseteq$：

| 符号                    | 概念                                                         |
| ----------------------- | ------------------------------------------------------------ |
| $(A,\sqsubseteq)$       | $a \sqsubseteq b,(a,b) \in A$ 表示 $a$ 命中的请求集合完全包含于 $b$ 命中的请求集合 |
| $(A, \sqcup)$           | $m=a \sqcup b,(a,b,m) \in A$ 表示 $a$ 和 $b$ 在 $A$ 中的满足唯一性的封闭并运算，即 $a \sqsubseteq w, b \sqsubseteq w$ 且 $\forall w \in A, a \sqsubseteq w \land b \sqsubseteq w \to m \sqsubseteq w$ |
| $\bot$                  | $A$ 中基于 $\sqsubseteq$ 的最小元，可以理解成授权为空的策略，即 $\forall a \in A, \bot \sqsubseteq A$ |
| $\gamma(A \mapsto 2^C)$ | 将一条策略 $a$ 映射到它能匹配的请求集合                      |
| $\beta(C \mapsto A)$    | 能匹配某一条请求 $c$ 的基于 $\sqsubseteq$ 的最小 Policy $a$。也就是说 $\nexists b \in A, c \in \gamma(b), a \sqsubset b $ |

将一组满足上述全部性质的 *Abstraction* $\mathcal{A}=(C,A,\sqsubseteq,\beta,\gamma,\sqcup,\bot)$ 称为 *Well-behaved*。此时 $\forall D \subseteq C$，存在能匹配上的唯一最小元 $a \in A$，即 $D \subseteq \gamma(a)$ 且 $\forall_{b \in A,D \subseteq \gamma(b) } b \subseteq a$。而且 $a$ 可以按如下规则构造：
$$
a=\bigsqcup_{d \in D}\beta(d)
$$
#### 策略的搜索空间和 Abstraction 构造

*Predicate Search Space* $\Phi_{\psi[v]}$：对于变量 $v$ 和原始约束 $\Psi[v]$，根据不同约束类型定义对应搜索空间的集合。

*Statement Search Space $\mathcal{S}_s$*：相比原始语句 $s=(e,\Psi)$，所有变量都在其 *Predicate Search Space* 里取值。
$$
(e,\Psi') \in \mathcal{S}_s \iff V(\Psi_s)=V(\Psi') \bigwedge \forall_{v \in V(\Psi)} \Psi'[v] \in \Phi_{\Psi[v]}
$$
Policy Search Space $\mathcal{P}_p$：所有 deny 语句保持不变，所有 allow 语句在其 *Statement Search Space* 里取值。

若语句 $s=(e,\Psi)$ 所有约束 $\psi \in pred(s)$ 构成的 $\mathcal{A_\psi}=(val(\psi),\Phi_\psi,\to,\beta_{\psi},\gamma_{\psi},\sqcup_{\psi},\bot)$ 是 *Well-behaved* 的，则针对 $\mathcal{S}_s$ 构造出的如下 *Abstraction* $\mathcal{A}_{\mathcal{s}}=(M(s), \mathcal{S}_s,\sqsubseteq_{\mathcal{s}},\beta_{\mathcal{s}},\gamma_{\mathcal{s}},\sqcup_{\mathcal{s}},\bot)$ 是 *Well-behaved* 的：
$$
\begin{aligned}
a \sqsubseteq_{\mathcal{s}}& b \iff \begin{cases} 
M(a) \subseteq M(b) & \text{if } e=allow   \\
M(b) \subseteq M(a) & \text{if } e=deny   \\
\end{cases} \\
\beta_{\mathcal{s}}(r)&=(e,\Psi') \in \mathcal{S}_s \quad \text{s.t.} \quad V(\Psi)=V(\Psi') ~\land~ \forall_{v \in V(\Psi)} \Psi'[v]=\beta_{\Psi[v]}(r(v)) \\
\gamma_{\mathcal{s}}(e,\Psi')&=M(\Psi') \\
(e,\Psi_1) \sqcup_{\mathcal{s}}(e,\Psi_2)&=(e,\Psi')\quad \text{s.t.} \quad \forall_{v \in V(\Psi)} \Psi'[v]=\Psi_1[v] \sqcup_{\Psi[v]}\Psi_2[v] \\
\end{aligned}
$$

若策略 $p=(Allow:\{a_1,a_2,\dots,a_n\},Deny:\{d_1,d_2,\dots,d_m\})$ 的所有约束 $\psi \in \bigcup_i pred(a_i)$ 构成的 $\mathcal{A_\psi}$ 是 *Well-behaved* 的，现在针对 $\mathcal{P}_p$ 构造出的如下 *Abstraction* $\mathcal{A}_{\mathcal{P}}=(Granted(p), \mathcal{P}_p,\sqsubseteq_{\mathcal{P}},\beta_{\mathcal{P}},\gamma_{\mathcal{P}},\sqcup_{\mathcal{P}},\bot)$：

$$
\begin{aligned}
a \sqsubseteq_{\mathcal{P}}& b \iff Granted(a) \subseteq Granted(b) \\
\beta_{\mathcal{P}}(r)&=\{a_1',\dots,a_n',d_1,\dots,d_m\} \text{ s.t. } \forall_{1 \le i \le n} \begin{cases}
a_i'=\bot & r \in \cup_{j<i}M(a_j) \lor r \notin M(a_i) \\
a_i'=\beta_{a_i}(r) & \text{otherwise} \\
\end{cases} \\
\gamma_{\mathcal{P}}(P')&=Granted(P') \\
\{a_1^1,\dots,a_n^1,d_1,\dots,d_m\} &\sqcup_{\mathcal{P}} \{a_1^2,\dots,a_n^2,d_1,\dots, d_m\}=\{a_1^1 \sqcup_{a_1}a_1^2,\dots,a_n^1 \sqcup_{a_n}a_n^2,d_1,\dots,d_m\}
\end{aligned}
$$
注意  $\mathcal{A_{\mathcal{P}}}$ **不是** *Well-behaved* 的，反例如下：$p$ 的两条语句各自授权了 action 形如 $a*$ 和 $*b$ 的所有权限。若请求 $r$ 的 action 是 $ab$（同时被两条语句匹配），按上述构造方式，$\mathcal{P}_p$ 里 $\beta(r)$ 的最小集会被修正为 $ab*$ 和 $\bot$，但实际上 $\bot$ 和 $*ab$ 同样符合要求，且前后两者均是极小集而不是最小集。

若 $p$ 中 allow 语句之间覆盖的请求没有交集，即 $\forall_{1 \le i < j \le n} M(a_i) \cap M(a_j)=\emptyset$，此时 $A_{\mathcal{P}}$ **是** *Well-behaved*。

#### 不同类型的 Abstraction 构造

**相等构造**：对于 $v=c$，考虑 $C=\{c\}$ 和 $A=\{v=c,\bot\}$，构造出来显然是 *Well-behaved* 的。

**不等构造**：对于 $v \ne c$，构造如下 *Well-behaved* 的 $\mathcal{A}_{\ne c}=(val(\ne c), \Phi_{\ne c},\to,\beta_{\ne c},\gamma_{\ne c},\sqcup_{\ne c},\bot)$：
$$
\begin{aligned}
val(\ne c)&=\{d | d \ne c \land  d \in Values_{type(c)}(p)\}, \text{i.e. all values } \ne d\text{ and has same type as }c \\
\Phi_{\ne c}&=\{v=d | d \ne c\} \cup \{v \ne c\} \cup \{\bot\} \\
\beta_{\ne c}&= \quad v=d \\
\gamma_{\ne c}(v=d)&=\{d\},\gamma_{\ne c}(v \ne c)=val(\ne c) \\
a \sqcup_{\ne c} b&=\begin{cases}
a& b \to a \\
b& a \to b \\
v \ne c & \text{otherwise}
\end{cases}
\end{aligned}
$$
**比较构造**：对于 $v \le c$，考虑 $C=\{d | d \le c \land d \in Values_{type(c)}(p)\}$，构造出来显然是 *Well-behaved* 的。

**通配符 ? 构造**：考虑 $C=\Sigma$ 和 $A=\Sigma \cup \{?\} \cup \{\bot \}$ ，构造出来显然是 *Well-behaved* 的。

**通配符 * 构造**：包含 * 和 $\sigma$ 的 Abstraction $\mathcal{A}_{*}$ 有很多构造方式，其中 *Well-behaved* 的是 $\mathcal{A}_{pref}$ 和 $\mathcal{A}_{succ}$。

**字符串前缀构造**：构造如下的 *Well-behaved* 的 $\mathcal{A}_{pref}=(\Sigma^*, \Phi_{pref},\subseteq_{\mathcal{L}},\beta_{pref},\gamma_{pref},\sqcup_{pref},\bot)$：
$$
\begin{aligned}
\Phi_{pref} &= \Sigma^* \cup \left\{\sigma W | \sigma \in \Sigma^* \land W \in \{?,*\} \right\} \cup \{\bot\} \\
\beta_{pref}(\sigma)&=\sigma \\
\gamma(pat)&=\mathcal{L}(pat) \\
x \sqcup_{pref} y&=\begin{cases}
x & y \to x \\
y & x \to y \\
z? & z=lcp(x,y) \land |z|+1=|x|=|y| \land x \ne z? \land y \ne z? \\
z* & z=lcp(x,y)
\end{cases}
\end{aligned}
$$

**字符串前后缀构造**：一个很自然的想法是将 $\mathcal{A}_{pref}$ 和 $\mathcal{A}_{succ}$ 合并成 $\mathcal{A}_{pref+suff}$，即对于请求集合 $\{aa,aaa,aca\}$ 各自做一遍得到 $(a*,*a)$，合并后即为 $a*a$。可惜有反例，请求集合 $\{aa,aaa\}$ 各自做一遍得到 $(aa*,*aa)$，合并后的 $aa*aa$ 会错误地要求字符串长度至少是 $4$。不过 $\mathcal{A}_{pref+suff}$ 并不是完全没有意义的，如果所有请求都满足长度至少为 $|p_{pref}|+|p_{succ}|$，这种合并的方式一定是 *Soundness* 的，可以用来替代 $\mathcal{A}_{*}$。

**特定正则串构造**：对于特定的正则串 $pat=\sigma_0W_1\sigma_1\dots W_n\sigma_n$（其中 $W_i \in \{*,?\}$ ），借助 $\mathcal{A}_*$ 和 $\mathcal{A}_?$ 来构造如下 Abstraction $\mathcal{A}_{pat}=(\mathcal{L}(pat),\Phi_{pat}, \subseteq_{\mathcal{L}}, \beta_{pat},\gamma_{pat},\sqcup_{pat},\bot)$：
$$
\begin{aligned}
\Phi_{pat}&=\{\sigma_0x_1\sigma_1\dots x_n\sigma_n\ | x_i \in \Phi_{W_i}\} \cup \{\bot\} \\
\beta_{pat}(\sigma)&=\sigma_0x_1\sigma_1\dots x_n\sigma_n \quad \text{s.t. }x_i=\Omega(\sigma,pat)[0][i] \\
\gamma_{pat}(pat')&=\mathcal{L}(pat') \\
pat_1 \sqcup_{pat} pat_2 &= \begin{cases}
pat_1 & pat_2 \to pat_1 \\
pat_2 & pat_1 \to pat_2 \\
\sigma_0z_1\sigma_1\dots z_n\sigma_n \quad \text{s.t. } \forall_i z_i=x_i^1 \sqcup_{W_i}x_i^2 & \text{otherwise}
\end{cases}
\end{aligned}
$$
可惜 $\mathcal{A}_{pat}$ **不是** *Well-behaved* 的，因为 $\beta(\sigma)$ 会盲选第一个匹配方案。以 $pat=a*a*$ 来举反例：

| $\sigma$         | $\Omega(\sigma_i,pat)$                          |
| ---------------- | ----------------------------------------------- |
| $\sigma_1=aaaa$  | $[(aa,\epsilon),(a,a),(\epsilon,aa)]$           |
| $\sigma_2=aaaaa$ | $[(aaa,\epsilon),(aa,a),(a,aa),(\epsilon,aaa)]$ |
| $\sigma_3=abaa$  | $[(b,a)]$                                       |

$\beta(\sigma_i)$ 盲选第一个匹配方案后，两个位置的结果分别是 $\{aa,aaa,b\}$ 和 $\{\epsilon,\epsilon,a\}$，两两合并后的结果是 $(*,*)$。但如果智能地选择了第二个、第三个和第一个，$\{a,a,b\}$ 和 $\{a,aa,a\}$ 能合并出一个更紧的结果 $(?,a*)$。

论文把 $\exist \sigma,|\Omega(\sigma,pat)|>1$ 的 $pat$ 称为 *ambiguous pattern*，指出 *unambiguous* 的 $\mathcal{A}_{pat}$ **是** *Well-behaved* 的。

**析取构造**：$\psi_{\lor}=\psi_1 \lor \dots \lor \psi_n$ 构造出来显然是 *Well-behaved* 的，如果 $\forall_i \mathcal{A}_{\psi_i}$ 是 *Well-behaved* 的。

**合取构造**：$\psi_{\land}=\psi_1 \land \dots \land \psi_n$ 构造出来显然是 *Well-behaved* 的，如果 $\forall_i \mathcal{A}_{\psi_i}$ 是 *Well-behaved* 的。

#### IAM-PolicyRefinerNeg

从请求集 $C$ 中找到最小权限策略的过程称为 IAM-PolicyRefiner。论文表示很多时候求对偶问题会更方便，即我们想找到一个最大权限策略使得其拒绝整个请求集 $C$，称为 IAM-PolicyRefinerNeg。搜索空间看似变得不规则了，但我们只需稍微修改下之前 Policy Search Space $\mathcal{P}_p$ 的定义，改为 Allow 不变而 Deny 变化。

## NFA2SAT

CAV 2023, AWS, Kevin Lotz: [Solving String Constraints Using SAT](https://www.amazon.science/publications/solving-string-constraints-using-sat)

#### 简介

提出了 **NFA2SAT** 的字符串约束求解器，使用 CaDiCaL 作为后端，将字符串约束转化为纯 SAT 约束迭代式求解。整体思想类似 WOORPJE，但证明了迭代长度的上限，可以在有限步停止并输出 UNSAT。

对比经典的 SMT 求解器，NFA2DFA 更适合 SAT 但不适合 UNSAT。ZALIGVINDER 测试集上结果如下：

![](Automated-Reasoning-in-Cloud/nfa2sat-2.png)

![](Automated-Reasoning-in-Cloud/nfa2sat-3.png)

#### 框架

本文考虑的字符串命题  $\psi$ 的定义如下：
$$
\begin{align}
F&=F \lor F \mid F \land F \mid \lnot F \mid \text{Atom} \\
Atom&=x \in RE \mid x=y \\
RE&=RE \cup RE \mid RE \cdot RE \mid RE^* \mid RE \cap RE \mid ? \mid w
\end{align}
$$
利用 BMC 思想，将字符串命题 $\psi$ 转化成分步 SAT 询问，第 $b$ 次格式形如 $\psi_{\mathcal{A}} \land \mathbf{D}^b \land h^b$：

+ $\psi_{\mathcal{A}}$ 表示将原命题进行 Boolean Abstraction，即将 $x \in RE,x=y$ 等原子约束替换成布尔变量。
+ $\mathbf{D}^b \land h^b$ 会针对每组原子约束，结合当前的长度上限 $b$ 进行编码。

![](Automated-Reasoning-in-Cloud/nfa2sat-1.png)

#### 字母表缩减技术

论文证明了字符串命题 $\psi$ 只需考虑所有约束里出现的字符+每个字符串变量增加一个专属字符。

#### 增量编码细节

**字符串变量 $x$ 编码细节**：假设第 $k$ 次求解的长度上限是 $b_k(x)$，设置 $b_k(x) \times (|\Sigma|+1)$ 个辅助布尔变量表示 $x[i]$ 是否是字符 $j$（其中用 $\lambda$ 表示独立于 $\Sigma$ 外的填充专用字符）。相比于前一次的增量限制为：
$$
h^{b_{k}}_{b_{k-1}}=\left(\bigwedge_{x} \bigwedge_{b_{k-1}(x)+1}^{b_{k}(x)} ExactOne({h^a_{x[i]}} | a \in \{\Sigma, \lambda\})\right) \land \left(\bigwedge_{x} \bigwedge_{b_{k-1}(x)}^{b_{k}(x)-1} h_{x[i]}^\lambda \to h_{x[i+1]}^\lambda \right)
$$
其中第二部分是用来限制占位符后必须全是占位符，保证解的唯一性。

**正则约束 $x \in R$ 编码细节**：构造对应的 NFA $(Q,\Sigma,\delta,q_0,F)$，注意每个状态 $q$ 都设一条连向自己的转移边 $\lambda$。对自动机里的每个状态都设置字符串长度个布尔变量 $S_q^i$，表示字符串变量的前缀 $x[1..i]$ 是否能走到状态 $q$。

通过枚举状态和转移边的组合 $(q,a) \to q'$ 来构造约束：
$$
\bigwedge_{b_{k-1}(x)}^{b_{k}(x)-1} \bigwedge_{(q,a) \in dom(\delta)} \bigwedge_{q' \in \delta(q,a)} (S_q^i \land h_{x[i+1]}^a) \to S_{q'}^{i+1}
$$
每个 $S_q^i$ 集群之间的转移自洽还不够，必须限定 $S_{q'}^i$ 如果为真就必须有一条从 $S_q^{i-1}$ 过来的通路，即：
$$
\bigwedge_{b_{k-1}(x)+1}^{b_{k}(x)} \bigwedge_{q'\in Q} \left(S_{q'}^i \to \bigvee_{(q,a) \in pred(q')} (S_q^{i-1} \land h_{x[i]}^a)\right)
$$
第 $k$ 步判断 $x \in R$ 是否成立，等价于验证 NFA 上走正好 $b_k(x)$ 步能否被接受，即 $Acc(x)=\bigvee_{q_{end}}S_{q_{end}}^{b_k(x)}$。新增一个选择变量 $s_k$，将 $x \in R$ 和 $x \notin R$ 编码为 $s_k \to Acc(x)$ 和 $s_k \to \lnot Acc(x)$，本次要求 $s_k \land \left(\bigwedge_{j<k} \lnot s_j \right)$。

**相（不）等约束编码细节**：命题 $\psi$ 里只会由字符串变量和常量字符串构建相（不）等关系，所以编码相对简单。第 $k$ 次求解时，只需分类考虑 $|w|$ 和区间 $(b_{k-1}(x),b_k(x)]$ 的大小关系，在 $h_{x[i]}^a,w[i],\lambda$ 三者里构建约束。

#### 上界推算

设 $h$ 是字符串命题 $\psi$ 里所有字符串长度之和最短的解，论文希望能确定 $h$ 的上界，来保证算法能停下来。  

首先考虑 normal form（整体是 CNF，每个元素都是不为字符串相等的原子约束）的字符串命题 $\varphi$。如果针对变量 $x_i$ 的约束只含有 $x_i \in R$ 和 $x_i \notin R$ 形式，我们可以构造大型 NFA $M_i=\bigcap_{t=1}^k \mathcal{L}(R_t) \cap \bigcap_{t=1}^l \overline{(R'_t)}$。设  $Q_i$ 是 $M_i$ 的状态集合，可得 $|h(x_i)| \le |Q_i|$。论文进一步证明了若含有 $k$ 个形如 $x_i \ne w$ 的不等约束：
$$
|h(x_i)| \le 2^k \times |Q_1| \times \dots \times |Q_n|
$$

当然在实际实践中，可以先把命题拆成一些变量彼此独立的部分，以减小 $|Q_i|$ 对上限的影响。

针对可能存在的相等约束 $x=w$，我们知道 $|h(x_i)|=|w|$，且 $\psi \land x=w$ 可转化为 $\psi'=\psi[x=w]$ 来消去这条相等约束。如果 $\psi$ 不是 CNF 的形式，可以转化为外层 DNF 内层 CNF 的一般形式，上界就是取最大值。

## Multi-Step IAM Attacks

USENIX 2023, Citi, Ilia Shevrin: [Detecting Multi-Step IAM Attacks in AWS Environments via Model Checking](https://www.usenix.org/conference/usenixsecurity23/presentation/shevrin)

#### 简介

本论文深度基于 AWS 的云上环境，深度建模了 IAM 的鉴权系统，并在此之上创新性地构建了云上多步提权攻击路径检测的 Bounded Model Checking。作者坦言当前的 BMC 是 *not complete* 的，即只能预设一个最大步长来聚焦短的攻击路径，没法像 *k-induction* 那样证明整个系统的安全性。实测发现步长 $\ge 5$ 的路径非常少。

![](Automated-Reasoning-in-Cloud/multi-step-escalation-2.png)

本论文除了构造了 Bool+Str 的常规 SMT 编码外，还提出了一种基于纯 Bool 的 SAT 编码（还原 Str 时需要 SMT 编码）。实验分别测试了同账号场景（资源个数分布在 $200 \sim 700$ 之间）和同组织跨账号场景（账号个数分布在 $5 \sim 80$，平均每个账号有约 $200$ 个资源），可以发现在大规模场景里后者具有明显的优势。

![](Automated-Reasoning-in-Cloud/multi-step-escalation-1.png)

#### IAM 鉴权建模

本论文有明确的威胁假设和覆盖场景，包括：攻击者必须从某个合法的 AWS 身份开始操作，攻击者知道账号或组织下的资源配置和资源名，攻击者仅通过 IAM 体系发起提权（而非网络等方式），切换委托没有时效等。

IAM 鉴权建模完全参照 AWS 对外公开的鉴权流程，下面展示了鉴权全流程图和身份策略鉴权逻辑图。本论文对 *InvokeFunction* 和 *RunInstances* 的建模处理和 *AssumeRole* 很接近，即这两个操作都可以达成目标身份的切换。*UpdateFunctionCode* 可以覆盖 Function 内容，就和 *UpdateAssumePolicyRole* 一样。

![](Automated-Reasoning-in-Cloud/multi-step-escalation-3.png)

#### 框架

整个提权建模就是个 BMC 框架。通过 AWS 的 *GetAccountAuthorizationDetails* 接口拿到详细的云上安全配置并做初始化。实验代码用 JAVA 开发，使用的 SMT 求解器后端是 Z3，通过 Z3 Java API 调用来建模。

![](Automated-Reasoning-in-Cloud/multi-step-escalation-4.png)

#### SMT 转 SAT

值得一提的是论文提出的 String 约束转 Bool 约束的思路。将所有策略里的正则约束全部提权出来构成数组（字符串常量看作一种特殊的正约束），每个字符串变量就能转化成等长的布尔数组，表示是否满足当前正则约束。由于这个数组的顺序不重要，以下用 $str[reg]$ 表示变量 $str$ 关于正则约束 $reg$ 的布尔变量。当整个算法求解结束时，字符串变量获得的其实是一组布尔数组的 01 取值，需要再用一个后处理（*Algorithm 2*）来构造真实串。

整个流程有个预处理（*Algorithm 1*），即两两枚举正则约束 $(reg_1,reg_2)$ 来识别两者的包含关系或者冲突关系，反映在布尔数组的关系里。这个算法最早在 AWS 论文中提出，仅在不含 ? 只含 * 的场景下能保证正确性（约束的完整性）。也就是说，仅 Bool 建模的做法出解后，有可能会发生字符串解无法被还原的严重问题。

![](Automated-Reasoning-in-Cloud/multi-step-escalation-5.png)

## A billion SMT queries a day

CAV 2022 (Invited Paper), AWS, Neha Rungta: [A billion SMT queries a day](

## Incremental Inprocessing in SAT

SAT 2019, Johannes Kepler University, Katalin Fazekas: [Incremental Inprocessing in SAT Solving](https://kfazekas.github.io/papers/FazekasBiereScholl-SAT19.pdf), [Slides](https://kfazekas.github.io/talks/sat2019_talk.pdf)

https://www.amazon.science/publications/a-billion-smt-queries-a-day)

## Zelkova and Z3AUTOMATA

FMCAD 2018, AWS, John Backes: [Semantic-based automated reasoning for AWS access policies using SMT](https://www.amazon.science/publications/semantic-based-automated-reasoning-for-aws-access-policies-using-smt)