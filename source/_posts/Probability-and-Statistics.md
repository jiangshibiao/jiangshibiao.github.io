---
categories: Math
cover: ../post_images/Probability-and-Statistics.jpg
date: 2023-09-03 23:46:36
description: 记录了我对概率论和数理统计的系统性学习。
tags: [Digest, Probability]
title: 概率论和数理统计
updated: 2023-09-04
---

本文将对概率论和数理统计的经典知识点做一个简要的总结和归纳。

相关传送门：[线性代数复习](https://jiangshibiao.github.io/categories/Knowledge-Learning/)，[趣题摘记-概率和期望](https://jiangshibiao.github.io/Interesting-Problems-Probability/)。

## 概率相关的定义



## 统计三大分布



## 基础不等式

**马尔科夫不等式 Markov inequality**：对于非负随机变量 $X$ 和定值 $a$：
$$
P(X \ge a) \le \frac{\mu}{a}
$$
证明：对 $X$ 的概率密度函数积分即可。

**切比雪夫不等式 Chebyshev Inequality**：假设随机变量 $X$ 总体均值为 $\mu$，总体方差为 $\sigma^2$：
$$
P(|X-\mu| \ge c) \le \frac{\sigma^2}{c^2}
$$
证明：取 $X'=(X-\mu)^2,a'=c^2$ 带入马尔科夫不等式即得证。

取 $c=k\sigma$ 立得推论：
$$
P(|X-\mu| \ge k\sigma) \le \frac{1}{k^2}
$$
相比于马尔科夫不等式，切比雪夫不等式额外利用了方差的信息，得到了更准确的界。

## 大数定律

| 大数定理         | 条件                                      | 效果                     |
| ---------------- | ----------------------------------------- | ------------------------ |
| 弱大数定律       | 期望存在                                  | 样本均值依概率收敛于期望 |
| 强大数定律       | 期望存在                                  | 样本均值趋向于期望       |
| 马尔科夫大数定律 | 期望存在，和的方差是关于 $n^2$ 的无穷小量 | 样本均值趋向于期望       |
| 切比雪夫大数定律 | 期望存在，方差独立且有共同上界            | 样本均值趋向于期望       |
| 辛钦大数定律     | 期望存在，独立同分布                      | 样本均值趋向于期望       |

定义 $\{X_1,X_2,\dots,X_n\}$ 是随机变量序列。若 $\mathbb E(x)$ 存在则记为 $\mu$，如果 $\mathbb D(x)$ 存在则记为 $\sigma^2$。

**弱大数定律 weak law of large numbers**：若 $\{X_n\}$ 的数学期望存在，则样本均值 $\overline X_n$ 依概率收敛于 $\mu$，记作 $\overline X_n \overset{P}{\longrightarrow} \mathbb \mu$。即：
$$
\forall\varepsilon>0: \lim_{n\rightarrow\infty}P\left\{ \left| \overline X_n-\mu \right| < \varepsilon \right\} = 1
$$
**强大数定律 strong law of large numbers**：若 $\{X_n\}$ 的数学期望存在，则样本均值 $\overline X_n$ 趋向于 $\mu$。即：
$$
P\left\{ \lim_{n\rightarrow\infty} \overline X_n=\mu \right\} =1
$$
需要注意的是，（强弱）大数定律的表达式是 $P=1$，即允许极少数离群点。

**马尔科夫大数定律**：若 $\{X_n\}$ 的满足以下性质，则其服从弱大数定律。
$$
\lim_{n\to\infty}\frac1{n^2}\mathbb D\left(\sum_{i=1}^nX_i\right)=0
$$

**切比雪夫大数定律**：若 $\{X_n\}$ 独立且方差有共同的上界，则其服从弱大数定律。

证明：因为 $\{X_n\}$ 独立，将马尔科夫大数定律的方差项各自拆开并替换成上界 $C$ 即可得证。

**辛钦大数定律 Khinchin's Law of Large numbers**：若 $\{X_n\}$ 独立同分布数学期望存在，则其服从弱大数定律。

**中心极限定理 Central Limit Theorem**：若 $\{X_1,X_2,\dots,X_n\}$ 是独立同分布的随机变量序列，且 $\mathbb E(X)=\mu$，$\mathbb D(X)=\sigma^2>0$，则 $n$ 足够大时 $\overline X_n$ 近似服从正态分布 $N\left(\mu,\frac{\sigma^2}n\right)$，即
$$
\lim_{n\to\infty}P\left(\frac{\overline X_n-\mu}{\sigma/\sqrt n}<a\right)=\Phi(a)=\int_{-\infty}^a\frac1{\sqrt{2\pi}}e^{-t^2/2}dt
$$
上述定理全称是林德伯格-勒维 Lindeberg-Levy 中心极限定理，是最常见的中心极限定理。此外还有：

+ 棣莫弗-拉普拉斯 De Moivre-Laplace 中心极限定理（二项分布中心极限定理），讨论了二项分布特例。
+ 林德伯格-费勒 Lindeberg-Feller 中心极限定理，不再要求独立同分布，是一个条件较弱的中心极限定理。
+ 李雅普诺夫 Lyapunov 中心极限定理，是林德伯格中心极限定理的强化版本（或者说是推论）。