---
categories: Math
cover: ../post_images/Elementary-Number-Theory.jpg
date: 2024-06-23 19:19:01
description: 记录了我对初等数论的系统性学习。
tags: [Digest, Number Theory]
title: 初等数论
updated: 2025-01-29
---

## 整除 Division

**除法定理**（*division theorem*）：若 $a,b \in \mathbb{Z}, b>0$，则存在唯一的整数对 $(q,r)$ 满足 
$$
\begin{align}
a=qb+r \quad 0\le r < b
\end{align}
$$

华罗庚在《数论导引》里的方法很简洁：
$$
\lfloor \frac{a}{b} \rfloor \le \frac{a}{b} < \lfloor \frac{a}{b} \rfloor+1 \quad a,b \in \mathbb{Z}, b>0\\
0 \le a - \lfloor \frac{a}{b} \rfloor \cdot b <b \\
a=\lfloor \frac{a}{b} \rfloor \cdot b+r \quad 0 \le r < b
$$
**整除**（*divide*）：若 $a,b,q \in \mathbb{Z}, a=qb$，则称 $a$ 是 $b$ 的倍数（*multiple*）或 $b$ 整除 $a$，记为 $b|a$。

**最大公约数**（*greatest common divisor*）：同时整除 $a,b$ 的最大非负整数，记为 $\gcd(a,b)$ 或 $(a,b)$。

最大公约数性质：$(a+bc,b)=(a,b),(a,b)=d \Leftrightarrow (a/d,b/d)=1, (0,0)=0,(0,a)=|a|$。

**裴蜀定理**（*Bézout's lemma*）：若整数 $a,b$ 不同时为 $0$，则存在整数 $x,y$ 使得：
$$
\begin{align}
ax+by=(a,b)
\end{align}
$$
裴蜀定理的等价形式： $ax+by=1 \Leftrightarrow (a,b)=1$。

**证明**：注意到一定存在整数 $(x,y)$ 使得 $ax+by>0$，不妨设其线性组合的最小正整数结果是 $d$。

下面我们将证明 $d=(a,b)$。首先我们证明 $d|a$，套用整除定理得到唯一的 $(r,q)$：$a=dq+r(0 \le r < d)$
$$
r=a-dq=a-(ax+by)q=(1-qx)a+(-qy)b
$$
说明 $r$ 也是 $(a,b)$ 的线性组合。由于 $0 \le r<d$，且我们规定线性组合最小正整数是 $d$，所以 $r=0$，即 $d|a$。

同理我们也可以证明 $d|b$，即 $d$ 是 $a,b$ 的公约数。

对于任何 $a,b$ 的其他公约数 $c$，由于 $d=ax+by$，则 $c|d$。所以 $d$ 是 $(a,b)$ 最小公约数。

**扩展欧几里得算法**：通过辗转相除算法来构造性地证明裴蜀定理。

**线性丢番图方程**（*linear diophantine equations*）：裴蜀定理的推广，求以下整数方程的解 $x,y \in \mathbb{Z}$：
$$
\begin{align}
ax+by=c \quad a,b,c \in \mathbb{Z}
\end{align}
$$
**解线性丢番图方程**：若 $a,b$ 不同时为 $0$，则丢番图方程有整数解当且仅当 $d=(a,b)|c$，且所有解形如：
$$
\begin{align}
(x=x_0+\frac{bn}{d},y=y_0-\frac{an}{d}) \quad n \in \mathbb{Z}
\end{align}
$$
有解的必要性：若 $(x,y)$ 是一组整数解，则 $ax+by=c$。又因为 $d|a,d|b$，所以 $d|c$。

有解的充分性：由裴蜀定理得存在 $s,t \in \mathbb{Z}$ 使得 $d=sa+tb$。不妨设 $c=dm$，则 $c=(ms)a+(mb)t$。

通式的正确性：设 $x_0=ms,y_0=mb$，易验证 $a(x_0+\frac{bn}{d})+b(y_0-\frac{an}{d})=c$。

通式的唯一性：反证。设存在一组解 $(x,y)$ 不满足通式，但仍然能推导出以下符合通式的矛盾：
$$
a(x-x_0)+b(y-y_0)=0 \\
\frac{a}{d}(x-x_0)=-\frac{b}{d}(y-y_0) \\
\text{WLOG. } b \ne 0 \Rightarrow \frac{b}{d} ~|~ [\frac{a}{d}(x-x_0)] \\
\exists n \in \mathbb{Z}, \quad x-x_0=\frac{b}{d} n \\
\exists n \in \mathbb{Z}, \quad -\frac{b}{d}(y-y_0)=\frac{a}{d}(x-x_0)=\frac{ab}{d^2}n \\
\exists n \in \mathbb{Z},\quad y=y_0-\frac{a}{d}n
$$

## 素数 Prime Number

进制定理：若 $b \in \mathbb{N}^+,b>1$，所有正整数 $n$ 都可以被唯一表示成以下形式：
$$
\begin{align}
n=a_kb^k+a_{k-1}b^{k-1}+\dots+a_1b+a_0 \quad 0 \le a_{0,1,..,k}<b,a_k \ne 0
\end{align}
$$
素数/质数（*prime number*）：大于 $1$ 且不能被除了 $1$ 和其本身外的任何自然数整除的自然数。

合数（*composite number*）：大于 $1$ 且不是素数的自然数。

素数的简单性质：

+   任何大于 $1$ 的自然数都有一个质因数（*prime divisor*）。
+   合数 $n$ 必然存在一个不超过 $\sqrt n$ 的质因数。
+   有无限多个素数。反证法：假设可穷举成 $p_1,p_2,\dots,p_n$，则 $Q=p_1p_2\dots p_n+1$ 也是素数。
+   存在至少 $n$ 个连续的合数。构造法：$(n+1)!+2,(n+1)!+3,\dots,(n+1)!+(n+1)$。

**算术基本定理**（*fundamental theorem of arithmetic*）：任何大于 $1$ 的正整数可以被唯一分解成素数幂的乘积。
$$
\begin{align}
n=p_1^{e_1}p_2^{e_2}\dots p_k^{e_k}
\end{align}
$$

**费马因式分解法**（*fermat's factorization method*）：若 $n$ 是正奇数，一定存在 $a,b$ 使得 $n^2=a^2-b^2$。

证明：注意到一定存在奇数 $c,d$ 使得 $n=cd$，也即 $n=\left(\frac{c+d}{2}\right)^2-\left(\frac{c-d}{2}\right)^2$。

应用：分解 $n$ 时，设 $m$ 是 $>\sqrt n$ 的最小正整数，枚举 $a=m^2,(m+1)^2,\dots$ ，观察 $b$ 是否是平方数。

【素数更多性质待填坑】

## 同余 Congruent

**同余**（*congruent*）：对于 $n \in \mathbb{N^+},a,b \in \mathbb{Z}$，若 $a$ 和 $b$ 除以 $n$ 的余数相同，称 $a,b$ 模 $n$ 同余，记为：
$$
\begin{align}
a \equiv b \pmod n
\end{align}
$$
推论：对于 $n \in \mathbb{N^+},a,b \in \mathbb{Z}$，有 $a \equiv b \pmod n \Leftrightarrow n | (a-b)$。

当 $n$ 确定时，同余符号满足自反性、对称性和传递性，即将 $\mathbb{Z}$ 划成了不相交的等价类（*equivalence class*）。

**同余类**（*congruence class*）：对于 $n \in \mathbb{N^+},a \in \mathbb{Z}$，所有和 $a$ 模 $n$ 同余的数构成一个同余类，记为：
$$
\begin{align}
[a]=\{b \in \mathbb{Z} | a \equiv b \pmod n\}=\{\dots,a-2n,a-n,a,a+n,\dots\}
\end{align}
$$
对于 $n \in \mathbb{N^+},$，用 $\mathbb{Z}_n$ 表示模 $n$ 场景下的 $n$ 个同余类。设 $[a],[b] \in \mathbb{Z}_n$，定义同余类的二元运算：
$$
\begin{align*}
[a]+[b]=[a+b] \\
[a]-[b]=[a-b] \\
[a][b] = [ab]
\end{align*}
$$
**线性同余方程**（*linear congruence eqaution*）：
$$
\begin{align}
ax \equiv b \pmod n,\quad n \in \mathbb{N^+}, a,b \in \mathbb{Z}
\end{align}
$$

解的存在性：设 $d=(a,n)$，上述方程有解当且仅当 $d|b$。

证明：变形至 $ax=b+kn, k \in \mathbb{Z}$，将线性同余方程转化为线性丢番图方程，套用丢番图方程的解法。

解的形式：若 $d|b$，设 $x_0$ 为任意解，其通解构成了 $d$ 个模 $n$ 的同余类：
$$
\begin{align}
x=x_0+\frac{nt}{d},t \in \mathbb{Z}
\end{align}
$$
推论：若 $(a,n)=1$，则线性同余方程 $ax \equiv b \pmod n$ 的解只构成一个同余类。

**中国剩余定理**（*chinese remainder theorem*）：以下同余方程的解是一个模 $n$ 的同余类，$n=n_1n_2 \dots n_k$。
$$
\begin{equation}
\begin{aligned}
& x  \equiv a_1 \pmod {n_1} \\
& x  \equiv a_2 \pmod {n_2} \\
& \dots \\
&x  \equiv a_k \pmod {n_k} \\
n_1,n_2,\dots,n_k \in \mathbb{N}^+,&a_1,a_2,\dots,a_k \in \mathbb{Z},\forall_{i \ne j} (n_i,n_j)=1
\end{aligned}
\end{equation}
$$

解的存在性：构造 $c_i=n/n_i$，则显然有  $(c_i,n_i)=1$。根据上述推论，线性同余 $c_ix \equiv 1 \pmod n$ 的解只构成一个模 $n$ 的同余类，不放设其为 $[c^{-1}_i]$。构造下列 $x_0$ 满足上述 $k$ 个等式，即模 $n$ 的同余类 $[x_0]$ 是方程的解。
$$
\begin{align}
x_0=a_1c_1c^{-1}_1+a_2c_2c^{-1}_2+\dots+a_kc_kc^{-1}_k
\end{align}
$$
解的唯一性：假设模 $n$ 的另一个同余类 $[x]$ 是方程的解，构造下列矛盾：
$$
\begin{align*}
\forall i & \quad x \equiv a_i \equiv x_0 \pmod n \\
\forall i & \quad n_i~|~x-x_0 \\
& n~|~x-x_0 \\
x & \equiv x_0  \pmod n \\
\end{align*}
$$

## 剩余 Residues

**二次剩余**（*quadratic residues*）：若 $\exists x,x^2 \equiv a \pmod p$，称 $a$ 是 $p$ 的二次剩余（否则被称为二次非剩余）。

推论：若 $a$ 是 $p$ 的二次剩余，$b$ 是 $p$ 的二次非剩余，则 $ab$ 是 $p$ 的二次非剩余。

**奇素数的二次剩余方程**：设 $p$ 是奇素数，$a>0$，下列方程一定无解或正好有两个解。
$$
\begin{align}
x^2 \equiv a \pmod p
\end{align}
$$
证明解的对偶性：假设 $x=s$ 是方程的解，则 $x=-s$ 是方程的另一个解，因为 $2s \not\equiv 0 \pmod p$。

证明解的唯二性：假设 $x=s_1,x=s_2$ 是方程的两个不同的解（即 $0 < s_1,s_2 <p,s_1 \ne s_2$），则有：
$$
s_1^2-s_2^2 \equiv (s_1+s_2)(s_1-s_2) \equiv 0 \pmod p
$$
观察可知 $p|(s_1+s_2)$ 或 $p|(s_1-s_2)$。已知 $0 < |s_1-s_2| <p$，且 $p$ 是奇质数，可得 $s_1+s_2=p$。

如果存在另一个解 $s_3$，由对称性可得 $s_2+s_3=p$，即 $s_1=s_3$，产生矛盾。

**奇质数的二次剩余数量**：$0 \le a < p \quad (p \in \mathbb{P_{odd}})$ 中正好有 $(p+1)/2$ 个数是 $p$ 的二次剩余。

证明：已证每个有解的 $a>0$ 都对应两个解 $(s_1,s_2)$，而每个 $0 \le s <p$ 都对应某个 $a$，说明正好一半的 $a$ 有解。

**勒让德符号**（*legendre symbol*）：对二次剩余进行形式化描述：
$$
\begin{equation}
\left(\frac{a}{p}\right)= 
\left\{
\begin{aligned}  
0 & \quad a \equiv 0 \pmod p \\
+1 & \quad a \not \equiv 0 \pmod p \quad \text{and} \quad \exists x, x^2 \equiv a \pmod p \quad \\
-1 & \quad \forall  x, x^2 \not\equiv a \pmod p\\
\end{aligned}
\right.
\end{equation}
$$
**欧拉准则**（*Euler's Criterion*）：若 $p \in \mathbb{P_{odd}}$，勒让德符号满足以下公式：
$$
\begin{align}
\left(\frac{a}{p}\right)=a^{\frac{p-1}{2}} \pmod p
\end{align}
$$
证明二次剩余场景：若 $\left(\frac{a}{p}\right)=1$，则 $\exists s, s^2 \equiv a \pmod p$。右侧根据费马小定理可得：
$$
a^{\frac{p-1}{2}} \equiv (s^2)^{\frac{p-1}{2}} \equiv s^{p-1} \equiv 1 \pmod p
$$
证明二次非剩余场景：对于任意 $1 \le s_1<p$，存在唯一的 $s_2=s_1^{-1}a$ 使得 $s_1\cdot s_2 \equiv a \pmod p$。由于 $a$ 是二次非剩余，则 $s_1 \not\equiv s_2 \pmod p$，即有 $(p-1)/2$ 组不同的 $(s_1,s_2)$。分组相乘，根据威尔逊定理可得：
$$
1 \times 2 \times 3 \times \cdots \times (p-1) \equiv -1  \equiv a^{\frac{p-1}{2}}\pmod p
$$
勒让德符号的运算性质：
$$
\begin{align*}
(1) & \quad \left(\frac{a}{p}\right)\left(\frac{b}{p}\right) =\left(\frac{ab}{p}\right) \\ 
(2) & \quad \left(\frac{a^2}{p}\right)=1
\end{align*}
$$


**高斯引理**（*gauss's lemma*）：若 $p \in \mathbb{P_{odd}},a>0$，勒让德符号满足以下公式：
$$
\begin{align}
\left(\frac{a}{p}\right) \equiv (-1)^{|aS_1 \cap S_2 |}, \quad aS_1=\left\{ak \pmod p~|~k=1,2,\dots,\frac{p-1}{2}\right\},\quad S_2=\left\{\frac{p+1}{2},\dots,p-1\right\}
\end{align}
$$
证明：考察 $aS_1$ 里元素的两两关系。由于 $(a,p)=1$，可得：
$$
\forall _{x,y} \quad ax \not \equiv \pm ay \pmod p\quad \left(1 \le x,y \le \frac{p-1}{2},x \ne y\right)
$$
将 $1,2,\dots,p-1$ 在模域下分组成 $\{\pm 1,\pm 2,\dots,\pm (p-1)/2\}$，则 $aS_1$ 的每个元素 **唯一映射** 到对应的一组，只是具体的正负性未知。$|aS_1 \cap S_2|$ 表达了 $aS_1$ 中有多少元素是映射到的是负值（即 $\mod p \ge (p+1)/2$）。

如果 $aS_1$ 的某个元素 $ka$ 映射到了某一组的负值，可以通过加负号将其调成同组的正值：
$$
|x|={\begin{cases}x&{\text{if }}1\leq x\leq {\frac {p-1}{2}},\\p-x&{\text{if }}{\frac {p+1}{2}}\leq x\leq p-1.\end{cases}} \\
ka \mod p={\begin{cases}|ka \mod p|&{\text{if }}1\leq ka \mod p\leq {\frac {p-1}{2}},\\-|ka \mod p|&{\text{if }}{\frac {p+1}{2}}\leq ka \mod p\leq p-1.\end{cases}}
$$
将 $aS_1$ 中所有元素相乘，利用 直接相乘 和 先把负值映射到正值再相乘 两种方法建立等式：
$$
\begin{align*}
a \cdot 2a \cdots \frac{p-1}{2}a&=(-1)^{|aS_1 \cap S_2|}(|a| \cdot |2a| \cdots |\frac{p-1}{2}a|)\\ &=(-1)^{|aS_1 \cap S_2|} (1 \cdot 2 \cdots \frac{p-1}{2}) \\
\end{align*}
$$
比较等式两侧除了阶乘外的系数，再运用欧拉准则可证命题：
$$
(-1)^{|aS_1 \cap S_2|}=a^{\frac{p-1}{2}}=\left(\frac{a}{p}\right)
$$
**二次互反律**（*quadratic reciprocity*） ：令 $p,q$ 是两个不同的奇素数，则
$$
\begin{align}
\left(\frac{q}{p}\right)\left(\frac{p}{q}\right)=(-1)^{\frac{p-1}{2} \cdot \frac{q-1}{2}}
\end{align}
$$