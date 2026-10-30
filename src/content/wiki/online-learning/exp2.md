---
title: "Exp2: Bandit Linear Optimization from One Scalar Loss"
area: "Online Learning & Bandits"
areaSlug: "online-learning"
tags: ["online_learning","bandits"]
order: 3
sources: ["Course/CS/CSCI 659/wiki/Algorithm/Exp2 – Bandit Linear Optimization (BLO).md"]
credits: [{"text":"Based on USC CSCI 659 (Online Learning & Bandits, Spring 2026). These notes contain my own understanding and the bridging steps I added; any mistakes are mine.","courseLink":null,"lectureLinks":[]}]
---

## 1. Game Setup
We study adversarial **Bandit Linear Optimization (BLO)**. The action set is a finite set

$$
A=\{a_1,a_2,\dots,a_K\}\subseteq \mathbb{R}^d
$$

and at each round the player chooses one action $a_t\in A$. The environment simultaneously chooses a linear loss vector $\ell_t\in\mathbb{R}^d$, so the loss of action $a$ is

$$
f_t(a)=\langle a,\ell_t\rangle.
$$

The player only observes the scalar loss of the played action

$$
\langle a_t,\ell_t\rangle,
$$

not the full vector $\ell_t$. The regret benchmark is the best fixed action in hindsight:

$$
\mathbb{E}[R_T]
=
\mathbb{E}\left[\sum_{t=1}^T \langle a_t,\ell_t\rangle\right]
-
\min_{a\in A}\sum_{t=1}^T \langle a,\ell_t\rangle.
$$

## 2. Game Rules
For each round $t=1,2,\dots,T$:
1. The player chooses an action $a_t\in A$.
2. Simultaneously, the environment chooses a loss vector $\ell_t$.
3. The player suffers loss $\langle a_t,\ell_t\rangle$ and observes only this scalar value.

The key structure is linearity: with suitable randomization, one observed scalar can be used to estimate the whole loss vector $\ell_t$.

## 3. Player Algorithm: Exp2
Exp2 runs exponential weights over the finite action set $A$, but instead of treating actions as unrelated bandit arms, it uses the linear structure to estimate the full loss vector. Let $p_t\in\Delta(K)$ be the action distribution at round $t$, and define the covariance matrix

$$
M_t=\sum_{a\in A} p_t(a)\, aa^\top
=
\mathbb{E}_{a\sim p_t}[aa^\top].
$$

If $a_t\sim p_t$, define the loss-vector estimator

$$
\hat{\ell}_t=M_t^{-1}a_t a_t^\top \ell_t.
$$

This is computable because $a_t^\top \ell_t=\langle a_t,\ell_t\rangle$ is exactly the observed scalar loss. The estimator is unbiased:

$$
\mathbb{E}[\hat{\ell}_t]=\ell_t.
$$

Then the estimated loss of any action $a\in A$ is

$$
\langle a,\hat{\ell}_t\rangle.
$$

So Exp2 uses these estimated linear losses inside exponential weights.

Because these estimated losses can be negative and large in magnitude, Exp2 adds explicit exploration. First compute a Hedge-type distribution

$$
p_t'(a)\propto \exp\left(-\eta\sum_{s<t}\langle a,\hat{\ell}_s\rangle\right).
$$

Then mix it with an exploration distribution $q\in\Delta(K)$:

$$
p_t=(1-\gamma)p_t'+\gamma q.
$$

The player samples

$$
a_t\sim p_t,
$$

observes $\langle a_t,\ell_t\rangle$, and constructs

$$
\hat{\ell}_t=M_t^{-1}a_t a_t^\top \ell_t,
\qquad
M_t=\sum_{a\in A} p_t(a)\, aa^\top.
$$

## 4. Proved Regret Bound
Let $\lambda_{\min}$ be the minimum eigenvalue of the covariance matrix of the exploration distribution $q$, namely of

$$
\mathbb{E}_{a\sim q}[aa^\top].
$$

Let

$$
B=\max_{a\in A}\|a\|_2.
$$

If

$$
\eta\le \frac{\gamma\lambda_{\min}}{B^2},
$$

then Exp2 ensures

$$
\mathbb{E}[R_T]
\le
\frac{\ln K}{\eta}
+
2\gamma T
+
\eta T d.
$$

With tuning

$$
\gamma=\frac{B^2\eta}{\lambda_{\min}},
$$

and

$$
\eta=
\min\left\{
\sqrt{\frac{\ln K}{(d+2B^2/\lambda_{\min})T}},
\frac{\lambda_{\min}}{B^2}
\right\},
$$

the regret becomes

$$
\mathbb{E}[R_T]
=
O\left(
\frac{B^2\ln K}{\lambda_{\min}}
+
\sqrt{\left(d+\frac{2B^2}{\lambda_{\min}}\right)T\ln K}
\right).
$$

## 5. Intuition
Exp2 is the BLO analogue of Exp3, but upgraded to exploit linear structure. Instead of estimating only the loss of the chosen action, it estimates the whole vector $\ell_t$, and then computes estimated losses for all actions through

$$
\langle a,\hat{\ell}_t\rangle.
$$

Because this estimator can be unstable, explicit exploration is added so that the covariance matrix stays well-conditioned and every direction in $\mathbb{R}^d$ is explored.