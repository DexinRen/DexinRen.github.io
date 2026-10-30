---
title: "From Pseudo-Dimension to Fat-Shattering Dimension"
area: "Statistical Learning Theory"
areaSlug: "learning-theory"
tags: ["learning_theory","complexity_measures"]
order: 5
sources: ["Course/CS/CSCI 678/Lecture 3 - Infinite Class Regression.md","Course/CS/CSCI 678/Lecture 4 - Fat-Shattering and Neural Network Complexity.md"]
credits: [{"text":"Based on Prof. Haipeng Luo's CSCI 678 (Theoretical Machine Learning, USC, Fall 2026). Thank you to Prof. Luo for an excellent course. These notes contain my own understanding and the bridging steps I added to make the lectures easier to follow; any mistakes are mine.","courseLink":"https://haipeng-luo.net/courses/CSCI678/2026_fall/schedule.html","lectureLinks":[{"label":"Lecture 3 (PDF)","url":"https://haipeng-luo.net/courses/CSCI678/2026_fall/lectures/lecture3.pdf"},{"label":"Lecture 4 (PDF)","url":"https://haipeng-luo.net/courses/CSCI678/2026_fall/lectures/lecture4.pdf"}]}]
---

## 7. Pseudo-Dimension: A VC-Like Parameter for Bounding Covers
This is the same role VC dimension played in classification:

$$
\text{growth function hard to calculate}
\quad\to\quad
\text{VC dimension}.
$$

For regression, we want

$$
\text{covering number hard to calculate}
\quad\to\quad
\text{a simpler combinatorial parameter}.
$$

For each $f\in F\subseteq[-1,+1]^X$, define a binary classifier on $X\times[-1,+1]$:

$$
h_f(x,r)
=
\operatorname{sign}(f(x)-r).
$$

Let

$$
H_F
=
\{h_f:f\in F\},
\qquad
\boxed{
\operatorname{Pdim}(F)
=
\operatorname{VCdim}(H_F).
}
$$

Equivalently, $\operatorname{Pdim}(F)\geq m$ if there exist inputs $x_1,\ldots,x_m$ and comparison levels $r_1,\ldots,r_m$ such that for every labeling $s_{1:m}\in\{-1,+1\}^m$, some $f\in F$ satisfies

$$
\operatorname{sign}(f(x_i)-r_i)
=
s_i,
\qquad i=1,\ldots,m.
$$

So pseudo-dimension measures how many input/threshold pairs the class can independently place above or below their thresholds.

For the $d$-dimensional linear class,

$$
h_\theta(x,r)
=
\operatorname{sign}(\langle\theta,x\rangle-r),
$$

and the lecture states

$$
\boxed{
\operatorname{Pdim}(F_{\mathrm{lin}})=d.
}
$$

A regression analogue of Sauer's lemma gives, up to logarithmic factors,

$$
\ln N_1(F|_{x_{1:n}},\alpha)
=
O\left(
\operatorname{Pdim}(F)\ln\frac1\alpha
\right).
$$

Therefore finite pseudo-dimension is sufficient for learnability.

The remaining question is whether this finally characterizes learnability, i.e. whether finite pseudo-dimension is also necessary.

### 7.1 Monotone Functions: Pseudo-Dimension Is Still Too Crude
Return to $F_{\mathrm{mono}}$. For any $m\geq1$, choose

$$
x_i=i,
\qquad
r_i=\frac{i}{m},
\qquad i=0,\ldots,m-1.
$$

For arbitrary labels $s_i\in\{-1,+1\}$, choose $0<\varepsilon\leq1/(2m)$ and set

$$
f(x_i)
=
\frac{i}{m}+s_i\varepsilon.
$$

These values remain non-decreasing because

$$
f(x_{i+1})-f(x_i)
=
\frac1m+(s_{i+1}-s_i)\varepsilon
\geq
\frac1m-2\varepsilon
\geq0.
$$

At the same time,

$$
\operatorname{sign}(f(x_i)-r_i)
=
\operatorname{sign}(s_i\varepsilon)
=
s_i.
$$

Thus every binary labeling can be realized for every $m$:

$$
\boxed{
\operatorname{Pdim}(F_{\mathrm{mono}})=\infty.
}
$$

But Section 5 already showed

$$
R^{i.i.d.}(F_{\mathrm{mono}})
=
O\left(\sqrt{\frac{\ln n}{n}}\right),
$$

so the class is learnable. Therefore

$$
\boxed{
\text{finite pseudo-dimension is sufficient, but not necessary.}
}
$$

What does pseudo-dimension miss? The shattering construction requires

$$
\varepsilon\leq\frac1{2m}\to0
$$

as $m\to\infty$. The class realizes increasingly many binary patterns only by using increasingly tiny vertical separation.

So the missing ingredient is **scale / margin**: not merely whether a pattern can be realized, but at what separation scale it can be realized. That is the bottleneck carried into Lecture 4.

## 8. Closing the Loop
The complete dependency chain is

$$
\left.
\begin{array}{l}
\text{Lecture 2 reduces learnability to }R(F)\\
\to\text{regression projection can remain infinite}\\
\to\text{pointwise cover reduces infinite }F\text{ to finite representatives}\\
\to\text{linear example: cover size can be bounded}\\
\to\text{general }p\text{: cube cover is valid but geometrically loose}\\
\to\text{packing + volume gives a direct }p\text{-norm cover}\\
\to\text{monotone class: pointwise cover can still be infinite}\\
\to\text{projection cover keeps only sample-visible behavior}\\
\to\text{monotone projection cover proves learnability, but gives }n^{-1/3}\\
\to\text{one-scale analysis is loose}\\
\to\text{chaining / Dudley combines information across scales}\\
\to\text{linear rate }O(\sqrt{d/n}),\ \text{monotone rate }O(\sqrt{\ln n/n})\\
\to\text{covering numbers still hard to calculate directly}\\
\to\text{pseudo-dimension gives a VC-like sufficient condition}\\
\to\text{monotone class has infinite Pdim but is learnable}\\
\to\text{next missing concept: scale / margin}.
\end{array}
\right.
$$

### Bound Progression

$$
\left.
\begin{array}{l|c|c}
\text{Method}
&F_{\mathrm{lin}}
&F_{\mathrm{mono}}\\ \hline
\text{pointwise cover}
&O\!\left(\sqrt{\dfrac{d\ln(n/d)}{n}}\right)
&\infty\\[1.2ex]
\text{projection one-scale cover}
&O\!\left(\sqrt{\dfrac{d\ln(n/d)}{n}}\right)
&O\!\left(\left(\dfrac{\ln n}{n}\right)^{1/3}\right)\\[1.2ex]
\text{Dudley / chaining}
&O\!\left(\sqrt{\dfrac dn}\right)
&O\!\left(\sqrt{\dfrac{\ln n}{n}}\right)
\end{array}
\right.
$$

### Variable Map
$n$ = training-sample size; $d$ = dimension of the linear example; $p,q$ = dual norm exponents; $r$ = projection-distance exponent; $\alpha$ = covering radius / chaining cutoff; $\delta$ = running scale in Dudley's integral; $M$ = number of chaining levels; $K$ = number of discretized output levels; $m$ = number of pseudo-shattered points.

### Main Idea

$$
\boxed{
\left.
\begin{array}{c}
\text{classification counts exact behaviors,}\\
\text{regression counts approximate behaviors at multiple resolutions.}
\end{array}
\right.
}
$$

## Fat-Shattering Dimension
Recall the question left from Lecture 3:

$$
\left. 
\begin{array}{l} 
\text{Can we find a VC-like parameter for real-valued }F\\
\text{ that characterizes learnability?}
\end{array} 
\right.
$$

Our first attempt was pseudo-dimension:

$$
\operatorname{Pdim}(F)
=
\operatorname{VCdim}
\left(
\{(x,y)\mapsto\operatorname{sign}(f(x)-y):f\in F\}
\right)
$$

Finite pseudo-dimension is sufficient for learning, but we found a problem: **it is not necessary**.

For the class of all non-decreasing functions, $\operatorname{Pdim}(F)=\infty$, even though Lecture 3 already proved that the class is learnable.
Why did pseudo-dimension fail?
### What Is Missing from Pseudo-Dimension?
Recall how we gave monotone functions infinite pseudo-dimension. For arbitrary $n$, choose:

$$
(x_t,y_t)=\left(t,\frac{t}{n}\right)
$$

and for any labels $s_t\in\{-1,+1\}$, construct:

$$
f(x_t)=\frac{t}{n}+s_t\epsilon,
\qquad
0<\epsilon\leq\frac1{2n}
$$

Then:

$$
\operatorname{sign}(f(x_t)-y_t)=s_t
$$

while $f$ remains non-decreasing.
But notice the important detail:

$$
\epsilon\leq\frac1{2n}
\overset{n\to\infty}{\longrightarrow}0
$$

So as we shatter more points, the function only needs to distinguish the labels by an increasingly tiny amount.
This suggests the missing ingredient:
**pseudo-dimension only asks whether $f(x_t)$ is above or below $y_t$; it does not ask how far above or below.**
So we add a **scale/margin**.
### $\alpha$-Shattering
$F\subseteq[-1,+1]^X$ $\alpha$-shatters $x_{1:n}$ if there exist witnesses $y_{1:n}\in[-1,+1]$ such that for every $s_{1:n}\in\{-1,+1\}^n$, there exists $f\in F$ satisfying:

$$
s_t(f(x_t)-y_t)\geq\frac{\alpha}{2},
\qquad
\forall t
$$

So:

$$
\left.
\begin{array}{lll}
s_t=+1
&\Rightarrow f(x_t)\geq y_t+\alpha/2\\
s_t=-1
&\Rightarrow f(x_t)\leq y_t-\alpha/2
\end{array}
\right.
$$

Unlike pseudo-dimension, we now require the labeling to be realized with margin $\alpha/2$.
Define the fat-shattering dimension:

$$
\boxed{
\operatorname{fat}(F,\alpha)
=
\max\{n:\exists\ x_{1:n}\text{ that is }\alpha\text{-shattered by }F\}
}
$$

If $\alpha$ becomes larger, shattering becomes harder:

$$
\alpha_1<\alpha_2
\Rightarrow
\operatorname{fat}(F,\alpha_1)
\geq
\operatorname{fat}(F,\alpha_2)
$$

and as $\alpha\to0$, fat-shattering approaches the pseudo-dimension idea.
So the question becomes: **does adding scale fix the monotone-function problem?**
### Monotone Functions
From the previous pseudo-dimension construction, we already know roughly:

$$
n\lesssim\frac1\alpha
$$

because the margin available between neighboring witness values shrinks as $1/n$.
Can we prove this is unavoidable?
Suppose $x_1\leq\cdots\leq x_n$ is $\alpha$-shattered with witnesses $y_1,\ldots,y_n$.
Choose alternating labels:

$$
s_t=
\begin{cases}
+1,&t\text{ odd}\\
-1,&t\text{ even}
\end{cases}
$$

For odd $t$:

$$
\left.
\begin{array}{lll}
y_{t+1}-y_t
&\geq y_{t+1}-f(x_{t+1})+f(x_t)-y_t
&f(x_t)\leq f(x_{t+1})\\
&=
s_{t+1}(f(x_{t+1})-y_{t+1})
+s_t(f(x_t)-y_t)\\
&\geq\alpha
&\alpha\text{-shattering}
\end{array}
\right.
$$

So every pair consumes at least $\alpha$ amount of vertical range.
But all witnesses lie inside $[-1,+1]$, whose total length is $2$:

$$
\left\lfloor\frac n2\right\rfloor\alpha
\leq2
\Rightarrow
n\leq\frac4\alpha+1
$$

Thus:

$$
\boxed{
\operatorname{fat}(F,\alpha)
\leq
\frac4\alpha+1
}
$$

Unlike pseudo-dimension:

$$
\operatorname{Pdim}(F)=\infty
\qquad\text{but}\qquad
\operatorname{fat}(F,\alpha)=O(1/\alpha)
$$

So fat-shattering sees that the class is complicated at tiny scales but much simpler at any fixed resolution.
Now the next question is: **does fat-shattering actually control the covering numbers from Lecture 3?**
## Fat-Shattering $\to$ Covering Number
Lecture 3 gave:

$$
\text{covering number}
\Rightarrow
R(F)
\Rightarrow
\text{learnability}
$$

We now need:

$$
\operatorname{fat}(F,\alpha)
\Rightarrow
\text{covering number}
$$

The regression analogue of Sauer's lemma gives, for some absolute constant $c>0$:

$$
\boxed{
\ln N_2(F|_{x_{1:n}},\alpha)
=
O\left(
\operatorname{fat}(F,c\alpha)
\ln\frac1\alpha
\right)
}
$$

This is better than pseudo-dimension because:

$$
\operatorname{fat}(F,c\alpha)
\leq
\operatorname{Pdim}(F)
$$

and the fat dimension changes with the scale.
### Monotone Functions Again
For monotone $F$:

$$
\operatorname{fat}(F,\alpha)
=
O(1/\alpha)
$$

so:

$$
\ln N_2(F|_{x_{1:n}},\alpha)
=
O\left(
\frac1\alpha\ln\frac1\alpha
\right)
$$

For the Dudley calculation, we can loosen this to:

$$
\ln N_2(F|_{x_{1:n}},\alpha)
=
O(\alpha^{-3/2})
$$

Thus:

$$
\left.
\begin{array}{lll}
R^{i.i.d.}(F)
&\lesssim
\inf_\alpha
\left[
\alpha+
\frac1{\sqrt n}
\int_\alpha^1
\sqrt{\ln N_2(F|_{x_{1:n}},\delta)}
\,d\delta
\right]\\
&\lesssim
\inf_\alpha
\left[
\alpha+
\frac1{\sqrt n}
\int_\alpha^1
\delta^{-3/4}d\delta
\right]\\
&=
O\left(\frac1{\sqrt n}\right)
\end{array}
\right.
$$

Last lecture, the direct $\ell_\infty$ projection cover only gave:

$$
O\left(\sqrt{\frac{\ln n}{n}}\right)
$$

Fat-shattering gives a tighter direct $\ell_2$ cover and removes the extra $\sqrt{\ln n}$.
More importantly, unlike pseudo-dimension:

$$
\boxed{
\operatorname{fat}(F,\alpha)<\infty
\text{ for every }\alpha>0
}
$$

is also necessary for learnability.
So for real-valued statistical learning, we finally have a scale-sensitive complexity measure that matches the problem.
### Closing the Regression Story
The entire upper-bound path is now:

$$
\left.
\begin{array}{lll}
V^{i.i.d.}(F,n)
&\leq
\sup_{\mathbb P}
\mathbb E\left[
\sup_{f\in F}(L(f)-\hat L_n(f))
\right]
&\text{ERM}\\
&\leq
2\sup_{\mathbb P}R^{i.i.d.}(\ell(F))
&\text{symmetrization}\\
&\leq
2G\sup_{\mathbb P}R^{i.i.d.}(F)
&\text{erase loss}
\end{array}
\right.
$$

Then:

$$
R(F)
\overset{\text{Dudley}}{\longleftarrow}
N_2(F|_{x_{1:n}},\alpha)
\overset{\text{fat}}{\longleftarrow}
\operatorname{fat}(F,\alpha)
$$

So the statistical-learning tool chain is:

$$
\boxed{
\operatorname{fat}
\to
\text{covering number}
\to
\text{Rademacher}
\to
\text{uniform convergence}
\to
\text{learnability}
}
$$

At this point, the basic statistical-learning theory is mostly complete.
Now we can ask a more practical question:
**Can this theory explain why modern neural networks generalize?**
### Proof: Fat Dimension of Monotone Functions
Suppose $x_1\leq\cdots\leq x_n$ is $\alpha$-shattered with ordered witnesses $y_1\leq\cdots\leq y_n$.
Choose alternating labels $s_t=+1,-1,+1,-1,\ldots$.
For odd $t$:

$$
\left.
\begin{array}{lll}
y_{t+1}-y_t
&\geq
y_{t+1}-f(x_{t+1})
+
f(x_t)-y_t
&f(x_t)\leq f(x_{t+1})\\
&=
s_{t+1}(f(x_{t+1})-y_{t+1})
+
s_t(f(x_t)-y_t)\\
&\geq\alpha
&\alpha\text{-margin}
\end{array}
\right.
$$

There are $\lfloor n/2\rfloor$ such pairs and $y_n-y_1\leq2$, hence:

$$
\left\lfloor\frac n2\right\rfloor\alpha
\leq2
\Rightarrow
n\leq\frac4\alpha+1
$$
