---
categories: Math
cover: ../post_images/Zero-Knowledge-Proof.png
date: 2025-07-15 00:23:32
description: 本篇文章试图入坑零知识证明，缓更。
tags: [Digest, Cryptography]
title: 零知识证明
updated: 2025-07-15
---

开坑了一定更有动力！

## zk-SNARK

SNARK Pinocchio 由 Eli Ben-Sasson 在 2012 年提出：[*Pinocchio: Nearly Practical Verifiable Computation*](https://eprint.iacr.org/2013/279.pdf)。

Vitalik Buterin: [Quadratic Arithmetic Programs: from Zero to Hero](https://medium.com/@VitalikButerin/quadratic-arithmetic-programs-from-zero-to-hero-f6d558cea649)

#### 用一个案例看转化原理

zk-SNARK 的目标是将一个待证明的任务通过数学运算电路最终转化成多项式，并基于多项式给出证明。

#### 基于多项式进行零知识证明

回顾转化后的多项式问题：

+ Prover 拥有多项式 $p(x)=A(x)B(x)-C(x)$ 的完整系数。
+ Prover 和 Verifier 约定了多项式 $t(x)=(x-1) \cdot (x-2)\cdot \dots \cdot (x-n)$。
+ Prover 要在不透露 $p(x)$ 和 $h(x)$ 的情况下证明 $p(x)=t(x)h(x)$。

**K**nowledge-of-**E**xponent **A**ssumption 工具：假设 Alice 有个值 $a$，Alice 希望 Bob 能以某个任意指数 $e$ 计算 $a^e \mod n$ 并将值返回。如何保证 Alice 一定做了指数运算？Alice 可以随机 $0 \le \alpha <n$ 并计算 $a'=a^\alpha$，把 $(a,a')$ 一起传递给 Bob 让其计算 $(b=a^e \mod n,b'=(a')^{e} \mod n)$，验证 $b^{\alpha}=b' \mod n$ 即可。

#### 标准转化过程
