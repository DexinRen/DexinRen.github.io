---
title: "Online Learning Games: Protocols, Feedback and Environments"
area: "Online Learning & Bandits"
areaSlug: "online-learning"
tags: ["online_learning","machine_learning"]
order: 0
sources: ["Course/CS/CSCI 659/in_class/Lecture 1.md","Course/CS/CSCI 659/wiki/environment/Online Convex Optimization (OCO).md"]
credits: [{"text":"Based on USC CSCI 659 (Online Learning & Bandits, Spring 2026). These notes contain my own understanding and the bridging steps I added; any mistakes are mine.","courseLink":null,"lectureLinks":[]}]
---

## What “online” means
Online learning = data arrives over time. At each round $t=1,2,\dots$:
1) receive input/context (optional)  
2) make a decision/prediction  
3) observe feedback (label/loss/reward)  
4) update for the next round

You will NOT be given a pack of data (usually refers to training data in ML) before you play the game, and you have to improve your action in game while playing.

General template:
- decision $w_t \in \Omega$
- incur loss $f_t(w_t)$ (or receive reward)

## Usage of online learning
there are some important usage and research result of online optimization:

1. [AdaGuard](/notes/machine-learning/gradient-based-optimizers/#134-adagrad), [ADAM](/notes/machine-learning/gradient-based-optimizers/#1310-pseudo-code-for-adam)
2. <span class="wl-missing" title="Not published yet">Regret</span> minimization
3. Multi-armed Bandits
4. Privacy-preserve ML
## Common instances of online learning
#### 1) Spam detection (online classification)
**Terms**
- email features: $x_t \in \mathbb{R}^d$
- predicted label: $\hat y_t \in \{-1,+1\}$
- true label: $y_t \in \{-1,+1\}$
- model parameters: $w_t \in \Omega$

**One common form**
- prediction: $\hat y_t = \mathrm{sign}(w_t^\top x_t)$
- example loss (mistake): $f_t(w_t)=\mathbf{1}[\hat y_t \neq y_t]$

---
#### 2) Sequential investment (universal portfolio)
**Terms**
- capital: $W_t$
- portfolio weights: $p_t \in \Delta(N)$  
- relative prices: $r_t \in \mathbb{R}^N_+$

**Simplex**
- $\Delta(N)=\{p\in\mathbb{R}^N_+:\sum_{i=1}^N p(i)=1\}$

**Wealth update**
- $W_{t+1}=W_t\langle p_t,r_t\rangle = W_t\sum_{i=1}^N p_t(i)r_t(i)$

**Tiny example**
- $p_t=(0.6,0.4)$, $r_t=(1.1,0.9)$  
- $\langle p_t,r_t\rangle=0.6\cdot1.1+0.4\cdot0.9=1.02$  
- $W_{t+1}=1.02W_t$

---

#### 3) Aggregating weather prediction (expert problem)
**Terms**
- $N$ experts/models
- expert losses revealed: $\ell_t \in [0,1]^N$
- mixture weights: $p_t \in \Delta(N)$

**Expected loss if sampling an expert**
- pick $I_t \sim p_t$
- $\mathbb{E}[\ell_t(I_t)] = \langle p_t,\ell_t\rangle$

**Tiny example**
- $\ell_t=(0.2,0.9,0.4)$, $p_t=(0.5,0,0.5)$  
- expected loss $=0.5\cdot0.2+0.5\cdot0.4=0.3$

---

#### 4) Product recommendation (multi-armed bandits)
**Terms**
- items/arms: $\{1,\dots,N\}$
- chosen arm: $a_t \in \{1,\dots,N\}$
- loss/reward only for chosen arm: observe $\ell_t(a_t)$ (not all arms)

**Key difference**
- partial feedback: you learn only from what you tried.

**Tiny example**
- show product $a_t=7$, user clicks $\Rightarrow$ reward $1$ (or loss $0$).  
- you do not know what would have happened for other products.

---

#### One-line summary
Online learning problems differ mainly by **what you observe after acting** (full labels/losses vs partial feedback) and what the **decision variable** is ($w_t$, $p_t$, or $a_t$).

## Course Game Setup & Focus
#### Game environments:
In this class we generally use [Online Convex Optimization (OCO)](/notes/online-learning/online-learning-games/) as the basic game framework/protocol, with full information setting (first half semester) and bandit setting (second half semester) as our feedback model, and with general adversarial settings as our environment

A online algorithm/ online decision rule (this can be optimizer in ML) is an algorithm that design an update rule for $w_{t}$ such that $R_{T}$ grow sub-linearly $(R_{T}=o(T))$. And we have different standard of typical good regret rate in different environment or game. A list of frequently used cumulative regret rates per environment is shown below:

$$
\begin{array}{|l|l|l|l|}
\hline
\textbf{Setting} & \textbf{Feedback} & \textbf{Typical } R_T & \textbf{Notes} \\
\hline
\begin{array}{l}
\text{Experts (Hedge)}\\
(n\ \text{experts})
\end{array}
&
\text{all losses}
&
O(\sqrt{T\log n})
&
\text{adversarial}
\\
\hline
\begin{array}{l}
\text{OCO (convex)}\\
(\text{Lipschitz, bounded})
\end{array}
&
\text{grad/subgrad}
&
O(\sqrt{T})
&
\text{baseline}
\\
\hline
\begin{array}{l}
\text{OCO (strongly convex)}\\
/\ \text{exp-concave}
\end{array}
&
\text{grad/subgrad}
&
O(\log T)
&
\text{curvature}
\\
\hline
\begin{array}{l}
\text{Bandit (gap-free)}\\
(n\ \text{arms})
\end{array}
&
\text{chosen loss}
&
O(\sqrt{Tn})
&
\text{minimax}
\\
\hline
\begin{array}{l}
\text{Bandit (stochastic)}\\
(\text{gap-dep.})
\end{array}
&
\text{chosen loss}
&
O\!\Big(\sum_{i\neq i^*}\frac{\log T}{\Delta_i}\Big)
&
\Delta_i:\ \text{gap}
\\
\hline
\begin{array}{l}
\text{BCO}\\
(\text{bandit convex})
\end{array}
&
f_t(w_t)
&
\text{worse than }\sqrt{T}
&
\text{dim./assump.}
\\
\hline
\end{array}
$$

To demonstrate the following steps simply, we will generally discuss online learning problems under OCO (convex, Lipschitz, bounded) model (so we use $\sqrt{T}$ as a good sublinear regret rate standard), thus we have: $$R_{T}=O(\sqrt{T})$$is treated as a general measure for good online algorithm on cumulative regret.
#### Goal of the learner
minimize learner's <span class="wl-missing" title="Not published yet">regret</span>:

$$
R_{T}\overset{\text{def}}{=}\sum\limits^{T}_{t=1} f_{t}(w_{t}) - \min_{w\in\Omega} \sum\limits^{T}_{t=1} f_{t}(w)
$$

OCO is a standard and unified model (I call it Game-Protocol, which defined the a game's framework and hosting rules), before the game starts the learner will be given a fixed compact **convex** set $\Omega$, and then it will host $T$ rounds of game. In the game it follows the following rules:
1. The learner first picks a point $w_{t} \in \Omega$  
2. the environment then picks a convex loss function $f_{t}: \Omega \to \mathbb{R}$
3. the learner suffers loss $f_{t}(w_{t})$, and observe some information about $f_{t}$ 

The table below shows how OCO hosting the previous games:

$$
\left. 
\begin{array}{|c|c|c|c|} 
	\hline
	\text{problems} & \Omega & f_{t}&\text{Observations}\\\hline
	
	\begin{array}{l} \text{linear classification}\\ \text{linear regression}\end{array} & e.g. \{w: ||w||_{2}\leq 1\} &f_{t}=l((w,x_{t}), y_{t}) & \begin{array}{c}x_{t}, y_{t},\text{then }\\ \text{the entire} f_{t}\end{array}\\\hline
	
	\text{universal portfolio} & \Delta(N) & f_{t}(p) = - \ln ((p.l_{t})) &\begin{array}{c}r_{t},\text{then }\\ \text{the entire} f_{t}\end{array}\\\hline
	
	\text{the expert problem} & \Delta(N) & f_{t}(p) = (p,l_{t}) & \begin{array}{c}l_{t},\text{then }\\ \text{the entire} f_{t}\end{array}\\\hline
	
	\text{multiarmed bandit} & \Delta(K) & f_{t}(p) = (p,l_{t}) & \begin{array}{c}\text{only one}\\\text{entry of }l_t\end{array}\\\hline
	
	\begin{array}{c}\text{combinatorial}\\\text{bandit}\end{array} & \left\{\begin{array}{l}w\in[1,0]^{K}:\\\sum\limits^{K}_{i=1}w(i)=k\}\end{array}\right\}& f_{w} = (w,l_{t}) & \begin{array}{c}\text{ k entries }\\\text{of }l_t\end{array}\\\hline
	
	\text{contaxtual bandit} & \Delta(N) & \begin{array}{c} f_{t}(w)\\=\sum\limits^{N}_{j-1} w(j) l_{t}(\pi^{j}(x_{t}))\\\ \left(\begin{array}{c}\text{ * loss struct.}\\\text{on policy}\end{array}\right) \end{array} & \begin{array}{c}\text{only one}\\\text{entry of }l_t\end{array}\\\hline
\end{array} 
\right.
$$

#### Feedback model
there are three type of feedback model $f_{t}$ in OCO:
1. full-information setting: learner observes $f_t$ or just the (sub) gradient $\nabla f_{t}(w_{t})$
2. bandit setting: learner observes only $f_{t}(w_{t})$;
3. other partial information settings (this sometime will not even include the loss of selected action)

#### Type of Environment: (how loss is determined)
1. Stochastic settings: $f_{1},...,f_{T}$ are i.i.d samples of a fixed and unknown distribution
2. oblivious adversary: $f_{1},...,f_{T}$ are arbitrary, but decided before the game start (independent of the learner's actions)
3. non-oblivious/adaptive adversary: for each $t$, $f_{t}$ depends on $w_{1},...,w_{t}$