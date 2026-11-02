---
categories: Study
cover: ../post_images/
date: 2026-10-27 21:51:06
description: 本文将收集主要由 AI 完成的数学和计算机科学领域的命题证明。
tags: [Review, Math，LLM]
title: AI 证明时刻
updated: 2026-10-27
---

这篇小结按时间倒序记录 AI 参与的数学研究、形式化验证与竞赛解题，包括具体结果、人机分工和后续审读。

## 2026-10-26｜局部平滑：全维挂谷与 Fourier 限制估计

> **背景**：波可以在某一时刻强烈聚焦。Sogge 的局部平滑猜想预言，对时间取平均后，控制波的大小所需的初值光滑性低于固定时刻的要求；这一估计联系着 Fourier 限制、求和与挂谷问题。

10 月 26 日，OpenAI 公开欧氏波方程在所有空间维数 $n\ge2$ 的[局部平滑证明](https://github.com/openai/math/blob/7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a/preprints/Local-smoothing-for-the-Euclidean-wave-equation-October-25-2026/paper.pdf)。

对半波演化及任意 $2\le p<\infty$，论文给出的 Sobolev 阶数为：
$$
s=\max\left\{0,\frac{n-1}{2}-\frac np\right\}+\varepsilon,
\qquad \varepsilon>0,
$$

其中 $p=2$ 时可取 $\varepsilon=0$。证明引入辅助偏微分方程，将波的聚焦控制转化为能量估计。据 [OpenAI 公告](https://openai.com/index/building-scientific-understanding-with-academic-communities/)，模型于 10 月 18 日产生证明，次日完成 Lean 形式化。

论文还给出了**所有维数的挂谷极大函数猜想和挂谷维数猜想**：$\mathbb R^n$ 中每个方向都包含单位线段的集合，其 Hausdorff 维数为 $n$；同时得到 Bochner–Riesz 估计，以及球面、紧抛物面和截断圆锥上的 Fourier 限制估计。10 月 6 日公布的是三维极大函数和四维维数结果，这次则推进到了所有维数。

论文和 Lean 材料都已公开。[形式化范围](https://github.com/openai/math/blob/7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a/lean/docs/079.md)列出半波局部平滑、球面延拓、挂谷极大函数与全维 Hausdorff 维数等命题；限制估计仍有严格的指数范围，局部平滑也保留上述 $\varepsilon$ 损失，并没有覆盖所有端点。

## 2026-10-26｜ETH 被否定：固定宽度 SAT 的次指数时间精确计数

> **背景**：指数时间假设（ETH）预言，含 $n$ 个变量的 3-SAT 在最坏情形下需要指数时间。它比 $\mathsf P\ne\mathsf{NP}$ 更强，也是参数化复杂度与细粒度复杂度中大量条件下界的基础。ETH 的分量不只在于 3-SAT 本身：许多“某类问题不可能有更快算法”的论证，都以它为起点。因此，一旦反例成立，受到冲击的是这一整类困难性判断，而不只是一个算法纪录。

OpenAI 公开了[一项确定性算法](https://github.com/openai/math/blob/7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a/preprints/The-Exponential-Time-Hypothesis-is-False-October-25-2026/paper.pdf)：对每个固定 $k\ge2$，精确计算 $n$ 个变量、$m$ 个子句的 $k$-CNF 公式的满足赋值数，使用多项式空间，时间为

$$
(n+m)^{O_k(1)}\,2^{O_k\!\left(n\log\log n/\sqrt{\log n}\right)}.
$$

若 $m\le Dn$ 且 $D$ 固定，指数进一步降为 $O_{k,D}(n/\sqrt{\log n})$。算法使用辅助变量的多项式插值与分组求和，较强定量界由张量收缩得到。只要看计数是否大于零，就能判断公式是否可满足，所以 $k=3$ 的情形已经构成 ETH 的反例。每个固定 $k$ 的精确计数界也否定了 SETH、计数版本 #ETH 和 Gap-ETH。论文还由此得到固定颜色数的图着色计数、独立集计数等次指数算法。

据 [OpenAI 公告](https://openai.com/index/building-scientific-understanding-with-academic-communities/)，模型于 10 月 16 日产生证明，17 日完成形式化。[目前 Lean 已覆盖的结论](https://github.com/openai/math/blob/7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a/lean/docs/378.md)是：在规范编码长度 $L$ 下，用多项式空间达到 $(L+1)^{O_k(1)}2^{O_k(n(\log\log n)^2/\sqrt{\log n})}$。这个界比论文主定理多了一个 $\log\log n$ 因子，不过仍是次指数时间，足以否定 ETH。

Aaronson 在 [10 月 26 日博客](https://scottaaronson.blog/?p=10239)中记录并讨论了这一结果。次指数时间当然不是多项式时间，所以这并没有解决 P 与 NP。依赖 ETH 的条件归约本身仍然成立，只是原来的困难性判断不能再靠这个假设支撑，相关工作也不会因此自动获得更快的算法。

<a id="yang-mills-qcd"></a>

## 2026-10-26｜四维量子场论：QCD 与 Yang–Mills 严格存在性证明的公告

> **背景**：量子场论的严格存在性要求构造满足相应公理的数学对象。[Clay 的 Yang–Mills 问题](https://www.claymath.org/wp-content/uploads/2022/06/yangmills.pdf)还要求正质量隙，即真空与激发态之间存在严格为正的能量间隔；存在性只是其中一部分。

据 [OpenAI 公告](https://openai.com/index/building-scientific-understanding-with-academic-communities/)，内部模型沿 Balaban 的构造性量子场论路线，得到了四维时空中若干包含规范场与费米子的相互作用理论的严格存在性证明，涵盖 QCD 及一种包含标准模型规范场、费米子的统一补全；纯 Yang–Mills 理论的存在性是其子问题。这个统一补全不包含引力，公告也没有声称证明了质量隙。

据公告，纯 Yang–Mills 存在性的自然语言证明于 9 月 9 日产生，QCD 证明于 9 月 18 日产生；10 月 16 日完成的是 Yang–Mills 存在性的 Lean 形式化，公告没有说明 QCD 和统一理论的全部结论都已完成形式化。

独立工作组选择暂不公开模型原始证明，先自行撰写论述。截至 10 月 27 日，证明包还没有公开；Yang–Mills 千禧年问题要求的质量隙，同样不在此次公告的结论中。

## 2026-10-19｜Siegel 零点：证明简化与有效常数

OpenAI 第 003 组的 *Uniform exclusion of Landau–Siegel zeros* 写道：存在统一的 $c>0$，使相应实特征 $L$ 函数的实零点 $\beta$ 满足 $1-\beta\ge c/\log q$，其中 $q$ 为导子，排除异常贴近 1 的零点；[形式化范围](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/lean/docs/003.md)另有说明。

10 月 19 日，[陶哲轩梳理](https://terrytao.wordpress.com/2026/10/19/a-sketch-of-the-proof-of-non-existence-of-siegel-zeroes/) Banks、Kerr 与 Ben Green 的后续解释，介绍 Green 的简化路线：构造一个非零整数，利用多项式在特定格点的取值和重数，同时控制它的通常绝对值以及在许多素数处的整除性，再比较两者得到所需的界。陶哲轩披露使用 SAIR 的数学模型辅助理解，并与多位数学家讨论。

10 月 20 日，他提出进一步量化常数的[公开挑战](https://terrytao.wordpress.com/2026/10/20/an-experimental-ai-math-challenge-using-tenth-discriminant-bounds-to-explore-arguments-ruling-out-siegel-zeroes/)，为假想的“第十个类数一判别式”寻找有效上界。这个挑战考察的是新方法的定量能力；类数一问题本身此前已有解答。

[准黎曼界追踪项目](https://github.com/GTimG/QuasiRiemannTracker)持续收集后续改进，并区分提交与验证状态。

## 2026-10-08｜Busy Beaver：超过 Graham 数与一致性机器压缩

> **背景**：Busy Beaver 研究具有固定状态数且最终停机的图灵机，最多能运行多少步或留下多少个 1。此处构造主要按停机时纸带上的 1 的数量计分，依靠递推分析而非实际跑完全部步骤来证明下界。

[Jeffrey Ketchersid 与 Claude 智能体的项目](https://github.com/jeff87654/busy-beaver)给出 **10 状态机器计分超过 Graham 数**的证明。Aaronson 在 [10 月 12 日的更新](https://scottaaronson.blog/?p=10169)中记录，团队还将“停机当且仅当 ZFC 不一致”的机器从 393 状态压缩到 335 状态。

10 月 14-19 日，Mira-Cult 先给出 254 状态构造，mira-emmy 随后将其压缩到 **[253 状态](https://github.com/jeff87654/busy-beaver/tree/main/ZF)**，并给出 Coq 中的端到端等价性证明。10 月 22 日，仓库还记录了负责人运行 Gemini Argon 得到的 $BB(7)$ 候选和机器检查证明，并注明这些结果尚未经过 bbchallenge 社区审阅。

这些结果给出了构造下界和更紧凑的一致性编码，但还没有确定 $BB(7)$、$BB(10)$ 的精确值。至于“停机当且仅当 ZFC 不一致”，这个等价性本身并不证明 ZFC 不一致。

## 2026-10-08｜AlphaProof Nexus：论文发表于 Science

10 月 8 日，DeepMind 的 [*Advancing Mathematics Research with AI-Driven Formal Proof Search*](https://doi.org/10.1126/science.aej2213) 发表于 *Science*，对应 [5 月 21 日公开的预印本](https://arxiv.org/abs/2605.22763)。论文报告的结果仍是在选定的 353 道 Erdős 开放题中解决 9 道、在 492 项 OEIS 猜想中证明 44 项。系统让语言模型提出并修改 Lean 证明，再根据检查器反馈迭代。这次主要是期刊发表，不是一轮新的实验。

## 2026-10-06｜OpenAI：批量公开大量研究成果

10 月 6 日，OpenAI 公开 **[372 组结果](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/CONTENTS.md)、722 篇手稿**；次日撤回三篇后，目录保留 **719 篇**。

[仓库记录](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/README.md)了约 4,000 个尝试问题，以及每项结果平均约三小时的 ChatGPT Pro thinking 等价算力。更新日志列出 **300/719 篇手稿的主要结果已有形式化，约占 42%**。独立条目之外的结果，按方向列在下表中。

| 方向       | 结果                     | 结论及适用范围                                               | 来源                                                         |
| ---------- | ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 数论       | Catalan 常数             | 报告 $G=1-1/3^2+1/5^2-\cdots$ 无理；提供 Lean 入口。         | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Catalans-constant-is-irrational-September-24-2026/paper.pdf) |
| 数论       | Artin 原根               | 对于不等于 −1 且不是完全平方数的整数 $a$，当 $x$ 充分大时，区间 $(x,2x)$ 内至少有 $c_a x/(\log x)^2$ 个素数以 $a$ 为原根。得到无穷性和下界，尚非精确密度公式。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Primitive-roots-for-every-admissible-integer-base-October-4-2026/primitive-roots-all-integer-bases.pdf) |
| 数论       | 虚二次域模性             | 称所有虚二次域上的椭圆曲线都具有相应的模性，并匹配各处局部参数；延续 Caraiani–Newton 等人的工作，Bao Le Hung 已整理、推广相关论证。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Modularity-of-elliptic-curves-over-imaginary-quadratic-fields-October-4-2026/paper.pdf)；[解读](https://galoisrepresentations.org/2026/10/08/a-brief-digest-of-some-new-openai-results/) |
| 代数几何   | CM 阿贝尔簇的 Hodge 猜想 | 称在 CM 阿贝尔簇上，所有维数和余维的有理 Hodge 猜想均成立，并联系有限域阿贝尔簇的 Tate 猜想；未覆盖一般光滑射影复代数簇，与下述撤稿路线不同。10 月 26 日新增 Lean 形式化，覆盖 CM 情形的主命题，未覆盖 Tate 等推论。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/The-rational-Hodge-conjecture-for-CM-abelian-varieties-October-6-2026/paper.pdf)；[新增形式化](https://github.com/openai/math/blob/7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a/lean/docs/032.md) |
| 算法       | 整数乘法                 | $n$ 位整数的确定性乘法位复杂度为 $O(n(\log n)^{1-\kappa})$，$\kappa=2^{-182}$；采用多带图灵机模型，突破 $n\log n$ 猜想界，尚无实用性能结论。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Integer-multiplication-below-n-log-n-September-23-2026/paper.pdf) |
| 算法       | 精确离散 Fourier 变换    | 运算数为 $O(n(\log n)^{1-\delta})$，$\delta=10^{-13}$；采用精确复数算术，不对系数设界，并假设给定单位根；这不是浮点 FFT 或位复杂度结论。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/An-explicit-power-saving-for-the-exact-discrete-Fourier-transform-September-25-2026/main.pdf) |
| 图算法     | 完美匹配计数             | 给出一般图的完全多项式随机近似方案（FPRAS），可精确识别零计数；不是精确计算全部匹配数。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/A-Fully-Polynomial-Randomized-Approximation-Scheme-for-Perfect-Matchings-in-General-Graphs-September-23-2026/main.pdf) |
| 图算法     | 最大基数匹配             | 使用 $(n+m)^{1+o(1)}$ 次字操作，以至少 $2/3$ 的成功率找到一般图的精确最优匹配。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Almost-Linear-Time-Maximum-Cardinality-Matching-in-Sparse-General-Graphs-September-24-2026/main.pdf) |
| 计算代数   | 素数域多项式分解         | 对二进制给出的素数 $p$，在关于次数 $n$ 和 $\log p$ 的多项式位时间内，确定性地分解稠密多项式，不依赖 GRH 或随机性。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Deterministic-Polynomial-Factorization-over-Prime-Fields-October-4-2026/Deterministic-Polynomial-Factorization-over-Prime-Fields.pdf) |
| 量子计算   | 酉变换合成               | 任意 $n$ 量子比特酉变换可借助依赖该变换的经典布尔 oracle，由多项式规模量子电路以 diamond 范数误差至多 $1/2$ 实现；oracle 大小不限，未给出高效构造它的方法。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Polynomial-Time-Unitary-Synthesis-from-a-Boolean-Oracle-October-5-2026/paper.pdf) |
| 量子计算   | 查询复杂度分离           | 对于总布尔函数，随机与量子查询复杂度之间实现了近四次方分离，使已知四次方上界在指数上最优；查询之间的计算不计成本。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/A-Nearly-Quartic-Separation-Between-Randomized-and-Quantum-Query-Complexity-October-5-2026/quartic-query-separation.pdf) |
| 数学物理   | 二维面积律               | 在有限平方格点上，具有统一全系统谱隙、有限程且局部作用有界的 Hamiltonian，其唯一基态满足熵面积律；配套 PEPS 近似的存在性不等于高效构造算法。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/A-two-dimensional-area-law-from-a-global-spectral-gap-September-24-2026/paper.pdf) |
| 数学物理   | 二维 $O(3)$ 模型         | 构造规范连续极限，得到唯一真空和正质量隙；同组论文还涉及 $O(n)$、$n\ge3$ 的正温度指数关联衰减及 $O(4)$ 质量渐近。不是[四维 Yang–Mills 问题](#yang-mills-qcd)的解答。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/The-canonical-massive-continuum-limit-of-the-two-dimensional-O3-model-October-4-2026/massive-continuum-o3.pdf) |
| 数学物理   | Bose–Einstein 凝聚       | 三维稀薄硬球气体在固定排斥距离、充分低密度及某个严格正温度下，热力学极限下的凝聚比例为正；包含粒子相互作用。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Bose-Einstein-condensation-at-positive-temperature-in-the-dilute-hard-sphere-gas-October-5-2026/positive-temperature-hard-spheres.pdf) |
| 数学物理   | Heisenberg 铁磁体        | 报告有限程模型的自发磁化及三维低温 Bloch $T^{3/2}$ 定律，包含精确系数与相关修正。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Blochs-Law-for-Finite-Range-Heisenberg-Ferromagnets-in-Three-Dimensions-October-5-2026/bloch-law-heisenberg.pdf) |
| 解析数论   | 二点 Chowla 猜想         | 报告普通平均下的二点相关性消失及修正后的二元 Elliott 猜想；区别于对数平均，未覆盖任意阶 Chowla 猜想。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Ordinary-two-point-correlations-of-multiplicative-functions-September-24-2026/final.pdf) |
| 调和分析   | 挂谷                     | 报告三维挂谷极大函数猜想及四维挂谷集 Hausdorff 维数为 4；形式化已超出[已有的三维维数证明](#kakeya-3d-formalization)，但这批结果没有覆盖任意维；10 月 26 日已另行公布全维结果，见[局部平滑条目](#local-smoothing-kakeya)。 | [三维](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/The-Kakeya-maximal-conjecture-in-three-dimensions-September-23-2026/paper.pdf)；[四维](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Every-four-dimensional-Kakeya-set-has-full-Hausdorff-dimension-September-24-2026/paper.pdf) |
| 凸几何     | Mahler 猜想              | 报告所有维数的对称、非对称体积乘积锐下界及取等情形，极值分别由 Hanner 多面体和适当中心化的单纯形达到。 | [对称](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/The-symmetric-Mahler-conjecture-and-its-equality-cases-September-22-2026/paper.pdf)；[一般](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/The-Mahler-Conjecture-for-General-Convex-Bodies-September-22-2026/paper.pdf) |
| 离散几何   | 平面单位距离着色         | 报告五种颜色仍不足，使平面色数只剩 6 或 7 两种可能；未确定精确值。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/The-Euclidean-plane-is-not-five-colorable-September-23-2026/paper.pdf) |
| 离散几何   | Borsuk 问题              | 构造 $\mathbb R^9$ 中不能由十个更小直径集合覆盖的紧集，降低反例维数；构造来自四维直线的秩一正交投影矩阵，不直接等同于有限点集版本。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/A-nine-dimensional-counterexample-to-Borsuks-covering-assertion-September-23-2026/paper.pdf)；[解读](https://gilkalai.wordpress.com/2026/10/21/progress-on-borsuks-problem-and-answer-to-tyi-60/) |
| 图论       | Hadwiger 猜想            | 给出 Hadwiger 猜想的反例，并称分数染色版本也不成立；与平面单位距离着色问题不同。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/A-counterexample-to-Hadwigers-conjecture-September-23-2026/paper.pdf) |
| 图论       | Sidorenko 猜想           | 以 35 个顶点、66 条边的连通二分图模式，反驳同态密度的一般下界，并影响相关 forcing 猜想。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/A-counterexample-to-Sidorenkos-conjecture-September-23-2026/paper.pdf) |
| 群论       | Thompson 群 $F$          | 报告 $F$ 非可和；该群不含非阿贝尔自由子群，不能用常见的自由子群障碍直接判断。10 月 13 日有 [人类重写版论文](https://arxiv.org/abs/2610.18360) 和 [与 AI 合作的回顾文章](https://justintatchmoore.github.io/homepage/10-6-2026.html) | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Thompsons-group-F-is-nonamenable-September-23-2026/paper.pdf) |
| 环论       | 无挠群的群环             | 构造特征 2 上的非零零因子；另一篇给出 $ab=1$ 而 $ba\ne1$ 的直接有限性反例，并联系 nonsofic 群。不能直接推广到特征 0。 | [零因子](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/A-Torsion-Free-Group-Algebra-with-Zero-Divisors-September-23-2026/paper.pdf)；[直接有限性](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/A-Torsion-Free-Group-Algebra-That-Is-Not-Directly-Finite-October-4-2026/direct-finiteness.pdf) |
| 算子代数   | 自由群因子同构           | 报告 $L(F_2)$ 与 $L(F_3)$ 同构，推出相应插值自由群因子的同构；同构对象是 von Neumann 代数，自由群本身并不同构。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/An-isomorphism-of-the-free-group-factors-September-23-2026/An-isomorphism-of-the-free-group-factors-September-23-2026.pdf) |
| 概率       | 一般图渗流               | 在满足 $p_c<1$ 的无限、连通、局部有限、拟传递图上，临界键渗流没有无限簇；另报告非可和拟传递图上 $p_c<p_u$，两个阈值间存在非唯一性区间。 | [临界行为](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/No-percolation-at-criticality-on-quasi-transitive-graphs-September-24-2026/paper.pdf)；[非唯一性](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Nonuniqueness-of-percolation-on-nonamenable-quasi-transitive-graphs-September-24-2026/paper.pdf) |
| 集合论     | 分割原则与选择公理       | 分割原则要求每个满射的目标集都能单射回原集合。论文报告：若 ZF 相容，则 ZF 加上分割原则、序数指标族的选择原则及选择公理的否定也相容。Lean 覆盖相对相容性结论；另一传递模型构造的端点还包含额外的大基数假设，形式化也未覆盖论文所述的全部保持性质。Asaf Karagila 的初读批评原文表述与引用，尚未认可其正确性。 | [论文](https://github.com/openai/math/blob/7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a/preprints/The-Partition-Principle-does-not-imply-Choice-September-24-2026/partition-principle-without-choice.pdf)；[形式化范围](https://github.com/openai/math/blob/7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a/lean/docs/244.md)；[Karagila 的评论](https://karagila.org/2026/openai-pp/) |
| 偏微分方程 | Vlasov–Maxwell           | 三维单物种相对论性系统的大初值全局经典解存在且唯一；要求初值相容、粒子密度光滑紧支撑，电磁场有限能量且各阶导数有界。系统不含 Landau 碰撞项。 | [论文](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Global-classical-solutions-of-the-three-dimensional-relativistic-Vlasov-Maxwell-system-September-23-2026/paper.pdf) |

**撤稿与修订。** [10 月 7 日撤回的三篇](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/history.md)分别涉及分裂阿贝尔八维簇的 Weil 类、K3 曲面的 Kuga–Satake 对应及 K3 曲面乘积的有理 Hodge 猜想。[Lekili–Sheridan 于 10 月 22 日指出](https://arxiv.org/html/2610.30976v1)，论文混用自交符号约定，使构造留下次数为 2 的自交点，并在所分析情形下产生障碍，原先的无障碍 Lagrangian 浸入论证因此失效，需要新的数学输入修复。同日还有 14 篇修补了证明或澄清了条件，13 篇更新了引用，这些都不属于撤稿。CM 阿贝尔簇论文仍列于目录，使用另一条路线。

本节的批量发布统计和论文链接仍采用 10 月 12 日版本。10 月 26 日新增局部平滑和 ETH 两篇手稿后，目录增至 **721 篇、373 组**，并补入 CM Hodge 形式化；这些更新见[新版本仓库](https://github.com/openai/math/blob/7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a/README.md)与[更新日志](https://github.com/openai/math/blob/7ef5c0cc5ca4b0e072b7a050fca09ab24bc6fa3a/history.md)。

**社区修订。** 10 月 24 日，研究者在[陶哲轩博客](https://terrytao.wordpress.com/2026/10/24/oai-math-revised-a-community-hub-for-revising-openais-math-write-ups/)介绍 [`oai-math-revised`](https://github.com/mathcommunity/oai-math-revised/)，邀请大家共同改善手稿的可读性、补全引用，并建立可浏览的修订版本。项目侧重澄清陈述、依赖和证明，不为所收录论文作统一的正确性背书。

相关解读：[Aaronson 综述](https://scottaaronson.blog/?p=10169)；[Persiflage 数论解读](https://galoisrepresentations.org/2026/10/08/a-brief-digest-of-some-new-openai-results/)；[Kalai 综述](https://gilkalai.wordpress.com/2026/10/07/updates-sharing-ai-progress-on-mathematics-amazing-and-my-lecture-plans/)；[数学物理专家访谈](https://www.scientificamerican.com/article/the-most-exciting-claims-from-openais-heap-of-new-proofs/)。

## 2026-10-06｜准黎曼猜想：固定半平面的无零区域

> **背景**：黎曼猜想要求 $\zeta$ 函数所有非平凡零点的实部为 $1/2$；准黎曼猜想只要求存在固定 $\theta<1$，使实部大于 $\theta$ 的半平面无零。后者仍强于随高度增大而贴近实部 1 的经典无零区域。

OpenAI [第 003 组](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/The-Quasi-Riemann-Hypothesis-September-30-2026/paper.pdf)称，$\zeta(s)$ 及所有 Dirichlet $L$ 函数在 **$\operatorname{Re}(s)>7/8$** 的半平面无零，另一路线得到 **$\operatorname{Re}(s)>11/12$**。$7/8$ 结论还覆盖 $\mathbb Q(\sqrt{-3})$ 上的有限阶 Hecke $L$ 函数；主特征在 $s=1$ 的极点不在函数取值的通常论域内。

固定半平面界把零点统一推离实部 1，因而可以改善素数分布的误差估计。[Persiflage 的解读](https://galoisrepresentations.org/2026/10/08/a-brief-digest-of-some-new-openai-results/)讨论了它与既有无零区域的区别。但它没有证明零点全部位于临界线，也不覆盖任意数域、任意 $L$ 函数。仓库的 [Lean 范围说明](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/lean/docs/003.md)未包含论文全部后续应用。

## 2026-10-06｜Hilbert 第十问题：有理数版本被证明不可判定

> **背景**：整数上的 Hilbert 第十问题已有否定答案。改问多项式是否有有理数解时，分母带来的自由度使整数版本的证明不能直接移植。

OpenAI [第 004 组](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Hilberts-tenth-problem-over-the-rational-numbers-October-6-2026/main.pdf)称，不存在一个总能终止并正确判断任意整数系数多项式是否有有理零点的算法。输入允许任意变量数，结论是[一般有理方程求解的不可判定性](https://scottaaronson.blog/?p=10169)。

这并不排除具体方程或受限方程族存在有效算法。[Persiflage 的解读](https://galoisrepresentations.org/2026/10/08/a-brief-digest-of-some-new-openai-results/)特别区分了一般问题与曲线情形。

## 2026-10-06｜$\pi$：无理性指数达到 2

> **背景**：无理性指数衡量有理数逼近一个实数所能达到的精度。Roth 定理给出代数无理数的指数为 2，但不能直接用于超越数 $\pi$。

OpenAI [第 017 组](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/The-irrationality-exponent-of-pi-is-2-September-24-2026/paper.pdf)给出的结果是 **$\pi$ 的无理性指数为 2**：对任意 $\varepsilon>0$，当分母 $q$ 足够大时，所有 $p/q$ 都满足

$$
\left|\pi-\frac pq\right|\ge q^{-2-\varepsilon}.
$$

论文还得到 Flint–Hills 级数 $\sum_{n\ge1}1/(n^3\sin^2n)$ 收敛，其中角度使用弧度。[Persiflage 的解读](https://galoisrepresentations.org/2026/10/08/a-brief-digest-of-some-new-openai-results/)讨论了相关构造与参数优化。结论限制的只是渐近逼近指数，仍可能存在无穷多个误差达到 $q^{-2}$ 量级的有理逼近。

## 2026-10-06｜BSD 与 Goldfeld：低 Selmer 余秩与扭曲族密度

> **背景**：BSD 猜想联系椭圆曲线有理点群的秩与 $L$ 函数的零点阶数，并预言首项系数公式。Goldfeld 猜想预测，固定椭圆曲线的二次扭曲中，秩 0 与秩 1 各占一半。

OpenAI [第 002 组](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Exact-Birch-Swinnerton-Dyer-Formula-from-Low-Selmer-Corank-October-7-2026/exact-bsd-low-selmer-corank.pdf)称，当某个素数 $q$ 对应的完整 $q$ 幂 Selmer 群余秩为 0 或 1 时，成立秩等式、Tate–Shafarevich 群有限性及完整 BSD 首项公式。[第 006 组](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Goldfelds-analytic-density-conjecture-and-the-2-converse-for-elliptic-curves-October-7-2026/paper.pdf)报告，每条有理椭圆曲线的二次扭曲族中，解析秩 0、1 分别具有 $1/2$ 的密度，平均解析秩趋于 $1/2$；扭曲参数取有符号无平方因子整数 $d$，按 $\lvert d\rvert$ 排序。

把两部分结合起来，论文称，对每条固定曲线，都存在一个密度为 1 的二次扭曲子族满足完整 BSD；一般高秩情形并未覆盖。10 月 15 日，Ashay Burungale 发表[技术解读](https://galoisrepresentations.org/2026/10/15/bsd-and-the-p-converse-guest-post-ashay-burungale/)，把论证与 Gross–Zagier、Kolyvagin、Iwasawa 理论及 Selmer 分布结果联系起来，并注明证明正确性仍在分析中。

## 2026-10-06｜Unique Games 猜想获证：近似算法的困难性阈值

> **背景**：Unique Games Conjecture（UGC）是许多优化问题近似比下界的核心假设，涉及区分“几乎所有约束可满足”与“只能满足极少约束”的困难性。

OpenAI 第 102 组给出了 [UGC 的证明](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/The-Unique-Games-Theorem-September-23-2026/paper.pdf)，并给出 Max-Cut 的 Goemans–Williamson 近似比、Vertex Cover 的二倍阈值，以及 Min-UnCut 和有向反馈顶点集常数因子困难性的直接归约。相关最优性结论由此不再依赖 UGC 假设。

这里证明的是 NP-hardness：若能高效越过相应阈值，就能导出 NP 问题的多项式时间算法；但它本身并没有证明 $\mathsf P\ne\mathsf{NP}$。仓库公开了[五项形式化的范围说明](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/lean/docs/102.md)。[Dana Moshkovitz 的初读](https://scottaaronson.blog/?p=10169)认为构造不同于熟悉的 long code、short code，同时指出原文难读，引用和解释也不足。

## 2026-10-06｜$\mathsf L=\mathsf{RL}=\mathsf{BPL}$：对数空间的去随机化

> **背景**：$\mathsf L$ 是确定性对数空间可判定的语言类；$\mathsf{RL}$、$\mathsf{BPL}$ 允许随机选择，分别容忍单侧和双侧有界错误。

OpenAI [第 103 组](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Exact-Derandomization-of-Logarithmic-Space-L-equals-RL-equals-BPL-September-23-2026/paper.pdf)称 **$\mathsf L=\mathsf{RL}=\mathsf{BPL}$**，给出一种有效过程，把相应的随机机器（多项式时间、对数空间）转换为确定性对数空间判定器，同时保证运行时间为多项式。

这一[去随机化结果](https://scottaaronson.blog/?p=10169)消除了对数空间约束下随机性带来的能力差别，但一般多项式时间的去随机化问题 $\mathsf P=\mathsf{BPP}$ 仍未解决。目录提供了对应 Lean 入口。

## 2026-10-06｜矩阵乘法：复数域渐近指数不超过 $9/4$

> **背景**：矩阵乘法指数 $\omega$ 衡量 $n\times n$ 矩阵相乘的渐近算术复杂度，与固定大小矩阵需要多少次标量乘法是不同指标。

OpenAI [第 107 组](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Matrix-Multiplication-Nine-Fourths-October-2-2026/paper.pdf)称，复数域上 **$\omega\le9/4=2.25$**，即对每个 $\varepsilon>0$，都存在算术复杂度为 $O_\varepsilon(n^{9/4+\varepsilon})$ 的算法。同组还改进矩形矩阵乘法，并给出任意固定域上的另一上界 $\omega<2.371054886006746$。

[形式化说明](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/lean/docs/107.md)分别列出复数域和一般域的命题。这里统计的是[算术运算次数](https://scottaaronson.blog/?p=10169)，不是大数位复杂度；它也不保证存在复杂度恰好为 $O(n^{2.25})$、常数因子又实用的实现。

## 2026-10-06｜Erdős 等差数列猜想：倒数和发散的整数集

> **背景**：Szemerédi 定理要求整数集有正密度；Erdős 的加强猜想只要求 $\sum_{a\in A}1/a$ 发散，允许密度趋于零。

OpenAI [第 159 组](https://github.com/openai/math/blob/1581d4cbdd69a0faf34b2089614fe2a814316a6a/preprints/Quasipolynomial-Bounds-for-Arithmetic-Progressions-September-23-2026/paper.pdf)称，对每个固定 $k\ge3$，不含非平凡 $k$ 项等差数列的 $A\subseteq\{1,\ldots,N\}$ 满足

$$
|A|\le C_k N\exp\!\left[-c_k(\log N)^{\varepsilon_k}\right],
\qquad c_k,\varepsilon_k>0.
$$

由这个界可以推出，任何倒数和发散的正整数集都包含任意有限长度的等差数列。这把此前关于三项等差数列的结果推广到了任意固定长度。目录列有形式化入口；[Kalai 的综述](https://gilkalai.wordpress.com/2026/10/07/updates-sharing-ai-progress-on-mathematics-amazing-and-my-lecture-plans/)将其与 Roth 定理及 Bloom–Sisask 的工作作了对照。

## 2026-10-05｜3SUM 与 APSP：真正次二次、次三次算法

> **背景**：3SUM 判断给定数列中是否有三个不同位置的数之和为零；APSP 计算图中所有顶点对的最短路。两者的二次、三次时间障碍，是细粒度复杂度中许多条件下界的基础。

10 月 5 日，Josh Alman 与 Virginia Vassilevska Williams [提交论文](https://arxiv.org/html/2610.06783v1)，给出了 **$O(n^{1.9992})$ 的 3SUM 算法**与 **$O(n^{2.9995})$ 的 APSP 算法**；后者的精细主定理给出指数 2.99942。整数版本在 word-RAM 模型中计时，数值或边权具有多项式大小。算法只计算瘦矩阵乘积中的指定元素，将任务转为不平衡稀疏三部图中的三角形计算，并通过归约把这些改进推进到 Exact Triangle、零权 $k$-Clique 等问题。

作者披露，Anthropic 内部的 Claude 在研究密码学的平均情形困难性时发现了算法，并将其扩展到最坏情形；这次会话产生约 1,600 万输出 token，期间没有人工输入。两位作者在 9 月获得结果及合作报酬，之后简化、加强并推广了算法，写成论文。

[Aaronson 指出](https://scottaaronson.blog/?p=10169)，这是固定正数幅度的指数改进，突破了相应版本的 3SUM/APSP 假设。项目公开了 [Lean 形式化](https://github.com/anthropics/formal-math/tree/main/3sum-apsp)，其中整数 word-RAM 的五个主要结论有对应端点；实数版本及部分归约的运行时间并未全部覆盖。论文仍为预印本。

## 2026-10-02｜Meta：六篇人机合作论文

10 月 2 日，Meta 公布了研究者使用 Muse Spark 1.1、1.2 完成的[六篇合作论文](https://research.meta.ai/blog/solving-open-research-problems-together)，其中五篇被项目方列为对开放研究问题的回答。数学家通过聊天界面引导研究，另一组研究者审读；论文分别标注人类与 AI 起草的部分。

高维概率论文给出高斯随机点椭球精确拟合的阈值，点数约为维数平方的四分之一；结论覆盖严格低于和高于阈值的情形，临界点仍未解决。偏微分方程论文证明，在相应维数条件下，质量临界双调和非线性 Schrödinger 方程的径向负能量解有限时间爆破。有限群论文利用模型生成的 GAP 程序找到 384 阶反例，否定“半阿贝尔群必为单项式群”的猜想。

其余三篇的工作分别是：刻画长度为三的特定 $\alpha$-cycle 的循环松弛何时精确；将曲线高度函数与 $p$-adic 弦论二点函数联系起来；给出演化代数分类判据的三维反例和替代刻画。团队还披露了椭球拟合、有限群和演化代数方向的独立同期工作。需要区分的是，公布的合作审读流程并不是期刊同行评审。

## 2026-09｜$\zeta(5)$：无理性证明与 Lean 形式化

> **背景**：Apéry 证明了 $\zeta(3)$ 无理，但其他指定奇数点值的无理性仍需分别证明；已知无穷多个奇数点值无理，并不能直接推出 $\zeta(5)$ 无理。

A. Fauzan 的[《$\zeta(5)$ is irrational》](https://zenodo.org/records/22826419)手稿日期为 9 月 17 日。9 月 23 日，[`mo271/zeta5` 项目](https://github.com/mo271/zeta5)提交了完整的 Lean 形式化，并接入 Comparator 检查；Epoch 随后将[对应的 FrontierMath 开放问题](https://epoch.ai/frontiermath/open-problems/apery-irrationality)标为 **Solved (human + AI)**。证明通过构造整数系数多项式，使其在 $\zeta(5)$ 处的值严格为正且衰减足够快，从而排除有理性。

形式化对原稿作了调整：修改素数分段阈值、秩损失估计和局部赋值论证，改用较弱但已经足够完成证明的衰减估计。据仓库记录，主定理只依赖 Lean 标准公理。形式化仓库记录了作者和手稿日期，不过没有明确说明原始研究使用的是哪个模型。

## 2026-09｜Hodge 猜想：匿名消息称接近解决

9 月 17 日，[The Decoder](https://the-decoder.com/openai-reportedly-closes-in-on-solving-the-hodge-conjecture-its-second-millennium-prize-problem/)引述匿名消息称，OpenAI 可能接近解决 Hodge 猜想；[此前报道](https://officechai.com/ai/after-navier-stokes-openai-says-it-has-made-substantial-progress-on-another-millenium-prize-problem/)也提到未具名的“另一个千禧问题”。当时还没有公开证明可供核对。10 月公布的 CM 阿贝尔簇结果及另一路线的三篇撤稿，可参见对应条目。

## 2026-09｜MVUEH：人机协作恢复 1941 年 Enigma 消息

> **背景**：Enigma 的转子、环设置和插线板共同决定每个字母的替换；短电文即使有已知词，也可能受到抄本差异和密钥流程的影响。在这项工作之前，[1941 年德国陆军电文 MVUEH 的存档](https://cryptocellar.org/bgac/1941-msg-list.html)仍将其标为未解。

9 月 14-15 日，Carter Leffen 主导调查，使用 GPT-6 Astra 和专用代理检索历史资料、比较模糊字母、编写 Enigma 模拟器和搜索程序，并复核候选密钥。[公开项目](https://mvueh-enigma-solved.carterl.chatgpt.site/)给出一组设置：转子 II–V–III、反射器 B、环 H–M–F、正文窗 R–W–D，以及十对插线；它能同时解释 82 个正文字符和独立的 GTA/KCI 报头。机器字面输出保留 `BTTE` 和 `WASCHBBSCH` 等拼写，`Bitte`、`Waschbusch` 及标点属于编辑性解释。

[媒体引述 Leffen](https://the-decoder.com/openais-gpt-6-astra-decrypts-a-nazi-radio-message-in-ten-hours-that-went-unsolved-for-83-years/) 称模型约运行十小时，但[项目页面记录](https://mvueh-enigma-solved.carterl.chatgpt.site/download/completion-report.md)的是跨两日的研究过程，未单独统计人类工作与模型推理时长。设定目标、选择线索和作出关键判断的仍是人类。项目公开了搜索数据、代码和复现材料。不过，结论依赖项目声明的转子、反射器、插线、字母候选范围和 `ROSENOWROSENOW` crib 等假设，不能证明所有 Enigma 配置下的唯一性。消息的签名、具体 Rosenow 地点和历史转发关系仍待密码史、德语及档案专家独立评阅。

## 2026-09｜四臂多骨牌：完整分类与 Lean 验证

[9 月 11 日提交的论文](https://arxiv.org/abs/2609.13641)研究在方格中心连接四条直臂的多骨牌，按它们能否铺满矩形、条带、半平面和整个平面等情形作了完整分类，并给出 Lean 4 形式化。作者说明，分类延续 2020-2021 年的人类工作，后续证明开发与形式化工作得到 AI 协助，Lean 检查覆盖分类命题及有限证书。

## 2026-09｜三维挂谷：连接两项形式化开发

> **背景**：挂谷集在每个方向上包含单位线段。三维挂谷猜想要求这些集合的 Hausdorff 维数为 3；“粘性”条件下的 Assouad 维数估计是证明中的一个重要组成部分，两种维数不能直接混用。

[南开大学郭少明等人与字节跳动 Seed AI4Math 团队的项目](https://github.com/M32026/3d-sticky-kakeya)形式化了 Wang–Zahl 的粘性挂谷 Assouad 维数下界，即所引论文的 Theorem 5.2，并提供了 Wolff 的 hairbrush 估计等配套理论。单看这个形式化端点，它只是完整三维证明所需的一项输入。

Numina 的 [`kakeya-3d` 项目](https://github.com/project-numina/kakeya-3d)则提供连接层，将前述结论转为其核心证明需要的 `StickyFrostmanHypothesis`，同时处理两项开发在覆盖条件和定义上的差异。README 区分了保留该假设的核心定理与消去该假设的 `Unconditional.KakeyaDimensionThree`；后者断言三维紧挂谷集的 Hausdorff 维数为 3。

两个仓库的公开说明称，连接后的端点不使用项目自定义公理或 `sorry`，只依赖 Lean 标准基础。复现需要使用固定的外部依赖，并运行完整检查，默认的核心构建不足以覆盖连接层。换句话说，这里做的是既有人类证明的形式化与集成。

## 2026-09｜Komlós：与维数无关的符号和界

> **背景**：Komlós 问题问，一组欧氏范数不超过 1 的实向量，能否分别选择正负号，使向量总和的每个坐标的绝对值都受同一个通用常数控制。

9 月 10 日，Lu、Guo 与 Fang [提交预印本](https://arxiv.org/abs/2609.11189)，给出了常数 $3\sqrt{2\pi}$ 的界，不依赖维数或向量数量。论文同时推出集合系统的着色不平衡小于 $3\sqrt{2\pi t}$，达到 Beck–Fiala 猜想要求的平方根量级。

作者将证明发现归于 Odin。这篇预印本还没有独立的形式化验证或外部审阅结论，常数是否最优也没有证明。

## 2026-09｜Navier–Stokes：强迫爆破解与发布争议

> **背景**：三维不可压 Navier–Stokes 的存在性与光滑性问题，研究由光滑初值出发的解是否会产生有限时间奇点。Clay 的 C/D 版本允许满足指定光滑性和衰减或周期条件的外力；“带外力”本身不能作为不符合问题的理由。无外力 $f=0$ 的情形仍是另一个需要明确区分的结论。

9 月的发布与回应按时间列在下面。

- **9 月 3 日前后：传言与澄清。** 据 [36Kr 转述](https://eu.36kr.com/en/p/3971371138855176)，陶哲轩用 Navier–Stokes 举例讨论 AI 研究的假设性场景，后来澄清自己并不知道已有重大新进展。该澄清早于随后成果的公布。
- **9 月 7 日：Buckmaster–Alpöge 发布。** 两人公开光滑外力下不可压多孔介质、Boussinesq 与[三维 Euler 方程的有限时间奇点结果](https://cims.nyu.edu/~tristanb/euler.pdf)及形式化材料。[Buckmaster 的声明](https://cims.nyu.edu/~tristanb/statement.pdf)说，Boussinesq 与 Euler 的进展在 8 月 15 日取得、8 月 22 日完成 Lean 验证；他们还认为已经得到低耗散 Navier–Stokes 的结果，但当时未完成验证，故未发布。声明强调这是个人合作，使用 Claude、Codex 与 Astra，并明确将基础路线归于 Córdoba 与 Martínez-Zoroa。
- [**9 月 8 日：OpenAI 发布。**](https://openai.com/index/navier-stokes-solution/) 据公告中的媒体引文及 [*Quanta*](https://www.quantamagazine.org/ai-has-solved-one-of-maths-1-million-millennium-prize-problems-20260908/) 报道，OpenAI 的内部模型组织约 10,000 个智能体，用 88 小时得到 Navier–Stokes 强迫爆破证明，再用约 17 小时完成形式化。OpenAI 称结果覆盖 Clay 的相应版本，并表示不申领奖金。公司同时发布证明与形式化材料。
- **9 月 7-8 日：优先权与沟通争议。** Buckmaster 的公开声明说，OpenAI 在听到其研究传言后加速投入；他还称，在 9 月 6 日的通话中，Bubeck 要求在拟议的发表安排中排除 Alpöge 署名，并使用涉及其职业生涯的施压措辞。以上通话内容来自 Buckmaster 的陈述。他同时明确写道，当时没有看过 OpenAI 的证明，不知道模型如何工作，也不知道自己的数据是否被使用。
- **9 月 8 日的 OpenAI 回应。** 据 [*The Decoder*](https://the-decoder.com/openai-researcher-allegedly-pressured-mathematician-to-drop-anthropic-co-author-from-math-breakthrough-paper/) 引述公告与发布会，OpenAI 承认在听到传言后于 9 月 1 日集中投入，称 9 月 6 日已完成证明和形式化，并曾提议共同发布公告。公司否认研究人员或智能体在对方公开前看过其工作，否认定向访问用户数据；同时说不能完全排除去标识化产品使用数据帮助改进模型的可能性。公司承认 Buckmaster–Alpöge 的 Euler 结果具有优先权，并强调两方 Euler 命题分别为 forced 与 unforced。训练数据是否影响了结果，现有公开材料还不足以让人独立判断。
- **9 月 11 日：Clay 声明。** [Clay 研究所](https://www.claymath.org/news/navier-stokes-announcement/)表示正与数学界共同关注该问题“似乎已经解决”（*apparently been settled*）的消息，并将依既定规则评估成果与归属，强调程序不会仓促。这既不是最终确认，也不是评奖结论。

[Nature 的报道](https://www.nature.com/articles/d41586-026-02842-5)也讨论了发布与归因争议。在这轮公告发布时，强迫版本的解答及形式化材料已公开，正式评估仍在进行。

10 月 6 日，Alexander Bastounis、Fabian Circelli、Anders C. Hansen [提交论文](https://arxiv.org/abs/2610.08144)，以 OpenAI 的 Navier–Stokes 材料为例，指出自然语言证明自动翻译成 Lean 时可能存在语义不一致。他们质疑的是形式化命题与原文是否对应，并没有据此证明目标 PDE 定理为假。

10 月 13 日，*Scientific American* [采访正在阅读证明的专家](https://www.scientificamerican.com/article/openais-blockbuster-navier-stokes-proof-isnt-what-we-thought-it-was/)。Gonzalo Cao-Labora 等人指出，最终论证与先前被引用的 Córdoba–Martínez-Zoroa 路线存在明显细节差异；两者都使用外力，并不意味着构造相同。这修正了 9 月讨论中对证明路径的部分判断，但模型的数据来源仍无法据此确定。[10 月 17 日的报道](https://the-decoder.com/mathematicians-say-openai-doesnt-understand-its-own-navier-stokes-proof/)转述了这轮审读。截至 10 月 26 日，未查到 Clay 对该成果的最终裁定。

## 2026-09｜正曲率：$S^3\times S^3$ 度量的反例报告

> **背景**：Hopf 符号猜想的正曲率分支预言，正截面曲率的闭偶数维流形具有正 Euler 示性数。$S^3\times S^3$ 是六维流形，Euler 示性数为零。

9 月 6 日，Guo、Lu 与 Fang [提交预印本](https://arxiv.org/abs/2609.11980)，称在 $S^3\times S^3$ 上构造了光滑且具有严格正截面曲率的度量；若论证成立，这一构造将反驳上述正曲率分支。作者将度量和证明发现归于 Odin，并提供曲率计算代码链接。

这篇预印本还没有独立审阅结论；Hopf 猜想的负曲率分支和 $S^2\times S^2$ 的正曲率问题，都不在它的讨论范围内。

## 2026-09｜费马大定理：已有证明完成端到端形式化

> **背景**：费马大定理断言 $n>2$ 时，$a^n+b^n=c^n$ 没有正整数解。Wiles 与 Taylor–Wiles 的证明已于 1995 年发表，形式化工作的难点在于连接其庞大的理论依赖。

9 月 4 日，据 [Anthropic 公告](https://www.anthropic.com/research/formalizing-fermats-last-theorem)，Claude 在 Prove2Me 平台上经过约 11 天的协作，生成约 1,300 万行 Lean 代码，最终证明使用约 29,500 个中间定理。其路线遵循 Darmon、Diamond 与 Taylor 对原证明的阐述；研究者提供了少量高层指导，系统复用了 Mathlib、Kevin Buzzard 领导的 FLT 项目与 `flt-regular` 的部分工作。

[公开仓库](https://github.com/anthropics/fermats-last-theorem)提供 Lean 构建、独立检查器和命题比较程序。这项成果是已有定理的机器检查版本，代码行数也包含代码展开和工程组织带来的开销。

## 2026-09｜Köthe：矩阵形式反例与后续论文

> **背景**：Köthe 猜想问两个 nil 左理想之和是否仍为 nil。nil 指每个元素都幂零，不等于存在统一次数使整个理想的幂为零。它有多个已知等价版本。

Epoch AI 的 [LeanOpenProblems 评测](https://github.com/tadamcz/koethe)中，预发布版 GPT-6 Astra 找到矩阵形式的反例：某个环中存在 nil 双边理想 $I$，但 $M_2(I)$ 含有非幂零元素。项目称，模型在隔离环境中自主搜索；检查器确认，其证明对应的正是给定矩阵命题的否定，且只依赖标准公理。

Tom Adamczewski、Bernhard Böhmler 与 René Marczinzik 于 9 月 7 日提交[后续论文](https://arxiv.org/abs/2609.07996)，将构造推广到任意可数域，并解释如何得到原始左理想表述的反例。仓库特别说明，**矩阵版本与原始版本的等价关系没有在该 Lean 项目中形式化**。

## 2026-09｜反馈顶点集：新的二近似证明路线

> **背景**：反馈顶点集要求删除数量尽可能少或总成本尽可能低的顶点，使无向图无圈。二近似算法保证成本至多为最优解的两倍，这个近似比在 1990 年代就已有算法达到。

9 月 3 日，Chandrasekaran、Chekuri 与 Kulkarni [提交论文](https://arxiv.org/abs/2609.04414)，证明相关线性规划的每个基本可行解中，都有一个取值至少为 $1/2$ 的变量，回答了 Fiorini 的极点性质猜想，并据此给出迭代舍入二近似算法。

作者说明，在向模型输入已有证明笔记后，Claude Opus 4.7 与 Gemini 3.1 Pro 提出了 Hasse 森林及计数引理的关键思路；人类研究者发展了后续论证、边版本与算法。这项工作的进展在于结构定理和算法路线，近似比仍然是二倍。

## 2026-09｜临界渗流：全维格点结论的 Lean 证明

> **背景**：对 $\mathbb Z^d$ 上最近邻 Bernoulli 键渗流，问题是临界概率 $p_c$ 下，原点所在的开簇是否几乎必然有限，即 $\theta(p_c)=0$。

[Anthropic 公布的项目](https://github.com/anthropics/formal-math/blob/795efb86f191735c5481675763537cfb4ff37e55/percolation/README.md)给出了适用于所有 $d\ge2$ 的结论。其路线是先证明 Kozma–Nitzan 的第 3 猜想，再形式化 Kozma–Nitzan 把该不等式归约为临界渗流结论的定理，以及所需的既有结果。

所引固定版本的 README 说明：主定理只依赖 Lean 的标准公理，解答中没有 `sorry`，但用于命题比较的 `Challenge.lean` 有意保留了两个占位符。项目也明确表示，成果尚未接受作者以外的独立审查。项目没有声称解决 Kozma–Nitzan 的第 1、2、4 猜想，结论也没有推广到位点渗流、其他格或任意模型。

## 2026-08 至 2026-09｜PrimeGaps186：素数间隔的条件形式化

> **背景**：$\liminf_{n\to\infty}(p_{n+1}-p_n)\le186$ 表示无穷多次出现不超过 186 的相邻素数间隔，不是所有相邻素数都相距至多 186。可容许位移集指对每个素数 $p$，位移的剩余类都不占满模 $p$ 的全部剩余类。

OpenAI 的项目从外部输入推出 $\mathrm{DHL}[40,2]$：对每个含 40 个位移的可容许集合，都有无穷多个平移，其中每个平移至少包含两个素数；再用直径为 186 的显式位移集推出目标间隔界。

OpenAI 9 月的 [GPT-6 Astra 官方介绍](https://openai.com/index/gpt-6-astra/)正式公布了这一结果以及大素数间隔的改进。[短间隔论文](https://cdn.openai.com/pdf/51126fac-1b68-4128-9666-c908bcc16033/short_gaps.pdf)给出
$\liminf_{n\to\infty}(p_{n+1}-p_n)\le 186$，相较此前的 246 更强；论文还记录了 Julia Stadlmann 同期独立将界改进到 240 的工作。[大间隔论文](https://cdn.openai.com/pdf/51126fac-1b68-4128-9666-c908bcc16033/long_gaps.pdf)把
$G(X)$ 的下界提高为
$G(X)\gg \log X(\log_2 X)^2\log_4 X/(\log_3 X)^2$，比此前的相应估计多出一个 $\log_2 X$ 因子。两篇论文均将证明发现归于 Astra。

[仓库](https://github.com/openai/PrimeGaps186)明确保留三条项目公理：一个三元 Kloosterman 和估计、一个二元 Kloosterman 和相关估计，以及数值积分上界。前两项引用已有数学文献，但未在本项目中证明；后一项涉及 104 个外积分、45 个内积分和 3 个封顶界，由独立 Python/FLINT 计算证书核对。运行数值证书不会自动消去 Lean 中的相应公理，且仓库说明其测试使用了未随库提供的修正版 FLINT 构建。

所以，这个项目属于依赖外部文献与计算证书的**条件形式化**。首次公开日期尚未确认，按 8-9 月记录。

## 2026-08｜Cyphral Distich：历史密码的解读

Thomas Urquhart 在《Logopandecteision》末尾留下了两行各含 32 个数的密码。[Vals AI](https://www.vals.ai/blogs/fable-solves-cyphral-distich) 于 **8 月 31 日**称，Claude Fable 5.1 找到了以书中 32 条 Proquiritations 为密码本的取字规则：对每行密文的第 $i$ 个数 $k$，到第 $i$ 条 Proquiritation 取第 $k$ 个词的首字母。两行分别得到：

```text
O GOD UPHOLD KING CHARLS THE SECOND AND
MAKE HIM THE SUPREME RULER OF THIS LAND
```

实验者记录耗时约 44 分钟、176,000 token，运行过程中没有人工追加提示；一处拉丁语 `hinc inde` 需要按一个词组处理。解读与行长、押韵和作者的政治背景相符，也可按公开规则复核。

## 2026-08｜椭圆曲线：有理点秩下界达到 31

> **背景**：椭圆曲线有理点群的秩，是其自由部分独立生成元的数量。展示足够多的线性无关有理点，可以证明一个秩下界；精确秩还需要相应上界。

[Epoch AI 记录](https://epoch.ai/frontiermath/open-problems/elliptic-curve-rank)：8 月 20 日公布一条秩至少为 30 的曲线，8 月 23 日又公布一条秩至少为 31 的曲线，均归于 Claude、Levent Alpöge 与 **Ava Howell**。此前纪录是 Elkies 与 Klagsbrun 于 2024 年构造的秩至少为 29 的曲线。

不附加任何假设时，得到的是 30 与 31 的下界。该页面另注明，在假设 BSD 和 GRH 成立时，对应曲线的精确秩分别为 30 和 31。

## 2026-08｜常标量曲率：YTD 版本的反例报告

> **背景**：Yau–Tian–Donaldson（YTD）有不同几何语境下的表述。一般极化流形上的常标量曲率 Kähler 度量，与 Fano 情形的 Kähler–Einstein 度量不是同一个命题。

8 月 19 日，Jihao Liu [提交预印本](https://arxiv.org/abs/2608.19301)，构造了一个光滑极化复射影五维簇，并称其为 K-polystable，但不具有常标量曲率 Kähler 度量，以此反驳相应的 YTD 表述。

论文附有与 Bin Dong、Guoxiong Gao 合作的 AI 使用报告，列出 GPT-5.6-sol、Fable 5 与 Danus 的贡献。这篇预印本还没有外部独立检查记录；结论也不涉及已知的 Fano Kähler–Einstein 对应定理。

## 2026-08｜Talagrand：布尔卷积界的证明报告

> **背景**：Talagrand 的布尔卷积猜想研究超立方体上的噪声卷积，要求一种大值集估计不随维数恶化。

8 月 16 日，Junwei Lu、Shengtao Guo 与 Ethan X. Fang [提交论文](https://arxiv.org/abs/2608.15515)，称对每个固定的噪声参数 $0<a<1$，都给出了 $C_a/\sqrt{\log u}$ 的弱型估计，其中常数只依赖 $a$，不依赖维数。

论文将证明发现归于 Odin Automatic AI Research Agent，并说明其建立在既有反向热流、布尔桥及局部误差方法之上。目前引用的材料中，还没有独立审阅或形式化验证。

## 2026-08｜三块 ADMM：恒等约束块的非收敛反例

[8 月 14 日提交的论文](https://arxiv.org/abs/2608.14396)称：即使前两个块是强凸二次函数、第三个约束块为恒等映射，直接三块 ADMM 也可能产生有界而不收敛的周期 66 轨道；作者还给出另一个模型流程得到的周期 23 证书。研究者使用 Codex 与 GPT-5.6 Sol 构造反例，并作了精确分段仿射检查，同时比较了 Kimi K3 的独立路径。反例否定了该类算法的一般收敛保证，论文仍为预印本。

## 2026-08｜Grothendieck 常数：显式改进与持续人机协作

> **背景**：实 Grothendieck 常数 $K_G$ 衡量一类双线性优化中，向量松弛相对符号解的最大差距。它联系半定规划、图优化与量子信息，精确值仍未知。

Alan Li、Rahul Saha、Anton Xue、Swarat Chaudhuri、Adam Klivans、Pravesh Kothari 与 Raghu Meka 的[数学论文](https://arxiv.org/html/2606.03991v3)给出

$$
K_G<\frac{\pi}{2\log(1+\sqrt2)}-10^{-5}.
$$

2011 年的结果只说明 Krivine 上界存在正改进，这次则给出了显式的量化结果。论文初稿于 6 月 2 日提交，8 月 11 日修订；搜索使用 Claude Code，最终数值不等式由 Arb 区间算术控制舍入误差。

8 月 11 日提交、14 日修订的[协作回顾](https://arxiv.org/html/2608.11195v3)另给出了经作者核验的下界 $K_G\ge6\pi/11$。研究系统先用 GPT-5.5 Pro、后用 GPT-5.6 Sol 推理，并用 Claude Code 编写和检查程序，运行约 240 轮；人类在搜索停滞时调整问题与方向。回顾还列出更强的候选界，但区分了系统检查与作者核验，其中一个早期数值已撤回。[普林斯顿的采访](https://www.cs.princeton.edu/news/ai-great-math-does-it-know-how-do-research)介绍了这项持续研究中的分工。

## 2026-08｜Hadamard：668 阶矩阵的构造记录

> **背景**：Hadamard 矩阵的元素为 $\pm1$，任意两行都正交。除一阶和二阶外，阶数必须是四的倍数；是否每个这样的阶数都存在 Hadamard 矩阵，仍是更广的猜想。

[Epoch 的 8 月更新](https://epoch.ai/frontiermath/open-problems/hadamard)记录，由三位人类研究者与 Claude 组成的团队公布了编码为谜题的构造，覆盖了 2,000 阶以内此前尚缺实例的所有可行阶数，其中包括 668 阶。

Epoch 暂将该题标为 AI 解决，同时明确说明，若后续材料显示核心数学思路有重要人类贡献，将调整这一归类。构造补齐的只是有限范围内的实例，并没有证明所有阶数的 Hadamard 猜想。

## 2026-08｜zeta 零点：临界线比例超过三分之二

> **背景**：黎曼猜想要求所有非平凡零点都在 $\operatorname{Re}(s)=1/2$ 上。研究“渐近来看，至少有多少比例的零点在该线上”，则是一个较弱的问题，还须区分重数、单零点和互异零点的统计。

8 月 10 日，[Anthropic 公告](https://www.anthropic.com/research/riemann-zeta)称，其内部 Claude 模型改进了这一比例界。Levent Alpöge 与 Ralph Furman 在[随后的论文](https://arxiv.org/abs/2608.13637v2)中写道：按重数计数，至少三分之二的非平凡零点是临界线上的单零点，至少六分之五是互异零点；采用 Montgomery–Taylor 窗口后，常数分别为 0.6725 和 0.8362。论文注明，证明由 Claude 发现，作者负责检查和阐述，并提供 [Lean 形式化](https://github.com/anthropics/zeta-23-lean)。

公告用约 41.6% 描述原纪录，精确比较应以论文对统计量的定义为准。

即使类似的渐近比例达到 100%，也可能还有有限个或密度为零的线外零点，所以仍推不出完整的黎曼猜想。

## 2026-08｜$M_{23}$：人类主导的逆 Galois 构造

> **背景**：逆 Galois 问题问每个有限群能否作为有理数域某个 Galois 扩张的群出现。Mathieu 群 $M_{23}$ 是散在有限单群实现计划中最后未解决的一例。

8 月 9 日，Huang、Jackson、Lee、Poonen、Pries 与 Zhang 提交[实现 $M_{23}$ 的论文](https://arxiv.org/abs/2608.08538)。[Shaowu Zhang](https://www.shaowuzhang.com/files/how-we-found-m23.pdf) 随后解释，AI 帮助生成与测试代码、组织计算和排查失败，但选择计算对象、改变坐标与发展约化方法等关键决策来自人类研究者。

尤其在模型建议继续提高数值精度时，团队通过改变坐标解决了瓶颈。最终的数学结论用 Magma 与 PARI/GP 作了严格检查，不依赖 AI 的判断。[Epoch](https://epoch.ai/frontiermath/open-problems/inverse-galois) 将该项归为 **Solved (human)**，属于人类主导、AI 辅助计算的研究。

## 2026-08｜HJO 恒等式：$a=3$ 层的无限族

> **背景**：Huang–Jiang–Oblomkov（HJO）猜想把有限域上满足 $X^a=Y^b$ 的可交换幂零矩阵对计数与 $q$ 级数及模形式乘积联系起来。参数 $a$ 的不同层对应不同恒等式族。

8 月 6 日提交的 [Lau–Ono 论文](https://arxiv.org/abs/2608.05480)证明了完整的 $a=3$ 层，得到一族新的 Rogers–Ramanujan 型恒等式；8 月另有 [Huang、Lau、Ono 与 Paule 的论文](https://arxiv.org/abs/2608.15219)给出四个具体情形及相关中间恒等式。

两篇论文都记录了 AxiomProver 的 Lean 验证。关于完整层的论文明确说，形式化将已有文献结果作为假设，并未从 Lean 基础展开全部依赖；结论限于 $a=3$。

## 2026-08｜Sendov：候选证明与 Lean 检查记录

> **背景**：Sendov 猜想问：次数至少为二且所有零点都在单位闭盘内的复多项式，是否每个零点的 1 邻域内都有一个导数零点？

8 月 5 日，Lech Mazur 发布计算机辅助证明手稿，[ProofAtlas](https://www.proofatlas.ai/formalizations/sendov-conjecture/) 将 GPT-5.6 Pro 列为探索、策略、计算、纠错与写作的贡献者。页面收录 1,160 个第一方 Lean 文件，计 92,816 行，并记录形式命题 `Sendov.sendov_conjecture` 的成功构建和标准公理审计摘要。

但页面也明确说明：Lean 开发不是手稿的逐行翻译，也没有验证配套的 Python 程序；**形式命题与非形式猜想的对应关系尚未审查，ProofAtlas 对成果的接纳审查也尚未完成**。所以，目前它仍是一个带有 Lean 检查记录、等待独立审查的候选证明。

## 2026-08｜Crouzeix：矩阵函数界的证明预印本

> **背景**：Crouzeix 猜想将矩阵函数的算子范数，与函数在矩阵数值域上的最大绝对值联系起来，猜测其中的通用常数可取 2。

[8 月 4 日提交、8 月 17 日修订的论文](https://arxiv.org/abs/2608.03841v2)中，Emiel Lorist 与 Felix Schwenninger 称证明了这一猜想。证明的关键是一个关于 2-dilation 的扰动引理，随后将其用于双层势表示中的函数迭代。

作者的 AI 使用说明记录，GPT-5.6 Sol Pro 帮助梳理既有估计，并提出统一控制迭代误差的思路；最终证明由人类发展、核验并撰写成文。论文目前还是预印本，也还没有独立的形式化验证或期刊审稿结论。

## 2026-08｜Astra：十项数学与理论计算机结果

OpenAI 于 8 月初[集中发布十项研究结果](https://siliconangle.com/2026/08/02/openais-astra-solves-10-long-open-math-problems-publishes-proofs/)。下表按 **[8 月 6 日更新的论文合集](https://cdn.openai.com/pdf/ten-proofs-oai.pdf)**的十章整理。

| 问题             | 背景与手稿结果                                               | 结论的适用范围                                               |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 高维球堆积       | 确定 Cohn–Elkies 线性规划界的渐近指数，给出密度上界 $2^{-(0.6044\ldots+o(1))d}$。 | 改进的是密度**上界**，并说明该线性规划方法在指数层面的极限；不是构造更密堆积，也未确定实际最优密度。 |
| 二元码与球面码   | 对固定相对距离的二元码、固定角距离的球面码，改进最大规模的渐近上界。 | 说明最多能放多少码字或球面点；不是提供对应规模的纠错码构造。 |
| 非 sofic 群      | 构造不能用有限置换近似其有限乘法关系的群，回答了“是否每个可数群都是 sofic”这一问题。 | 依赖 Kun、Kun–Thom 等既有工作；数学正确性与发现过程的归因应分开核对。 |
| Connes 刚性猜想  | 构造无穷多个两两不同构的 property (T) 群，却具有同构的群 von Neumann 代数。 | 反驳相关代数不变量能在该类群中唯一确定群的主张。property (T) 指酉表示若有几乎不变单位向量，则有非零不变向量。 |
| 算术电路复杂度   | 对 permanent 给出无除法电路 $\Omega(n^2\log\log n)$ 的门数下界，以及公式 $\Omega(n^4/\log n)$ 的叶子数下界。 | 是特定算术计算模型中的下界，不是解决 P 与 NP 问题。精确域假设和计算模型以第五章为准。 |
| 量子并行重复     | 对有限双人纠缠博弈证明指数式并行重复结果。                   | 描述原胜率小于 1 时，要求所有副本获胜的概率如何衰减；不是所有量子协议都可任意套用的结论。 |
| 最近向量问题     | 从 3SAT 归约得到欧氏 CVP 的 $n^{1/400}$ 因子近似困难性。     | 是最坏情况的计算复杂度结果；不能直接等同于具体密码系统的安全证明。 |
| Ehrhart 体积猜想 | 对重心是唯一内部格点的 $n$ 维凸体，证明体积至多 $(n+1)^n/n!$。 | 是具有指定格点与重心条件的**上界**，不是中心对称多面体的体积下界。 |
| 多色 Ramsey 数   | 对避免单色三角形的 $k$ 色问题，给出新下界，并得到 $R_k(3)=k^{\Theta(k)}$。 | 确定这一尺度的增长阶，不是每个 $k$ 的精确 Ramsey 数。        |
| 极值图论         | 用不同二部图构造反驳 Erdős–Simonovits 紧致性猜想与 Erdős 的退化度猜想。 | 是两个具体猜想的反例，合集将它们计为同一章。                 |

[公开仓库](https://github.com/openai/ten-proofs)提供十章的 Lean 模块及命题比较工具。

**后续审阅**：Mikołaj Sienicki 与 Krzysztof Sienicki 的[审阅综述](https://arxiv.org/abs/2608.14673v3)在 9 月 9 日更新至 v3，汇总 18 份针对各章的评阅与技术分析。该综述称，所收材料中，主要结果尚无已确认的实质性错误，但各章审阅深度不同。这篇综述汇总的是已有检查材料，并不代表两位作者独立重证了全部十项结果。

其中，第六章曾被质疑有极性错误；审阅者核对排版后发现 PDF 文本提取遗漏了表示补集的上划线，撤回该批评。第八章 Ehrhart 体积论证则仍有不同评价：一份报告建议小修，另一份建议大修，认为 Bergman/Laplace 渐近等分析步骤过于压缩，尚不足以完整复核。分歧集中在论证细节是否足以复核，目前尚未确认主要结论存在错误。

## 2026-07｜亏格二曲线：从数据库找到挠点答案

[7 月 30 日的 Epoch 预发布测试](https://epoch.ai/frontiermath/open-problems/genus-2-jacobian-torsion)中，GPT-5.6 Sol 从 Edgar Costa 维护的公开曲线数据库里，找到一条曲线，其 Jacobian 有理点群含有阶为素数且至少为 31 的挠点，并通过验证。Epoch 将下一目标提高到阶 37，同时明确：这是文献与数据检索成果，曲线并非模型首次构造。

## 2026-07｜和集与差集：最优指数的构造

对有限阿贝尔群中的集合，记 $\sigma(A)=\lvert A+A\rvert/\lvert A\rvert$、$\delta(A)=\lvert A-A\rvert/\lvert A\rvert$，经典不等式为 $\sigma(A)^{1/2}\leq\delta(A)\leq\sigma(A)^2$。[7 月 29 日提交的论文](https://arxiv.org/abs/2607.27199)构造整数集族，使 $\log\sigma(A)/\log\delta(A)\to2$，从而证明下界中的指数 $1/2$ 不能改进。作者说明，构造和证明得到 Hyra（基于 Hy3 的 AI 研究代理）协助；随后，人类独立检查了构造和证明，并将证明转成 Lean。

## 2026-07｜超排列：新构造与次日的答案检索

> **背景**：$n$ 个符号的超排列，是包含全部 $n!$ 个排列作为连续子串的序列。找到更短实例会降低最短长度的已知上界，但不证明实例已最短。

据 [Epoch 记录](https://epoch.ai/frontiermath/open-problems/superpermutations)，7 月 26 日 Uku Raudvere 公布更短的八符号超排列；William Echols 受其启发，同日通过与 GPT-5.6 Sol 的交互式 Codex 会话得到九、十符号的新实例，并[公开序列和生成材料](https://github.com/WilliamEchols/superpermutations)。

7 月 27 日的 FrontierMath 预发布测试中，GPT-5.6 Sol 从这些公开链接取得序列，并通过了验证器检查。前一天是人机协作构造，次日则是检索既有答案，两者的贡献不能混为一谈。

## 2026-07｜不可分流：保成本舍入猜想的反例

> **背景**：单源不可分流要求每个需求沿一条路径输送。已知可将分数流舍入为不可分流，同时控制额外拥堵；进一步的问题是能否同时不增加成本。

7 月 22 日，Dmitry Rybin 公布一个反例，后由 Arthur Freitas Ramos、David Barros Hulak 与 Ruy Jose Guerra Barretto de Queiroz 形式化。[AFP 所检查的图](https://isa-afp.org/entries/Dinitz_Garg_Goemans_Counterexample.html)有 7 个顶点、9 条弧和 3 个终端需求；分数流成本为 58，最大需求为 15，而对于任何不可分路由，只要每条弧的负载至多增加 15，其成本就至少为 60。

这个有限反例否定的是“同时保持成本”的加强要求，原来的拥堵舍入定理并不受影响。AFP 页面列出了反例和形式化的作者；AI 在发现过程中使用的具体型号及交互次数，尚缺直接材料核实。

## 2026-07｜Jacobian：三维反例及形式化检查

> **背景**：特征零域上的 Jacobian 猜想问：多项式映射的 Jacobian 行列式若为非零常数，是否必有多项式逆映射？一个处处满足该条件却不单射的映射，就足以反驳猜想。

7 月 19-20 日，Levent Alpöge 公布三维反例，相关记录将提问归于 Akhil Mathew，将产生该映射的工作归于 Claude Fable。Isabelle/HOL 的 [AFP 条目](https://isa-afp.org/entries/Jacobian_Counterexample.html)验证了 Jacobian 行列式恒为 $-2$、三个不同的有理点具有相同的像，以及不存在多项式逆映射。

AFP 还通过补上恒等坐标，将反例推广至所有维数至少为 3 的有限维情形；二维情形不在其结论内。7 月 31 日提交的 [Shuhong Gao 预印本](https://arxiv.org/abs/2608.00222)给出几何解释和更多构造。

## 2026-07｜圈双覆盖：证明与专家重述

> **背景**：圈双覆盖猜想问，每个无桥图是否都有一组圈，使每条边恰好被覆盖两次。无桥指不存在删除后会增加连通分支数的边。

OpenAI 于 7 月公布证明。Jim Geelen 于 7 月 16 日提交[三页说明](https://arxiv.org/abs/2607.15399)，Sang-il Oum 于 7 月 17 日提交[较长的重述](https://arxiv.org/abs/2607.16356)，后者在 8 月 1 日更新至 v3。

两篇文稿分别澄清和重述了原证明；所引页面还没有期刊发表或形式化验证记录。

## 2026-07｜多重检验：相关高斯情形的反例

> **背景**：Benjamini–Hochberg（BH）方法控制多重检验中的错误发现率（FDR）。独立性或特定正相关条件下的保证，不能自动推广到任意相关结构。

Edgar Dobriban 在 [7 月 14 日的手稿](https://faculty.wharton.upenn.edu/wp-content/uploads/2017/06/bh.pdf)中给出相关高斯变量双侧检验的反例：当目标水平 $\alpha=0.01$ 且假设数量足够多时，严格区间算术证书证明 $\mathrm{FDR}>0.0104$。手稿称证明由 GPT-5.6 Pro 得到，作者对其进行了仔细检查，并公开[计算代码](https://github.com/dobriban/BH)。

被否定的是这一类相关高斯场景下的普遍控制主张，BH 在原有假设下的定理仍然成立。

## 2026-07｜AtCoder：OpenAI 演示通过全部五题

[7 月 9 日的报道](https://the-decoder.com/openais-ai-beats-every-human-at-atcoder-a-top-competitive-programming-contest/)称，OpenAI 系统在 AtCoder World Tour Finals 的 Algorithm Division 人机演示中通过全部五题，得 8,300 分；人类第一名 tour1st 得 4,300 分。系统由推理模型与小型运行框架组成，无互联网访问。这是演示成绩，不占用正式名次，也不能与其他分部或不同年份直接比较。关于人类选手逐题通过情况的报道不一致，因此这里只列总成绩。

## 2026-07｜$q$ 级数：经典恒等式的形式化基础

> **背景**：$q$ 级数连接分拆、数论和表示论。形式化既要处理代数恒等式，也要说明无限乘积与级数的收敛。

[7 月 1 日提交、8 月 14 日更新的论文](https://arxiv.org/abs/2607.01544v3)中，Lau、Lee 与 Ono 使用 AxiomProver 建立了 $q$-Pochhammer 符号、$q$-二项式系数、Bailey 引理等形式化基础，给出 Jacobi 三重积和 Rogers–Ramanujan 恒等式的 Lean 验证。

这些恒等式早有经典证明，这次的进展是建立了可复用的形式化基础。

## 2026-06｜Thakur 假设：有限域幂和的部分解答

Thakur 的三个假设涉及有限域多项式环上幂和的次数、极值项与递推关系。6 月 15 日，Evan Chen 与 Ken Ono [提交论文](https://arxiv.org/abs/2606.16239)，在素域情形证明 H1、H2，并在所有有限域上证明 H3，同时提供 AxiomProver 生成的 Lean 形式化。H1、H2 在非素域上的一般情形仍未覆盖。

## 2026-06｜$\mathbb Q_2$ Galois 群：显式表示与条件验证

> **背景**：绝对 Galois 群统一描述一个域的有限代数扩张。奇素数的 $p$-adic 域已有显式表示，$\mathbb Q_2$ 的相应描述长期缺失。

据 [Epoch 记录](https://epoch.ai/frontiermath/open-problems/q2-absolute-galois)，David Roe 于 6 月 9 日用 Claude Fable 5 得到候选表示，David Turturean 于 6 月 24 日提交 GPT-5.5 Pro 产生的方案。7 月 6 日的更新仍明确说，通过有限商检查并不等于已经有完整证明。

两位研究者随后公开了 [7 月 26 日的证明手稿](https://roed314.github.io/gq2/paper.pdf)，其中用四个带标记的生成元和两个关系，并要求由野分歧生成元产生的闭正规子群为 pro-2，以此描述该群。[作者页面](https://roed314.github.io/gq2/)说明，手稿尚未经过外部同行评审；两项 Lean 开发分别保留九个经典文献接口和七项外部输入。对 5,402 个有限群的检查提供了额外证据，但不能代替一般证明。

## 2026-05｜模空间：Poincaré 多项式的实根性

> **背景**：Poincaré 多项式记录空间的上同调维数。所有根都是实数这一性质，可进一步约束这些维数形成的系数序列。

[5 月 27 日提交、6 月 11 日修订的论文](https://arxiv.org/abs/2605.29151v2)中，Gergely Bérczi 与 Young-Hoon Kiem 证明了稳定带标记有理曲线模空间 $\overline{\mathcal M}_{0,n}$ 的 Poincaré 多项式具有实根性，回答了 Aluffi–Chen–Marcolli 猜想，并得到交错性和超对数凹性结论。

作者披露，DeepMind 的 Co-Mathematician 在迭代中提出双变量变形等思路；人类负责提出问题、识别漏洞、要求修正、比较文献和整理证明。将方法推广到 Fulton–MacPherson 空间 $\mathbb P^1[n]$ 的观察则明确归于人类作者。

## 2026-05｜DeepMind：开放问题集的形式化搜索

> **背景**：将开放问题译成形式化命题，可以用证明助手检验候选答案。不过，数据库中标注“开放”也可能意味着旧文献尚未整理，而非答案一定未知。

[5 月 21 日提交的论文](https://arxiv.org/abs/2605.22763)称，最强智能体解决了选入实验的 353 个 Erdős 开放问题中的 9 个，并证明了 492 个 OEIS 猜想中的 44 个。题数仅对应实验选定的命题集。

这与另一团队 1 月发表的 Gemini 文献检索及解题研究不同。后者在 [2 月 5 日的 v3 摘要](https://arxiv.org/abs/2601.22401v3)中将 700 个候选问题中的结果归为 **5 项看来是新解、8 项找到既有文献答案**，并说明曾重新分类。两项研究使用的问题集和方法不同，计数时也应分开。

## 2026-05｜单位距离：平面点集猜想的反例

> **背景**：令 $u(n)$ 为平面上 $n$ 个点能形成的单位距离点对数的最大值。Erdős 猜想 $u(n)=n^{1+o(1)}$；这一猜想比已知 $O(n^{4/3})$ 上界强得多。

5 月 20 日，OpenAI 公布[内部模型得到的构造](https://cdn.openai.com/pdf/74c24085-19b0-4534-9c90-465b8e29ad73/unit-distance-proof.pdf)：存在固定 $\delta>0$，对无穷多个 $n$，有 $u(n)\ge n^{1+\delta}$。构造使用数域塔、格与 Golod–Shafarevich 理论，反驳了上述渐近猜想。

多位数学家随后发表[配套说明](https://cdn.openai.com/pdf/74c24085-19b0-4534-9c90-465b8e29ad73/unit-distance-remarks.pdf)，给出经人类核查、简化和推广的论证，并讨论其对既有数学工作的依赖。[Quanta](https://www.quantamagazine.org/why-the-legendary-erdos-problems-are-falling-to-ai-20260803/)报道了这轮人类核查与整理。这项反例并没有确定 $u(n)$ 的精确增长率。

## 2026-05｜有限群：删去任一关系即变为无限群

> **背景**：群的有限表示用有限个生成元和关系描述群。所谓“just finite”是指：该群有限，但删除表示中的任何一个关系后，所得群都无限。

5 月 11 日，Marc Lackenby 提交[五页论文](https://arxiv.org/abs/2605.10402)，证明每个有限群都有这样的表示，回答了 Kourovka Notebook 的 Problem 21.10。作者明确披露 Google DeepMind 的 AI co-mathematician 工具提供了重要帮助。

论文没有提供 Lean 验证记录，属于具名研究者主导的 AI 辅助研究。

## 2026-04｜Ramsey 图：双重饱和的无限族

> **背景**：一个图既不含大小为 $s$ 的团，也不含大小为 $t$ 的独立集，称为相应的 Ramsey-good 图。“双重饱和”进一步要求，加入任何一条原本不存在的边，或删除任何一条已有边，都会破坏这一性质。

4 月 23 日，Benjamin Przybocki、John Mackey、Marijn Heule 与 Bernardo Subercaseaux [提交论文](https://arxiv.org/abs/2604.21187)，将 SAT 求解器与语言模型生成的专用程序结合，发现这样的无限图族，回答了 Grinstead 与 Roberts 在 1982 年提出的问题。

作者还说明，他们使用语言模型生成证明，并在 Lean 中完成形式化。研究把有限搜索、无限族构造与证明结合起来，但并没有确定一般 Ramsey 数的精确值。

## 2026-04｜本原集：Erdős 猜想与新估计方法

> **背景**：本原整数集要求任意两个不同元素互不整除。Erdős #1196 研究元素足够大时，和式 $\sum_{a\in A}1/(a\log a)$ 能否以统一的方式逼近上界 1。

[4 月公开的结果](https://the-decoder.com/openais-gpt-5-4-pro-reportedly-solves-a-longstanding-open-erdos-math-problem-in-under-two-hours/)中，Liam Price 向 GPT-5.4 Pro 提问后得到证明思路，给出尾部和不超过 $1+O(1/\log x)$ 的估计。[Erdős 数据库](https://www.erdosproblems.com/1196)将 #1196 标为 **PROVED (LEAN)**。

5 月 1 日，Alexeev、Barreto、Li、Lichtman、Price、Shah、Tang 与 Tao [提交论文](https://arxiv.org/abs/2605.00301)，将模型输出中的 von Mangoldt 权重 Markov 链发展成了一套系统方法，证明 #1196 与 #1217，并给出本原集猜想 #164 的短证明。#164 此前已有证明，这次的新贡献是另外两题的解答、统一方法及后续推广。

## 2026-03｜等离子体平衡：人机协作的 Lean 验证

> **背景**：Vlasov–Maxwell–Landau（VML）方程描述带电粒子的运动、电磁场与碰撞。平衡态的分类不同于证明任意初值的解始终存在。

Vasily Ilin 在 [3 月 16 日提交的报告](https://arxiv.org/abs/2603.15929v2)中介绍了三维环面上单物种、Coulomb 碰撞 VML 系统的平衡态形式化：在指定的正性、光滑性、速度衰减和增长条件下，稳态是空间均匀的 Maxwell 分布，电场为零，磁场为常数。Gemini DeepThink 提出非形式证明，Claude Code 转写为 Lean 代码，Aristotle 完成 111 个引理；研究者在十天中提交 229 条提示并审核关键定义。

报告特别披露了模型把待证引理误加为假设，以及形式化定义偏离原意的问题。最终形式命题仍明确要求速度方向上的对数导数具有多项式增长界，该条件不能仅由 Schwartz 衰减推出。没有人工审核与修正，这项形式化就无法完成。

## 2026-01｜Erdős #728：阶乘整除的非平凡构造

> **背景**：问题问的是是否有无穷多组整数满足 $a!b!\mid n!(a+b-n)!$，且 $a,b$ 不太小、$a+b-n$ 超过一定对数尺度。数据库指出原题文字存在歧义，若不加适当限制，会包含平凡解。

据 [Erdős 数据库](https://www.erdosproblems.com/728)和 [*Quanta*](https://www.quantamagazine.org/why-the-legendary-erdos-problems-are-falling-to-ai-20260803/) 的记录，Kevin Barreto 等人于 1 月初使用 GPT-5.2 Pro 得到符合原题预期的构造：对任意 $0<C_1<C_2$，存在无穷多组解满足 $b=n/2$、$a=n/2+O(\log n)$，以及 $C_1\log n<a+b-n<C_2\log n$。随后借助 Harmonic 的 Aristotle 完成 Lean 验证。

数据库将其标为 **PROVED (LEAN)**，并明确解释为什么这个构造避开了原题文字中的平凡情形。

## 2025-12｜AxiomProver：Putnam 十二题形式化解答

> **背景**：Putnam 是北美本科生数学竞赛，12 题、满分 120 分，分两个各三小时的场次进行。

Axiom Math 的[公开仓库](https://github.com/AxiomMath/Putnam2025)记录：AxiomProver 在 12 月 6 日比赛结束前完成八题，[随后数日完成剩余四题](https://axiommath.ai/research/from-seeing-why-to-checking-everything/)，提供 Lean 4 解答，并用星号标出赛后完成的题目。

全部十二题的形式化包括赛后完成的四题，因此既不能算作正式参赛，也不是比赛时限内的 120 分成绩。

## 2025-09｜ICPC 2025：OpenAI 12 题，Gemini 10 题

> **背景**：ICPC 世界总决赛由三名学生组队，在五小时内解题。2025 年决赛共 12 题，AI 系统以独立演示方式在赛事环境中接受判题。

9 月 4 日的决赛中，OpenAI 的模型组合[通过全部 12 题](https://worldfinals.icpc.global/2025/openai.html)；其中 [GPT-5 能解出 11 题](https://the-decoder.com/openai-outperforms-humans-and-google-at-the-worlds-top-collegiate-programming-contest/)，实验性推理模型解出余下一题。人类冠军队通过 11 题。[DeepMind 则报告](https://deepmind.google/blog/gemini-achieves-gold-medal-level-at-the-international-collegiate-programming-contest-world-finals/)，Gemini 2.5 Deep Think 通过 10 题，包括当年无人类队伍通过的 C 题；其远程运行比学生晚开始十分钟，也遵守同样的五小时时限。

AI 不占用学生的正式名次。评测只确认程序通过了比赛测试，并未形式化证明它能正确处理所有合法输入。

## 2025-08｜IOI 2025：OpenAI 在线评测对照学生排名第 6

> **背景**：IOI 是个人信息学竞赛。模型在线评测可与学生成绩对照，但须区分在线参与记录与正式学生名次。

据 [*The Decoder*](https://the-decoder.com/openais-ai-system-wins-a-gold-medal-level-score-at-the-international-olympiad-in-informatics-2025/) 引述 OpenAI 研究人员，系统在 IOI 2025 在线赛道遵守每场五小时、每题至多 50 次提交的约束；将成绩与约 330 名学生选手对照时，仅有五名学生成绩更高，达到金牌水平。

报道将系统描述为通用推理模型的组合，加上筛选候选的轻量程序；其中表现最好的核心模型也用于当年的 IMO 实验。相比 2024 年约第 49 百分位的表现，成绩明显提升；不过模型、算力和候选筛选机制也同时发生了变化。

## 2025-07｜IMO 2025：两家模型达到金牌线

> **背景**：IMO 2025 的金牌线为 35/42 分。比较模型表现，除了分数，还要看是否直接处理自然语言题目、是否遵守比赛时限，以及谁负责评分。

[DeepMind 于 7 月 21 日公布](https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/)：高级版 Gemini Deep Think 解出五题，得 35 分，以自然语言完成解答，并遵守每场 4.5 小时的比赛时限。其答案进入 IMO 协调员组织的 AI 评阅与认证程序，IMO 主席 Gregor Dolinar 在公告中确认分数。

[OpenAI 于 7 月 19 日报告](https://the-decoder.com/openai-claims-a-breakthrough-in-llm-reasoning-on-complex-math-problems/)其实验性推理系统在相同时限设置下解出五题，得 35 分；据报道，答案由团队的[三名前 IMO 金牌得主](https://the-decoder.com/google-deepminds-gemini-wins-mathematical-olympiad-gold-using-only-natural-language/)另行评阅，并非上述 IMO 官方认证程序。两方都用自然语言作答，但评分安排不同，也都没有作为正式选手获颁金牌。

## 2025-05｜AlphaEvolve：复矩阵算法与接吻数下界

> **背景**：$4\times4$ 复矩阵乘法的经典算法需要 49 次标量乘法。接吻数问一个单位球最多能同时接触多少个互不重叠的同半径球；11 维的精确值未知。

[AlphaEvolve](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/) 利用 Gemini 模型和进化搜索改写程序，找到了 $4\times4$ 复矩阵乘法的 48 次乘法方案，并在 11 维中构造了 593 个球同时接触中心球的配置，将当时下界从 592 提高到 593。

两项都是构造性改进：前者降低了乘法次数及相应张量秩的已知上界，后者提高了接吻数下界，但都没有证明对应问题的最优性。成果于 5 月公布，[技术报告](https://arxiv.org/abs/2506.13131)于 6 月提交 arXiv；还没有期刊发表信息。

## 2024-07｜IMO 2024：形式化系统达到银牌线

> **背景**：IMO 每届 6 题，满分 42 分，选手分两个各 4.5 小时的场次作答；2024 年金牌线为 29 分。

[DeepMind 的 AlphaProof 与 AlphaGeometry 2](https://deepmind.google/blog/ai-solves-imo-problems-at-silver-medal-level/) 合计解出四题，获评 28/42 分，达到当年银牌水平。其中 AlphaProof 解出三道代数、数论题，AlphaGeometry 2 解出几何题；第 6 题当年只有五名人类选手解出。

题目先由人类译成形式语言，系统对部分题目的解答耗时长达三天。Timothy Gowers 与 IMO 2024 选题委员会主席 Joseph Myers 按 IMO 评分规则评阅了答案。由于题目经过人工翻译，而且部分计算超时，这个结果只能说明题目解答达到了银牌水平，并非正式参赛成绩。AlphaProof 的方法论文于 2025 年 11 月发表于 *Nature*。

## 2024-01｜AlphaGeometry：几何基准解出 25/30

> **背景**：研究者从 2000-2022 年 IMO 题目中整理出 30 道适用于该系统表示方式的几何题。辅助构造是难点之一：仅靠既有点线关系进行符号推导，未必能找到证明。

[AlphaGeometry](https://deepmind.google/blog/alphageometry-an-olympiad-level-ai-system-for-geometry/) 由语言模型提出辅助构造，再由符号演绎引擎推导，解出基准中的 25 题。论文将它的表现与人类金牌选手在该题集上的成绩作了比较；此前的代表性符号系统解出 10 题。

论文发表于 [*Nature*](https://www.nature.com/articles/s41586-023-06747-5)。结果只限于该几何题集和表示方式，不能直接换算成完整 IMO 的奖牌成绩。

## 2023-12｜FunSearch：cap set 构造与装箱启发式

> **背景**：cap set 是 $\mathbb F_3^n$ 中不含三个互不相同共线点的集合，等价于不存在互不相同的 $x,y,z$ 满足 $x+y=2z$。在线装箱则要求物品到达时立即决定放入哪个箱子，目标是少用箱子。

[FunSearch](https://deepmind.google/blog/funsearch-making-new-discoveries-in-mathematical-sciences-using-large-language-models/) 让语言模型在进化循环中改写程序中的优先级函数，再通过执行程序评价结果。它找到大小为 512 的八维 cap set，并通过相关组合构造改进渐近下界；在装箱任务中，找到在论文测试分布上优于常用基线的启发式。

论文发表于 [*Nature*](https://doi.org/10.1038/s41586-023-06924-6)。cap set 成果提供了可检查的构造；装箱成绩则是所测实例上的性能改进，不是最优性证明。

## 2022-10｜AlphaTensor：模 2 矩阵乘法 47 次

> **背景**：矩阵乘法算法可用乘法张量的分解表示，每个秩一项对应一次标量乘法。Strassen 的 $2\times2$ 算法需要 7 次乘法，两层递归可用 49 次完成 $4\times4$ 乘法。

[AlphaTensor](https://deepmind.google/blog/discovering-novel-algorithms-with-alphatensor/) 将张量分解转成搜索任务，用强化学习找到 $4\times4$ 矩阵在有限域 $\mathbb F_2$ 上的 47 项分解，比上述 49 次方案少两次标量乘法。该构造证明**张量秩不超过 47**；这一分解也不直接适用于实数或复数。

论文发表于 [*Nature*](https://www.nature.com/articles/s41586-022-05172-4)。分解给出了可用精确算术验证的算法；标量乘法次数减少和具体硬件上的运行加速，仍是两个不同指标。

## 2022-02｜AlphaCode：模拟竞赛接近中位数

> **背景**：Codeforces 是竞赛编程平台。选手需要在时限内设计算法并提交程序，由在线判题系统根据测试数据评判。

[AlphaCode](https://deepmind.google/blog/competitive-programming-with-alphacode/) 在 10 场举办时间晚于训练数据截止时间的 Codeforces 比赛中进行事后模拟，平均名次约位于前 54.3%，接近参赛者中位数。系统为每题生成大量候选程序，经测试、聚类和排序后，选出至多 10 个候选交由外部评测。

这项结果于 2 月首次公布，论文于同年 12 月发表于 [*Science*](https://arxiv.org/abs/2203.07814)。结果来自模拟评测，展示了大规模生成与筛选在竞赛编程中的作用，不能当作正式参赛名次。
