---
title: "Sub-Gaussian Variables and the Maximal Inequality"
area: "Probability & Statistics"
areaSlug: "probability"
tags: ["statistics","distributions"]
order: 1
sources: ["Wiki/Statistics Wiki/Distribution/Sub-Gaussian Random Variables.md"]
credits: []
---

We want to describe random variables that are **not necessarily Gaussian**, but whose probability of producing extreme values still decays at a Gaussian-like rate.

##### Tail Probability
For $X$ with mean $\mu=\mathbb E[X]$, $P(|X-\mu|\geq t)$ measures the probability that a realization is at least distance $t$ from the mean:

$$
P(|X-\mu|\geq t)=P(X\leq\mu-t)+P(X\geq\mu+t).
$$

Here $t\geq0$ is an arbitrary distance threshold, not a fixed "start of the tail". The question is: **how fast does this probability approach $0$ as $t$ increases?**

A Gaussian has tail decay roughly $e^{-ct^2}$. We therefore call a variable sub-Gaussian if its extreme deviations can be controlled at this rate.

##### $\sigma$-Sub-Gaussian
A zero-mean random variable $U$ is $\sigma$-sub-Gaussian if

$$
\mathbb E[e^{\lambda U}]
\leq
e^{\sigma^2\lambda^2/2},
\qquad \forall\lambda\in\mathbb R.
$$

For general $X$, center it first: $U=X-\mathbb E[X]$.

This MGF condition implies

$$
P(|X-\mathbb E[X]|\geq t)
\leq
2e^{-t^2/(2\sigma^2)}.
$$

Thus $\sigma$ controls the allowed tail-decay rate:

$$
\sigma\downarrow
\Rightarrow
\frac{t^2}{2\sigma^2}\uparrow
\Rightarrow
e^{-t^2/(2\sigma^2)}\downarrow
\Rightarrow
\text{stronger concentration}.
$$

So $\sigma$ is a **concentration scale**, not necessarily the actual standard deviation, although $\operatorname{Var}(X)\leq\sigma^2$.

Sub-Gaussian does **not** mean "Gaussian-shaped". Uniform, discrete, or multimodal distributions can all be sub-Gaussian. What matters is the probability of being far from the mean, not the number or shape of PDF peaks.

Example: $X\sim\mathrm{Unif}[-a,a]$ has

$$
P(|X|\geq t)
=
\begin{cases}
1-\frac{t}{a}, & 0\leq t<a,\\
0, & t\geq a.
\end{cases}
$$

Its PDF is flat, but its extreme tail is even lighter than Gaussian because the probability becomes exactly $0$.

Useful mental model:

$$
\boxed{\text{sub-Gaussian}\approx\text{extreme values are at most Gaussian-scale likely}.}
$$

A zero-mean variable bounded in $[a,b]$ is $\frac{b-a}{2}$-sub-Gaussian by Hoeffding's lemma.

---

## Maximum of Sub-Gaussian Random Variables

Now suppose $\{U_f\}_{f\in F}$ is a finite family of zero-mean $\sigma$-sub-Gaussian random variables. Define

$$
M=\max_{f\in F}U_f.
$$

Important: $M$ is the largest **realized value**, not the largest PDF density.

For one realization,

$$
(U_1,U_2,U_3,U_4)=(-0.3,0.8,1.7,-1.2)
\Rightarrow
M=1.7.
$$

Although every $\mathbb E[U_f]=0$, selecting the largest realization introduces a positive "best-of-many" effect. We want to know how large this effect can be.

##### Maximal Inequality

$$
\boxed{
\mathbb E\left[\max_{f\in F}U_f\right]
\leq
\sigma\sqrt{2\ln|F|}.
}
$$

So adding more candidates increases the expected winner, but only at rate $\sqrt{\ln|F|}$.

Why should $\ln|F|$ appear? For one variable,

$$
P(U_f\geq t)\leq e^{-t^2/(2\sigma^2)}.
$$

For all $|F|$ candidates,

$$
P(\max_fU_f\geq t)
=
P(\exists f:U_f\geq t)
\leq
|F|e^{-t^2/(2\sigma^2)}.
$$

The rough scale where this upper bound changes from trivial to small satisfies

$$
\left.
\begin{array}{rl}
|F|e^{-t^2/(2\sigma^2)}&\approx1\\
\ln|F|-\dfrac{t^2}{2\sigma^2}&\approx0\\
t&\approx\sigma\sqrt{2\ln|F|}.
\end{array}
\right.
$$

This explains the scale, but **does not prove the expectation bound**. We still need to directly control $\mathbb E[M]$.

##### Proof
We have a problem: the target contains $\max_fU_f$, but the sub-Gaussian assumption gives us information about $\mathbb E[e^{\lambda U_f}]$. So we need to turn the maximum into something involving exponentials.

For any $\lambda>0$,

$$
e^{\lambda M}
=
e^{\lambda\max_fU_f}
=
\max_f e^{\lambda U_f}
\leq
\sum_{f\in F}e^{\lambda U_f}.
$$

Taking $\ln$ and dividing by $\lambda$,

$$
M
\leq
\frac1\lambda
\ln\left(\sum_{f\in F}e^{\lambda U_f}\right).
$$

Now take expectation:

$$
\left.
\begin{array}{lll}
\mathbb E[M]
&\leq
\dfrac1\lambda
\mathbb E\left[\ln\left(\sum_f e^{\lambda U_f}\right)\right]
\\[5pt]
&\leq
\dfrac1\lambda
\ln\mathbb E\left[\sum_f e^{\lambda U_f}\right]
&\text{Jensen}\\[5pt]
&=
\dfrac1\lambda
\ln\left(\sum_f\mathbb E[e^{\lambda U_f}]\right)
&\text{linearity}\\[5pt]
&\leq
\dfrac1\lambda
\ln\left(|F|e^{\sigma^2\lambda^2/2}\right)
&\sigma\text{-sub-Gaussian}\\[5pt]
&=
\dfrac{\ln|F|}{\lambda}
+
\dfrac{\sigma^2\lambda}{2}.
\end{array}
\right.
$$

This is true for every $\lambda>0$, so choose the $\lambda$ giving the smallest upper bound. Let

$$
g(\lambda)=\frac{\ln|F|}{\lambda}+\frac{\sigma^2\lambda}{2}.
$$

Then

$$
g'(\lambda)
=
-\frac{\ln|F|}{\lambda^2}
+
\frac{\sigma^2}{2}
=0
\Rightarrow
\lambda^*
=
\frac{\sqrt{2\ln|F|}}{\sigma}.
$$

Substitute $\lambda^*$:

$$
\boxed{
\mathbb E\left[\max_{f\in F}U_f\right]
\leq
\sigma\sqrt{2\ln|F|}.
}
$$

The key move is therefore

$$
\boxed{
\max_fU_f
\rightarrow
\max_fe^{\lambda U_f}
\leq
\sum_fe^{\lambda U_f}
\rightarrow
\text{MGF bound}
\rightarrow
\min_\lambda.
}
$$

The exponential is not introduced because we assume the maximum lies in the tail. It is introduced because **the sub-Gaussian assumption controls the exponential moment**, and $\max\leq\sum$ lets us connect that assumption to the maximum.

## Summary

$$
\boxed{
\mathbb E[e^{\lambda U}]
\leq e^{\sigma^2\lambda^2/2}
}
\Rightarrow
\boxed{
P(|U|\geq t)\leq2e^{-t^2/(2\sigma^2)}
}
$$

so $\sigma$ controls concentration. For a finite family of such variables,

$$
\boxed{
\mathbb E[\max_fU_f]
\leq
\sigma\sqrt{2\ln|F|}
}
$$

because

$$
\boxed{
\max
\rightarrow
\text{log-sum-exp}
\rightarrow
\text{sub-Gaussian MGF}
\rightarrow
\sqrt{\ln|F|}.
}
$$
