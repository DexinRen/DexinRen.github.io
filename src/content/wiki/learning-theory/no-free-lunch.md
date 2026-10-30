---
title: "PAC Learning, Density Estimation and No Free Lunch"
area: "Statistical Learning Theory"
areaSlug: "learning-theory"
tags: ["learning_theory"]
order: 1
sources: ["Course/CS/CSCI 678/Lecture 1 - Statistical Learning and Online Learning.md"]
credits: [{"text":"Based on Prof. Haipeng Luo's CSCI 678 (Theoretical Machine Learning, USC, Fall 2026). Thank you to Prof. Luo for an excellent course. These notes contain my own understanding and the bridging steps I added to make the lectures easier to follow; any mistakes are mine.","courseLink":"https://haipeng-luo.net/courses/CSCI678/2026_fall/schedule.html","lectureLinks":[{"label":"Lecture 1 (PDF)","url":"https://haipeng-luo.net/courses/CSCI678/2026_fall/lectures/lecture1.pdf"}]}]
---

## Examples of Statistical Learning
### PAC Learning
Consider binary classification:

$$
Y=\{-1,+1\},
\qquad
\ell(f,(x,y))
=
\mathbb I\{f(x)\neq y\}
$$

Traditional realizable PAC assumes:

$$
\exists f^*\in F:
\mathbb P(y=f^*(x)\mid x)=1
$$

So:

$$
L(f^*)=0
\Rightarrow
\inf_{f\in F}L(f)=0
$$

and excess risk becomes simply:

$$
L(\hat y)-0=L(\hat y)
$$

PAC asks for a high-probability guarantee:

$$
\mathbb P_{z_{1:n}}
\left(
L(\hat y)\leq\epsilon
\right)
\geq1-\delta
$$

So realizable PAC is a special case where the reference class contains a perfect predictor.
General statistical learning does **not** assume this.
### Density Estimation
Now consider a completely different problem.
Let $D$ be a class of probability density functions on $Z$ and use log loss:

$$
\ell(q,z)=-\log q(z)
$$

Then:

$$
L(q)
=
-\mathbb E_{z\sim\mathbb P}[\log q(z)]
$$

Compare two candidate densities $\hat y$ and $f$:

$$
\left.
\begin{array}{lll}
L(\hat y)-L(f)
&=
-\mathbb E_{\mathbb P}[\log\hat y(z)]
+
\mathbb E_{\mathbb P}[\log f(z)]\\
&=
\underbrace{
\mathbb E_{\mathbb P}
\left[\log\frac{\mathbb P(z)}{\hat y(z)}\right]
}_{KL(\mathbb P\|\hat y)}
-
\underbrace{
\mathbb E_{\mathbb P}
\left[\log\frac{\mathbb P(z)}{f(z)}\right]
}_{KL(\mathbb P\|f)}\\
&=
KL(\mathbb P\|\hat y)
-
KL(\mathbb P\|f)
\end{array}
\right.
$$

Thus minimizing log-loss excess risk corresponds to approximating the unknown distribution in KL divergence relative to the best density in $F$.
So supervised prediction and density estimation look different, but both fit the same statistical-learning framework:

$$
\boxed{
\text{sample}
\to
\text{decision}
\to
\text{loss}
\to
\text{compare with best }f\in F
}
$$

## Can Every Function Class Be Learned?
Now we have defined learnability.
A natural question is:
**if we have enough data, can any $F$ eventually be learned?**
Suppose binary classification with:

$$
F=Y^X
$$

the class of **all** binary functions on a continuous/infinite input space.
This seems ideal because whatever the true labeling rule is, it belongs to $F$.
But that creates another problem:
**$F$ is so expressive that the labels on unseen points can be completely unrelated to everything observed during training.**
This leads to the no-free-lunch theorem.
### No-Free-Lunch Theorem
For binary classification with $Y=\{-1,+1\}$ and 0-1 loss:

$$
\boxed{
V^{i.i.d.}(Y^X,n)
\geq
\frac14,
\qquad
\forall n
}
$$

So even with more and more data:

$$
V^{i.i.d.}(Y^X,n)
\nrightarrow0
$$

and therefore:

$$
Y^X\text{ is not learnable}
$$

Why?
Take only $2n$ input points.
The training sample can reveal labels for at most $n$ distinct points, so a fresh point has substantial probability of being one of the unseen points.
Since $F=Y^X$, every possible labeling of those $2n$ points is allowed.
Therefore, conditioned on seeing a new point, its label can still be completely unpredictable.
Roughly:

$$
\underbrace{\Pr(x\text{ unseen})}_{\geq1/2}
\times
\underbrace{\Pr(\text{wrong label}\mid x\text{ unseen})}_{1/2}
\geq
\frac14
$$

This explains why we need a restricted reference class:

$$
\boxed{
\text{learning requires assumptions somewhere}
}
$$

Instead of assuming a precise form of $\mathbb P$, statistical learning restricts $F$.
The next lectures will ask:
**what properties of $F$ make learning possible?**
### Proof: No-Free-Lunch Theorem
Take any $2n$ distinct points:

$$
X'=\{x_1,\ldots,x_{2n}\}\subseteq X
$$

and let $Q$ be uniform over $X'$.
Consider all binary labelings:

$$
\mathcal F'
=
\{f:X'\to\{-1,+1\}\},
\qquad
|\mathcal F'|=2^{2n}
$$

For each $f\in\mathcal F'$, define:

$$
\mathbb P_f(x,y)
=
\frac1{2n}
\mathbb I\{x\in X',\ y=f(x)\}
$$

Since $F=Y^X$, the labeling function $f$ itself belongs to $F$, so:

$$
\inf_{g\in F}L_{\mathbb P_f}(g)=0
$$

Thus excess risk under $\mathbb P_f$ is simply:

$$
\mathbb E_{S\sim\mathbb P_f^n}
\mathbb E_{x\sim Q}
\left[
\mathbb I\{
\hat y(x;S)\neq f(x)
\}
\right]
$$

Instead of choosing the hardest $f$ directly, average over a uniformly random labeling $f$:

$$
\sup_f\operatorname{ExcessRisk}(f)
\geq
\mathbb E_f[\operatorname{ExcessRisk}(f)]
$$

Fix the unlabeled training inputs $S_X=(x_1',\ldots,x_n')$.
They contain at most $n$ distinct points out of $2n$, hence:

$$
Q(X'\setminus S_X)
\geq
\frac12
$$

For any test point $x\notin S_X$, the random label $f(x)$ has never been observed and is independent of the learner's output.
Therefore:

$$
\mathbb E_f
\left[
\mathbb I\{
\hat y(x;S)\neq f(x)
\}
\mid x\notin S_X
\right]
=
\frac12
$$

Hence:

$$
\left.
\begin{array}{lll}
\mathbb E_f[\operatorname{ExcessRisk}(f)]
&\geq
\Pr(x\notin S_X)
\cdot
\Pr(\hat y(x;S)\neq f(x)\mid x\notin S_X)\\
&\geq
\frac12\cdot\frac12\\
&=
\frac14
\end{array}
\right.
$$

This holds for every learning policy $\pi$, so:

$$
\boxed{
V^{i.i.d.}(Y^X,n)\geq\frac14
}
$$
