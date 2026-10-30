---
title: "Statistical Learning: Competing with a Reference Class"
area: "Statistical Learning Theory"
areaSlug: "learning-theory"
tags: ["learning_theory"]
order: 0
sources: ["Course/CS/CSCI 678/Lecture 1 - Statistical Learning and Online Learning.md"]
credits: [{"text":"Based on Prof. Haipeng Luo's CSCI 678 (Theoretical Machine Learning, USC, Fall 2026). Thank you to Prof. Luo for an excellent course. These notes contain my own understanding and the bridging steps I added to make the lectures easier to follow; any mistakes are mine.","courseLink":"https://haipeng-luo.net/courses/CSCI678/2026_fall/schedule.html","lectureLinks":[{"label":"Lecture 1 (PDF)","url":"https://haipeng-luo.net/courses/CSCI678/2026_fall/lectures/lecture1.pdf"}]}]
---

## From Supervised Learning to Statistical Learning
We start from the usual supervised-learning problem:
- observe training examples $(x_1,y_1),\ldots,(x_n,y_n)$;
- use them to construct a predictor $\hat y:X\to Y$;
- hope $\hat y$ predicts well on future samples.
Assume:

$$
(x_1,y_1),\ldots,(x_n,y_n)
\overset{i.i.d.}{\sim}\mathbb P
$$

where $\mathbb P$ is an unknown distribution over $X\times Y$.
The predictor belongs to $Y^X$, the set of all mappings $X\to Y$.
Given loss $\ell:Y^X\times(X\times Y)\to\mathbb R$, examples:

$$
\left.
\begin{array}{lll}
\text{binary classification}
&\ell(\hat y,(x,y))
=\mathbb I\{\hat y(x)\neq y\}
&Y=\{-1,+1\}\\
\text{regression}
&\ell(\hat y,(x,y))
=\frac12(\hat y(x)-y)^2
&Y\subseteq\mathbb R
\end{array}
\right.
$$

A finite test set gives empirical test error:

$$
\frac1m\sum_{t=1}^m
\ell(\hat y,(x'_t,y'_t))
$$

but what we actually care about is performance on a new random example:

$$
L(\hat y)
:=
\mathbb E_{(x,y)\sim\mathbb P}
[\ell(\hat y,(x,y))]
$$

This is the **population risk**.
Now we have the first problem:
**$\mathbb P$ is unknown, so how can we know which predictor has the smallest population risk?**
Classical statistics often answers this by assuming a specific structure for $\mathbb P$.
Statistical learning takes a different approach: instead of strongly modeling $\mathbb P$, choose a **reference class** $F\subseteq Y^X$ and compare the learner with the best predictor available in $F$.
Thus the target becomes:

$$
L(\hat y)-\inf_{f\in F}L(f)
$$

called the **excess risk**.

So we are no longer asking: Can we predict perfectly?
We ask: Can we perform almost as well as the best predictor in the reference class $F$?

This matters because even the best $f\in F$ may have nonzero risk due to noise, model restriction, or both.
## General Statistical Learning
At this point, notice that nothing essential requires the observation to literally be an $(x,y)$ pair.
So abstract the problem.
Let:
- $Z$ = observation space;
- $D$ = decision space;
- $z_1,\ldots,z_n\overset{i.i.d.}{\sim}\mathbb P$;
- $\ell:D\times Z\to\mathbb R$.
The learner observes $z_{1:n}$ and outputs:

$$
\hat y\in D
$$

with population risk:

$$
L(\hat y)
=
\mathbb E_{z\sim\mathbb P}[\ell(\hat y,z)]
$$

But $\hat y$ itself depends on the random training sample $z_{1:n}$.
So there are **two sources of randomness**:

$$
\mathbb E[L(\hat y)]
=
\mathbb E_{z_{1:n}\sim\mathbb P^n}
\left[
\underbrace{
\mathbb E_{z\sim\mathbb P}[\ell(\hat y,z)]
}_{L(\hat y)}
\right]
$$

The inner expectation measures performance of one learned decision on a fresh sample.
The outer expectation averages over which training set happened to generate $\hat y$.
### Reference Class
Choose $F\subseteq D$ as the benchmark.
Expected excess risk:

$$
\boxed{
\mathbb E[L(\hat y)]
-
\inf_{f\in F}L(f)
}
$$

If the learning algorithm is required to output $\hat y\in F$, it is **proper**.
If it may output $\hat y\notin F$, it is **improper**.
The reference class is only the comparator; an improper learner is allowed to beat every individual member of $F$ using a decision outside $F$.
Now the natural question is:
**what does it formally mean for $F$ to be learnable?**
## Statistical Learnability
A learning algorithm can be represented by a policy $\pi$ that maps the observed sample $z_{1:n}$ to a decision, possibly randomly.
For a fixed distribution $\mathbb P$, its expected excess risk is:

$$
\mathbb E[L(\hat y)]
-
\inf_{f\in F}L(f)
$$

But we do not know the real distribution and do not want learnability to depend on one favorable $\mathbb P$.
So consider the worst possible distribution:

$$
\sup_{\mathbb P}
\left(
\mathbb E[L(\hat y)]
-
\inf_{f\in F}L(f)
\right)
$$

Then allow the learner to choose the best possible policy:

$$
\boxed{
V^{i.i.d.}(F,n)
=
\inf_{\pi}
\sup_{\mathbb P}
\left[
\mathbb E[L(\hat y)]
-
\inf_{f\in F}L(f)
\right]
}
$$

Interpretation:

$$
\left.
\begin{array}{lll}
\inf_\pi
&\text{learner chooses the best possible learning strategy}\\
\sup_{\mathbb P}
&\text{environment chooses the hardest data distribution}\\
V^{i.i.d.}(F,n)
&\text{unavoidable worst-case excess risk with }n\text{ samples}
\end{array}
\right.
$$

So $V^{i.i.d.}(F,n)$ is essentially the **best worst-case learning curve** achievable for $F$.
Define:

$$
\boxed{
F\text{ is learnable}
\iff
\limsup_{n\to\infty}V^{i.i.d.}(F,n)=0
}
$$

Notice that $\inf_{f\in F}L(f)$ is only a theoretical benchmark.
We do **not** need to explicitly enumerate $F$ or compute this infimum during training.
The learning problem is to construct $\hat y$ whose risk approaches this benchmark.