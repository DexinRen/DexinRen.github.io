---
title: "Combinatorial Decisions and Convexification"
area: "Online Learning & Bandits"
areaSlug: "online-learning"
tags: ["online_learning","bandits"]
order: 5
sources: ["Course/CS/CSCI 659/wiki/problems/Combinatorial Problems.md"]
credits: [{"text":"Based on USC CSCI 659 (Online Learning & Bandits, Spring 2026). These notes contain my own understanding and the bridging steps I added; any mistakes are mine.","courseLink":null,"lectureLinks":[]}]
---

## Basic setup

In a combinatorial online learning problem, the learner does **not** choose one atomic item directly.  
Instead, each **arm** is itself a **structured action** containing multiple base items.

Let there be $N$ restaurants. A legal action is a subset of restaurants, for example a takeout recommendation set.

We write the set of legal combinatorial actions as

$$
A=\{a_1,a_2,\dots,a_K\},
$$

where each action $a_j\in\{0,1\}^N$ is a binary indicator vector:

$$
a_j(i)=
\begin{cases}
1,& \text{if restaurant } i \text{ is included in subset } a_j,\\
0,& \text{otherwise.}
\end{cases}
$$

Thus:

- base object: restaurant $i$
- combinatorial arm: subset $a_j$
- pulling arm $a_j$: choosing that whole subset

---

## Restaurant example

Suppose there are $N=5$ restaurants, and each legal action must choose exactly $2$ restaurants.

Then possible arms can be:

$$
a_1=(1,1,0,0,0),
$$

$$
a_2=(1,0,1,0,0),
$$

$$
a_3=(0,0,1,1,0),
$$

$$
a_4=(0,1,0,0,1).
$$

Interpretation:

- $a_1$: choose restaurants $\{1,2\}$
- $a_2$: choose restaurants $\{1,3\}$
- $a_3$: choose restaurants $\{3,4\}$
- $a_4$: choose restaurants $\{2,5\}$

Each arm is one **multi-restaurant choice**, not one single restaurant.
## Randomized decision and convexification
The learner may randomize over these combinatorial arms.
Let

$$
p_t(j)
$$

be the probability of choosing arm $a_j$ at round $t$, where

$$
\sum_{j=1}^K p_t(j)=1,\qquad p_t(j)\ge 0.
$$

Then the learner's round-$t$ decision variable is

$$
w_t=\sum_{j=1}^K p_t(j)a_j.
$$

This $w_t$ is **not** one discrete subset.  
It is the **mixed decision** or **convexified action**.
## Meaning of $w_t(i)$

The $i$-th coordinate of $w_t$ is

$$
w_t(i)=\sum_{j:\,a_j(i)=1} p_t(j).
$$

So $w_t(i)$ is the total probability mass of all arms that contain restaurant $i$.

Therefore, in the restaurant example, $w_t(i)$ means:

> the marginal probability that restaurant $i$ appears in the chosen subset.

---
## Concrete numerical example
Suppose at round $t$ the learner randomizes over four subset-arms with

$$
p_t(1)=0.35,\qquad
p_t(2)=0.10,\qquad
p_t(3)=0.20,\qquad
p_t(4)=0.35.
$$

Then

$$
w_t
=
0.35\,a_1+0.10\,a_2+0.20\,a_3+0.35\,a_4.
$$

Substituting the action vectors:

$$
w_t
=
0.35(1,1,0,0,0)
+0.10(1,0,1,0,0)
+0.20(0,0,1,1,0)
+0.35(0,1,0,0,1).
$$

Coordinatewise:

$$
w_t
=
(0.45,\;0.70,\;0.30,\;0.20,\;0.35).
$$

Interpretation:
- restaurant $1$ appears with probability $0.45$
- restaurant $2$ appears with probability $0.70$
- restaurant $3$ appears with probability $0.30$
- restaurant $4$ appears with probability $0.20$
- restaurant $5$ appears with probability $0.35$
Note that

$$
0.45+0.70+0.30+0.20+0.35=2,
$$

which is correct because every legal arm chooses exactly $2$ restaurants.

In general, if every arm satisfies

$$
\|a_j\|_1=m,
$$

then the mixed decision also satisfies

$$
\|w_t\|_1=m.
$$

---
## Loss
Let the per-restaurant loss vector at round $t$ be

$$
\ell_t\in\mathbb{R}^N,
$$

where $\ell_t(i)$ is the loss of restaurant $i$.

If the learner chooses discrete arm $a_j$, the loss is

$$
\langle a_j,\ell_t\rangle.
$$

If the learner randomizes according to $p_t$, then the expected loss is

$$
\sum_{j=1}^K p_t(j)\langle a_j,\ell_t\rangle.
$$

Using

$$
w_t=\sum_{j=1}^K p_t(j)a_j,
$$

this becomes

$$
\left\langle \sum_{j=1}^K p_t(j)a_j,\ell_t\right\rangle
=
\langle w_t,\ell_t\rangle.
$$

So $w_t$ is useful because it represents the expected behavior of randomized discrete play in a convex form.

---
## Final intuition
Combinatorial online learning can be viewed as:
- each arm $a_j$ is a structured multi-item choice
- the learner randomizes over these arms
- $w_t$ is the resulting soft inclusion vector over base items
- linear loss makes optimization over $w_t$ equivalent to optimization over randomized combinatorial actions