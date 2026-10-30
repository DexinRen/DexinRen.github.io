---
title: "Online Learning, Regret and Online-to-Batch Conversion"
area: "Online Learning & Bandits"
areaSlug: "online-learning"
tags: ["online_learning","learning_theory","machine_learning"]
order: 1
sources: ["Course/CS/CSCI 678/Lecture 1 - Statistical Learning and Online Learning.md","Course/CS/CSCI 659/in_class/Lecture 1.md"]
credits: [{"text":"Based on Prof. Haipeng Luo's CSCI 678 (Theoretical Machine Learning, USC, Fall 2026). Thank you to Prof. Luo for an excellent course. These notes contain my own understanding and the bridging steps I added to make the lectures easier to follow; any mistakes are mine.","courseLink":"https://haipeng-luo.net/courses/CSCI678/2026_fall/schedule.html","lectureLinks":[{"label":"Lecture 1 (PDF)","url":"https://haipeng-luo.net/courses/CSCI678/2026_fall/lectures/lecture1.pdf"}]},{"text":"Based on USC CSCI 659 (Online Learning & Bandits, Spring 2026). These notes contain my own understanding and the bridging steps I added; any mistakes are mine.","courseLink":null,"lectureLinks":[]}]
---

## Online Learning
So far:

$$
z_{1:n}
\to
\text{observe entire training sample}
\to
\hat y
$$

What if decisions must be made **before future data are observed?**
That gives online learning.
For $t=1,\ldots,n$:

$$
\left.
\begin{array}{lll}
1.&\text{learner chooses }\hat y_t\in D\\
2.&\text{environment chooses/reveals }z_t\in Z\\
3.&\text{learner suffers }\ell(\hat y_t,z_t)
\end{array}
\right.
$$

At round $t$, $\hat y_t$ may depend on $z_{1:t-1}$ but not on the future.
We cannot compare one online decision with the true population risk because there may not even be a distribution $\mathbb P$.
So what benchmark should we use?
### Regret
Compare the learner's cumulative loss with the best **fixed** $f\in F$ chosen in hindsight:

$$
\boxed{
\operatorname{Reg}(F,n)
=
\sum_{t=1}^n\ell(\hat y_t,z_t)
-
\inf_{f\in F}
\sum_{t=1}^n\ell(f,z_t)
}
$$

The comparator sees the entire sequence before being evaluated, but must use the same fixed $f$ on every round.
The learner is **no-regret** if:

$$
\frac{\operatorname{Reg}(F,n)}{n}
\overset{n\to\infty}{\longrightarrow}0
$$

meaning its average loss eventually becomes as good as the best fixed comparator.
### Environment
Two common settings:

$$
\left.
\begin{array}{ll}
\text{oblivious}
&z_{1:n}\text{ is fixed before interaction}\\
\text{adaptive}
&z_t\text{ may depend on the previous interaction}
\end{array}
\right.
$$

For an oblivious sequence, define:

$$
V^{seq}(F,n)
=
\inf_{\pi}
\sup_{z_{1:n}}
\mathbb E
\left[
\frac{\operatorname{Reg}(F,n)}{n}
\right]
$$

and:

$$
\boxed{
F\text{ is online learnable}
\iff
\limsup_{n\to\infty}V^{seq}(F,n)=0
}
$$

For the adaptive minimax game, the learner chooses a distribution $q_t\in\Delta(D)$ each round:

$$
\left.
\begin{array}{l}
V^{seq}(F,n)
=
\inf_{q_1\in\Delta(D)}
\sup_{z_1\in Z}
\mathbb E_{\hat y_1\sim q_1}
\cdots\\
\qquad
\inf_{q_n\in\Delta(D)}
\sup_{z_n\in Z}
\mathbb E_{\hat y_n\sim q_n}
\left[
\frac{\operatorname{Reg}(F,n)}{n}
\right]
\end{array}
\right.
$$

Online learning therefore asks for robustness against a sequence rather than against an unknown i.i.d. distribution.
## Which Problem Is Harder?
We now have two values:

$$
V^{i.i.d.}(F,n)
\qquad\text{and}\qquad
V^{seq}(F,n)
$$

Statistical learning assumes:

$$
z_t\overset{i.i.d.}{\sim}\mathbb P
$$

Online learning allows arbitrary/adversarial sequences.
So we expect online learning to be at least as hard.
Indeed:

$$
\boxed{
V^{i.i.d.}(F,n)
\leq
V^{seq}(F,n)
}
$$

How can an online algorithm solve an i.i.d. statistical problem?
### Online-to-Batch Reduction
Given:

$$
z_1,\ldots,z_n
\overset{i.i.d.}{\sim}\mathbb P
$$

feed them sequentially into the online algorithm and obtain:

$$
\hat y_1,\ldots,\hat y_n
$$

Then sample:

$$
T\sim\operatorname{Unif}\{1,\ldots,n\}
$$

and output:

$$
\hat y=\hat y_T
$$

Why should this work?
Since $\hat y_t$ depends only on $z_{1:t-1}$, it is independent of the fresh sample $z_t$.
Therefore:

$$
\mathbb E[L(\hat y_t)]
=
\mathbb E[\ell(\hat y_t,z_t)]
$$

So the online loss at time $t$ is an unbiased estimate of the population risk of $\hat y_t$.
This lets us turn the online regret guarantee into an excess-risk guarantee:

$$
\boxed{
\mathbb E[L(\hat y)]
-
\inf_{f\in F}L(f)
\leq
\mathbb E\left[
\frac{\operatorname{Reg}(F,n)}{n}
\right]
}
$$

Thus:

$$
\boxed{
\text{online learnable}
\Rightarrow
\text{i.i.d. learnable}
}
$$

but the converse does not necessarily hold.
## Closing the Loop
The research path of Lecture 1 is:

$$
\left.
\begin{array}{l}
\text{supervised learning}\\
\to\text{population risk is unknown}\\
\to\text{compare with a reference class }F\\
\to\text{general statistical-learning framework}\\
\to\text{define worst-case learnability by }V^{i.i.d.}\\
\to\text{ask whether every }F\text{ is learnable}\\
\to\text{no-free-lunch: no}\\
\to\text{need to understand complexity of }F\\
\to\text{consider sequential/adversarial data}\\
\to\text{online regret and }V^{seq}\\
\to\text{online-to-batch reduction}\\
\to V^{i.i.d.}(F,n)\leq V^{seq}(F,n)
\end{array}
\right.
$$

The two learning frameworks can be summarized as:

$$
\left.
\begin{array}{c|cc}
&\text{Statistical Learning}&\text{Online Learning}\\\hline
\text{data}
&i.i.d.\ z_t\sim\mathbb P
&\text{arbitrary sequence }z_{1:n}\\
\text{output}
&\text{one }\hat y\text{ after training}
&\hat y_t\text{ each round}\\
\text{benchmark}
&\inf_{f\in F}L(f)
&\inf_{f\in F}\sum_t\ell(f,z_t)\\
\text{error}
&\text{excess risk}
&\text{regret}\\
\text{learnable}
&V^{i.i.d.}(F,n)\to0
&V^{seq}(F,n)\to0
\end{array}
\right.
$$

### Proof: Online-to-Batch Reduction
Run the online algorithm on:

$$
z_1,\ldots,z_n
\overset{i.i.d.}{\sim}\mathbb P
$$

and obtain $\hat y_1,\ldots,\hat y_n$.
Choose $T\sim\operatorname{Unif}\{1,\ldots,n\}$ independently and output $\hat y=\hat y_T$.
For any fixed $f\in F$:

$$
\left.
\begin{array}{lll}
\mathbb E[L(\hat y)]-L(f)
&=
\frac1n\sum_{t=1}^n
\mathbb E[L(\hat y_t)]
-
\frac1n\sum_{t=1}^nL(f)\\
&=
\mathbb E\left[
\frac1n\sum_{t=1}^n\ell(\hat y_t,z_t)
-
\frac1n\sum_{t=1}^n\ell(f,z_t)
\right]
&\hat y_t\perp z_t\\
&\leq
\mathbb E\left[
\frac1n\sum_{t=1}^n\ell(\hat y_t,z_t)
-
\inf_{f^*\in F}
\frac1n\sum_{t=1}^n\ell(f^*,z_t)
\right]\\
&=
\mathbb E\left[
\frac{\operatorname{Reg}(F,n)}{n}
\right]
\end{array}
\right.
$$

Now take the supremum over $f\in F$ on the left:

$$
\left.
\begin{array}{lll}
\sup_{f\in F}
\left(
\mathbb E[L(\hat y)]-L(f)
\right)
&\leq
\mathbb E\left[
\frac{\operatorname{Reg}(F,n)}{n}
\right]\\
\mathbb E[L(\hat y)]
-
\inf_{f\in F}L(f)
&\leq
\mathbb E\left[
\frac{\operatorname{Reg}(F,n)}{n}
\right]
\end{array}
\right.
$$

Thus every online algorithm gives an i.i.d. learner with no larger expected excess risk:

$$
\boxed{
V^{i.i.d.}(F,n)
\leq
V^{seq}(F,n)
}
$$

### Connection to Statistical Learning
Statistical learning (offline) assumes $z_1,\dots,z_T \overset{i.i.d.}{\sim}\mathcal{D}$ and outputs one predictor $\bar w\in\Omega$ minimizing population risk $L(\bar w)=\mathbb{E}_{z\sim\mathcal{D}}[\ell(\bar w,z)]$.

Online learning is more general: no i.i.d. required; losses can be adversarial. Performance is measured by <span class="wl-missing" title="Not published yet">regret</span>.

#### Online-to-batch reduction (bridge) — step-by-step
Goal: use an *online* algorithm (regret guarantee) to solve an *offline i.i.d.* statistical learning problem (excess risk).

##### Assumptions (must be stated)
- Data are i.i.d.: $z_1,\dots,z_T \overset{i.i.d.}{\sim}\mathcal D$
- Loss per example: $\ell(w;z)\in[0,1]$
- Population risk: $L(w)=\mathbb E_{z\sim\mathcal D}[\ell(w;z)]$
- (For averaging option) $\ell(\cdot;z)$ is convex in $w$ and $\Omega$ is convex.

##### Step 1 — convert the dataset into an online game
Define the per-round online loss using the $t$-th sample:
- $f_t(w) \;:=\; \ell(w; z_t)$

Interpretation: the “environment” at round $t$ is just “show me sample $z_t$ and score me by its loss”.

##### Step 2 — run any online learner *one pass*
Pick an online algorithm $A$ (e.g., OGD / mirror descent) that produces decisions $w_t\in\Omega$ sequentially.

Process:
- for $t=1,\dots,T$:
  1) learner has $w_t$ (computed from past samples only)
  2) observe sample $z_t$
  3) suffer loss $f_t(w_t)=\ell(w_t;z_t)$
  4) update to get $w_{t+1}$ using $(z_t,\nabla_w \ell(w_t;z_t))$

Critical independence condition for the proof:
- $w_t$ must be a function of past samples only: $w_t=A(z_1,\dots,z_{t-1})$
- so $z_t$ is “fresh” relative to $w_t$.

##### Step 3 — output ONE predictor (batch model) from $\{w_t\}$
You must compress the sequence into a single predictor:

**Option I (always valid): random iterate**
- sample $\bar t \sim \mathrm{Unif}(\{1,\dots,T\})$
- output $\bar w := w_{\bar t}$

**Option II (needs convexity): average iterate**
- output $\bar w := \frac{1}{T}\sum_{t=1}^T w_t$

Why these work: they turn a guarantee on the *average online performance* into a guarantee for a single predictor.

##### Step 4 — the key link: online regret ⇒ statistical excess risk
Online regret on the constructed losses:
- $R_T := \sum_{t=1}^T f_t(w_t) - \min_{w\in\Omega}\sum_{t=1}^T f_t(w)$  
  $= \sum_{t=1}^T \ell(w_t;z_t) - \min_{w\in\Omega}\sum_{t=1}^T \ell(w;z_t)$

If the online algorithm satisfies $\mathbb E[R_T]\le B(T)$, then the output $\bar w$ satisfies:
- $\mathbb E[L(\bar w)] - \min_{w\in\Omega} L(w) \;\le\; \frac{B(T)}{T}$

Meaning: **no-regret** ($B(T)=o(T)$) ⇒ **vanishing excess population risk**.

##### Algorithm
![](</notes-media/transform_sl_to_ol.png>)
##### Why “one pass / fresh sample” shows up in the proof
The bridge uses:
- $\mathbb E[\ell(w_t;z_t)\mid w_t] = \mathbb E_{z\sim\mathcal D}[\ell(w_t;z)] = L(w_t)$

This requires $z_t \perp w_t$ (fresh i.i.d. sample). If you reuse points across epochs, $w_t$ can depend on $z_t$, and this identity can fail.