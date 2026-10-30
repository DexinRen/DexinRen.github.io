---
title: "Bounding ERM: Symmetrization, Rademacher Complexity and Finite Classes"
area: "Statistical Learning Theory"
areaSlug: "learning-theory"
tags: ["learning_theory","complexity_measures"]
order: 2
sources: ["Course/CS/CSCI 678/self_note/Lecture 2.md"]
credits: [{"text":"Based on Prof. Haipeng Luo's CSCI 678 (Theoretical Machine Learning, USC, Fall 2026). Thank you to Prof. Luo for an excellent course. These notes contain my own understanding and the bridging steps I added to make the lectures easier to follow; any mistakes are mine.","courseLink":"https://haipeng-luo.net/courses/CSCI678/2026_fall/schedule.html","lectureLinks":[{"label":"Lecture 2 (PDF)","url":"https://haipeng-luo.net/courses/CSCI678/2026_fall/lectures/lecture2.pdf"}]}]
---

## Objectives
How do we measure the model's learnability? 

Given a predictor $\hat y$, and a function class $\mathcal{F}$, we want to know the scale or magnitude of the expected difference between loss of $\hat y$ and loss of $f$ where $f$ is the best function in $\mathcal{F}$ on the true distribution (not on the $n$ observations). And we assume the probability distribution of sampling observations tend to maximize such loss difference and our predictor selection policy tend to minimize the loss difference. Thus we have:

$$
\mathcal{V}^{iid}(\mathcal{F},n) =\inf_{\pi}\sup_{\mathcal{P}}(\mathbb{E}[ L(\hat y)] -\inf_{f\in\mathcal{F}} L(f) )
$$

Then here is the question: how do we simplify and upper bound this?

## Upperbounding Steps
#### Step 1: Choose an analyzable policy $\pi=ERM$ 
if we choose Empirical Risk Minimizer (ERM) to select our predictor from $\mathcal{F}$, we have:

$$
\hat y_{ERM}\in \arg\min_{f\in\mathcal{F}} \frac{1}{n}\sum\limits^{n}_{t=1}\ell(f,z_{t})
$$

We can use this to cancel the infimum. Use $f^{*}=\arg\min_{f\in\mathcal{F}} L(f)$. Since ERM itself is choosing the predictor with smallest loss, and such loss is bigger than its infimum:

$$
\left. 
\begin{array}{l} 
\mathcal{V}^{iid}(\mathcal{F},n)
&\leq \sup\limits_\mathcal{P}(\mathbb{E}[ L(\hat y_{ERM})] -L(f^{*}) )\\
&= \sup\limits_\mathcal{P}\mathbb{E}\left[ L(\hat y_{ERM}) - \frac{1}{n}\sum\limits^{n}_{t=1}\ell(f^{*},z_{t})\right],(\text{by definition of L})\\
&\leq \sup\limits_\mathcal{P}\mathbb{E}\left[ L(\hat y_{ERM}) - \frac{1}{n}\sum\limits^{n}_{t=1}\ell(\hat y_{ERM},z_{t})\right],(\text{by definition of }\hat y_{ERM})\\
&\leq \sup\limits_\mathcal{P}\mathbb{E}\left[\sup\limits_{f\in\mathcal{F}} \left(L(f) - \frac{1}{n}\sum\limits^{n}_{t=1}\ell( f,z_{t})\right)\right]\\
&= \sup\limits_\mathcal{P}q, q=\mathbb{E}\left[\sup\limits_{f\in\mathcal{F}} \left(L(f) - \frac{1}{n}\sum\limits^{n}_{t=1}\ell( f,z_{t})\right)\right]
\end{array} 
\right.
$$

Here the random variable $L(f) - \frac{1}{n}\sum\limits^{n}_{t=1}\ell( f,z_{t})$ indexed by $f$ is called **empirical process**. It measures the gap between loss on the true distribution and the loss on sampled points. And clearly this is zero mean and when $n$ is large enough this would be small.

#### Step 2: Symmetrization & Rademacher Complexity
Since we cannot know the loss on distribution, we need to find another way to simplify/substitute it.

Sample pseudo sample $z'_{1:n}\overset{iid}{\sim}\mathcal{P}$, clearly $\mathop{\mathbb{E}}\limits_{z'_{1:n}\sim\mathcal{P}}[ \frac{1}{n}\sum\limits^{n}_{t=1}\ell(f,z'_{t}) ]=L(f)$, thus we have:  

$$
\left. 
\begin{array}{l} 
q
&=\mathop{\mathbb{E}}\limits_{z_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \left(L(f) - \frac{1}{n}\sum\limits^{n}_{t=1}\ell( f,z_{t})\right)\right]\\
&= \frac{1}{n} \mathop{\mathbb{E}}\limits_{z_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \mathop{\mathbb{E}}\limits_{z'_{1:n}}\left[\sum\limits^{n}_{t=1}\ell( f,z'_{t}) - \sum\limits^{n}_{t=1}\ell( f,z_{t})\right]\right]\\
&\leq\frac{1}{n} \mathop{\mathbb{E}}\limits_{z_{1:n},z'_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \left(\sum\limits^{n}_{t=1}\ell( f,z'_{t}) - \sum\limits^{n}_{t=1}\ell( f,z_{t})\right)\right]\\
&=\frac{1}{n} \mathop{\mathbb{E}}\limits_{z_{1:n},z'_{1:n}}\left[\sup\limits_{f\in\mathcal{F}}\sum\limits^{n}_{t=1} \left(\ell( f,z'_{t}) - \ell( f,z_{t})\right)\right]\\
\end{array} 
\right.
$$

**Problems**: We can indeed continue to split this to two terms, which gives us

$$
\left. 
\begin{array}{l} \mathop{\mathbb{E}}\limits_{\substack{z_{1:n}\sim\mathcal{P}\\z'_{1:n}\sim\mathcal{P}}}\left[\sup\limits_{f\in\mathcal{F}}\sum\limits^{n}_{t=1} \left(\ell( f,z'_{t}) - \ell( f,z_{t})\right)\right]\\
\quad\quad\leq
\mathop{\mathbb{E}}\limits_{z'_{1:n}}\left[\sup\limits_{f\in\mathcal{F}}\sum\limits^{n}_{t=1} \left(\ell( f,z'_{t}) \right)\right]
+
\mathop{\mathbb{E}}\limits_{z_{1:n}}\left[\sup\limits_{f\in\mathcal{F}}\sum\limits^{n}_{t=1} \left(-\ell( f,z_{t}) \right)\right]
\end{array} 
\right.
$$

But notice that we cannot simplify this expression by canceling the negative sign on $\ell(f,z_{t})$, which means that we cannot merge these two terms. 

To further simplify this, we need to introduce **Rademacher parameter** $\epsilon_{1:n}, \epsilon_{t}\in \{-1,1\}\ \forall t, \mathbb{E}[ \epsilon ]=0$, this allow us to do **symmetrization** operation.

Since $z'_{t},z_{t}$ are all sampled independently from $\mathcal{P}$:

$$
\left. 
\begin{array}{l} 
\mathbb{E}[ \ell(f,z_{t})-\ell(f,z_{t}') ]
&=\mathbb{E}[ \ell(f,z'_{t})-\ell(f,z_{t}) ]\\
&=\mathbb{E}[ \epsilon(\ell(f,z_{t})-\ell(f,z_{t}')) ]\\
&\text{ where }\epsilon\in\{-1,1\},\mathbb{E}[ \epsilon ]=0
\end{array} 
\right.
$$

Therefore we have:

$$
\left. 
\begin{array}{l} 
q
&\leq\frac{1}{n} \mathop{\mathbb{E}}\limits_{z_{1:n},z'_{1:n}}\left[\sup\limits_{f\in\mathcal{F}}\sum\limits^{n}_{t=1} \left(\ell( f,z'_{t}) - \ell( f,z_{t})\right)\right]\\
&=\frac{1}{n} \mathop{\mathbb{E}}\limits_{z_{1:n},z'_{1:n},\epsilon_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1}\epsilon_{t}(\ell( f,z'_{t}) - \ell( f,z_{t}))\right],(\text{apply }\epsilon_{t})\\
&\leq \frac{1}{n} (\mathop{\mathbb{E}}\limits_{z'_{1:n},\epsilon_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1}\epsilon_{t}\ell( f,z'_{t})\right]+\mathop{\mathbb{E}}\limits_{z_{1:n},\epsilon_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1}-\epsilon_{t}\ell( f,z_{t})\right])\\
&=\frac{2}{n} \mathop{\mathbb{E}}\limits_{z_{1:n},\epsilon_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1}\epsilon_{t}\ell( f,z_{t})\right],(\text{symmetrization: }\left\{\substack{-\epsilon_{t}\overset{d}{\equiv}\epsilon_{t}\\\\ z_{t}\overset{d}{\equiv}z'_{t}}\right.\ )\\
&=2\mathcal{R}^{iid}(\ell(\mathcal{F}))
\end{array} 
\right.
$$

Where $\hat{\mathcal{R}}^{iid}(\mathcal{H}; z_{1:n})= \frac{1}{n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{h\in\mathcal{H}} \sum\limits^{n}_{t=1}\epsilon_{t}h(z_{t})\right]$ as **Rademacher Complexity** 

#### Step 3: Transform $\hat{\mathcal{R}}^{iid}(\ell(\mathcal{F}); z_{1:n})\to\hat{\mathcal{R}}^{iid}(\mathcal{F}; x_{1:n})$ 
To do this we need to do case studies:
###### Case 1: Binary Classification
suppose we have a binary classification problem with $\mathcal{Y}\in\{-1,1\}$ and we use $0-1$ loss. Then under this situation we have:

$$
\left. 
\begin{array}{l} 
\hat{\mathcal{R}}^{iid}(\ell(\mathcal{F}); z_{1:n})
&= \frac{1}{n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1}\epsilon_{t}\mathbb{I}( f(x_{t})\neq y_{t})\right]\\
&= \frac{1}{n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1}\epsilon_{t} \frac{1-y_{t}f(x_{t})}{2}\right]\\
&=\frac{1}{2n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sum\limits^{n}_{t=1}\epsilon_{t}\right]
+
\frac{1}{2n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1} -\epsilon_{t}y_{t}f(x_{t})\right],(\mathbb{E}[ \epsilon ]=0)\\
&=
\frac{1}{2n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1} -\epsilon_{t}y_{t}f(x_{t})\right], (-y\epsilon_{t}\overset{\Delta}{\equiv}\epsilon_{t})\\
&=
\frac{1}{2n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1} \epsilon_{t}f(x_{t})\right]=\frac{1}{2}\hat{\mathcal{R}}^{iid}(\mathcal{F},x_{1:n})
\end{array} 
\right.
$$

And thus under binary classification problem settings, $$\mathcal{R}^{iid}(\ell(\mathcal{F}))= \frac{1}{2}\mathcal{R}^{iid}(\mathcal{F})$$
###### Case 2: Regression
Suppose we have $\mathcal{Y}\subset \mathbb{R}$ and loss $\ell(f,(x,y))=\tilde\ell(f(x),y)$ for some loss $\tilde f(y',y)$ that is $G-$Lipschiz in the first parameter (if a function $f$ is $G-$Lipschiz, we have $|f(x_{1})-f(x_{2})|\leq G|x_{1}-x_{2}|$ for any $x_{1}, x_{2}$), then we have:

$$
\left. 
\begin{array}{l} 
\hat{\mathcal{R}}^{iid}(\ell(\mathcal{F}); z_{1:n})
= \frac{1}{n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1}\epsilon_{t}\tilde \ell( f(x_{t}),y_{t})\right]\\
= \frac{1}{2n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \sum\limits^{n-1}_{t=1}\epsilon_{t}\tilde \ell( f(x_{t}),y_{t})+\tilde \ell( f(x_{n}),y_{n})\right]\\
\quad\quad+
\frac{1}{2n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{g\in\mathcal{F}} \sum\limits^{n-1}_{t=1}\epsilon_{t}\tilde \ell( g(x_{t}),y_{t})-\tilde \ell( g(x_{n}),y_{n})\right]\\
= \frac{1}{2n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{\substack{f\in\mathcal{F}\\g\in\mathcal{F}}} \sum\limits^{n-1}_{t=1}\left( \epsilon_{t}\tilde \ell( f(x_{t}),y_{t})+\epsilon_{t}\tilde \ell( g(x_{t}),y_{t})+\tilde \ell( f(x_{n}),y_{n})-\tilde \ell( g(x_{n}),y_{n})\right)\right]\\
\leq \frac{1}{2n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{\substack{f\in\mathcal{F}\\g\in\mathcal{F}}} \sum\limits^{n-1}_{t=1}\left( \epsilon_{t}\tilde \ell( f(x_{t}),y_{t})+\epsilon_{t}\tilde \ell( g(x_{t}),y_{t})+G|f(x_{n})-g(x_{n})|\right)\right]\\
\leq\frac{1}{2n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{\substack{f\in\mathcal{F}\\g\in\mathcal{F}}} \sum\limits^{n-1}_{t=1}\left( \epsilon_{t}\tilde \ell( f(x_{t}),y_{t})+\epsilon_{t}\tilde \ell( g(x_{t}),y_{t})+Gf(x_{n})-Gg(x_{n})\right)\right]\\
=\frac{1}{2n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{\substack{f\in\mathcal{F}}} \sum\limits^{n-1}_{t=1} \epsilon_{t}\tilde \ell( f(x_{t}),y_{t})+Gf(x_{n})\right]
\\
\quad\quad+
\frac{1}{2n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{\substack{g\in\mathcal{F}}} \sum\limits^{n-1}_{t=1} \epsilon_{t}\tilde \ell( g(x_{t}),y_{t})-Gg(x_{n})\right]\\
=\frac{1}{n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{\substack{f\in\mathcal{F}}} \sum\limits^{n-1}_{t=1} \epsilon_{t}\tilde \ell( f(x_{t}),y_{t})+\epsilon_{n}Gf(x_{n})\right]
\end{array} 
\right.
$$

If we repeat this for $t=n-1,...,1$ we can finally transform every $\epsilon_{t}\tilde \ell( f(x_{t}),y_{t})$ term, and have:

$$
\left. 
\begin{array}{l} 
\hat{\mathcal{R}}^{iid}(\ell(\mathcal{F}); z_{1:n})
&\leq \frac{1}{n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{\substack{f\in\mathcal{F}}} \sum\limits^{n}_{t=1}\left(\epsilon_{t}Gf(x_{t})\right)\right]\\
&=G \hat{\mathcal{R}}^{iid}(\mathcal{F}; x_{1:n})
\end{array} 
\right.
$$

And thus $\mathcal{R}^{iid}(\ell(\mathcal{F}))\leq G\mathcal{R}^{iid}(\mathcal{F})$ under this regression settings

###### Case summery:
By using these two cases, we can have:

$$
\mathcal{V}^{iid}(\mathcal{F},n)\leq\sup\limits_\mathcal{P}q\leq2 \sup\limits_\mathcal{P}\mathcal{R}^{iid}(\ell(\mathcal{F}))\leq 2G\sup\limits_\mathcal{P}\mathcal{R}^{iid}(\mathcal{F})
$$

#### Step 4: Bound $\mathcal{R}^{iid}(\mathcal{F})$
Then we need to find out the magnitude of $\mathcal{R}^{iid}(\mathcal{F})$, which lead to another case studies:

###### Case 1: Finite Function Class
suppose $\mathcal{F}$ is finite. we can rewrite the Rademacher complexity as:

$$
\left. 
\begin{array}{l} 
\hat{\mathcal{R}}^{iid}(\mathcal{F}; x_{1:n})
&=\frac{1}{n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\sup\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1}\epsilon_{t}f(z_{t})\right]\\
&=\frac{1}{n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\max\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1}\epsilon_{t}f(z_{t})\right],\ (\mathcal{F} \text{ is finite})\\
\end{array} 
\right.
$$

Then we can define a random variable for each $f\in\mathcal{F}$:

$$
U_{f}=\sum\limits_{t=1}^{n}\epsilon_{t}f(x_{t})
$$

Therefore

$$
\left. 
\begin{array}{l} 
\hat{\mathcal{R}}^{iid}(\mathcal{F}; x_{1:n})
&=\frac{1}{n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\max\limits_{f\in\mathcal{F}} \sum\limits^{n}_{t=1}\epsilon_{t}f(z_{t})\right]\\
&=\frac{1}{n}\mathop{\mathbb{E}}\limits_{\epsilon_{1:n}}\left[\max\limits_{f\in\mathcal{F}} U_{f}\right]
\end{array} 
\right.
$$

Then our problem becomes: how can we upper bound this expected maximum of a finite collection of random variables?

We can solve this using the maximal inequality for sub-Gaussian random variables: A zero mean random variable $U$ is called $\sigma$-sub-Gaussian if:

$$
\mathbb{E}[ e^{\lambda U} ]\leq e^{\frac{\sigma^{2}\lambda^{2}}{2}},\ \forall \lambda \in \mathbb{R}
$$

Then we can have:

$$
\left. 
\begin{array}{l} 
e^{\lambda \mathbb{E}[ \max_{f}U_{f} ] }
&\leq \mathbb{E}[ e^{\lambda\max_{f}U_{f}} ], (\text{Jensen})\\
&= \mathbb{E}[ \max\limits_{f}e^{\lambda U_{f}} ]\\
&\leq \mathbb{E}\left[ \sum\limits_{f\in\mathcal{F}} e^{\lambda U_{f}} \right]\\
&=\sum\limits_{f\in\mathcal{F}} \mathbb{E}[ e^{\lambda U_{f}} ]\\
&\leq |\mathcal{F}| e^\frac{\sigma^{2}\lambda^{2}}{2},(\text{sub-Gaussian}) 
\end{array} 
\right.
$$

Taking logarithms and rearranging gives us:

$$
\mathbb{E}[ \max_{f}U_{f} ]\leq \frac{\ln|\mathcal{F}|}{\lambda}+ \frac{\sigma^{2}\lambda}{2}
$$

We can optimize this bound by choosing $\lambda= \frac{\sqrt{2\ln|\mathcal{F}|}}{\sigma}$ and we can get:

$$
\mathbb{E}[ \max_{f}U_{f} ]\leq \sigma \sqrt{2\ln|\mathcal{F}|}\ \ \ \text{(maximal inequality)}
$$

If we apply this to Rademacher complexity, we can set

$$
U_{f}=\sum\limits^{n}_{t=1}\epsilon_{t}f(x_{t})
$$

And first we need to show $U_{f}$ is sub-gaussian:
Since $\epsilon$ is an independent random variable and $\mathbb{E}[ \epsilon ]=0$, $\epsilon_{t}f(x_{t})$ has zero mean and is $|f(x_{t})|$-sub-gaussian

For any $\lambda\in \mathbb{R}$, we have:

$$
\left. 
\begin{array}{l} 
\mathbb{E}[ e^{\lambda U_{f}} ]
&=\mathbb{E}[ e^{\lambda\sum\limits^{n}_{t=1}\epsilon_{t}f(x_{t})} ]\\
&=\prod\limits^{n}_{t=1}\mathbb{E}[ e^{\lambda\epsilon_{t}f(x_{t})} ]\\
&\leq \prod\limits^{n}_{t=1} e^{\frac{\lambda^{2}f(x_{t})^{2}}{2}}\\
&=\exp( \frac{\lambda^{2}}{2}\sum\limits^{n}_{t=1}f(x_{t})^{2})
\end{array} 
\right.
$$

Therefore $U_{f}$ is sub-Gaussian with parameter $\sigma_{f}= \sqrt{\sum\limits^{n}_{t=1}f(x_{t})^{2}}$ 
To make this work for every $f\in\mathcal{F}$, we need to choose

$$
\sigma = \max_{f\in\mathcal{F}}\sqrt{\sum\limits^{n}_{t=1}f(x_{t})^{2}} 
$$

Then if we apply the maximal inequality we have the **Massart's Lemma**:

$$
\hat{\mathcal{R}}^{iid}(\mathcal{F}; x_{1:n})\leq \frac{1}{n}\sqrt{2\left(\max_{f\in\mathcal{F}}\sum\limits^{n}_{t=1}f(x_{t})^{2}\right)\ln|\mathcal{F}|}
$$

If every function $f$ is bounded by $C$, then we have:

$$
\left. 
\begin{array}{l} 
\hat{\mathcal{R}}^{iid}(\mathcal{F}; x_{1:n})
&\leq \frac{1}{n}\sqrt{2\left(\max_{f\in\mathcal{F}}\sum\limits^{n}_{t=1}f(x_{t})^{2}\right)\ln|\mathcal{F}|}\\
&=C\sqrt{ \frac{2\ln|\mathcal{F}|}{n}}
\end{array} 
\right.
$$

Since this holds for any fixed inputs, it also holds after taking expectation over $x_{1:n}$, therefore we also have:

$$
\left. 
\begin{array}{l} 
\mathcal{R}^{iid}(\mathcal{F})
\leq C\sqrt{ \frac{2\ln|\mathcal{F}|}{n}}
\end{array} 
\right.
$$

Therefore, for a finite bounded class $\mathcal{F}$ under a supervised loss with contraction constant $G$ we have:

$$
\mathcal{V}^{iid}(F,n)\leq 2GC\sqrt{ \frac{2\ln|\mathcal{F}|}{n}}
$$

Therefore for fixed $|\mathcal{F}|$ (which is finite), $\mathcal{V}^{iid}(F,n)$ converge to $0$ as $n\to\infty$. Therefore **every finite bounded prediction class is learnable** in this settings