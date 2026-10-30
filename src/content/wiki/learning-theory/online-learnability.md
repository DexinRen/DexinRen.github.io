---
title: "Online Learnability as a Minimax Game"
area: "Statistical Learning Theory"
areaSlug: "learning-theory"
tags: ["learning_theory","online_learning"]
order: 7
sources: ["Course/CS/CSCI 678/Lecture 5 - Online Learning.md"]
credits: [{"text":"Based on Prof. Haipeng Luo's CSCI 678 (Theoretical Machine Learning, USC, Fall 2026). Thank you to Prof. Luo for an excellent course. These notes contain my own understanding and the bridging steps I added to make the lectures easier to follow; any mistakes are mine.","courseLink":"https://haipeng-luo.net/courses/CSCI678/2026_fall/schedule.html","lectureLinks":[{"label":"Lecture 5 (PDF)","url":"https://haipeng-luo.net/courses/CSCI678/2026_fall/lectures/lecture5.pdf"}]}]
---

## Settings

For $t=1,\dots,n$ round of game
1. Learner picks $\hat y_t\in\mathcal{D}$, and environment picks $z_t\in Z$ simultaneously, where $\mathcal{D}$ is decision space
2. Learner suffers loss $\ell(\hat y_t,z_t)$ and observes $z_t$
   Goal: minimize the regret against some $F\subseteq\mathcal{D}$
## Online Learnability
$F\text{ is online learnable }\iff V^{seq}(F,n)\to0$, and we have the regret as:

$$
\text{Reg}(F,n)=\sum\limits_{t=1}^{n}\ell(\hat y_t,z_t)-\inf\limits_{f\in F}\sum\limits_{t=1}^{n}\ell(f,z_t)
$$

To expand the policy term, we represent the learner's decision at round $t$ by a distribution $q_t\in\Delta(\mathcal D)$. The learner chooses $q_t$ to minimize ($\inf$) the regret under the worst outcome $z_t$ chosen by the environment ($\sup$), so we have:

$$
\left.
\begin{array}{ll}
V^{i.i.d.}(F,n)
&\leq V^{seq}(F,n)
=\inf\limits_{\pi}\sup\limits_{z_{1:n}}
\mathbb{E}\left[\dfrac{\text{Reg}(F,n)}{n}\right]
\\
&=\inf\limits_{q_1\in\Delta(\mathcal{D})}\sup\limits_{z_1}
\mathbb{E}_{\hat y_1\sim q_1}\dots
\inf\limits_{q_n\in\Delta(\mathcal{D})}\sup\limits_{z_n}
\mathbb{E}_{\hat y_n\sim q_n}
\left[\dfrac{\text{Reg}(F,n)}{n}\right]
\\
&=
\left\langle\left\langle
\inf\limits_{q_t\in\Delta(\mathcal{D})}
\sup\limits_{z_t\in Z}
\mathbb{E}_{\hat y_t\sim q_t}
\right\rangle\right\rangle_{t=1}^{n}
\left[\dfrac{\text{Reg}(F,n)}{n}\right].
\end{array}
\right.
$$

We want to relax (simplify and upperbound) $V^{seq}$ following the same roadmap as $V^{i.i.d.}$. In statistical learning, our first step was to choose a policy ERM, so the natural online analogue is

$$
\text{Follow the Leader: }\qquad
\hat y_t\in\arg\min_{f\in F}\sum_{\tau=1}^{t-1}\ell(f,z_\tau).
$$

But FTL can have linear regret even for very simple problems $\Rightarrow$ instead of searching for another policy, directly relax $V^{seq}$ without constructing an algorithm.
## Minimax and Dual Game
First allow the environment to randomize. We assume the enviroment is sampling $z_{t}$ from a distribution $p_{t}$ and $p_{t}$ is a distribution in the environment action space $\Delta(Z)$, so we use $\sup\limits_{z_t\in Z}G(z_t)=\sup\limits_{p_t\in\Delta(Z)}\mathbb{E}_{z_t\sim p_t}[G(z_t)]$:

$$
\left.
\begin{array}{ll}
V^{seq}(F,n)
&=
\left\langle\left\langle
\inf\limits_{q_t\in\Delta(\mathcal{D})}
\sup\limits_{z_t\in Z}
\mathbb{E}_{\hat y_t\sim q_t}
\right\rangle\right\rangle_{t=1}^{n}
\left[\dfrac{\text{Reg}(F,n)}{n}\right]\\
&=
\left\langle\left\langle
\inf\limits_{q_t\in\Delta(\mathcal{D})}
\sup\limits_{p_t\in\Delta(Z)}
\mathbb{E}_{\substack{\hat y_t\sim q_t\\z_t\sim p_t}}
\right\rangle\right\rangle_{t=1}^{n}
\left[\dfrac{\text{Reg}(F,n)}{n}\right]
\\
&=
\left\langle\left\langle
\sup\limits_{p_t\in\Delta(Z)}
\inf\limits_{q_t\in\Delta(\mathcal{D})}
\mathbb{E}_{\substack{\hat y_t\sim q_t\\z_t\sim p_t}}
\right\rangle\right\rangle_{t=1}^{n}
\left[\dfrac{\text{Reg}(F,n)}{n}\right], \text{ minimax theorem}
\\
&=
\left\langle\left\langle
\sup\limits_{p_t\in\Delta(Z)}
\inf\limits_{\hat y_t\in\mathcal{D}}
\mathbb{E}_{z_t\sim p_t}
\right\rangle\right\rangle_{t=1}^{n}
\left[\dfrac{\text{Reg}(F,n)}{n}\right],
\text{ dual game}.
\end{array}
\right.
$$

Minimax theorem: if both player randomized $\Rightarrow \inf_{q}\sup_{p}=\sup_{p}\inf_{q}$ (swap) 
Dual game: environment picks $p_t$ first $\to$ learner knows $p_t$ and then picks $\hat y_t$ 
Since the learner knows $p_t$, its best randomized strategy $q_t$ is just putting all probability on the optimal $\hat y_t$, so learner randomization is removed. Minimax tells us that although the dual game looks easier for the learner, its value is exactly the same as the original game.

But the optimal strategy in the dual game cannot be used as a policy in the original game, since in dual game, the learner observed the opponent/env.'s decision distribution $p_{t}$ (minimax: both sides are considered to play optimally) before making the decision, but in online learning, the opponent/env. pick decision after observed player's decision.

$$
\text{dual game: }p_t\to\hat y_t,
\qquad
\text{original game: }\hat y_t\to z_t,
$$

so we preserved the game value but lost the algorithmic information. Then why do we switch to the dual game? Because its value can be relaxed into an empirical process:

## Empirical Process with Dependent Data
Since we've already used minimax to assume that the player observed the opponent's decision before making the decision, the player/learner can choose the decision that minimizing expected current loss:

$$
\inf_{\hat y\in\mathcal{D}}\mathbb{E}_{z'_{t}\sim p_{t}}[ \ell(\hat y_{t},z'_{t}) ]
$$

$$
\left. 
\begin{array}{l} 
V^{seq}(F,n)
&= \left\langle\left\langle
\sup\limits_{p_t\in\Delta(Z)}
\inf\limits_{\hat y_t\in\mathcal{D}}
\mathbb{E}_{z_t\sim p_t}
\right\rangle\right\rangle_{t=1}^{n}
\left[\dfrac{\text{Reg}(F,n)}{n}\right]\\
&\overset{\text{THM}}{\leq}
\sup\limits_{\mathbb{P}\in\Delta(Z^n)}
\underset{z_{1:n}\sim\mathbb{P}}{\mathbb{E}}
\left[
\sup_{f\in F}
\frac{1}{n}\sum_{t=1}^{n}
\left(
\underbrace{
\underset{z'_t\sim\mathbb{P}(\cdot\mid z_{1:t-1})}{\mathbb{E}}
[\ell(f,z'_t)]
}_{\substack{\text{expected loss}\\\text{conditioned on history}}}
-\ell(f,z_t)
\right)
\right]
\end{array} 
\right.
$$

This is the online analogue of the empirical process in statistical learning. Compare the two:

$$
\left.
\begin{array}{ll}
V^{i.i.d.}(F,n)
&\leq
\sup\limits_{P\in\Delta(Z)}
\mathbb{E}_{z_{1:n}\sim P^n}
\left[
\sup\limits_{f\in F}
\dfrac{1}{n}\sum\limits_{t=1}^{n}
\left(
\mathbb{E}_{z'_t\sim P}[\ell(f,z'_t)]
-\ell(f,z_t)
\right)
\right]
\\
V^{seq}(F,n)
&\leq
\sup\limits_{\mathbb{P}\in\Delta(Z^n)}
\mathbb{E}_{z_{1:n}\sim\mathbb{P}}
\left[
\sup\limits_{f\in F}
\dfrac{1}{n}\sum\limits_{t=1}^{n}
\left(
\mathbb{E}_{z'_t\sim\mathbb{P}(\cdot\mid z_{1:t-1})}
[\ell(f,z'_t)]
-\ell(f,z_t)
\right)
\right].
\end{array}
\right.
$$

$$
\left.
\begin{array}{lll}
\text{i.i.d.}:P^{n}, z_{t}\sim P,\ \text{fixed distribution, independent samples}
\\
\text{online}
:\mathbb{P}\in\Delta(Z^n), z_t\sim\mathbb{P}(\cdot\mid z_{1:t-1})
,\ \text{arbitrary dep. on previous outcomes}.
\end{array}
\right.
$$

If $\mathbb{P}=P^n$, then $\mathbb{P}(\cdot\mid z_{1:t-1})=P$, so the online empirical process reduces exactly to the i.i.d. empirical process. Therefore i.i.d. is a special case of online learning, which corresponds to $V^{i.i.d.}(F,n)\leq V^{seq}(F,n)$.

For fixed $f$, although $z_t$ is dependent on $z_{1:t-1}$,

$$
\mathbb{E}
\left[
\mathbb{E}_{z'_t\sim\mathbb{P}(\cdot\mid z_{1:t-1})}[\ell(f,z'_t)]
-\ell(f,z_t)
\mid z_{1:t-1}
\right]
=0,
$$

so this is still a zero-mean process conditioned on the history. The remaining problem is therefore the same type of problem as statistical learning:

$$
\left. 
\begin{array}{l} 
V^{seq}
\to
\underbrace{
\mathbb{E}\left[
\sup_{f\in F}
\frac{1}{n}\sum_{t=1}^{n}
\left(
\mathbb{E}[\ell(f,z'_t)\mid z_{1:t-1}]
-\ell(f,z_t)
\right)
\right]
}_{\text{empirical process with dependent data}}
\\\to
\boxed{\text{how do we symmetrize it?}}
\end{array} 
\right.
$$

## Proof
#### n=2

$$
\begin{aligned}
V^{seq}_2
&\leq
\frac12
\sup\limits_{P\in\Delta(Z^2)}
\mathop{\mathbb E}\limits_{\substack{z_1\sim P\\z_2\sim P(\cdot\mid z_1)}}
\sup\limits_{f\in F}
\left[
\mathop{\mathbb E}\limits_{z_1'\sim P}\ell(f,z_1')
-\ell(f,z_1)
+
\mathop{\mathbb E}\limits_{z_2'\sim P(\cdot\mid z_1)}\ell(f,z_2')
-\ell(f,z_2)
\right]
\\[-1mm]
&\quad\textcolor{red}{\uparrow\ \text{dependent empirical process}}
\\[2mm]
&\leq
\frac12
\sup\limits_{P\in\Delta(Z^2)}
\mathop{\mathbb E}\limits_{\substack{
z_1,z_1'\sim P\\
z_2,z_2'\sim P(\cdot\mid z_1)
}}
\sup\limits_{f\in F}
\left[
\ell(f,z_1')-\ell(f,z_1)
+\ell(f,z_2')-\ell(f,z_2)
\right]
\\[-1mm]
&\quad\textcolor{red}{\uparrow\ \text{pull ghost-sample expectations outside }\sup_f}
\\[2mm]
&=
\frac12
\sup\limits_{P\in\Delta(Z^2)}
\mathop{\mathbb E}\limits_{\substack{
z_1,z_1'\sim P\\
z_2,z_2'\sim P(\cdot\mid z_1)
}}
\mathop{\mathbb E}\limits_{\epsilon_2}
\sup\limits_{f\in F}
\left[
\ell(f,z_1')-\ell(f,z_1)
+\epsilon_2\bigl(\ell(f,z_2')-\ell(f,z_2)\bigr)
\right]
\\[-1mm]
&\quad\textcolor{red}{\uparrow\ z_2,z_2'\text{ are symmetric conditioned on }z_1}
\\[2mm]
&\leq
\frac12
\sup\limits_{P\in\Delta(Z^2)}
\mathop{\mathbb E}\limits_{z_1,z_1'\sim P}
\sup\limits_{z_2,z_2'}
\mathop{\mathbb E}\limits_{\epsilon_2}
\sup\limits_{f\in F}
\left[
\ell(f,z_1')-\ell(f,z_1)
+\epsilon_2\bigl(\ell(f,z_2')-\ell(f,z_2)\bigr)
\right]
\\[-1mm]
&\quad\textcolor{red}{\uparrow\ \text{replace the dependent future draw by its worst case}}
\\[2mm]
&=
\frac12
\sup\limits_{P\in\Delta(Z^2)}
\mathop{\mathbb E}\limits_{z_1,z_1'\sim P}
\mathop{\mathbb E}\limits_{\epsilon_1}
\sup\limits_{z_2,z_2'}
\mathop{\mathbb E}\limits_{\epsilon_2}
\sup\limits_{f\in F}
\left[
\epsilon_1\bigl(\ell(f,z_1')-\ell(f,z_1)\bigr)
+\epsilon_2\bigl(\ell(f,z_2')-\ell(f,z_2)\bigr)
\right]
\\[-1mm]
&\quad\textcolor{red}{\uparrow\ \text{now }z_1,z_1'\text{ are symmetric}}
\\[2mm]
&\leq
\frac12
\sup\limits_{z_1,z_1'}
\mathop{\mathbb E}\limits_{\epsilon_1}
\sup\limits_{z_2,z_2'}
\mathop{\mathbb E}\limits_{\epsilon_2}
\sup\limits_{f\in F}
\left[
\epsilon_1\bigl(\ell(f,z_1')-\ell(f,z_1)\bigr)
+\epsilon_2\bigl(\ell(f,z_2')-\ell(f,z_2)\bigr)
\right]
\\[-1mm]
&\quad\textcolor{red}{\uparrow\ \text{replace the remaining expectation by the worst case}}
\\[2mm]
&\leq
\frac12
\sup\limits_{z_1'}
\mathop{\mathbb E}\limits_{\epsilon_1}
\sup\limits_{z_2'}
\mathop{\mathbb E}\limits_{\epsilon_2}
\sup\limits_{f\in F}
\left[
\epsilon_1\ell(f,z_1')
+\epsilon_2\ell(f,z_2')
\right]
\\
&\qquad+
\frac12
\sup\limits_{z_1}
\mathop{\mathbb E}\limits_{\epsilon_1}
\sup\limits_{z_2}
\mathop{\mathbb E}\limits_{\epsilon_2}
\sup\limits_{f\in F}
\left[
-\epsilon_1\ell(f,z_1)
-\epsilon_2\ell(f,z_2)
\right]
\\[-1mm]
&\quad\textcolor{red}{\uparrow\ \sup_f(A_f+B_f)\leq\sup_fA_f+\sup_fB_f}
\\[2mm]
&=
\sup\limits_{\mathbf z}
\mathop{\mathbb E}\limits_{\epsilon_{1:2}}
\sup\limits_{f\in F}
\sum\limits_{t=1}^{2}
\epsilon_t\ell\!\left(f,z_t(\epsilon_{1:t-1})\right)
\\[-1mm]
&\quad\textcolor{red}{\uparrow\ -\epsilon\overset{d}{=}\epsilon;\ \text{nested }\sup_{z_t}\text{ gives the tree}}
\\[2mm]
&=
2R^{seq}(\ell(F)).
\end{aligned}
$$
