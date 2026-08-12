---
categories: Math
cover: ../post_images/Review-of-Linear-Algebra.jpg
date: 2020-09-29 15:40:45
description: 记录了我对线性代数的系统性学习。
tags: [Digest, Linear Algebra]
title: 线性代数复习
updated: 2021-09-02
---

**线性代数** 广泛应用在计算机专业的各个领域。由于是大一学的课，现在对矩阵的反应已经大不如前。

本文章旨在温故线性代数，总结经典定理和证明，提供给自己和读者一个快速复健的平台。

## 线性空间

设 $V$ 是一个非空集合，$F$ 是一个域，在 $V$ 和 $F \times V$ 上定义 **加法** 和 **数乘** 两种运算。

+   $\langle V:+\rangle$ 是一个交换群（加法群），我们把其单位元记作 $\mathbf{0}$。
+   对于 $\forall \alpha,\beta \in V$, $\forall \lambda,\mu \in F$ 以及域 $F$ 的乘法单位元 $\mathbf{1}$，有：
    +   $\mathbf{1}\alpha=\alpha$
    +   $\lambda(\mu\alpha)=(\lambda\mu)\alpha$
    +   $(\lambda+\mu)\alpha=\lambda\alpha+\mu\beta$
    +   $\lambda(\alpha+\beta)=\lambda\alpha+\lambda\beta$

则称 $V$ 对于上述两种运算在域 $F$ 上构成一个 **线性空间**，记作 $V(F)$。

设 $W$ 是线性空间 $V(F)$ 的一个非空子集，如果 $W$ 对 $V$ 中的运算也构成 $F$ 的线性空间，则称 $W$ 为 $V$ 的 **线性子空间**。$W$ 是子空间的充分必要条件是 $W$ 对 $V(F)$ 的线性运算封闭。

设 $W$ 是线性空间 $V(F)$ 的一个非空子集，定义 $L(W)$ 为 $W$ 中所有有限子集在域 $F$ 上的一切线性组合所构成的集合，此过程被称为 $W$ 的 **线性扩张**。显然 $L(W)$ 是 $V$ 中包含 $W$ 的最小子空间。

设 $V(F)$ 是一个线性空间，$\pmb{\alpha}_1,\pmb{\alpha}_2,\dots,\pmb{\alpha}_m \in V$，如果存在不全为 $0$ 的 $\lambda_1,\lambda_2,\dots,\lambda_m \in F$，使得
$$
\lambda_1\pmb{\alpha}_1+\lambda_2\pmb{\alpha}_2+\dots+\lambda_m \pmb{\alpha}_m=\pmb{0}
$$

则称 $\pmb{\alpha}_1,\pmb{\alpha}_2,\dots,\pmb{\alpha}_m$ **线性相关**，否则称为 **线性无关**。

若向量组 $\{\pmb{\alpha}_1,\pmb{\alpha}_2,\dots,\pmb{\alpha}_n\}$ 线性无关，$\{\pmb{\beta},\pmb{\alpha}_1,\pmb{\alpha}_2,\dots,\pmb{\alpha}_n \}$ 线性相关，则 $\pmb{\beta}$ 可被 $\{\pmb{\alpha}_1,\dots,\pmb{\alpha}_n\}$ 唯一表示。

在线性空间 $V(F)$ 里，若 $V$ 的有限子集 $B=\{\pmb{\beta},\pmb{\alpha}_1,\pmb{\alpha}_2,\dots,\pmb{\alpha}_n \}$ 线性无关且 $L(B)=V$，则称 $B$ 是 $V$ 的一组 **基**，$|B|$ 是 $V$ 的 **维度**。如果 $B$ 是对于 $V(F)$ 的一个子集 $S$ 而言的，记 $|B|$ 为 $S$ 的 **秩**。

设 $W_1,W_2$ 是线性空间 $V(F)$ 的两个子空间，定义子空间的 **交** 与 **和** 为：
$$
W_1 \cap W_2 = \{\pmb{\alpha}|\pmb{\alpha} \in W_1 \land \pmb{\alpha} \in W_2\}\\
W_1+W_2=\{\pmb{\alpha}|\pmb{\alpha}=\pmb{\alpha}_1+\pmb{\alpha}_2,\pmb{\alpha}_1 \in W_1 , \pmb{\alpha}_2 \in W_2\}
$$
注意子空间的 交 与 和 依然是子空间。此外，子空间交与和还满足 **维度公式**：
$$
\dim W_1+\dim W_2=\dim(W_1+W_2)+\dim(W_1 \cap W_2)
$$
若 $W_1 \cap W_2=\{\pmb{0}\}$，则 $W_1+W_2$ 也被称为 $W_1$ 和 $W_2$ 的 **直和**，记为 $W_1 \oplus W_2$。

已知 $B=\{\pmb{\alpha}_1,\pmb{\alpha}_2,\dots,\pmb{\alpha}_n\}$ 是 $n$ 维欧式空间的一组基，则可以用 **Schmidt 正交化** 构出一组 **单位正交基**。

## 线性映射

从线性空间 $V_1(F)$ 到 $V_2(F)$ 的一个 **映射** $\sigma$ 是 **线性** 的，如果对于 $\forall \pmb{\alpha},\pmb{\beta} \in V_1$ 和 $\forall \lambda,\mu \in F$ 都有：
$$
\sigma(\lambda \pmb{\alpha}+\mu\pmb{\beta})=\lambda\sigma(\pmb{\alpha})+\mu\sigma(\pmb{\beta})
$$
设 $\sigma$ 是线性空间 $V_1(F)$ 到 $V_2(F)$ 的线性映射，则定义：

+   $V_1$ 的所有元素在 $\sigma$ 下的像所组成的集合被称为 $\sigma$ 的 **像**，记为 $\sigma(V_1)$ 或 $Im \sigma$。
+   $V_2$ 的零元在 $\sigma$ 的原像集合被称为 $\sigma$ 的 **核**，记为 $\sigma^{-1}(\pmb{0}_2)$ 或 $Ker \sigma$。

定理：线性映射 $\sigma:V_1 \to V_2$ 是单射 $\Leftrightarrow$ $\sigma^{-1}(\pmb{0}_2)=\{\pmb{0}_1\}$

后推前：假设存在 $\sigma(\pmb{\alpha}_1)=\sigma(\pmb{\alpha}_2)$，则 $\sigma(\pmb{\alpha}_1)-\sigma(\pmb{\alpha_2})=\sigma(\pmb{\alpha}_1-\pmb{\alpha}_2)=\pmb{0}$，根据条件得 $\pmb{\alpha}_1=\pmb{\alpha}_2$

把线性空间 $V_1(F)$ 到 $V_2(F)$ 的所有线性映射组成的集合记作 $L(V_1,V_2)$。额外定义 $L(V_1,V_2)$ 上的加法为 $(\sigma+\tau)(\pmb{\alpha})=\sigma(\pmb{\alpha})+\tau(\pmb{\alpha}),\pmb{\alpha} \in V_1$，数乘为 $(\lambda\sigma)(\pmb{\alpha})=\lambda(\sigma(\pmb{\alpha})),\pmb{\alpha} \in V_1$，则 $L(V_1,V_2)$ **也是线性空间**。

设 $\sigma \in L(V_1,V_2)$，$B=\{\pmb{\alpha}_1,\pmb{\alpha}_2,\dots,\pmb{\alpha}_n\}$ 是 $V_1$ 的基，$V_1$ 中任一向量 $\xi=x_1\pmb{\alpha}_1+x_2\pmb{\alpha}_2+,\dots,+x_n\pmb{\alpha}_n$ 在 $\sigma$ 下的像可表示为 $\sigma(\xi)=x_1\sigma(\pmb{\alpha}_1)+x_2\sigma(\pmb{\alpha}_2)+,\dots,+x_n\sigma(\pmb{\alpha}_n)$。即 **$\sigma$ 的值域是基 $B$ 在 $\sigma$ 下的像 $\sigma(B)$ 的线性扩张**。定义 **线性变换 $\sigma$ 的秩** 为 $\sigma(V_1)$ 的维数，即 $r(\sigma)=\dim \sigma(V_1)$。

对于有限维线性空间 $V_1,V_2$，若 $\dim(V_1)=n$，则线性映射 $\sigma$ 的像和核满足如下的维数公式：
$$
r(\sigma)+\dim(Ker\sigma)=n
$$
证明：构造 $Ker\sigma$ 的一组基 $B_{k}=\{\pmb{\alpha}_1,\pmb{\alpha}_2,\dots,\pmb{\alpha}_k\}$，将其扩充成 $V_1$ 的基 $\{\pmb{\alpha}_1,\dots,\pmb{\alpha}_k,\pmb{\alpha}_{k+1},\dots,\pmb{\alpha}_n\}$ ，则 $r(\sigma)=\dim \sigma(V_1)=\dim L(\sigma(\pmb{\alpha}_{k+1}),\dots,\sigma(\pmb{\alpha_n}))$，只需再证 $\sigma(\pmb{\alpha}_{k+1}),\dots,\sigma(\pmb{\alpha_n})$ 线性无关。假设存在一组系数使其相加 $=0$，那么它就能被 $B_k$ 线性表示；但已知 $B_1$ 是线性无关的，则系数只能全为 $0$。

推论：若 $V_1$ 和 $V_2$ 都是 $n$ 维线性空间，线性映射 $\sigma \in L(V_1,V_2)$ ，则 $r(\sigma)=n \Leftrightarrow \sigma$ 是单射 $\Leftrightarrow \sigma$ 是满射

## 矩阵的基本变换和性质

设 $A \in M_F$，如果存在 $B \in M_F$ 使得 $BA=AB=E$，则称矩阵 $A$ 是可逆的，并把 $B$ 叫做 $A$ 的 **逆矩阵**。

若方程 $A\mathbf{X}=\mathbf{b}$ 对于任意的 $\mathbf{b}$ 都有唯一解，则 $A$ 是可逆矩阵，且解 $\mathbf{X}=A^{-1}\mathbf{b}$。

域 $F$ 上全体 $n$ 阶矩阵 $M_n(F)$ 关于矩阵乘法构成 **含幺半群**，但是全体 $n$ 阶可逆矩阵关于矩阵乘法构成 **群**。

若 $A^T=A$，则称方阵 $A$ 为 **对称矩阵**；若 $A^T=-A$，则称方阵 $A$ 为 **反对称矩阵**。

将倍加、倍乘、对换行称为矩阵的三大 **初等变换**。从单位矩阵 $E$ 经过一次初等变换的矩阵称为 **初等矩阵**。

定理：任何一个可逆矩阵 $A$ 可以表示成若干个初等矩阵 $P_1,P_2,\dots,P_k$ 的乘积。

如果 $A$ 经过初等变换能变成 $B$，则称 $A$ **相抵于** $B$，记为 $A \simeq B$。相抵关系是一个等价关系。

矩阵的行秩和列秩是相等的，统称为矩阵的 **秩**。初等行（列）变换不改变矩阵的秩。可逆矩阵 **满秩**。
$$
r(A+B)\le r(A)+r(B) \\
r(AB) \le \min(r(A),r(B))
$$

## 方阵的行列式

设 $A,B$ 是 $n$ 阶方阵，则 $|A^T|=|A|$，$|AB|=|A||B|$。

在 $n$ 阶行列式 $D=|a_{i,j}|_{n \times n}$ 中，去掉元素 $a_{i,j}$ 所在的第 $i$ 行和第 $j$ 列的所有元素而得到的 $n-1$ 阶行列式称为元素 $a_{i,j}$ 的 **余子式**，记作 $M_{i,j}$。并把 $A_{i,j}=(-1)^{i+j}M_{i,j}$ 称为元素 $a_{i,j}$ 的 **代数余子式**。

设 $A$ 是 $n$ 阶可逆矩阵，构造 **伴随矩阵** $A^{\ast}$ 为 $A$ 的代数余子式矩阵的转置，即：
$$
A^{\ast}=\begin{bmatrix} A_{11} & A_{21} & \dots & A_{n1} \\ A_{12} & A_{22} & \dots & A_{n2} \\ \dots & \dots & \dots & \dots \\ A_{1n} & A_{2n} & \dots & A_{nn} \end{bmatrix}
$$
那么有性质：$AA^{\ast}=|A|E$，即 $\frac{1}{|A|}A^{\ast}$ 是 $A$ 的逆矩阵。

取 $A$ 的任意 $k$ 行和任意 $k$ 列的交点构成的方阵的行列式称为 $A$ 的 **$k$ 阶子式**。如果取得正好是前 $k$ 行和前 $k$ 列，则称为 $A$ 的 **$k$ 阶主子式**。$A$ 的非零子式的最高阶数称为 $A$ 的 **行列式秩**。

定理：$r(A)=k$ 的充要条件是 $A$ 的行列式秩等于 $k$。

**Cramer 法则**：若线性方程组 $A\mathbf{X}=\mathbf{b}$ 满足 $D=|A| \ne 0$，则方程组有唯一解 $x_j=\frac{D_j}{D}$。

推论：齐次线性方程组 $A\mathbf{X}=\mathbf{0}$ 有非零解的充分必要条件是 $|A|=0$。

## 正交矩阵和相似矩阵

对于欧式空间 $V(\mathbf{R})$ 的一个线性变换 $\sigma$ ，若 $\forall \pmb{\alpha,\beta} \in V,(\sigma(\pmb{\alpha}),\sigma(\pmb{\beta}))=(\pmb{\alpha},\pmb{\beta})$（即内积保持不变），则称 $\pmb{\alpha}$是 **正交变换**，对应的矩阵叫做 **正交矩阵**。$\pmb{\alpha}$ 是正交变换的充要条件是：$\forall \pmb{\alpha} \in V,|\sigma(\pmb{\alpha})|=|\pmb{\alpha}|$。

矩阵 $A$ 是正交矩阵，当且仅当 $A^TA=E$。注意此时 $|A|=\pm 1$。

如果对于 $A,B \in M_n(F)$，存在可逆矩阵 $C \in M_n(F)$，使得 $C^{-1}AC=B$，则称 $A$ **相似** 于 $B$，记为 $A \sim B$。容易证明，矩阵的相似关系在集合 $M_n(F)$ 上构成等价关系。

**相似矩阵** 其实是同一个线性变换 $\sigma$ 在不同基下得到的矩阵。

若 $A \sim B$，则 $f(A) \sim f(B)$，其中 $f(X)=a_mX^m+a_{m-1}X^{m-1}+\dots+a_0E$。

## 特征值和特征向量

设矩阵 $A \in M_n(F)$，如果存在数 $\lambda_0 \in F$ 和非零向量 $X \in V$，使得 $AX=\lambda_0X$，则称数 $\lambda_0$ 为 $A$ 的一个 **特征值**，$X$ 为 $A$ 属于 $\lambda_0$ 的 **特征向量**。称 $f(\lambda)=|\lambda E-A|$ 为 $A$ 的 **特征多项式**。

根据定义，特征向量 $X$ 的几何意义是：经过 $A$ 的变换后方向不变的一组向量。

特征多项式 $f(\lambda)=\lambda^n+b_1\lambda^{n-1}+\dots+b_{n-1}\lambda^1+b_n$，其中 $b_k=(-1)^kS_k$，$S_k$ 是全体 $k$ 阶主子式之和。

推论：若矩阵 $A$ 的 $n$ 个特征值为 $\lambda_1,\lambda_2,\dots,\lambda_n$，则：
$$
\sum \limits_{i=1}^n \lambda_i=\sum \limits_{i=1}^nA_{i,i}  \quad  \quad \prod \limits \lambda_i=|A|
$$
定理：若矩阵 $A$ 和 $B$ 相似，则他们的特征多项式相等，即 $|\lambda E-A|=|\lambda E-B|$。

证明：若 $A \sim B$，即存在可逆矩阵 $P$，使得 $P^{-1}AP=B$，于是：
$$
|\lambda E-B|=|\lambda E-P^{-1}AP|=|P^{-1}(\lambda E-A)P|=|P^{-1}||\lambda E-A||P|=|\lambda E-A|
$$
说明：线性变换 $\sigma$ 在不同基下对应的矩阵是相似矩阵，所以他们的特征多项式均相同。说明不同基下的特征多项式（特征值）是 $\sigma$ 的 **不变量**。他们也可以统称为线性变换 $\sigma$ 的特征多项式。

设 $V$ 是域 $F$ 上的线性空间，$\lambda_0$ 是其一个特征值，称以下子空间为 $\sigma$ 关于 $\lambda_0$ 的 **特征子空间** $V_{\lambda_0}$：
$$
V_{\lambda_0}=\{\xi | \sigma(\xi)=\lambda_0\xi,\xi \in V\}
$$
定理：设 $\lambda_j,j \in[1..m]$ 是 $n$ 维线性空间 $V(F)$ 的线性变换 $\sigma$ 的互不相同的特征值，$V_{\lambda_j}$ 是相应的特征子空间，则 $m$ 个特征子空间的和是直和，即 $\dim(V_{\lambda_1}+V_{\lambda_2}+\dots+V_{\lambda_m})=n$。

说明：可以想象投影映射 $\sigma_p$：$\pmb{R}^3$ 中的向量关于某个二维平面 $W$ 的投影。 $\sigma_p$ 的特征值是 $\lambda_1=0$ 和 $\lambda_2=1$（重根），对应的特征子空间分别是 $W^{\perp},W$，其中 $\dim V_{\lambda_1}=1,\dim V_{\lambda_2}=2$。

**Caylay-Hamilton Theorem**：$f(\lambda)=\lambda^n+b_1\lambda^{n-1}+\dots+b_{n-1}\lambda^1+b_n$ 是方阵 $A$ 的特征多项式，则：
$$
f(A)=A^n+b_1A^{n-1}+\dots+b_{n-1}A^1+b_n=0
$$
证明可参考 [shb 的博客](https://heyshb.github.io/2020/04/04/Algebra/)。

## 可对角化

如果线性变换 $\sigma$ 在某个基下对应的矩阵 $A$ 为对角阵，则称 $\sigma$ 为 **可对角化** 的线性变换。同样，与对角阵相似的矩阵 $A$ 称为可对角化矩阵。与 $A$ 相似的对角矩阵 $\Lambda$ 称为 **相似标准形**。

定理：矩阵 $A \in M_n(F)$ 可对角化的充分必要条件为 $A$ 有 $n$ 个线性无关的特征向量。

证明：设 $A \sim \Lambda=\mathbb{diag}(\lambda_1,\lambda_2,\dots,\lambda_n)$，则存在可逆矩阵 $P$ 使 $AP=P\Lambda$。若 $P=(\pmb{X}_1,\dots,\pmb{X}_n)$ 则：
$$
A(\pmb{X}_1,\dots,\pmb{X}_n)=(\pmb{X}_1,\dots,\pmb{X}_n)
\begin{bmatrix} \lambda_1 \quad \quad \quad \\ \quad \lambda_2 \quad \quad \\ \quad \quad \dots \quad \\ \quad \quad \quad \lambda_n\end{bmatrix}
$$
容易发现 $A\pmb{X}_j=\lambda_j\pmb{X_j}$，即 $(\pmb{X}_1,\dots,\pmb{X}_n)$ 是 $A$ 的 $n$ 个线性无关的特征向量。反之亦然。

对于一个 $n$ 阶可对角化矩阵 $A$，我们一般用如下的步骤求其变换矩阵：

1.  求出 $A$ 的所有不同特征值 $\lambda_1,\lambda_2,\dots,\lambda_m$，他们的重数分别是 $r_1,r_2,\dots,r_m$，且 $\sum r_i=n$。
2.  将 $m$ 个特征子空间的基向量依次排成 $n$ 阶矩阵构成 $P$，即 $P=(\pmb{X}_{1,1},\dots,\pmb{X}_{1,r_1},\dots,\pmb{X}_{m,1},\pmb{X}_{m,r_m})$

则有 $P^{-1}AP=\mathbb{\lambda_1,\dots,\lambda_1,\dots,\lambda_m,\dots,\lambda_m}$。

## 实对称矩阵

如果 $n$ 阶矩阵 $A$ 满足 $A_{i,j}$ 都是实数且 $A_{i,j}=A_{j,i}$，则称 $A$ 是 **实对称矩阵**。

二次曲线 $f(x_1,x_2)=a_{1,1}x_1^2+2a_{1,2}x_1x_2+a_{2,2}x^2_2$ 可以写成 $\pmb{X}^TA\pmb{X}$ 的形式，其中 $A$ 是有关系数的实对称矩阵，$\pmb{X}=(x_1,x_2)^T$。

定理：实对称矩阵的特征值都是实数。

证明：设 $\lambda$ 是 $A$ 的任一个特征值，只需证明 $\lambda=\overline \lambda$。根据 $AX=\lambda X$ 和 $(\overline A)^T=A$ 就有
$$
\lambda (\overline X)^TX=(\overline X)^TAX=(\overline X)^T(\overline A)^TX=(\overline {AX})^TX=\overline \lambda(\overline X)^TX
$$
定理：实对称矩阵里属于不同特征值的特征向量相互正交。

证明：设 $\lambda_1,\lambda_2$ 是两个特征值，$X_1$ 和 $X_2$ 是对应的特征向量（实向量）。那么有：
$$
\lambda_1(X_1,X_2)=(AX_1,X_2)=(AX_1)^TX_2=X_1^TA^TX_2=X_1^TAX_2=(X_1,AX_2)=\lambda_2(X_1,X_2)
$$
由于 $\lambda_1 \ne \lambda_2$，则 $(X_1,X_2)=0$。

定理：若矩阵 $A$ 是 $n$ 阶实对称矩阵，则存在 $n$ 阶正交矩阵 $Q$，使得 $Q^{-1}AQ=\mathbb{diag}(\lambda_1,\lambda_2,\dots,\lambda_n)$。

具体求 $Q$ 的步骤是：取 $A$ 不同特征值下的单位正交基，按顺序排成 $Q$。

**主轴定理**：对于任一个 $n$ 元二次型 $f(x_1,x_2,\dots,x_n)=\pmb{X}^TA\pmb{X}$，都存在正交变换 $\pmb{X}=Q\pmb{Y}$，使得：
$$
\pmb{X}^TA\pmb{X}=\pmb{Y}^T(Q^TAQ)\pmb{Y}=\lambda_1y_1^2+\dots+\lambda_ny_n^2
$$

## 矩阵树定理 Kirchhoff's **Matrix**-Tree Theorem

定义无向图 $G$ 的关联矩阵（incidence matrix）$B_{n,m}$ 为：
$$
B_{i,j}=\begin{cases} 
1 & \quad i = st_{e_j} \\
-1 & \quad i = ed_{e_j}\\
0 & \quad otherwise
\end{cases}
$$
定义无向图 $G$ 的拉普拉斯矩阵（Laplacian matrix）或基尔霍夫矩阵（Kirchhoff matrix）为：$Q=BB^T$ 。

注意到 $Q$ 也满足公式 $Q=D(G)-Adj(G)$ ，即无向图的拉普拉斯矩阵是度数矩阵和邻接矩阵的差。

定理1：拉普拉斯矩阵的所有代数余子式均相等。

证明：为了证明上述定理，只需证明对于某一行 $i$，$A_{i,j}=A_{i,k}$，即 $(-1)^{i+j}M_{i,j}=(-1)^{i+k}M_{i,k}$。考察 $M_{i,j}$ 对应的列向量，其中并不包含原矩阵的第 $j$ 个列向量 $\overrightarrow j$。现在，把所有列都加到第 $k$ 个列向量 $\overrightarrow k$ 上。注意到，拉普拉斯矩阵的每一行和每一列的和都是 $0$，所以 $\overrightarrow k=-\overrightarrow j$。现在我们再把新的子矩阵的 $\overrightarrow k$ 不断地向 $\overrightarrow j$ 处调换，一共调换 $|j-k|-1$ 次。所以 $M_{i,k}=(-1)^{|j-k|}M_{i,j}$，即 $A_{i,j}=A_{i,k}$。

定理2：拉普拉斯矩阵的行列式为 $0$。

证明：高斯消元过程不会改变每行和都是 $0$ 的性质，所以消完后 $A_{n,n}=0$。我们也可以直接展开第一行证明。

**矩阵树定理**：无向图 $G$ 的拉普拉斯矩阵 $Q$ 去掉任意一行任意一列的行列式 $|Q'|$ 即为 $G$ 的生成树个数，即：
$$
t(G)=\frac{1}{n}\lambda_1\lambda_2\dots\lambda_{n-1},\quad \lambda_n=0
$$
推广1：无向图还能带边权，$Adj_{i,j}=k$ 表示 $i$ 到 $j$ 之间存在 $k$ 条边，依然能求得正确的生成树个数。

推广2：如果给出一个有向图和一个点 $k$，删掉根所在的行列可正确求出以 $k$ 为根的外向树个数。

推广3：矩阵树定理还能求构成 $k$ 个连通块的森林的方案数。对于某一种方案 $F$，设 $k$ 个点集为 $V_1,V_2\dots,V_k$，定义权值为 $w(F)=|V(F_1)|\times|V(F_2)|\times\dots|V(F_n)|$。那么我们有：
$$
\sum \limits_{F} w(F)=q_k \\
q_k=\sum \limits_{i_1,i_2,\dots,i_{n-k} \subseteq \{1 \dots, n-1\}}\lambda_{i_1}\lambda_{i_2}\dots\lambda_{i_{n-k}}
$$
原来树的方案该推论的一个特例：$k=1,q_k=\lambda_1\dots\lambda_{n-1}$。

## 矩阵范数

我们知道，向量范数的定义是：$||\pmb{x}||_k=\sqrt[k]{\sum |x_i|^k}$。

矩阵范数没有公认的统一定义，但是它必须满足以下这些规则：
$$
||A||\ge 0, \quad ||\pmb{0}_{n,m}||=0, \quad ||\alpha A||=\alpha ||A||, \quad ||A+B|| \le ||A||+||B||
$$
有些教科书认为矩阵范数是定义在方阵上的，还需满足相容性：
$$
||AB|| \le ||A|| \cdot ||B||
$$
我们可以从向量范数去推导一种可能的矩阵范数，它被称为 **诱导范数**。
$$
||A||_k=\sup\{||Ax||_k:x \in R^n,||x||_k=1\}
$$
对于特殊的 $k$，矩阵范数还有以下的一些求法：
$$
||A||_1=\max \limits_{1 \le j \le n} \sum \limits_{i=1}^m |a_{i,j}| \\
||A||_2=\max|\lambda_i|,\quad ||A||_2=\max\{x^TAx: ||x||=1\} \\
||A||_{\infty}=\max \limits_{1 \le i \le m} \sum \limits_{j=1}^n |a_{i,j}|
$$