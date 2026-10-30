---
title: "Gaussian Mixture Models and the EM Algorithm"
area: "Probability & Statistics"
areaSlug: "probability"
tags: ["statistics","probability","probability_distribution","probablistic_model"]
order: 0
sources: ["Wiki/Statistics Wiki/Distribution/Gaussian Mixture Models (GMM).md"]
credits: []
---

The notation of this section adapt the notation of *"Pattern Recognition and Machine Learning"* (since the whole note is from the book), to switch to notation on the lecture, change $\pi$ to $\omega$
#### 2.1 Mixtures of Gaussians (Supplemental Material)
To model complex data that can be interpreted as combination of Gaussian distributions, we mimic the idea of polynomial model $p(x)=\sum\limits^{N}_{n=1}a_{n}x^{n}$, and formulate Mixture of Gaussians. Assume we have an arbitrary data point $x_{n}$, and we want to model the dataset with K Gaussian mixture with normalized parameter $(\mu_{nk}, \Sigma_{nk})$, we have:

$$
p(x_{n}) = \sum\limits^{K}_{k=1}\pi_{k}\mathcal{N}(x_{n}\mid \mu_{k},\Sigma_{k})
$$

where $\pi_{k}$ is the mixing coefficients and $\sum\limits^{K}_{k=1}\pi_{k}=1, \pi_{k}\in[0,1],\forall k$, therefore we can treat $\pi_{k}$ as the prior probability of picking the $k^\text{th}$ component, so we can re-write the whole formula as:

$$
\left.
\begin{array}{lll} 
p(x) = \sum\limits^{K}_{k=1}p(k)\ p(x|k)\\ 
\quad\quad\text{,where }p(x|k) =\mathcal{N}(x\mid \mu_{k},\Sigma_{k}), \pi_{k}= p(k)\\ 
\end{array}
\right.
$$

p.s. check *"Pattern Recognition and Machine Learning"* chapter 2.3.9 (p.110) for more details

#### 2.2 GMM Clustering
If we use GMM to model and cluster the dataset, for arbitrary data $x_{n}$, we can treat the $\gamma_{n}=\{\gamma_{nk}\}^{K}_{k=1}$ in k-mean as the vector $z_{n}$ (in which only one entries of $z_{n}$ is 1 and the other are zeros, and thus $\sum\limits z_{nk}=1$). We set $k'=\arg\max_{k} \{z_{nk}\}^{K}_{k=1}$. But we cannot observe $z_{n}$, it is a latent (hidden) variable.

Given a GMM $(\pi_{k},\mu_{k},\Sigma_{k})$, for arbitrary data point $x_{n}$ with $z_{n}$ we have:

$$
p(z_{n})=\prod\limits_{k=1}^{K}\pi_{k}^{z_{nk}} = \pi_{k'}
$$

 Since only $z_{nk'}=1$, $p(z_{n})$ is choosing $k'$-th GMM component as the model generated $x_{n}$. Vector $z_{n}$ marks which component (or cluster) $x_{n}$ get comprised.

Similarly we have:

$$
\left.
\begin{array}{rrl} 
&p(x_{n}\mid z_{nk}=1) 
&= \mathcal{N}(x_{n}\mid \mu_{k}, \Sigma_{k})\\
\Rightarrow &p(x_{n}\mid z_{n})
&= \prod\limits_{k=1}^{K}\mathcal{N}(x_{n}\mid \mu_{k}, \Sigma_{k})^{z_{nk}}\\  
&&=\mathcal{N}(x_{n}\mid \mu_{k'}, \Sigma_{k'})\\
\end{array}
\right.
$$

Thus

$$
\left.
\begin{array}{lll} 
p(x_{n}, z_{n})
&=p(z_{n})\cdot p(x_{n}\mid z_{n})\\
&=\prod\limits_{k=1}^{K}\pi_{k}^{z_{nk}}\cdot \prod\limits_{k=1}^{K}\mathcal{N}(x_{n}\mid \mu_{k}, \Sigma_{k})^{z_{nk}}\\
&= \pi_{k'}\cdot \mathcal{N}(x_{n}\mid \mu_{k'}, \Sigma_{k'}) 
\end{array}
\right.
$$

Since $z_{n}$ is latent, we cannot know its value, so we have to iterate all possible value of $z_{n}$ and $p(x_{n})=\sum\limits_{\begin{array}{c} \forall z_n\in\{1,0\}^{K}\\||z_{n}||=1\end{array}}p(x_{n},z_{n})$. Since $z_{n}$ is also one-hot (choose only one component each time), then all component will be chose exactly once when iterating all possible $z_{n}$. 

Thus the marginal distribution of x: 

$$
\left.
\begin{array}{lll} 
p(x_{n})
&=\sum\limits_{\begin{array}{c} \forall z_n\in\{1,0\}^{K}\\||z_{n}||=1\end{array}} p(z_{n})p(x_{n}\mid z_{n})\\ 
&= \sum\limits_{\begin{array}{c} \forall z_n\in\{1,0\}^{K}\\||z_{n}||=1\end{array}}\pi_{k'}\cdot \mathcal{N}(x_{n}\mid \mu_{k'}, \Sigma_{k'}) \text{, where }k'= \arg\max_{k}z_{nk}\\
&= \sum\limits^{K}_{k=1}\pi_{k}\mathcal{N}(x_{n}\mid \mu_{k},\Sigma_{k}),\text{ since all component will be chosen}\\
&\quad\quad\quad\quad\quad\quad\quad\quad\text{exactly once when iterating all possible $z_{n}$. }
\end{array}
\right.
$$

We also define another useful probability of $z_{n}$ given $x$, this is also known as **responsibility** $\gamma(z_{nk})=p(z_{nk}=1\mid x_{n})$:

$$
\left.
\begin{array}{lll} 
\gamma(z_{nk})\equiv p(z_{nk}=1\mid x_{n})
&\large=\frac{p(z_{nk}=1)p(x\mid z_{nk}=1)}{\sum\limits^{K}_{j=1}p(z_{j}=1)p(x\mid z_{j}=1)}\\
&\large=\frac{\pi_{k}\mathcal{N}(x\mid \mu_{k},\Sigma_{k})}{\sum\limits^{K}_{j=1}\pi_{j}\mathcal{N}(x\mid \mu_{j},\Sigma_{j})}
\end{array}
\right.
$$

This is used to analyse how many responsibility a cluster should take towards a data point (multiple components could have responsibilities to one data point located near their boarder line), and responsibility allow us to do soft clustering, instead of forcing each point to joint one cluster

#### 2.3 Maximum Likelihood (DO NOT USE)
Given sequence of observations $\{x_{n}\}^{N}_{n=1}$, we would like to model these observations with $K$ Gaussian Mixture Model.  

Set $X=\{x^{T}_{n}\}^{N}_{n=1}\in\mathbb{R}^{N\times D},\ Z=\{z^{T}_{n}\}\in\mathbb{R}^{N\times K}$, then we have the log likelihood as:

$$
\ln p(X|\pmb\pi,\pmb\mu,\pmb\Sigma) = \sum\limits^{N}_{n=1}\ln\left( \sum\limits^{K}_{k=1}\pi_{k} \mathcal{N}(x_{n}\mid \mu_{k},\Sigma_{k})\right)
$$

##### DO NOT use this naive GMM MLE !!!!!
Recall Gaussian density function:

$$
\mathcal{N}(\pmb x\mid\pmb\mu,\pmb\Sigma)
 =\frac{1}{(2\pi)^{D/2}}\frac{1}{|\pmb\Sigma|^{1/2}}\exp(-\frac{1}{2}(\pmb x-\pmb\mu)^{T}\pmb\Sigma^{-1}(\pmb x-\pmb\mu))
$$

**IF** one Gaussian component only fit one data point, the covariance matrix of a single point $\Sigma\to 0$. And we have $\mathcal{N}(\pmb x\mid\pmb\mu,\pmb\Sigma)\to \infty$. (Singularity)

Since MLE naturally tend to tune parameters to maximize the likelihood function, it will definitely let one or more Gaussian component fit single point, so likelihood function will be maximized (infinity), causing **model collapse**

Use **EM** instead, the naive MLE is ill-posed and shall never be used.

## 3. Expectation-Maximization (EM) Algorithm
Instead of classifying each data point into exactly one cluster and falling into the singularity trap, we use **responsibility** to soften the boundary of each cluster.

Even if the center of one component is far away from a data point, it still holds a very small responsibility toward that point. Thus, for any arbitrary $k$-th component, the covariance matrix $\Sigma_{k}$ is computed as a weighted covariance between all data points and the $k$-th Gaussian center, where each data point's contribution is weighted by its responsibility $\gamma_{nk}$. As a result, $\Sigma_{k} \neq 0$, effectively dodging the singularity trap.

In this way, we only change the center and shape of the Gaussian components, and better align with theoretical Gaussian distribution (expand infinitely in all directions). Therefore, every data point influences every component to some degree, preserving stability during clustering.

#### 3.1 Setup
Given observations $\{x_{n}\}_{n=1}^{N}$ and latent variables $\{z_{n}\}_{n=1}^{N}$, with model parameters $\{\pi_{k}, \mu_{k}, \Sigma_{k}\}_{k=1}^{K}$, the **complete-data log-likelihood** (pretend $z_{n}$ are observed) is:

$$
\ln p(X,Z|\pmb\pi,\pmb\mu,\pmb\Sigma) = \sum\limits_{n=1}^{N} \sum\limits_{k=1}^{K} z_{nk} \left[ \ln \pi_{k} + \ln \mathcal{N}(x_{n}|\mu_{k},\Sigma_{k}) \right]
$$

However, $Z$ is unknown. Instead, we optimize the marginal likelihood $p(X|\pmb\pi,\pmb\mu,\pmb\Sigma)$ indirectly.

---

#### 3.2 Two Steps of EM
At each iteration $t$, we perform two steps:

##### E-step (Expectation step)
Compute the **expected value of the complete-data log-likelihood** with respect to the current posterior distribution of $Z$ given $X$ and the current parameters $(\pmb\pi^{(t)}, \pmb\mu^{(t)}, \pmb\Sigma^{(t)})$.

This is equivalent to computing the **responsibilities**:

$$
\gamma^{(t)}(z_{nk}) = p(z_{nk}=1\mid x_{n},\pmb\pi^{(t)},\pmb\mu^{(t)},\pmb\Sigma^{(t)}) = \frac{\pi^{(t)}_{k}\mathcal{N}(x_{n}\mid \mu^{(t)}_{k},\Sigma^{(t)}_{k})}{\sum\limits_{j=1}^{K}\pi^{(t)}_{j}\mathcal{N}(x_{n}\mid \mu^{(t)}_{j},\Sigma^{(t)}_{j})}
$$

##### M-step (Maximization step)
Update parameters by maximizing the expected complete-data log-likelihood computed in E-step.

The update formulas are:

$$
\left.
\begin{array}{lll}
\pi^{(t+1)}_{k} &= \frac{1}{N} \sum\limits_{n=1}^{N} \gamma^{(t)}(z_{nk}) \quad &\text{(Update mixing coefficients)}\\
\mu^{(t+1)}_{k} &= \frac{\sum\limits_{n=1}^{N} \gamma^{(t)}(z_{nk})x_{n}}{\sum\limits_{n=1}^{N} \gamma^{(t)}(z_{nk})} \quad &\text{(Update mean)}\\
\Sigma^{(t+1)}_{k} &= \frac{\sum\limits_{n=1}^{N} \gamma^{(t)}(z_{nk})(x_{n} - \mu^{(t+1)}_{k})(x_{n} - \mu^{(t+1)}_{k})^{T}}{\sum\limits_{n=1}^{N} \gamma^{(t)}(z_{nk})} \quad &\text{(Update covariance)}
\end{array}
\right.
$$

#### 3.3 EM Algorithm Pseudo-code
```pseudo
\begin{algorithm}
\caption{Expectation-Maximization for GMM}
\begin{algorithmic}
\Procedure{EM-GMM}{$\{x_{n}\}_{n=1}^{N}, K$}
    \State Initialize $\{\pi_{k}^{(0)}\}_{k=1}^{K}, \{\mu_{k}^{(0)}\}_{k=1}^{K}, \{\Sigma_{k}^{(0)}\}_{k=1}^{K}$ randomly
    \State $\mathcal{L}^{(0)} \leftarrow \sum\limits_{n=1}^{N} \ln\left( \sum\limits_{k=1}^{K} \pi_{k}^{(0)} \mathcal{N}(x_n \mid \mu_{k}^{(0)}, \Sigma_{k}^{(0)}) \right)$
	\State $t \leftarrow 0$
    \Repeat
        \State $t \leftarrow t+1$
        \State $\{\gamma^{(t)}(z_{nk})\} \leftarrow$ \Call{E-step}{$\{x_n\}, \{\pi^{(t-1)}_{k}\}, \{\mu^{(t-1)}_{k}\}, \{\Sigma^{(t-1)}_{k}\}$}
        \State $\{\pi_{k}^{(t)}\}, \{\mu_{k}^{(t)}\}, \{\Sigma_{k}^{(t)}\}\leftarrow$ \Call{M-step}{$\{x_n\}, \{\gamma^{(t)}(z_{nk})\}$}
        \State $\mathcal{L}^{(t)} \leftarrow \sum\limits_{n=1}^{N} \ln\left( \sum\limits_{k=1}^{K} \pi_{k}^{(t)} \mathcal{N}(x_n \mid \mu_{k}^{(t)}, \Sigma_{k}^{(t)}) \right)$
    \Until{convergence of parameters$(\{\pi\},\{\mu\},\{\Sigma\})$ or likelihood ($\mathcal{L}$)}
    \Return $\{\pi_{k}^{(t)}\}^{N}_{n=1}, \{\mu_{k}^{(t)}\}^{N}_{n=1}, \{\Sigma_{k}^{(t)}\}^{N}_{n=1}$
\EndProcedure

\State $ $

\Procedure{E-step}{$\{x_n\}, \{\pi_{k}\}, \{\mu_{k}\}, \{\Sigma_{k}\}$}
    \ForAll{$n=1$ to $N$}
        \ForAll{$k=1$ to $K$}
            \State $\gamma(z_{nk}) \leftarrow \frac{\pi_{k} \mathcal{N}(x_{n} \mid \mu_{k}, \Sigma_{k})}{\sum\limits_{j=1}^{K} \pi_{j} \mathcal{N}(x_{n} \mid \mu_{j}, \Sigma_{j})}$
        \EndFor
    \EndFor
    \Return $\{\gamma(z_{nk})\}$
\EndProcedure

\State $ $

\Procedure{M-step}{$\{x_n\}, \{\gamma(z_{nk})\}$}
    \ForAll{$k=1$ to $K$}
        \State $\pi_{k} \leftarrow \frac{1}{N} \sum\limits_{n=1}^{N} \gamma(z_{nk})$
        \State $\mu_{k} \leftarrow \frac{\sum\limits_{n=1}^{N} \gamma(z_{nk})x_{n}}{\sum\limits_{n=1}^{N} \gamma(z_{nk})}$
        \State $\Sigma_{k} \leftarrow \frac{\sum\limits_{n=1}^{N} \gamma(z_{nk})(x_{n} - \mu_{k})(x_{n} - \mu_{k})^{T}}{\sum\limits_{n=1}^{N} \gamma(z_{nk})}$
    \EndFor
    \Return $\{\pi_{k}\}, \{\mu_{k}\}, \{\Sigma_{k}\}$
\EndProcedure
\end{algorithmic}
\end{algorithm}
```