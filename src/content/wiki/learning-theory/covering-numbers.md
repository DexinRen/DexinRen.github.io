---
title: "Covering Numbers: From Finite to Infinite Classes"
area: "Statistical Learning Theory"
areaSlug: "learning-theory"
tags: ["learning_theory","complexity_measures"]
order: 3
sources: ["Course/CS/CSCI 678/Lecture 3 - Infinite Class Regression.md"]
credits: [{"text":"Based on Prof. Haipeng Luo's CSCI 678 (Theoretical Machine Learning, USC, Fall 2026). Thank you to Prof. Luo for an excellent course. These notes contain my own understanding and the bridging steps I added to make the lectures easier to follow; any mistakes are mine.","courseLink":"https://haipeng-luo.net/courses/CSCI678/2026_fall/schedule.html","lectureLinks":[{"label":"Lecture 3 (PDF)","url":"https://haipeng-luo.net/courses/CSCI678/2026_fall/lectures/lecture3.pdf"}]}]
---

### Main Task
Fix the regression setting: input space $X$, output space $Y=[-1,+1]$, function class $F\subseteq[-1,+1]^X$, and $z_t=(x_t,y_t)\overset{i.i.d.}{\sim}\mathbb P$, $t=1,\ldots,n$.

From Lecture 2,

$$
\left.
\begin{array}{lll}
V^{i.i.d.}(F,n)
&\leq \sup_{\mathbb P}\mathbb E\left[\sup_{f\in F}(L(f)-\hat L_n(f))\right]
&\text{ERM}\\
&\leq 2\sup_{\mathbb P}R^{i.i.d.}(\ell(F))
&\text{symmetrization}\\
&\leq 2G\sup_{\mathbb P}R^{i.i.d.}(F)
&\text{erase loss}
\end{array}
\right.
$$

So the remaining task is still **to upper-bound $R^{i.i.d.}(F)$**.

For binary classification, the projection

$$
F\big|_{x_{1:n}}
=
\{(f(x_1),\ldots,f(x_n)):f\in F\}
\subseteq\{-1,+1\}^n
$$

is finite, so we can count exact prediction vectors. For regression,

$$
F\big|_{x_{1:n}}\subseteq[-1,+1]^n
$$

can remain infinite. Exact counting therefore breaks.

The lecture develops progressively better replacements for exact counting:

$$
\left.
\begin{array}{l}
\text{infinite real-valued class}\\
\to\text{pointwise finite approximation}\\
\to\text{projection-only approximation}\\
\to\text{multi-scale approximation}\\
\to\text{combinatorial parameter controlling the cover}.
\end{array}
\right.
$$

## 1. Pointwise Cover: Replace an Infinite Class by Finite Representatives
The finite-class Rademacher bound is already available. The immediate bottleneck is only that $F$ is infinite, so first try to approximate every function by one element of a finite class.

For $\alpha\geq0$, a finite $H\subseteq[-1,+1]^X$ is a **pointwise $\alpha$-cover** of $F$ if

$$
\forall f\in F,\ \exists h\in H
\quad\text{s.t.}\quad
\sup_{x\in X}|f(x)-h(x)|\leq\alpha.
$$

Pointwise covering number:

$$
N(F,\alpha)
=
\min\{|H|:H\text{ is a pointwise }\alpha\text{-cover of }F\}.
$$

As $\alpha$ increases, approximation becomes easier, so $N(F,\alpha)$ is non-increasing.

For each $f\in F$, choose a representative $h_f\in H$. Then

$$
\left.
\begin{array}{lll}
\hat R^{i.i.d.}(F;x_{1:n})
&=\dfrac1n\mathbb E_\epsilon\left[\sup_f\sum_t\epsilon_tf(x_t)\right]\\
&=\dfrac1n\mathbb E_\epsilon\left[\sup_f\sum_t\epsilon_t(f(x_t)-h_f(x_t)+h_f(x_t))\right]\\
&=\dfrac1n\mathbb E_\epsilon\left[\sup_f\sum_t\epsilon_t(f(x_t)-h_f(x_t))\right]+\dfrac1n\mathbb E_\epsilon\left[\sup_f\sum_t\epsilon_th_f(x_t))\right]\\
&\leq
\underbrace{\dfrac1n\sup_f\sum_t|f(x_t)-h_f(x_t)|}_{\leq\alpha}
+
\hat R^{i.i.d.}(H;x_{1:n})\\
&\leq
\alpha+\sqrt{\dfrac{2\ln|H|}{n}},\ \text{Massart}
\end{array}
\right.
$$

Thus

$$
\boxed{
R^{i.i.d.}(F)
\leq
\min_{\alpha\geq0}
\left[
\alpha+
\sqrt{\frac{2\ln N(F,\alpha)}{n}}
\right]
}.
$$

We have reduced the problem

$$
\boxed{
\text{bound }R(F)
\quad\to\quad
\text{bound }N(F,\alpha).
}
$$

The next question is therefore concrete: **for an actual infinite regression class, can $N(F,\alpha)$ be made finite and small enough to vanish with $n$?**

## 2. Bounded Linear Functions: How Large Is the Pointwise Cover?
Use the linear class as the first test case. Let $p,q\in[1,\infty]$ satisfy $\frac1p+\frac1q=1$ and define

$$
B_r^d:=\{u\in\mathbb R^d:\|u\|_r\leq1\},
\qquad
X=B_q^d,
$$

$$
F_{\mathrm{lin}}
=
\{f_\theta(x)=\langle\theta,x\rangle:\theta\in B_p^d\}.
$$

The dual exponents are chosen so the class matches the bounded-regression setting:

$$
|f_\theta(x)|
=
|\langle\theta,x\rangle|
\leq
\|\theta\|_p\|x\|_q
\leq1
\qquad\text{Hölder}.
$$

So $F_{\mathrm{lin}}\subseteq[-1,+1]^X$.

### 2.1 Cube Case: $p=\infty,\ q=1$
Here $B_\infty^d=[-1,+1]^d$. Since the parameter set is literally a cube, discretize each coordinate at resolution $2\alpha$. This gives about $(1/\alpha)^d$ representatives.

If $\|\theta-\theta'\|_\infty\leq\alpha$, then for every $x\in B_1^d$,

$$
|f_\theta(x)-f_{\theta'}(x)|
=
|\langle\theta-\theta',x\rangle|
\leq
\|\theta-\theta'\|_\infty\|x\|_1
\leq\alpha.
$$

Hence

$$
N(F_{\mathrm{lin}},\alpha)
\lesssim
\left(\frac1\alpha\right)^d.
$$

Plugging this into the pointwise-cover theorem,

$$
R^{i.i.d.}(F_{\mathrm{lin}})
\lesssim
\min_\alpha
\left[
\alpha+
\sqrt{\frac{d\ln(1/\alpha)}{n}}
\right].
$$

The lecture chooses $\alpha=\sqrt{d/n}$ for $n\gtrsim d$. Then

$$
\ln\frac1\alpha
=
\frac12\ln\frac nd,
$$

so, up to constants and the lower-order first term,

$$
\boxed{
R^{i.i.d.}(F_{\mathrm{lin}})
=
O\left(
\sqrt{\frac{d\ln(n/d)}{n}}
\right)
}.
$$

Thus the linear class is learnable.

### 2.2 General $p$: The Cube Argument Works, but Uses the Wrong Geometry
We still need a cover for a general $B_p^d$. A first attempt is to reuse the same $\ell_\infty$ cube discretization because $B_p^d\subseteq B_\infty^d$.

If the cube resolution gives $\|\theta-\theta'\|_\infty\leq\eta$, then

$$
\|\theta-\theta'\|_p
\leq
 d^{1/p}\|\theta-\theta'\|_\infty
\leq
 d^{1/p}\eta,
$$

so

$$
|f_\theta(x)-f_{\theta'}(x)|
\leq
\|\theta-\theta'\|_p\|x\|_q
\leq
 d^{1/p}\eta.
$$

To guarantee pointwise error $\alpha$, we must take $\eta=\alpha/d^{1/p}$. Therefore the inherited cube cover gives

$$
N(F_{\mathrm{lin}},\alpha)
\lesssim
\left(
\frac{d^{1/p}}{\alpha}
\right)^d.
$$

This is valid, so learnability is already established for every $p$. But the factor $d^{1/p}$ is introduced only because we are approximating a $p$-norm ball by $\ell_\infty$ cubes.

The actual remaining task is sharper: **bound a cover directly in the $p$-norm, preferably without explicitly constructing all cover points.**

### 2.3 Packing + Volume: Bound the $p$-Norm Cover Without Constructing It
Fix $0<\alpha\leq1$. Let $S\subseteq B_p^d$ be a maximal $\alpha$-packing:

$$
\|\theta-\theta'\|_p>\alpha,
\qquad
\forall\theta\neq\theta'\in S.
$$

A maximal packing is automatically an $\alpha$-cover. Otherwise, if some $\theta\in B_p^d$ satisfied $\|\theta-\theta'\|_p>\alpha$ for every $\theta'\in S$, we could add it to $S$, contradicting maximality.

Therefore, for every $\theta\in B_p^d$, some $\theta'\in S$ satisfies $\|\theta-\theta'\|_p\leq\alpha$, and then

$$
|f_\theta(x)-f_{\theta'}(x)|
\leq
\|\theta-\theta'\|_p\|x\|_q
\leq\alpha.
$$

So $\{f_{\theta'}:\theta'\in S\}$ is a pointwise $\alpha$-cover. It remains only to bound $|S|$.

Put a radius-$\alpha/2$ $p$-ball around every point of $S$. Packing implies these small balls are disjoint, and because every center lies in $B_p^d$, all of them lie inside $(1+\alpha/2)B_p^d$. Hence

$$
\left.
\begin{array}{lll}
|S|\operatorname{Vol}\left(\dfrac\alpha2 B_p^d\right)
&\leq
\operatorname{Vol}\left(\left(1+\dfrac\alpha2\right)B_p^d\right)\\
|S|\left(\dfrac\alpha2\right)^d
&\leq
\left(1+\dfrac\alpha2\right)^d
&\operatorname{Vol}(rB_p^d)=r^d\operatorname{Vol}(B_p^d)\\
|S|
&\leq
\left(1+\dfrac2\alpha\right)^d.
\end{array}
\right.
$$

Thus

$$
\boxed{
N(F_{\mathrm{lin}},\alpha)
\leq
\left(1+\frac2\alpha\right)^d
}.
$$

The packing argument removes the artificial $d^{1/p}$ distortion and again gives

$$
R^{i.i.d.}(F_{\mathrm{lin}})
=
O\left(
\sqrt{\frac{d\ln(n/d)}{n}}
\right)
$$

up to constants in the one-scale analysis.

So pointwise covering works well for this parametric class. The next issue is more fundamental: **is finite pointwise covering actually necessary for learnability?**

## 3. Pointwise Cover Is Too Strict
To test whether pointwise covering is the right general complexity measure, consider the nonparametric monotone class

$$
F_{\mathrm{mono}}
=
\{f:\mathbb R\to[-1,+1]:f\text{ non-decreasing}\}.
$$

For each integer $m$, let $f_m(x)=\operatorname{sign}(x-m)$. For $m<m'$ and $x=(m+m')/2$,

$$
f_m(x)=+1,
\qquad
f_{m'}(x)=-1,
$$

so $|f_m(x)-f_{m'}(x)|=2$. Therefore one representative cannot pointwise-$\alpha$ cover two distinct $f_m$'s for any $\alpha<1$, and

$$
\boxed{
N(F_{\mathrm{mono}},\alpha)=\infty,
\qquad \alpha<1.
}
$$

If pointwise covering were the correct notion, this would make the Rademacher bound useless. But monotone regression is still learnable.

The defect is now clear: pointwise covering demands approximation on **every $x\in X$**, while empirical Rademacher complexity only sees

$$
f(x_1),\ldots,f(x_n).
$$

So the next object should approximate only the behavior visible to the sample.

## 4. Covering the Projection: Approximate Only What Rademacher Complexity Sees
Fix observed inputs $x_{1:n}$ and cover only

$$
F\big|_{x_{1:n}}
=
\{(f(x_1),\ldots,f(x_n)):f\in F\}
\subseteq[-1,+1]^n.
$$

For $r\in[1,\infty)$, define the normalized projection distance

$$
d_r(u,v)
=
\left(
\frac1n\sum_{t=1}^n|u_t-v_t|^r
\right)^{1/r},
$$

and $d_\infty(u,v)=\max_t|u_t-v_t|$.

A finite $V\subseteq[-1,+1]^n$ is an $\alpha$-cover of $F|_{x_{1:n}}$ under $d_r$ if every $u\in F|_{x_{1:n}}$ has some $v\in V$ with $d_r(u,v)\leq\alpha$. Let $N_r(F|_{x_{1:n}},\alpha)$ be the smallest such size.

Because these normalized norms are power means,

$$
d_1(u,v)
\leq
d_2(u,v)
\leq\cdots\leq
d_\infty(u,v),
$$

so a cover for a stricter metric is automatically a cover for every weaker one:

$$
N_1(F|_{x_{1:n}},\alpha)
\leq
N_2(F|_{x_{1:n}},\alpha)
\leq\cdots\leq
N_\infty(F|_{x_{1:n}},\alpha).
$$

### 4.1 Projection-Cover Bound
Use an $\ell_1$ projection cover. For $u_f=(f(x_1),\ldots,f(x_n))$, choose $v_f$ with $\|u_f-v_f\|_1\leq n\alpha$. Then

$$
\left.
\begin{array}{lll}
\hat R^{i.i.d.}(F;x_{1:n})
&=\dfrac1n\mathbb E_\epsilon\left[\sup_f\langle\epsilon,u_f\rangle\right]\\
&\leq
\underbrace{\dfrac1n\sup_f\|u_f-v_f\|_1}_{\leq\alpha}
+
\dfrac1n\mathbb E_\epsilon\left[\sup_{v\in V}\langle\epsilon,v\rangle\right]\\
&\leq
\alpha+
\sqrt{\dfrac{2\ln N_1(F|_{x_{1:n}},\alpha)}{n}}
&\text{Massart}.
\end{array}
\right.
$$

Therefore

$$
\boxed{
\hat R^{i.i.d.}(F;x_{1:n})
\leq
\min_{\alpha\geq0}
\left[
\alpha+
\sqrt{\frac{2\ln N_1(F|_{x_{1:n}},\alpha)}{n}}
\right]
}.
$$

This is never worse than pointwise covering, because any pointwise $\alpha$-cover induces an $\ell_\infty$ projection $\alpha$-cover:

$$
N_\infty(F|_{x_{1:n}},\alpha)
\leq
N(F,\alpha).
$$

However, merely replacing $F$ by the entire ambient cube $[-1,+1]^n$ is useless. A grid needs about $(1/\alpha)^n$ points, so

$$
\ln N\sim n\ln(1/\alpha),
$$

and the factor $n$ cancels the $1/n$ in the Rademacher bound. We must exploit the **structure of the projection generated by $F$**.

### 4.2 Monotone Functions: Projection Structure Makes the Cover Finite
Sort the sample so $x_1\leq\cdots\leq x_n$. Then every vector in $F_{\mathrm{mono}}|_{x_{1:n}}$ is non-decreasing.

Fix $0<\alpha<1$. Discretize $[-1,+1]$ into ordered levels $S_\alpha=\{s_1<\cdots<s_K\}$ with $K=O(1/\alpha)$ so every output is within $\alpha$ of some level. Define

$$
V
=
\{v\in S_\alpha^n:v_1\leq\cdots\leq v_n\}.
$$

Then $V$ is an $\ell_\infty$ projection $\alpha$-cover.

A monotone vector $v\in V$ is determined by the counts $m_k$ of each level, where $m_k\geq0$ and $\sum_{k=1}^K m_k=n$. Therefore

$$
|V|
=
\binom{n+K-1}{K-1}
\leq
(n+1)^K,
$$

so

$$
\ln N_\infty(F_{\mathrm{mono}}|_{x_{1:n}},\alpha)
=
O\left(
\frac{\ln(n+1)}{\alpha}
\right).
$$

Using $N_1\leq N_\infty$,

$$
R^{i.i.d.}(F_{\mathrm{mono}})
\lesssim
\min_\alpha
\left[
\alpha+
\sqrt{\frac{\ln(n+1)}{\alpha n}}
\right].
$$

Balance the two terms:

$$
\alpha
\asymp
\sqrt{\frac{\ln n}{\alpha n}}
\quad\Longrightarrow\quad
\alpha^3\asymp\frac{\ln n}{n}
\quad\Longrightarrow\quad
\alpha\asymp\left(\frac{\ln n}{n}\right)^{1/3}.
$$

Hence

$$
\boxed{
R^{i.i.d.}(F_{\mathrm{mono}})
=
O\left(
\left(\frac{\ln n}{n}\right)^{1/3}
\right)
}.
$$

This proves the class is learnable even though its pointwise covering number is infinite.

The useful lesson from symmetrization is therefore

$$
\boxed{
\text{whole function}
\quad\to\quad
\text{behavior only on the observed sample}.
}
$$

But a new defect appears: the rate is only about $n^{-1/3}$, while the previous examples are closer to $n^{-1/2}$. We now need to determine whether the class is genuinely harder or the **one-scale covering analysis is loose**.