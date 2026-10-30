---
title: "Prediction with Expert Advice: Why FTL Fails and Hedge Works"
area: "Online Learning & Bandits"
areaSlug: "online-learning"
tags: ["online_learning","machine_learning"]
order: 2
sources: ["Course/CS/CSCI 659/in_class/Lecture 1.md"]
credits: [{"text":"Based on USC CSCI 659 (Online Learning & Bandits, Spring 2026). These notes contain my own understanding and the bridging steps I added; any mistakes are mine.","courseLink":null,"lectureLinks":[]}]
---

## Expert Problem (Prediction with Expert Advice) — FTL vs Hedge  

### Problem in 1 sentence
You don’t train a new model from scratch; you **combine N existing predictors (“experts”)** and want to perform almost as well as the **best single expert in hindsight**.

---

## Notation (keep namespace clean)
- $N$ = number of experts, indexed by $i \in \{1,\dots,N\}$
- $\Delta(N)=\{p\in\mathbb{R}^N_{\ge 0}:\sum_{i=1}^N p(i)=1\}$ = simplex (valid weight vectors)
- $p_t \in \Delta(N)$ = your weight (mixture) over experts at round $t$
  - $p_t(i)$ = weight on expert $i$ at round $t$
- $\ell_t \in [0,1]^N$ = **per-round loss vector**
  - $\ell_t(i)$ = loss suffered by expert $i$ on round $t$
- $L_t \in \mathbb{R}^N$ = **cumulative loss vector** up to round $t$
  - $L_t(i) := \sum_{s=1}^t \ell_s(i)$
  - (So $L_{t-1}$ means “cumulative loss before round $t$”.)
- $\eta>0$ = learning rate (how aggressively weights move)

Your round-$t$ loss (full-information setting):

$$
\text{loss}_t = \langle p_t,\ell_t\rangle = \sum_{i=1}^N p_t(i)\,\ell_t(i)
$$

Regret vs best single expert:

$$
R_T=\sum_{t=1}^T \langle p_t,\ell_t\rangle - \min_{i\in[N]} \sum_{t=1}^T \ell_t(i)
$$

---

## Fish vs NOAA example (why we need Hedge)
Experts:
- Expert F = “magic gold fish” (actually very accurate)
- Expert N = NOAA (you initially trust it too much)

Initial weights (biased prior):
- $p_1(F)=0.01$, $p_1(N)=0.99$

Even if fish is “god-level”, it can be unlucky early:
- Day 1: fish wrong (loss $1$), NOAA correct (loss $0$)
- So $\ell_1(F)=1$, $\ell_1(N)=0$
- Cumulative: $L_1(F)=1$, $L_1(N)=0$

A good algorithm must still be able to **recover** from bad priors if fish keeps winning later.

---

## FTL (Follow-The-Leader) — what it does and why it fails
**FTL rule (expert setting):**
- pick the expert with smallest cumulative loss so far:

$$
i_t \in \arg\min_i L_{t-1}(i), \quad p_t = e_{i_t}\ (\text{all weight on one expert})
$$

**Why it can be bad:** if losses alternate, the “current leader” flips each round.
FTL chases yesterday’s winner and can get **linear regret** (keeps picking the one that will be wrong next).

FTL also “collapses” weights immediately (one expert gets weight 1, others 0), which is unstable under adversarial/alternating sequences.

---

## Hedge (Exponential Weights / Multiplicative Weights)
Hedge is the “soft” version of following the leader.

### Definition (cumulative-loss form)

$$
p_t(i) \propto \exp\big(-\eta\,L_{t-1}(i)\big)
\quad\Longleftrightarrow\quad
p_t(i)=\frac{\exp(-\eta L_{t-1}(i))}{\sum_{j=1}^N \exp(-\eta L_{t-1}(j))}
$$

### Equivalent update (one-step multiplicative form)
After observing $\ell_t$:

$$
p_{t+1}(i)\propto p_t(i)\cdot \exp\big(-\eta\,\ell_t(i)\big)
$$

### What this fixes (relative to your fish story)
- Hedge **does use the current weights** $p_t$ (so your prior bias matters),
- but it keeps reweighting by losses, so **consistent performance beats a bad prior**.
- Weight ratios evolve as:

$$
\frac{p_t(F)}{p_t(N)}=
\frac{p_1(F)}{p_1(N)}\cdot
\exp\Big(-\eta\big(L_{t-1}(F)-L_{t-1}(N)\big)\Big)
$$

If fish keeps having smaller cumulative loss than NOAA, that exponential term will eventually overwhelm the $0.01/0.99$ handicap.

---

## Hedge guarantee (statement only; no proof)
If $\ell_t(i)\in[0,1]$, then with $\eta=\sqrt{\frac{\ln N}{T}}$:

$$
R_T = O(\sqrt{T\ln N})
$$

Minimax lower bound is $\Omega(\sqrt{T\ln N})$, so this rate is essentially optimal.

---

## One-line memory hook
FTL = hard “winner-takes-all” on current best past expert → can chase & fail.  
Hedge = soft exponential weighting by **cumulative loss** → stable + optimal regret rate.