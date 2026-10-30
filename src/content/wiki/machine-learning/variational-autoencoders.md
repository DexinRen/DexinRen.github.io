---
title: "Variational Autoencoders: Deriving the ELBO"
area: "Machine Learning & Generative Models"
areaSlug: "machine-learning"
tags: ["AI","probablistic_model","statistics"]
order: 0
sources: ["Wiki/AI Wiki/Basics/VAE.md"]
credits: []
---

Suppose we are given a set of data $x$, and our target is to generate more data that looks very similar to the pattern of given $x$

We assume there is a latent variable $z$ such that:

$$
z\to x
$$

And what we want is to construct a network to fit $p(x|z)$, such that for any random state $z$, we can construct a $x$ that fit the pattern of given $\{x\}$ 

According to Bayesian Formula and basic probability theory

$$
\left. 
\begin{array}{l} 
p(x|z) = \frac{p(z|x)p(z)}{p(x)}\\
p(x) = \int p(x|z)p(z)\ dz
\end{array} 
\right.
$$

Clearly, we only got $p_\text{data}(x)$, and have no idea about and no way to get $$p_\text{true}(x|z),\ p_\text{true}(z|x),\ p_\text{true}(z)$$
 Thus we need to build a completely fake latent variable $z'$, decoder network $p_{\theta}(x|z')$ and encoder network $q_{\phi}(z'|x)$. And the optimized networks should produce  $p_{\theta}(x)$ as close as $p_\text{data}(x)$  

Thus we totally ignore the true latent variable and create a dummy latent $\to$ data relation. We first define our fake latent as:

$$
p(z')=\mathcal{N}(0,I)
$$

Then create two dummy posterior probability network ($\phi, \theta$ are network weight, initialize them randomly): 

$$
\left. 
\begin{array}{l} 
\text{encoder}:
&q_{\phi}(z|x) \sim \mathcal{N}(z; \mu_{\phi}(x),\Sigma_{\phi}(x))\\
\text{decoder}:
&p_{\theta}(x|z) \sim \mathcal{N}(\mu_{\theta}(z),\Sigma_{\theta}(z))
\end{array} 
\right.
$$

Both network does not emit $x$ or $z'$ directly, they will be used to calculate the mean and var of a normal distribution. Thus we have:

$$
\left. 
\begin{array}{rcl} 
x_{1}\xrightarrow{\text{input}}
&q_{\phi}(x) &\to&\quad\mu_{\phi}(x_{1}),\ \Sigma_{\phi}(x_{1})\\
&&&\quad\quad\quad\quad\downarrow\\
&z'\ &\sim& \mathcal{N}(\mu_{\phi}(x_{1}),\ \Sigma_{\phi}(x_{1}))\\
&\downarrow\ \\
&p_{\theta}(z')&\to&\quad\mu_{\theta}(z'),\ \Sigma_{\theta}(z')\\
&&&\quad\quad\quad\quad\downarrow\\
x_{2}\xleftarrow{\text{output}}&x_{2}\quad&\sim&\mathcal{N}(\mu_{\theta}(z'),\ \Sigma_{\theta}(z'))\\
\end{array} 
\right.
$$

Our target is to let the $x_{1}=x_{2}$, and the output distribution $p_{\theta}(x) = p_\text{data}(x)$
We update two network towards the direction that maximize ELBO:

$$
\log p_{\theta}(x)\geq \mathbb{E}_{q_{\phi}(z|x)}\biggr[\log p_{\theta}(x|z)\biggr] - D_{KL}(q_{\phi}(z|x)\ \|\ p(z))
$$

Notice that in the ELBO, all $x$ refers to the input $x$, which means that in the training stage, the decoder should not grab a $x_{2}$ with calculated $\mu_{\theta}(z'),\ \Sigma_{\theta}(z')$, it should just use the probability of sample input $x$ from $\mu_{\theta}(z'),\ \Sigma_{\theta}(z')$ and use it in the loss function

$\mathbb{E}_{q_\phi(z|x)}[ \log p_\theta(x|z) ]$ in the ELBO will be maximized, which means that for each input $x$,  $q_{\phi}(z'|x)\log p_{\theta}(x|z')$ should be maximized, which means that the loss will force to increase the probability of input = output. And it will also minimize $D_{KL}(q_{\phi}(z'|x)\|p(z'))$ which is equivalent to the distance between $q_{\phi}(z'|x)$, and $p(z')$. This decreases the dependence between  $q_{\phi}(z'|x),\ \ p(z')$,