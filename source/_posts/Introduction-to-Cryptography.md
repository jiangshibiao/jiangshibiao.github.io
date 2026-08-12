---
categories: Math
cover: ../post_images/Cryptography-in-Engineering.png
date: 2024-02-14 17:52:53
description: 本篇密码学导论主要有以下几个特征：概括性（用统一的风格，列举密码学里经典的概念、定理和算法）、准确性（总体风格不拘小节，每个细节力求准确无误）、应用性（重点关注应用）和持续性（想到哪就写到哪，持续修正和扩展）。
tags: [Digest, Cryptography]
title: 密码学导论
updated: 2025-07-23
---

## 概述

密码学（Cryptography）可分为古典密码学和现代密码学。

1949 年香农（C. E. Shannon）发表了题为《保密系统的通信理论》的经典论文标志着现代密码学的开始。

密码学的本质是消息在传递过程中保证如下性质：机密性（Confidentiality）、完整性（Integrity）、可用性（Availability）、认证性（Authentication）和不可否认性（Non-repudiation）。前三个性质简称为 CIA。

密码学中常用 Alice 和 Bob 作为通信双方的人名，该用法源自 RSA 的论文。其他常用人名如下：

| 名称        | 作用                         |
| ----------- | ---------------------------- |
| Alice, Bob  | 主要的通信双方               |
| Carol, Dave | 其他通信方                   |
| Eve         | 偷听者，通常只会偷听不会篡改 |
| Mallory     | 恶意攻击者，可能会篡改消息。 |

和密码学相关的工具、组织或标准介绍如下：

| 名称                                                         | 简介                                   |
| ------------------------------------------------------------ | -------------------------------------- |
| **A**bstract **S**yntax **N**otation One（ASN.1）            | 用于通信传输的数据结构标准格式         |
| OpenSSL                                                      | 用于密码学和安全通信的通用软件         |
| **N**ational **I**nstitute of **S**tandards and **T**echnology | 美国国家标准技术研究院，直属商务部     |
| **F**ederal **I**nformation **P**rocessing **S**tandards     | 联邦信息处理标准，NIST 发布的标准      |
| **S**tandards for **E**fficient **C**ryptography **G**roup   | 致力于制定和推动密码学标准的国际性组织 |

## 群论 Group theory

### 同余 Congruence Modulo

若整数 $a,b$ 除正整数 $n$ 的余数相等，称 $a,b$ 模 $n$ **同余**（Congruence Modulo），记为 $a\equiv b \pmod n$。

模 $n$ 同余是一种 **等价关系**（Equivalence Relation），元素 $a$ 的等价类集合是 $\{\dots,a-n,a,a+n,\dots\}$。

**剩余系**（Residue System）指模 $n$ 同余类的代表数构成的集合，代表数通常选为最小的非负整数。

**完全剩余系**（Complete Residue System）指模 $n$ 同余类的全部代表数构成的集合。

**简约剩余系**（Reduced Residue System）指模 $n$ 同余类里所有与 $n$ 互质的代表数构成的集合。例如模 $6$ 的简约剩余系是 $\{1,5\}$ 或 $\{7,11\}$，模素数 $p$ 的简约剩余系是 $\{0,1,\dots,p-1\}$。

欧拉函数（Euler's Totient function）指模 $n$ 的简约剩余系的元素个数。$\varphi(n)$ 满足等式：
$$
\varphi(n)=n \prod_{p|n}(1-\frac{1}{p})
$$

卡迈克尔函数（Carmichael Function）指最小的正整数 $m$ 使得 $a^m \equiv 1 \pmod n$。$\lambda(n)$ 满足等式：
$$
\lambda (n)={\begin{cases}\varphi (n)&n=1,2,4,p^k,2p^k \\{\dfrac {1}{2}}\varphi (n)& \mathbb{otherwise}\end{cases}}
$$

| 定理                               | 内容                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| 威尔逊定理 Wilson's Theorem        | $(n-1)!\ \equiv -1 \pmod {n}$                                |
| 费马小定理 Fermat's Little Theorem | $a^p \equiv a \pmod p$                                       |
| 欧拉定理 Euler's Theorem           | $a^{\phi(n)} \equiv 1 \pmod n$                               |
| 卢卡斯定理 Lucas's Theorem         | $\binom {m}{n} \equiv \prod _{i=0}^{k}{\binom {m_{i}}{n_{i}}}\pmod p$ |

### 群 Group 

给定一个集合 $G\neq\varnothing$ 以及其上的二元代数运算「 $\circ$ 」，如若它们满足如下性质：

| 性质                    | 描述                                                         |
| ----------------------- | ------------------------------------------------------------ |
| 封闭性（Closure）       | $\forall v, u \in G, \quad v \circ u \in G$                  |
| 结合律（Associativity） | $\forall v, u, w \in G, \quad (v \circ u) \circ w = v \circ (u \circ w)$ |
| 单位元（Identity）      | $\exists e \in G, \forall v \in G, \quad e \circ v = v$      |
| 逆元（Inverse）         | $\forall v \in G, \exists v^{-1} \in G, \quad v^{-1} \circ v = e$ |

则称集合 $G$ 对该代数运算作成一个**群**（Group），记作 $(G,\circ)$。常见的群包括：

+ 整数对加法构成群 $(\mathbb{Z},+)$。单位元 $0$，$v$ 的逆元 $-v$。
+ 正有理数对乘法构成群  $(\mathbb{Q}_+,\times)$。单位元 $1$，$v$ 的逆元 $1/v$。
+ 实数域 $\mathbb{R}$ 上的全体 $m$ 阶可逆矩阵对矩阵乘法构成群。单位元 $I_m$，元素 $A$ 的逆元为逆矩阵 $A^{-1}$。

**有限群**（Finite Group）是指元素是有限个的群，其个数被称为阶（Order），记为 $|G|$。

若群 $(G, \circ)$ 存在 $H \subseteq G$ 满足 $(H,\circ)$ 也是群，则称 $H$ 是 $G$ 的**子群**（Subgroup），记为 $H \le G$。

**拉格朗日定理**（Lagrange's Theorem）：若 $H$ 是有限群 $G$ 的子群，则 $H$ 的阶整除 $G$ 的阶。
$$
\left|G\right|=\left[G:H\right]\cdot \left|H\right|
$$
**循环群**（Cyclic Group）指群 $(G,\circ)$  里存在元素 $g$ 可以指数表达所有群里的元素：
$$
G=\{a|(\exist k \in \mathbb{Z})(a=g^k)\}
$$
$g$ 被称为群 $(G,\circ)$  的生成元（Generator）或原根（Primitive Root）。

循环群的一些性质：

+   $n$ 阶循环群一定同构于模 $n$ 的同余类构成的加法群 $(\mathbb{Z}/n\mathbb{Z},+)$。
+   无限循环群一定同构于整数关于加法构成的群 $(\mathbb{Z},\circ)$。
+   $(\mathbb{Z}/n\mathbb{Z},+)$ 是循环群当且仅当 $\varphi(n)=\lambda(n)$，即要求 $n=1,2,4,p^k,2p^k$。

根据二元代数运算「 $\circ$ 」性质的增加或减少，群可以衍生出相关的概念，如半群、幺半群和交换群。

| 定义                              | 运算性质                             |
| --------------------------------- | ------------------------------------ |
| 半群（Semigroup）                 | 封闭性，结合律                       |
| 幺半群（Monoid）                  | 封闭性，结合律，单位元               |
| 群（Group）                       | 封闭性，结合律，单位元，逆元         |
| 交换群（阿贝尔群，Abelian Group） | 封闭性，结合律，单位元，逆元，交换律 |

### 环和域 Ring and Field

对于集合 $R\neq\varnothing$ 以及其上的两个二元代数运算「 $+$ 」和「 $\circ$ 」，如若满足如下性质：

1.  $R$ 对运算「 $+$ 」构成交换群。
2.  $R$ 对运算「 $\circ$ 」构成半群。
3.  $R$ 对运算「 $+$ 」和「 $\circ$ 」满足分配律，即：

$$
\forall v, u, w \in R, \quad w \circ (v + u) = w \circ v + w \circ u, (v + u) \circ w = v \circ w + u \circ w
$$

则称集合 $R$ 对此二代数运算形成一个**环**（Ring），记作 $(R,+,\circ)$。

环的特征（Characteristic）指最小的 $n$ 使得 ${\displaystyle \underbrace {1+\cdots +1} _{n{\text{ summands}}}=0}$，记为 $char(R)$。若不存在 $n$，记 $char(R)=0$。

根据 「 $\circ$ 」运算性质的增加，环可以衍生出相关的概念，如幺环、交换环、域等：

| 定义                                                     | 「 $\circ$ 」额外满足的运算性质                         |
| -------------------------------------------------------- | ------------------------------------------------------- |
| 环（Ring）                                               |                                                         |
| 幺环（Ring with Identity）                               | 「 $\circ$ 」单位元                                     |
| 交换环（Commutative Ring）                               | 「 $\circ$ 」交换律                                     |
| 含幺交换环（**C**ommutative **R**ing with **I**dentity） | 「 $\circ$ 」单位元、交换律                             |
| 除环（Division Ring）                                    | 「 $\circ$ 」单位元、逆元（除 「 $+$ 」单位元）         |
| 域（Field）                                              | 「 $\circ$ 」交换律、单位元、逆元（除 「 $+$ 」单位元） |

有限域（Finite Field）又称伽罗瓦域（Galois Field），指包含有限个元素的域。

## 经典模型 Classic Model

### RSA

RSA 是由 Ron Rivest、Adi Shamir 和 Leonard Adleman 于 1977 年提出、1978 年发表的算法：

1. 随机生成两个超大质数 $(p,q)$。
2. 设 $n=p \cdot q$，$\lambda(n)=\mathbb{lcm}(p-1,q-1)$。
3. 找到一个 $e$ 使得 $2<e<\lambda(n),\gcd(e,\lambda(n))=1$。
4. 计算 $d=e^{-1} \pmod {\lambda(n)}$。

定义公钥为 $(e, n)$，私钥为 $(d,n)$。注意点如下：

+   第 2 步 RSA 原始论文用 $\phi(n)=(p-1)(q-1)$，目前更推荐用 $\lambda(n)$ 代替 $\phi(n)$。
+   公钥 $e$ 选得小可以加速验签，$e=3$ 已被证明不安全，openssl 固定选用 $e=65537$。

根据费马小定理和中国剩余定理，公私钥满足 $(m^e)^d=m^{de}=m^{de \mod \lambda(n)}=m \pmod n$。

2004 年 Alexander May 证明了破译 RSA 私钥 $d$ 和分解 $n=p \cdot q$ 这两个问题在多项式时间内等价。

RSA 的安全性基于两个数论假设：

+ Integer Factorization Problem 大整数分解问题：不存在多项式时间算法能分解大整数 $n$。
+ RSA Problem：不存在多项式时间算法能从 $m'=m^e \pmod n$ 反向推出 $m$。这个问题和离散对数问题的关联性很高，不过后者定义在素数域下，而 RSA 的 $n$ 是特殊的合数。

在实际使用时，$p$ 和 $q$ 要选择得足够大，且彼此不能相差太小（当 $|p-q|<2\sqrt[4]{n}$ 时存在 trivial 的分解方法，如使用 Fermat's factorization method）。通常用 $n=pq$ 的二进制位数衡量 RSA 算法的安全性。

目前已知被分解的最大位数是 829 二进制位，花了 2700 CPU 年。普遍认为 RSA-1024 已经不够安全（虽然目前还没有公开的破译记录），推荐使用 RSA-2048/RSA-4096 来保证安全性。

```bash
# 生成 2048 位的 RSA 私钥
❯ openssl genrsa -out rsa-private-key.pem 2048

# 查看私钥的详细参数
❯ openssl rsa -noout -text -in rsa-private-key.pem
```

openssl 的 RSA 私钥结构如下表：

| 字段名称           | 含义                                                         |
| ------------------ | ------------------------------------------------------------ |
| `modulus`          | 模数 $n$                                                     |
| `publicExponent`   | 公钥 $e$，openssl 固定为 $65537$                             |
| `privateExponent`  | 私钥 $d$，很大                                               |
| `prime1`, `prime2` | 质数 $(p,q)$，用于计算 $n=p \cdot q$                         |
| `exponent1`        | 用于加速 RSA 运算的中国剩余定理指数之一，即 $exp_1=d \mod (p-1)$ |
| `exponent2`        | 用于加速 RSA 运算的中国剩余定理指数之二，即 $exp_2=d \mod (q-1)$ |
| `coefficient`      | 用于加速 RSA 运算的中国剩余定理系数，即 $c=q^{-1} \mod p$    |

### ElGamal

ElGamal 密码由 Taher Elgamal 在 1985 提出，是用于加解密或数字签名的非对称算法。

ElGamal 密码作用于循环群 $G$，常见的例子是整数模 $n$ 的乘法群（注意 $n=1,2,4,p^k,2p^k$）。

假设 $G$ 的一个生成元是 $g$，阶是 $q$。随机 $x \in \{1,2,\dots,q-1 \}$ 作为私钥，$(G,q,g, h=g^x)$ 作为公钥。

ElGamal 密码的安全性直接依赖于循环群 $G$ 的离散对数问题（**D**iscrete **L**ogarithm **P**roblem）。

### Paillier

Paillier 密码由 Pascal Paillier 在 1999 年提出，是用于加解密的的非对称算法。

Paillier 最重要的特性是 **加同态**（**A**dditive **H**omomorphic **E**ncryption），即 $E(m_1+m_2)=E(m_1)E(m_2)$

密钥生成时：

1. 取大质数 $(p,q)$ 使得 $(pq,(p-1)(q-1))=1$。设 $n=pq,\lambda=\text{lcm}(p-1,q-1), L(x)=\lfloor \frac{x-1}{n} \rfloor$。
2. 不断地取随机数 $g \in \mathbb{Z}^{*}_{n^2}$ 使得 $\mu=L(g^{\lambda} \mod n^2)^{-1} \mod n$ 存在 。
3. 记公钥为 $(n,g)$，私钥为 $(\lambda, \mu)$。

加密数据 $m(0 \le m \le n)$ 时：取 $0<r<n$ 使得 $(r,n)=1$，计算 $c=g^m \cdot r^n \mod n^2$。

解密数据 $c \in \mathbb{Z}^{*}_{n^2}$ 时：$m=L(c^{\lambda} \mod n^2) \cdot \mu \mod n$。

正确性验证（倒数第二步是基于二项式展开）：
$$
\begin{aligned}
m&=L(c^{\lambda} \mod n^2) \cdot \mu \mod n \\
&=L(g^{\lambda m} \cdot r^{\lambda n} \mod n^2) \cdot \mu \mod n \\
&=L(g^{\lambda m}   \mod n^2) \cdot \mu \mod n \\
&=L((kn+1)^{m}   \mod n^2) \cdot L(kn+1)^{-1} \mod n \\
&=L((1+mkn)   \mod n^2) \cdot L(kn+1)^{-1} \mod n \\
&=m \cdot k \cdot k^{-1} \mod n
\end{aligned}
$$

实践中，密钥生成时常取位数相同的 $(p,q)$ 使得 $\lambda=\varphi(n)$，同时取 $g=n+1$ 来保证 $\mu=\lambda^{-1}=\varphi^{-1}(n)$

### 椭圆曲线 Elliptic Curve

#### 定义和运算

椭圆曲线（Elliptic Curve）是一条定义在域 $R$ 上、生成点在 $R^2$ 上的平滑二维曲线。

命名由来：将下列椭圆周长积分式的分母平方后就能得到椭圆曲线方程
$$
\int_a^b \frac{\mathrm{d}x}{\sqrt {x^3+ax+b}}
$$
当域 $R$ 满足 $char(R) \ne 2,3$，椭圆曲线上除 $O$ 外的所有点可以用如下魏尔斯特拉斯方程表示：
$$
\{(x,y) \in \mathbb{R}^2 \quad | \quad y^2=x^3+ax+b, \quad a,b \in R,4a^3+27b^2\ne 0\}
$$
当  $4a^3+27b^2=0$ 时会产生尖点（cusp）或自交（self-intersection），称为奇异性（singularity）。

椭圆曲线有很多不同的形式和变种，彼此之间往往可以互相转化：

| 变种名                  | 方程    | 非奇异判定 |
| ----------------------- | ------- | ---------- |
| Weierstrass Normal Form | $(x,y)~\vert~y^2 = x^3+ax+b$ | $4a^3+27b^2 \ne 0$ |
| Montgomery Curve | $(x,y)~\vert~by^2 = x^3+ax^2+x$ | $b(a^2-4) \ne 0$ |
| Edwards Curve | $(x,y)~\vert~x^2+y^2=1+dx^2y^2$ | $d \notin \{0,1\}$ |
| Twisted Edwards Curve | $(x,y)~\vert~ax^2+y^2 = 1+dx^2y^2$ | $a \ne 0,d \ne 0,a \ne d$ |
| Hessian Curve | $(x,y)~\vert~dxy=x^3+y^3+1$ | $d^3 \ne 27$ |

椭圆曲线上的所有点连同无限远点 $O$ 构成一个交换群：

+ 单位元就是无穷远处的点 $O$。
+ 群里的元素 $P$ 的逆元是其关于 $x$ 轴的对称点，记为 $-P$。
+ 记群的二元运算为 $+$，对于椭圆曲线上位于同一直线的 $P,Q,R$ 三点，定义 $P+Q+R=0$。
+ 椭圆曲线上点 $C$ 的切线仅与曲线产生一个新交点 $D$，认为 $P=Q=C,D=R$，即 $C+C=-D$。

如果把 $A+A$ 记为 $2A$，可以在这个交换群上定义出（和标量的）乘法运算。

+ 已知 $G$ 和 $x$ 求 $xG$ 很容易，基于群的结合律可以用快速幂计算。
+ 已知 $xG$ 和 $G$ 求 $x$ 很难，这是椭圆曲线上的离散对数问题（**E**lliptic **C**urve **D**iscrete **L**ogarithm **P**roblem）。

实数域 $R$ 是连续的，密码学中常会选择离散的有限域，包括素数域 $GF(P)$ 和二进制域 $GF(2^n)$。

+ 二进制域只涉及二进制运算，适合有加速或资源受限的专用硬件设备。
+ 素数域的研究更透彻（一般会认为更安全），在通用计算机上速度更快。

#### 椭圆曲线和素数域

关于椭圆曲线如何应用于素数域，细节可查看 [这篇文章](https://andrea.corbellini.name/2015/05/23/elliptic-curve-cryptography-finite-fields-and-discrete-logarithms/)，这里做一个简单介绍。

对椭圆曲线 $\mathbb{G}$ 施加质数 $p$ 下的有限域 $\mathbb{F}_p$ 意味着曲线上的所有坐标点和加乘运算都要在 $\mathbb{F}_p$ 下进行： 
$$
\{(x,y) \in \mathbb{R}^2 ~|~y^2=x^3+ax+b, \quad a,b \in \mathbb{R}^2,~4a^3+27b^2\ne 0\} \cup \{0\}\\
\to \{(x,y) \in \mathbb{F}_p^2 ~|~ y^2=x^3+ax+b \mod p, \quad a,b \in \mathbb{F}_p^2, ~4a^3+27b^2\ne 0 \mod p \} \cup \{0\}
$$


$\mathbb{G}_{\mathbb{F}}$ 在 $\mathbb{F}_p$ 下构成了一个群，设为 $N=|\mathbb{G}_{\mathbb{F}}|$ 是 $\mathbb{G}_{\mathbb{F}}$ 的阶（即 $\mathbb{G}$ 在 $\mathbb{F}_p$ 下的总点数是 $N$）。

对于任意点 $G \in \mathbb{G}_{\mathbb{F}}$，显然有 $NG=0$，即 $n|G$。进一步地，$0G,1G,2G,\dots,...,nG$ 构成一个阶为 $n$ 的子群，其中 $n$ 是满足 $nG=\mathbf{0}$ 的最小非负整数。对于一条固定 $\mathbb{G}_{\mathbb{F}}$ 椭圆曲线，我们肯定希望能找到合适的 $G$（基点，base point）使得由其生成的子群的阶 $n$ 是尽量大的质数，就能满足密码学中各种良好性质。

如何找到合适的 $G$ 和 $n$？一种暴力的方式是取点 $G=(x,y)\in \mathbb{F}_p^2$，枚举 $N$ 的约数来判定其生成的子群的阶。

更快的方式利用了 $NR=\mathbf{0}$ 的性质，即 $n(\frac{N}{n}R)=\mathbf{0}$。我们先枚举 $N$ 中所有合适的大质数 $n$，然后不断随机点 $R=(x,y)\in \mathbb{F}_p^2$，快速验证 $\frac{N}{n}R \ne \mathbf{0}$ 是否成立，若成立说明找到一组非平凡的基点 $G=\frac{N}{n}R$。

#### 椭圆曲线的安全性

经典计算机模型下，ECDLP 的时间复杂度仍然是指数级，如 $O(\sqrt{|R|})$ 的 Pollard’s rho 算法、Baby-Step Giant-Step 算法等；量子计算机模型下，存在 $O(\log^3|R|)$ 的舒尔算法（Shor's Algorithm）。

椭圆曲线密码（Elliptic Curve Cryptography，ECC）是用椭圆曲线实现的密码技术的统称，包括加解密、数字签名和密钥交换等。椭圆曲线算法于 1985 年被提出，1999 年 NIST 标准化了签名算法并选取了 15 条曲线。曲线选择和特殊的参数设定为了防止奇异性等情况的出现，保证 [椭圆曲线的安全性](https://safecurves.cr.yp.to/)。

| 椭圆曲线名称    | ECC 模长 | 曲线类型    | 评价                                  |
| --------------- | -------- | ----------- | ------------------------------------- |
| Curve25519      | 256      | Montgomery  | 速度快，常用于密钥交换协议            |
| SM2             | 256      | Weierstrass | 中国国家标准                          |
| secp256k1       | 256      | Koblitz     | 合适的参数设置来加速，用于 BTC 和 ETH |
| P-256/secp256r1 | 256      | Weierstrass | 最流行的椭圆曲线                      |
| P-384/secp384r1 | 384      | Weierstrass |                                       |
| P-521/secp521r1 | 521      | Weierstrass |                                       |

椭圆曲线的命名规则详见 [一场椭圆曲线的寻根问祖之旅](https://cloud.tencent.com/developer/news/586021)。以 secp256k1 为例，sec 表示是 SEC 2 里的推荐曲线，p/P 表示素数域（t/B 表示二进制域），256 表示模长，k 表示 Koblitz Curve（r 表示 random），1 表示首选。

```bash
# 列出 openssl 支持的所有曲线名称
openssl ecparam -list_curves

# 生成 ec 算法的私钥，使用 prime256v1 算法，密钥长度 256 位
openssl ecparam -genkey -name prime256v1 -out ecc-private-key.pem
```

openssl 的 ECC 私钥结构如下表：

| 字段名       | 内容                                   |
| ------------ | -------------------------------------- |
| `priv`       | 私钥 $x$，一个大整数                   |
| `pub`        | 基点 $G=(x,y)$，两个大整数             |
| `ASN1 OID`   | 椭圆曲线的 ASN1 OID，例如 `prime256v1` |
| `NIST CURVE` | 椭圆曲线的 NIST 名称，例如 `P-256`     |

## 认证 Authentication

### 单向散列函数 One-way Hash Function

单向散列函数也被称为消息摘要函数（Message Digest Function），哈希函数或杂凑函数。 

+ 输入被称为消息（Message）或原像（Pre-Image）。
+ 输出被称为散列值（Hash Value）、消息摘要（Message Digest）或指纹（FingerPrint）。  

单向散列函数用来保证消息的完整性。（一个密码学安全的）单向散列函数主要特征如下：

+ 整个过程是单向的，即给定散列值无法逆推出消息。
+ 输入可以是足够长的消息，输出是固定且较短的长度。
+ 原文的微小变化（如一比特翻转）会引起散列值的巨大变化。
+ 具有抗碰撞性（Collision Resistance）。弱抗碰撞性是指要找到和某条消息具有相同散列值的另一条消息是非常困难的，强抗碰撞性是指要找到散列值相同的两条不同的消息是非常困难的。

MD4 和 MD5 是 Rivest 于 1990 年和 1991 年设计的单向散列函数，采用 Merkle-Damgard 结构，迭代 64 轮，能生成 128 位的散列值。MD5 的强抗碰撞性于 2004 年被王小云团队攻破，已不推荐使用。

SHA-1 是 NIST 于 1993 年发布、1995 年修正的单向散列函数，迭代次数提高到了 80 轮，接受长度 $<2^{64}$ 位的输入，能生成 160 位的散列值。强抗碰撞性于 2005 年被队攻破，已不安全。2005 年王小云和黄洪涛团队首次找到能生成同样 SHA-1 散列值的两条消息。NIST 在 2011 年将其标记为废弃，2013 年正式在数字签名中弃用。

SHA-2 是 NIST 于 2002 年发布的单向散列函数集合，接受长度 $<2^{128}$ 位的输入，生成不同的散列值位数，包括 SHA-256、SHA-384、SHA-512、SHA-512/224 和 SHA512/256（表示 SHA-512 算法结果截取一个前缀）。

SM3 由中国国家密码管理局于 2010 年发布。SM3 和 SHA256 结构一致，里面的函数不同。

SHA-3 是 NIST 于 2009-2012 年从 64 个算法中选拔出来的，本名为 Keccak，采用了和 Merkle-Damgard 结构完全不同的海绵结构（Sponge Construction），接受任意长度的输入，生成不同的散列值位数，包括 SHA3-224，SHA3-256，SHA3-384 和 SHA3-512。SHA-2 和 SHA-3 都被认为是安全的，广泛应用于各个领域。

### 消息认证码 Message Authentication Code

消息认证码（Message  Authentication Code）本质上是与密钥相关联的单向散列函数。

HMAC（Hashed Message Authentication Code）是最常见的消息认证算法，需要指定一种散列算法和一个密钥，比如 HMAC-SHA1，HMAC-SHA-224，HMAC-SHA-256，HMAC-SHA-384 和 HMAC-SHA-512 等。

HMAC 的计算方法为 `hash((key xor opad) || hash((key xor ipad) || message))`

+ 其中 `ipad`（00110110 循环） 和 `opad`（01011100 循环）是固定 01 串，长度和散列算法一致。
+ key 由密钥导出，长度和散列算法一致。如果偏短就在后面填 0，如果过长就先求个散列值。

为了应对重放攻击（Replay Attack），HMAC 可以配合如下操作： 

+ 序号：发送方每次带上递增序号，多发送场景需持久化记录。 
+ 时间戳：发送方每次带上时间戳，要求双方时间同步。 
+ nonce：发送方每次带上随机数字，有长度开销。

## 密码 Cipher

密码算法主要分为对称密码（Symmetric Cryptography）和非对称密码（Asymmetric Cryptography）。

+ 对称加密的通信双方使用相同的秘钥，如果一方的秘钥遭泄露，那么整个通信就会被破解。
+ 非对称加密采用公私钥的方式来加解密，安全性高，但速度较慢。

对称密码可分为分组密码（Block Cipher）和流密码（Stream Cipher）。

+ 分组密码每次只能加解密一块特定长度的数据。
+ 流密码是先自己不断派生密钥流，利用其对数据流连续处理（一般是二进制异或）。

分组密码可以采取不同的模式（mode）来将很长的一段明文组合加密，甚至转化成流密码。

### 分组密码 Block Cipher

DES（Data Encryption Standard）是 NIST 于 1977 年在 FIPS 46-3 里采用的一种对称密码，一直以来被美国以及其它国家的政府和银行广泛使用。其基本结构由 Horst Feistel 设计，于是被称为 Feistel 网络。DES 是一种 16 轮循环的 Feistel 网络，将 64 位明文加密成 64 位密文。密钥长度为 64 位，但每隔 7 位有一个错误校验位，实际上只有 56 位被用于加密，即密钥空间为 $2^{56}$。现代计算机可以穷举破解，已过时。

三重 DES（Triple-DES）将 DES 结构重复做三遍，强化了强度并向下兼容。速度慢，安全性弱，不推荐使用。

AES（Advanced Encryption Standard）由 NIST 于 2000 年从若干候选算法中选出来的新对称加密标准，本名为 Rijndael。AES 标准要求分组长度为 128 位，密钥长度为 128、192 或 256 位。AES 采用了 SPN 结构，总共会操作 10/12/14​ 轮，每轮有 SubBytes、ShiftRows、MixColumns、AddRoundKey 四个步骤，都具有位运算+可并行化的特性，解密过程正好和加密过程完全相反。DES 和 3-DES 都已过时，推荐使用 AES-256。

SM4 于 2006 年被提出，2012 年选为中国国家商用标准。加密算法和密钥扩展算法均采用 32 轮非平衡 Feistel 结构，每轮迭代包含异或、盒变换和移位三种操作。分组长度为 128 位，密钥长度为 128 位。

### 流密码 Stream Cipher

流密码需要记录内部状态来生成一个伪随机的密钥流，然后与明文数据进行按位异或运算。

**RC4** 加密算法是 Ron Rivest 在 1987 年设计出的密钥长度可变的加密算法簇，1994 年公诸于众。RC4 密钥长度在 40~2048 位，常见的是 128 位和 256 位。RC4 算法实现简单，加解密速度快，曾被广泛应用于网络通信协议（如 SSL 和 WEP 等）以及其他应用中；但 RC4 在密钥初始化和密钥流输出方面存在安全缺陷，已不推荐使用。

**ChaCha20** 算法由 Bernstein 在 2008 年提出，是其在 2005 年提出的 Salsa20 算法的变种 。标准 Chacha20 的密钥长度为 128 或 256 位，IV 长度为 64 位。ChaCha20 速度快、安全性高，Google 最先选择其作为移动互联网应用的标准算法，而后逐渐取代 RC4，广泛应用于数据加密传输和安全通信协议（如 TLS 1.3）等场景。 

### 模式 Mode

| 全称                              | 需要 IV | 加密原理                                                |
| --------------------------------- | ------- | ------------------------------------------------------- |
| **E**lectronic **C**ode**B**ook   | 否      | 直接将明文分组，每组各自加密                            |
| **C**ipher **B**lock **C**haining | 是      | 串行将每段明文与前段密文进行 xor 后再加密               |
| **C**ipher **F**eed**B**ack       | 是      | 串行将每段明文与前段密文再次加密后的结果进行 xor        |
| **O**utput **F**eed**B**ack       | 是      | 串行维护一段密钥流，每段明文与对应密钥进行 xor          |
| **C**oun**T**e**R**               | 是      | 分别用 IV, IV + 1, . . . 加密后的结果与每段明文进行 xor |
| **G**alois/**C**ounter **M**ode   | 是      | 基于 CTR 模式，运用伽罗瓦域进行消息认证                 |

| 简称 | 并行         | 加解密 | 评价                                               | 推荐程度 |
| ---- | ------------ | ------ | -------------------------------------------------- | -------- |
| ECB  | 支持         | 不同   | 相同数据块密文相同；可在不破译的情况下交换、删除等 | 不能使用 |
| CBC  | 仅解密支持   | 不同   | 翻转比特仅会影响两块，丢失比特会导致后缀失效       | 可以使用 |
| CFB  | 仅解密支持   | 相同   | 本质上把分组密码转化成了流密码                     | 可以使用 |
| OFB  | 预处理后支持 | 相同   | 如果密钥流加密前后值相同，会永远重复下去           | 可以使用 |
| CTR  | 支持         | 相同   | 本质上就是用可预测的 IV 位移替代 OFB 串行密钥流    | 推荐使用 |
| GCM  | 支持         | 相同   | 高性能且安全，认证加密场景的最佳实践               | 强烈推荐 |

分组密码的末组长度可能不满，很自然地引入填充（Padding）操作。

+ ZeroPadding：用特定的 ASCII 码（一般是编号 $0$）来填充末组剩余字节。要求待加密串不包含这个编号。
+ PKCS7Padding：如果末组空出了 $n$ 个字节，在这些字节上都填充编号为 $n$ 的 ASCII 码。这种方式能顺带起到校验作用。如果末组已满，约定新增一个块填充，方便接收方解析（这样末组一定有填充字符）。

密文窃取（**C**ipher**T**ext **S**tealing）是一种无需填充即可处理末组不满的技术，常和 ECB 或 CBC 配合。设组数 $n$，分组长度 $l$，末组长度 $x(x\leq l)$。ECB-CTS 要求 $n \ge 2$，前 $n-2$ 块加密流程不变，第 $n-1$ 块加密后将其中长度为 $l-x$ 的部分移动至第 $n$ 块参与加密。CTS 根据后两块密文的摆放细节可以分成三种：

+ CTS-CS1：最自然的方式，第 $n-1$ 块保留长度 $x$ 的密文，接上第 $n$ 块长度 $l$ 的密文。优点是末块长度满的时候和非 CTS 效果相同，缺点是接收者在解末尾长度为 $l$ 的一段时，不能获得下标对齐的加速。
+ CTS-CS2：末块长度满时不做处理，末块长度不满时把 CS1 中前后长度为 $(x,l)$ 的两块密文交换。优点是解密第 $n-1$ 块时下标对齐，缺点是要分类讨论末块长度是否为满。
+ CTS-CS3：无论如何都把前后长度为 $(x,l)$ 的两块密文交换。这是最流行的方案。

在 CTS-CBC 中，如果发送方能自由选择 IV，那么当 $n=1$ 时可以把 IV 参与填充唯一的块。

### 磁盘加密 Disk Encryption

磁盘加密应用于于按扇区（sector）索引的存储介质，如硬盘。主要有三个需求：

1. 保证磁盘上数据的机密性。
2. 数据的读取和存储速度足够快。这意味着磁盘要按扇区划分（一般是 $512$ 字节），每块独立加解密。
3. 使用尽量少的辅助空间来加解密。这意味着流密码不适合磁盘加密，因为流密码内部要维持一个不能重复的状态机来保证安全性，导致每个扇区都有一个固定的空间开销；相反地，往往是 $16$ 或 $32$ 字节一组的分组密码很合适，磁盘加密主要在研究该用什么加密模式来将单个分组拓展到整个扇区。

使用 CBC 模式是很自然的想法，但每个扇区的第一组需要指定 IV。如果用可预测的 IV（比如扇区地址编号和时间戳），容易遭受 [水印攻击（Watermarking Attack）](https://en.wikipedia.org/wiki/Watermarking_attack)。**E**ncrypted **S**alt-**S**ector **I**nitialization **V**ector 是一个用来生成不可预测 IV 的方法，计算规则为 $IV(SN)=E_{hash(Key)}(SN)$，即用密钥的哈希值对扇区编号加密。

**X**or–**E**ncrypt–**X**or 是由 Rogaway 设计的可调整（tweakable）的磁盘加密模式。对于分组后的某个扇区：
$$
X=E_k(SN) \oplus \alpha^j(j=1,2,\dots) \\
C=E_k(P \oplus X) \oplus X
$$
其中 $SN$ 表示本扇区的编号，$\alpha$ 表示域内原根（在 $GF(2^{128})$ 中 $\alpha=2$），$j$ 表示 1-based 分组编号。

XTS（**X**EX-based **T**weaked-codebook mode with ciphertext **S**tealing）就是 XEX+CTS，用于处理扇区不是分组长度倍数的情况。AES-XTS 在 2007 年的 [IEEE P1619](https://en.wikipedia.org/wiki/IEEE_P1619) 被标准化，2010 年 NIST 的 SP 800-38E 额外要求每个扇区的 AES 组数不能超过 $2^{20}$。在标准 XTS 流程中，$\alpha^j$ 里的分组编号 $j$ 从 0 开始标号，且要求使用两个不同的密钥对 $SN$ 和块内容进行加密（一般做法是将一个长密钥拆成两部分，所以主密钥长度是 AES 分组长度的两倍）。[主流观点](https://csrc.nist.gov/csrc/media/projects/block-cipher-techniques/documents/bcm/comments/xts/xts_comments-liskov_minematsu.pdf)认为：即使使用一个密钥也不影响安全性，双密钥设计可能源于 XTS 标准对原始 XEX 论文的误读。

### 非对称加解密

RSA 的非对称加解密算法流程如下：

1.  Alice 生成 $(n=p \cdot q,d,e)$ 等 RSA 私钥信息，并给出公钥 $(e,n)$。
2.  Bob 把待加密消息编码成模 $n$ 域下的一个大数 $m$，根据公钥 $(e,n)$ 加密：$m'=m^e \pmod n$。
3.  Alice 用私钥 $(d,n)$ 解密： $m=(m')^d \pmod n$。

ElGamal 密码通常会利用 DH 算法生成一次性的共享密钥 $s$ 再进行加解密：

1.  Alice 生成循环群 $G$ 下的 $x=\{1,2,\dots,q-1\}$ 的私钥信息，并给出公钥 $(G,q,g,y=g^x)$。
2.  Bob 把待加密消息编码成循环群 $G$ 下的元素 $m$。取随机数 $r=\{1,2,\dots,q-1\}$ 计算 $s=y^r$，其中 $s$ 被称为共享密钥（shared secret）。计算 $(c_1=g^r,c_2=m \cdot s)$ 发送给 Alice。
3.  Alice 计算 $s=c_1^x$，由于 $c_1^x=(g^r)^x=y^r$，所以求出的值 $s$ 和 Bob 一致。
4.  Alice 解密 $m=c_2 \times s^{-1}$。注意 $s^{-1}=c_1^{q-x}$，因为 $s \cdot c_1^{q-x}=g^{xr} \cdot g^{(q-x)r}=(g^q)^r=e$。

ECC 无原生加解密算法，或使用 ECDH 共享对称密钥，或使用以下 ECC ElGamal 实现非对称加解密：

1.  双方约定好椭圆曲线、基点 $G$ 和模数 $P$。
2.  Alice 随机模域下的数 $a$ 作为私钥（$aG \ne \mathbf{0}$），并把公钥点 $aG$ 发送给 Bob。
3.  Bob 把待加密消息编码成椭圆曲线上的一个点 $M$，随机模域下的数 $k$，计算 $C_1=kG,C_2=M+k(aG)$，发送两个点 $(C_1,C_2)$ 给 Alice。
4.  Alice 还原消息 $M=C_2-aC_1$。

### 认证加密

带认证的加密算法（**A**uthenticated **E**ncryption）可以同时保证机密性和完整性，常见的是 GCM 和 CCM。

GCM（Golois/Counter Mode）在模多项式 $x^{128}+x^7+x^2+x+1$ 的二进制域上做一系列加法和乘法的运算。
$$
X_i=\sum_{j=1}^i S_j \cdot H^{i-j+1}=\begin{cases}
0  \quad & i=0  \\ \left(X_{i-1} \oplus S_i\right) \cdot H \quad & i = 1, \ldots, m + n + 1 \end{cases}
$$

很多 AE 算法支持携带关联数据（**A**ssociated **D**ata），比如在数据包的 header 里携带目标地址。Chacha20-Poly1305 是一种经典的 AEAD 认证加密算法。Poly1305 的输出是 16 字节，比 HMAC-SHA1 更省带宽。

### 安全性

位安全性（Bit Security）是用来衡量不同工具的安全性，近似表达破解所需时间（$2$ 的幂次位单位）。当对称算法和非对称算法的取成能抵御同等暴力破解的长度，后者的处理速度往往只有前者的几百分之一。

ECC 与 RSA 的安全性都依赖离散对数问题，但 ECC 能以更短的模长实现与 RSA 同等的强度。

| 对称密码（AWS） | 散列（SHA-2） | RSA尺寸 | ECC 尺寸 |
| :-------------: | :-----------: | :-----: | :------: |
|       112       |      224      |  2048   |   224    |
|       128       |      256      |  3072   |   256    |
|       192       |      384      |  7680   |   384    |
|       256       |      512      |  15360  |   521    |

在量子计算机模型下，Shor 算法能在多项式时间破解 RSA 和 ECC，后者并不比前者更有优势。由于 RSA 的规模普遍偏大，随着量子位的不断增长，现行规模下的 ECC 反而比 RSA 更早地会被量子计算机破解。

| 位安全性 | 破解 RSA 预估量子位 | 破解 ECC 预估量子位 |
| :------: | :-----------------: | :-----------------: |
|   112    |        4098         |        2042         |
|   128    |        6146         |        2330         |
|   192    |        15362        |        3484         |

## 密钥协商 **D**iffie-**H**ellman

**D**iffie-**H**ellman 密钥交换算法于 1976 年被提出，通信双方通过可公开的信息进行密钥的交换：

1. 双方约定大质数 $P$ 和它的原根 $g$。
2. Alice 随机 $a \in [1..P-2]$ 作为私钥，Bob 随机 $b \in [1..P-2]$ 作为私钥。
3. Alice 发送 $g^a \pmod P$ 给 Bob，Bob 发送 $g^b \pmod P$ 给 Alice，各自作为公钥。
4. 双方将对方的公钥乘方上自己的私钥，即可共享密钥 $g^{ab} \pmod P$。

DH 算法的安全性完全依赖数论中的离散对数问题，当前仍未找到多项式算法。

DH 密钥交换算法的无法保证前向安全性 （Forward Secrecy），即密钥泄露后会影响到过去的通信。

**D**iffie–**H**ellman **E**phemeral 做了改良，每次动态生成随机数，密钥泄露后不会影响到过去的通信。

**E**lliptic **C**urve **D**iffie–**H**ellman 密钥协商算法把 DH 算法转移至 ECC 模型上：

1. 任意一方确定好椭圆曲线、基点 $G$ 和素数域 $P$。
2. Alice 随机 $a$ 作为私钥（$aG \ne \mathbf{0}$），Bob 随机 $b$ 作为私钥（$bG \ne \mathbf{0}$）。
3. Alice 发送点 $aG \pmod P$ 给 Bob，Bob 发送 $bG \pmod P$ 给 Alice，各自作为公钥。
4. 双方将对方的公钥乘方上自己的私钥，即可共享密钥 $abG \pmod P$。

## 数字签名 Digital Signature

数字签名（Digital Signature）分为生成签名和验证签名两个环节，可以保证消息的完整性、认证和防否认性。

考虑到签名的运算量很大，数字签名通常只对待签消息的散列值进行签名。

### DSA 工具

数字签名算法（**D**igital **S**ignature **A**lgorithm）主要包括 RSA, ElGamal 和 ECDSA。

RSA 的公私钥签名算法流程如下：

+ Alice 生成 $(n=p \cdot q,d,e)$ 等 RSA 私钥信息，并给出公钥 $(e,n)$。
+ Alice 把待签散列值编码成模 $n$ 域下的大数 $h$，对 $h$ 计算签名 $s=h^d \pmod n$。
+ Bob 验签时判定 $s^e \pmod n$ 是否等于 $h$。

ElGamal 的公私钥签名很少使用，流程如下：

1.  Alice 生成循环群 $G$ 下的 $x=\{1,2,\dots,q-1\}$ 的私钥信息，并给出公钥 $(G,q,g,y=g^x)$。
2.  Bob 把待签散列值编码成 $G$ 下的元素 $h$。随机 $r=\{1,2,\dots,q-1\}$ 计算 $s_1=(g^r \mod p) \pmod q$，以及 $s_2=r^{-1}(h+xs_1) \pmod q$。如果 $s_1=0$ 或 $s_2=0$ 则重新随机 $r$，否则发送 $(s_1,s_2)$ 给 Alice。
3.  Alice 验签时判定 $g^{h/s_2 \pmod q}y^{s_1/s_2 \pmod q} \mod p \pmod q$ 是否等于 $s_1$。

ECC 的公私钥签名算法流程如下（以素数域为例）：

1. 双方约定好椭圆曲线、基点 $G$ 和模数 $P$。
2. Alice 随机模域下的数 $a$ 作为私钥（$aG \ne \mathbf{0}$），并把公钥点 $aG$ 发送给 Bob。
3. Alice 随机模域下的数 $r$（$rG \ne \mathbf{0}$），并计算 $s=r^{-1}(h+ax)$，其中 $h$ 是待签消息 $m$ 的散列值，$x$ 是 $rG$ 的横坐标。Alice 把 $(rG, s)$ 作为消息 $m$ 的数字签名发送给 Alice。
4. Bob 验签时判定 $(h/s)G+(x/s)(aG)=rG$ 是否对于 $(x,y)$ 两个维度都成立。

等式能成立的数学原理：
$$
\frac{h}{s}G+\frac{x}{s}(aG)=\frac{h+ax}{s}=\frac{r(h+ax)}{h+ax}=rG
$$
对于一组固定的私钥，ECDSA 的随机数 $r$ 的存在会使多次签名的值互不相同。

### 证书

数字签名的问题是，验证者很难确保自己手上的公钥确实对应发送者——所以要用证书机制去辅助。

公钥证书（Public-Key Certificate）用于证明公钥的可信。本质上就是认证机构对特定公钥进行数字签名。

## 附录：资料推荐

| 网站                                                         | 简介                             |
| ------------------------------------------------------------ | -------------------------------- |
| [写给开发人员的实用密码学](https://thiscute.world/posts/practical-cryptography-basics-1/) | 总共八个系列，内容如题           |
| [QUANTUM ATTACK RESOURCE ESTIMATE](https://research.kudelskisecurity.com/2021/08/24/quantum-attack-resource-estimate-using-shors-algorithm-to-break-rsa-vs-dh-dsa-vs-ecc/) | 量子计算威胁评估                 |
| [阮行止-格密码笔记](https://www.ruanx.net/lattice-1/)        | 总共五个系列，格密码相关知识介绍 |