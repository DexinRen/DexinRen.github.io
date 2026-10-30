---
title: "Score-Based Generative Modeling: From Noise Levels to SDEs"
area: "Machine Learning & Generative Models"
areaSlug: "machine-learning"
tags: ["AI","statistics","probablistic_model"]
order: 1
sources: ["Wiki/AI Wiki/Basics/SCORE-BASED.md"]
credits: []
---

## Pre-paper concepts
#### SMLD
We construct a noisy data by adding Gaussian noise with $(\mu= x, \sigma_{i})$, and we use different $\sigma_{i}$ as implicit noise level indicator, and clearly $\tilde x \sim \mathcal{N}(x, \sigma_{\min}) = x$, when $\sigma_{\min}= 0$  

$$
\mathcal{p}(\tilde x\mid x):=\mathcal{N}(\tilde{x};\ x, \sigma^{2})
$$

Then, given current noise level $\sigma_{i}$, to denoise and recover $\tilde x$ to $x$, we need to move $\tilde x$ toward the direction where $p(\tilde x \mid x)$ is increasing, which is (use log to prevent gradient explosion and overflow/ underflow):

$$
\nabla_{x_{t}} \log \mathcal{p}_{\sigma_{i}}(\tilde x\mid x)
$$

We call this probability density gradient as **score** 

We propose a model $\theta$ such that  $s_{\theta}(\tilde x \mid x)=\nabla \log \mathcal{p}_{\sigma_{i}}(\tilde x\mid x)$ , and we have:

$$
\begin{array}{rl}
\theta^{*} 
&= \arg\min_{\theta}\sum\limits^{N}_{i=1}\sigma^{2}_{i}
\underset{
\begin{array}{c}
         x\sim \mathcal{p}_\text{data}\\
         \tilde x\sim \mathcal{N}(\tilde x; x, \sigma_{i})
    \end{array}
}{\mathbb{E}} \biggl[\ \Bigl\|s_{\theta}(\tilde x,\sigma_{i})-\nabla_{\tilde x}\log \mathcal{p}_{\sigma_{i}}(\tilde x\mid x)\ \Bigl\|^{2}_{2}\biggl]
\end{array}\\
$$

Since the probability of $\tilde x$ given $x$ is a normal distribution with $\mu=x, \sigma = \sigma_{i}$, we have:

$$
\left. 
\begin{array}{l} 
\log(\mathcal{p}_{\sigma_{i}}(\tilde x\mid x))&= C\cdot (-\Bigl\|\tilde x - x\Bigl\|^{2}_{2}\ \Bigl/ \ 2\sigma_{i}^{2})\\
\underset{\bar x}{\nabla} \log(\mathcal{p}_{\sigma_{i}}(\tilde x\mid x))
&=\partial\ \log\mathcal{p}_{\sigma_{i}}(\tilde x\mid x)\ \ \ / \ \  {\partial\tilde x}= -(\tilde x - x)\ \ / \ \ \sigma_{i}^{2}
\end{array} 
\right.
$$

When the noise level is very low (smaller than 1), the term $\frac{1}{\sigma^{2}}$ will be really high and it will corrupt the gradient. Thus we multiply each single loss function with $\sigma_{2}$ to cancel such corruption factor.

$$
x^{m_{i}} = x_{i}^{m-1} + \epsilon_{i} s_{\theta^{*}} (x_{i}^{m-1}, \sigma_{i})+\sqrt{2\epsilon_{i} z_{i}^{m}}
$$

At here, they say z_i^m is a standard normal, is that a random variable that we roll a dice to determine its value in every steps or we have a equation to calculate it

## Concept applied in paper
#### Stochastic Differential Equation (SDE)
We define the noise adding process as the sum of directed noise w.r.t. noise level $t$ and  process plus random noise $\xi$:

$$
\begin{array}{rl}
dx_t/dt &= F(x(t))+ g(x,t)\xi_t,\ \ \xi_t\sim \text{ some noise distribution} \\
\end{array}
$$

In this equation, $\xi_t$ serve as white noise generator, and $g(x,t )$ is the noise scalar scheduler at $x, t$ on the added white noise. And $F(x, t)$ is the directed $x\to x_T$ drift. If we specify $\xi$ as the # Brownian motion noise, and according to Itô calculus we have:

$$
\begin{array}{rl}
dx_t 
&= F(x,t) dt + g(x,t)\xi_t\ dt, &\text{ set }W_t = \int\limits^t_0\xi_s\ ds\\
&= F(x,t) dt + g(x,t)dW_t, &\text{ where } d\ W_t = \xi_t\ dt, \text{ by Itô calculus} \\
&&\ \ \ \ \ \ \ \ \ \ E[ (d W_t)^2 ]=dt,\ dW_t\sim\ \mathcal{N}(0, dt) 
\end{array}
$$

If we use Fokker–Planck equation to reverse the forward process we get the backward process that can reverse the noise adding forward process, which is:

$$
\text{Backward: }dx_{t} = [\ f(x_{t}, t)-g(x_{t}, t)^{2}\nabla_{x}\log \mathcal{p}_{t}(x_{t})]\ dt+\ g(t) d\bar W
$$

where $\bar W$ is also a Brownian motion distribution (independent with $W$) that add noise in the reverse process. The reason why we add noise in reverse process is because the Brain D Anderson proved that the reverse time diffusion equation is also a diffuse equation that include noise adding process. And we call $f(x_{t}, t)-g(x_{t}, t)^{2}\nabla_{x}\log \mathcal{p}_{t}(x_{t})$ as reverse drift.

Then if we use model $\theta$ to fit the score we can have the optimized $\theta$ as:

$$
\theta^{*}= \underset{\theta}{\arg\max}\ \underset{t}{\mathbb{E}} \Biggl\{ \lambda(t)\ 
     \underset{\begin{array}{}
         x\sim \mathcal{p}_\text{data}\\
         x_{t}\sim \mathcal{p}(x_{t}\mid x)
    \end{array}}{\mathbb{E}}\biggr[\ \Bigl\|s_{\theta}(x_{t}, t)-\nabla_{x_{t}}\log\ \mathcal{p}_{0}(x_{t}\mid x)\Bigl\|^{2}_{2}\ \biggr] \ \Biggl\}
$$

In this formula, $\lambda(t)\propto g(t)^{2}=\frac{d\sigma^{2}(t)}{dt}$, $\lambda$  serves as a continuous Gaussian distribution corruption canceler ($\sigma$ is discrete), just like the purpose of $\sigma^{2}$ inside the loss of  SMLD 

And this is score based model with stochastic differential equation
#### 4.3 PROBABILITY FLOW AND CONNECTION TO NEURAL ODES
Removing the stochastic noise term $g(t)\ d\bar W_t$ from the reverse SDE gives the **probability flow ODE**:

$$
dx_t = [f(x_t,t) - \tfrac{1}{2}g(t)^2\nabla_x\log p_t(x_t)]\,dt
$$

It evolves the **same marginal densities** $p_t(x_t)$ as the SDE, but deterministically—linking diffusion models to **Neural ODEs**, where the score network $s_\theta(x_t,t)$ acts as the drift field.

| Process                                                                     | Equation                                                                                        | Randomness |
| :-------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- | :--------- |
| $\begin{array}{c}\text{Forward SDE}\\\text{ (stochastic)}\end{array}$       | $dx_t = f(x_t,t)\,dt + g(t)\,dW_t$                                                              | ✓          |
| $\begin{array}{c}\text{Reverse SDE}\\\text{ (stochastic)}\end{array}$       | $\begin{array}{rl}dx_{t} &= [f - g^2\nabla_x\log p_t]dt\\& \ \  \ \ + g(t)d\bar W_t\end{array}$ | ✓          |
| $\begin{array}{c}\text{Prob. Flow ODE}\\\text{ (deterministic)}\end{array}$ | $dx_t = [f - \tfrac12 g^2\nabla_x\log p_t]dt$                                                   | ✗          |

**Key idea:**  
Both SDE and ODE yield identical densities, but  
- **SDE** → stochastic, diverse samples.  
- **ODE** → deterministic, faster, Neural-ODE-like generation.

## Cross comparison:
#### VAE
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
## Quick Comparison
At the end I want to do a cross comparison.
Let’s end with a quick comparison.

A **VAE** tries to explain everything with probability distributions.  
Its encoder and decoder both output distributions that best fit the input, so nearby latent points get averaged together.  
That averaging, caused by maximum likelihood, is why VAEs always look soft and blurry.

**Score-based models** take a different route.  
They don’t try to guess hidden variables at all — they just learn how to _denoise_ data.  
They start from noisy samples and push them back toward the clean version, following the gradient of probability.  
The results are sharp, but the training is slow and complicated.

To make life easier, **flow models** simplify this process.  
They assume data moves toward noise at a constant speed, and the model just predicts that speed.  
**Rectified flow** makes it even simpler — everything moves in a straight line with constant velocity.

If the situation is simple, like my friend David walking in gentle rain, that works beautifully — smooth noise, easy drift, great reconstruction.  
But once chaos hits — imagine someone throws a _wet cat_ that lands on David, climbs all over him, and leaves random water trails — that’s no longer a simple straight line.  
It’s nonlinear, unpredictable, and full of dependent splashes.  
Now the basic flow model collapses; only complex, multi-modal models can capture that kind of mess.  
They can handle the “wet-cat chaos,” but training them becomes much heavier and fragile.