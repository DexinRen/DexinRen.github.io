---
title: "SCRiBLe: Bandit Optimization with Self-Concordant Barriers"
area: "Online Learning & Bandits"
areaSlug: "online-learning"
tags: ["online_learning","bandits"]
order: 4
sources: ["Course/CS/CSCI 659/wiki/Algorithm/SCRiBLe - Self-Concordant Regularization in Bandit Learning.md"]
credits: [{"text":"Based on USC CSCI 659 (Online Learning & Bandits, Spring 2026). These notes contain my own understanding and the bridging steps I added; any mistakes are mine.","courseLink":null,"lectureLinks":[]}]
---

## 1. Game Setup
We study adversarial **Bandit Linear Optimization (BLO)** over a compact convex domain $\Omega\subseteq\mathbb{R}^d$. At each round, the learner chooses a point in $\Omega$, while the environment chooses a linear loss vector $\ell_t\in\mathbb{R}^d$. The loss of any action $w\in\Omega$ is

$$
f_t(w)=\langle w,\ell_t\rangle.
$$

The learner only observes the scalar loss of the played point, not the full vector $\ell_t$. The regret benchmark is

$$
\mathbb{E}[R_T]
=
\mathbb{E}\left[\sum_{t=1}^T \langle \tilde w_t,\ell_t\rangle\right]
-
\min_{w\in\Omega}\sum_{t=1}^T \langle w,\ell_t\rangle.
$$

## 2. Core Idea of SCRiBLe
Instead of maintaining a huge distribution over actions, SCRiBLe maintains one interior **center** $w_t$, explores locally around it, reconstructs an estimated full loss vector, then updates the next center using FTRL.

So:

$$
\text{center } w_t
\to
\text{perturb to } \tilde w_t
\to
\text{observe scalar loss}
\to
\hat\ell_t
\to
w_{t+1}.
$$

## 3. Barrier Geometry
Choose a self-concordant barrier $\psi$ on $\Omega$. Define the local Hessian at the center:

$$
H_t=\nabla^2\psi(w_t).
$$

This Hessian comes from the barrier function, not from the set itself. It describes local geometry near $w_t$.

- large curvature direction = dangerous / near boundary  
- small curvature direction = safer / more room to move

The Dikin ellipsoid

$$
\{z:\|z-w_t\|_{H_t}\le 1\}
$$

is guaranteed to stay inside $\Omega$.

## 4. SCRiBLe Algorithm (Round $t$)

### Step 1. Compute barrier Hessian

$$
H_t=\nabla^2\psi(w_t).
$$

### Step 2. Sample random direction
Sample uniformly from the unit sphere:

$$
s_t\sim \mathrm{Unif}(S^d).
$$

### Step 3. Play perturbed point

$$
\tilde w_t = w_t + H_t^{-1/2}s_t.
$$

Interpretation:

- $w_t$ = internal exploit center  
- $\tilde w_t-w_t$ = exploration part

The matrix $H_t^{-1/2}$ stretches or shrinks the sampled direction so exploration matches the local geometry.
### Step 4. Observe scalar loss

$$
\tilde w_t^\top \ell_t.
$$

Only one number is observed.

### Step 5. Construct surrogate loss estimator

$$
\hat\ell_t
=
d\,H_t^{1/2}s_t(\tilde w_t^\top \ell_t).
$$

This is a **vector** in $\mathbb{R}^d$, not a scalar.
- $\tilde w_t^\top \ell_t$: observed scalar loss gives magnitude  
- $s_t$ gives sampled direction  
- $H_t^{1/2}$ maps information back toward center coordinates  
- $d$ corrects normalization since random sphere directions average to $I/d$
So this reconstructs an estimated full loss vector.
Also:

$$
\mathbb{E}[\hat\ell_t]=\ell_t.
$$

### Step 6. Choose next center
Use FTRL with cumulative estimated losses:

$$
w_{t+1}
=
\arg\min_{w\in\Omega}
\left\langle w,\sum_{s\le t}\hat\ell_s\right\rangle
+
\frac{1}{\eta}\psi(w).
$$

So the next center is chosen from all past reconstructed vectors.

## 5. Why $H^{-1/2}$ then $H^{1/2}$?
This is the geometric pair:

- $H_t^{-1/2}$ sends a unit random direction outward into feasible local space
- $H_t^{1/2}$ reverses that scaling when reconstructing the loss vector

So:

- go out with $H^{-1/2}$
- come back with $H^{1/2}$

## 6. Proved Regret Bound
If $\psi$ is a $\nu$-self-concordant barrier and

$$
\eta=
\min\left\{
\frac{1}{2d},
\sqrt{\frac{\nu\ln T}{Td^2}}
\right\},
$$

then

$$
\mathbb{E}[R_T]
=
O\left(
d\sqrt{\nu T\ln T}
+
d\nu\ln T
\right).
$$

For general convex sets, one can take $\nu=O(d)$, giving

$$
\widetilde O(d^{3/2}\sqrt T).
$$

## 7. Memory Hook
SCRiBLe chooses a smart center, probes nearby using barrier geometry, converts one scalar observation into a vector estimate, then recenters.