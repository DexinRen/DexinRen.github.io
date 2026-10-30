---
title: "Dudley's Entropy Integral and Chaining"
area: "Statistical Learning Theory"
areaSlug: "learning-theory"
tags: ["learning_theory","complexity_measures"]
order: 4
sources: ["Course/CS/CSCI 678/Lecture 3 - Infinite Class Regression.md"]
credits: [{"text":"Based on Prof. Haipeng Luo's CSCI 678 (Theoretical Machine Learning, USC, Fall 2026). Thank you to Prof. Luo for an excellent course. These notes contain my own understanding and the bridging steps I added to make the lectures easier to follow; any mistakes are mine.","courseLink":"https://haipeng-luo.net/courses/CSCI678/2026_fall/schedule.html","lectureLinks":[{"label":"Lecture 3 (PDF)","url":"https://haipeng-luo.net/courses/CSCI678/2026_fall/lectures/lecture3.pdf"}]}]
---

## 5. Dudley Entropy Integral: Replace One-Scale Approximation by Multi-Scale Approximation
The projection-cover theorem chooses one $\alpha$ and pays

$$
\boxed{
\text{approximation error at }\alpha
+
\text{full cover complexity at }\alpha.
}
$$

This can overpay: a fine cover contains information at all coarser scales, but the one-scale bound charges for the finest cover all at once.

The required improvement is therefore a bound that accumulates only the **new correction introduced at each resolution**. This is chaining, and its continuous form is Dudley's entropy integral.

For fixed $x_{1:n}$,

$$
\boxed{
\hat R^{i.i.d.}(F;x_{1:n})
\leq
\min_{0\leq\alpha\leq1}
\left[
4\alpha+
\frac{12}{\sqrt n}
\int_\alpha^1
\sqrt{\ln N_2(F|_{x_{1:n}},\delta)}\,d\delta
\right].
}
$$

Here $\delta$ is the running covering scale and $\alpha$ is the finest scale where the chain stops. The upper limit is $1$ because $|f(x_t)|\leq1$ implies $d_2(u_f,0)\leq1$, so $\{0\}$ is already a $1$-cover.

The key difference is

$$
\text{one scale: }\sqrt{\ln N(\alpha)}
\qquad\to\qquad
\text{all scales: }\int_\alpha^1\sqrt{\ln N_2(\delta)}\,d\delta.
$$

Before proving the theorem, check whether this actually fixes the loose rates.

### 5.1 Linear Functions: Remove the Extra Logarithm
From the pointwise packing bound,

$$
N_2(F_{\mathrm{lin}}|_{x_{1:n}},\delta)
\leq
N(F_{\mathrm{lin}},\delta)
\leq
\left(1+\frac2\delta\right)^d
\leq
\left(\frac3\delta\right)^d,
\qquad0<\delta\leq1.
$$

Hence

$$
\left.
\begin{array}{lll}
\displaystyle
\int_0^1\sqrt{\ln N_2(F_{\mathrm{lin}}|_{x_{1:n}},\delta)}\,d\delta
&\leq
\displaystyle
\sqrt d\int_0^1\sqrt{\ln(3/\delta)}\,d\delta\\
&=
O(\sqrt d).
\end{array}
\right.
$$

Setting $\alpha=0$ gives

$$
\boxed{
R^{i.i.d.}(F_{\mathrm{lin}})
=
O\left(\sqrt{\frac dn}\right).
}
$$

So the $\sqrt{\ln(n/d)}$ factor in the one-scale bound was an artifact of the analysis, not intrinsic complexity.

### 5.2 Monotone Functions: Improve $n^{-1/3}$ to Nearly $n^{-1/2}$
For the monotone class,

$$
\ln N_2(F_{\mathrm{mono}}|_{x_{1:n}},\delta)
\leq
\ln N_\infty(F_{\mathrm{mono}}|_{x_{1:n}},\delta)
=
O\left(\frac{\ln(n+1)}{\delta}\right).
$$

Thus

$$
\left.
\begin{array}{lll}
\displaystyle
\int_0^1\sqrt{\ln N_2(F_{\mathrm{mono}}|_{x_{1:n}},\delta)}\,d\delta
&=
\displaystyle
O\left(
\sqrt{\ln(n+1)}
\int_0^1\delta^{-1/2}\,d\delta
\right)\\
&=
O(\sqrt{\ln(n+1)}).
\end{array}
\right.
$$

Setting $\alpha=0$ gives

$$
\boxed{
R^{i.i.d.}(F_{\mathrm{mono}})
=
O\left(
\sqrt{\frac{\ln n}{n}}
\right).
}
$$

Therefore the earlier $n^{-1/3}$ rate was not fundamental. The one-scale argument was loose.

Now the theorem has justified its role. The remaining question is structural: **why does decomposing a function across scales produce the entropy integral?**

## 6. Chaining: Where Dudley's Integral Comes From
The goal is to replace one expensive fine approximation by a sequence of progressively finer corrections.

Choose dyadic scales $\alpha_j=2^{-j}$ for $j=0,\ldots,M$, so $\alpha_0=1$ and $\alpha_{j-1}=2\alpha_j$. Let $V_j$ be an $\ell_2$ $\alpha_j$-cover of $F|_{x_{1:n}}$ with

$$
|V_j|
=
N_2(F|_{x_{1:n}},\alpha_j),
$$

and set $V_0=\{0\}$.

For each prediction vector $u_f=(f(x_1),\ldots,f(x_n))$, choose $v_f^j\in V_j$ satisfying

$$
\|u_f-v_f^j\|_2
\leq
\sqrt n\,\alpha_j.
$$

Instead of approximating $u_f$ in one jump, telescope across scales:

$$
u_f
=
\underbrace{(u_f-v_f^M)}_{\text{final approximation error}}
+
\sum_{j=1}^M
\underbrace{(v_f^j-v_f^{j-1})}_{\text{new correction at scale }j}.
$$

Therefore

$$
\hat R(F;x_{1:n})
\leq
\underbrace{
\frac1n\mathbb E_\epsilon\sup_f\langle\epsilon,u_f-v_f^M\rangle
}_{\leq\alpha_M}
+
\frac1n\sum_{j=1}^M
\mathbb E_\epsilon\sup_f
\langle\epsilon,v_f^j-v_f^{j-1}\rangle.
$$

The final approximation term satisfies

$$
\|u_f-v_f^M\|_1
\leq
\sqrt n\|u_f-v_f^M\|_2
\leq
n\alpha_M.
$$

For the scale-$j$ correction, define

$$
S_j
=
\{(v_f^j,v_f^{j-1}):f\in F\}.
$$

For every $(v,v')\in S_j$ associated with the same $u_f$,

$$
\left.
\begin{array}{lll}
\|v-v'\|_2
&\leq
\|v-u_f\|_2+\|u_f-v'\|_2\\
&\leq
\sqrt n(\alpha_j+\alpha_{j-1})\\
&=
3\sqrt n\,\alpha_j
&\alpha_{j-1}=2\alpha_j.
\end{array}
\right.
$$

Thus $\langle\epsilon,v-v'\rangle$ is $3\sqrt n\,\alpha_j$-sub-Gaussian. Also

$$
|S_j|
\leq
|V_j||V_{j-1}|
\leq
|V_j|^2,
$$

so Massart gives

$$
\mathbb E_\epsilon
\sup_{(v,v')\in S_j}
\langle\epsilon,v-v'\rangle
\leq
6\sqrt n\,\alpha_j
\sqrt{\ln N_2(F|_{x_{1:n}},\alpha_j)}.
$$

Therefore

$$
\hat R(F;x_{1:n})
\leq
\alpha_M+
\frac6{\sqrt n}
\sum_{j=1}^M
\alpha_j
\sqrt{\ln N_2(F|_{x_{1:n}},\alpha_j)}.
$$

Since $\alpha_j=2(\alpha_j-\alpha_{j+1})$,

$$
\hat R(F;x_{1:n})
\leq
\alpha_M+
\frac{12}{\sqrt n}
\sum_{j=1}^M
(\alpha_j-\alpha_{j+1})
\sqrt{\ln N_2(F|_{x_{1:n}},\alpha_j)}.
$$

Because $\sqrt{\ln N_2(F|_{x_{1:n}},\delta)}$ is non-increasing in $\delta$, this Riemann sum is bounded by an integral:

$$
\hat R(F;x_{1:n})
\leq
\alpha_M+
\frac{12}{\sqrt n}
\int_{\alpha_{M+1}}^{\alpha_1}
\sqrt{\ln N_2(F|_{x_{1:n}},\delta)}\,d\delta.
$$

For any target cutoff $\alpha>0$, choose $M$ such that

$$
2^{-(M+2)}\leq\alpha\leq2^{-(M+1)}.
$$

Then $\alpha_M\leq4\alpha$ and $\alpha\leq\alpha_{M+1}$, giving

$$
\boxed{
\hat R(F;x_{1:n})
\leq
4\alpha+
\frac{12}{\sqrt n}
\int_\alpha^1
\sqrt{\ln N_2(F|_{x_{1:n}},\delta)}\,d\delta.
}
$$

The constants come directly from the construction:

$$
\left.
\begin{array}{lll}
3 &:& \alpha_j+\alpha_{j-1}=3\alpha_j,\\
6 &:& \text{Massart on the pair set }S_j,\\
12&:& \alpha_j=2(\alpha_j-\alpha_{j+1}),\\
4 &:& \text{matching the dyadic finest scale to the target }\alpha.
\end{array}
\right.
$$

Why $\ell_2$ covers? Because the sub-Gaussian scale of $\langle\epsilon,v-v'\rangle$ is exactly controlled by $\|v-v'\|_2$.

At this point the analytic problem is largely solved:

$$
\boxed{
\text{covering numbers}
\quad\Longrightarrow\quad
\text{Rademacher complexity}.
}
$$

But a practical/theoretical bottleneck remains: **covering numbers themselves can be hard to calculate directly for a new real-valued class.**