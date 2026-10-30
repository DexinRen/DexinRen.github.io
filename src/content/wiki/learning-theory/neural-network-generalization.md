---
title: "Why Neural Networks Generalize: Norm-Based Covers, Spectral Complexity and Margins"
area: "Statistical Learning Theory"
areaSlug: "learning-theory"
tags: ["learning_theory","deep_learning"]
order: 6
sources: ["Course/CS/CSCI 678/Lecture 4 - Fat-Shattering and Neural Network Complexity.md"]
credits: [{"text":"Based on Prof. Haipeng Luo's CSCI 678 (Theoretical Machine Learning, USC, Fall 2026). Thank you to Prof. Luo for an excellent course. These notes contain my own understanding and the bridging steps I added to make the lectures easier to follow; any mistakes are mine.","courseLink":"https://haipeng-luo.net/courses/CSCI678/2026_fall/schedule.html","lectureLinks":[{"label":"Lecture 4 (PDF)","url":"https://haipeng-luo.net/courses/CSCI678/2026_fall/lectures/lecture4.pdf"}]}]
---

## Neural Networks: Why Doesn't Parameter Count Explain Generalization?
Modern neural networks may contain millions or billions of parameters, often with:

$$
\#\text{parameters}\gg n
$$

and can achieve zero training error.
Our theory suggests that a huge class should have huge complexity and poor generalization.
This looks even worse empirically: sufficiently large neural nets can fit CIFAR10 with completely random labels.
That strongly suggests:

$$
\operatorname{VCdim}(F)\gtrsim n
$$

so a bound like:

$$
V^{i.i.d.}(F,n)
\lesssim
\sqrt{\frac{\operatorname{VCdim}(F)}{n}}
$$

can be essentially constant.
Yet on real labels the same architecture generalizes much better.
So we have a problem:
**the number of parameters is apparently not the intrinsic complexity of the trained network.**
What quantity might matter instead?
### Hint from Linear Models: Weight Norm
For linear predictors:

$$
f_\theta(x)=\langle\theta,x\rangle,
\qquad
\|\theta\|_2\leq b
$$

HW1 gives:

$$
\hat R(F;x_{1:n})
\leq
\frac b n
\sqrt{\sum_{t=1}^n\|x_t\|_2^2}
$$

Notice:

$$
\boxed{
\text{no polynomial dependence on dimension }d
}
$$

The important quantity is the **norm of the weight**, not simply the number of coordinates.
So ask:
**Can we derive similar norm-based complexity bounds for neural networks?**
The plan is:

$$
\text{linear}
\to
\text{one layer}
\to
\text{multi-layer network}
$$

## Linear Class: Almost Dimension-Independent Cover
Consider:

$$
F=
\{f_\theta(x)=\langle\theta,x\rangle:\|\theta\|_2\leq b\}
$$

Let $X\in\mathbb R^{n\times d}$ contain the samples as rows.
Lecture 3's geometric cover gives roughly:

$$
\ln N_2
\lesssim
d\ln(1/\alpha)
$$

which depends linearly on $d$.
Can we exploit the actual data matrix instead?
The desired result is:

$$
\boxed{
\ln N_2(F|_{x_{1:n}},\alpha)
\leq
\frac{
b^2\|X\|_F^2\ln(2d)
}{
n\alpha^2
}
}
$$

Now the dependence on $d$ is only logarithmic.
### Where Does This Come From?
Every projected predictor is:

$$
X\theta
=
\sum_{i=1}^d\theta_iX_{:,i}
$$

Normalize every column:

$$
v_i=\frac{X_{:,i}}{\|X_{:,i}\|_2},
\qquad
\beta_i=\theta_i\|X_{:,i}\|_2
$$

so:

$$
X\theta=\sum_{i=1}^d\beta_iv_i
$$

The problem is that $\beta_i$ can be negative, while the convex-hull covering lemma uses nonnegative coefficients.
Fix this by doubling the dictionary:

$$
v_1,\ldots,v_d,-v_1,\ldots,-v_d
$$

Then all coefficients can be made nonnegative, with total mass:

$$
\left.
\begin{array}{lll}
\sum_i|\beta_i|
&=
\sum_i|\theta_i|\|X_{:,i}\|_2\\
&\leq
\|\theta\|_2
\sqrt{\sum_i\|X_{:,i}\|_2^2}
&\text{Cauchy-Schwarz}\\
&=
\|\theta\|_2\|X\|_F\\
&\leq
b\|X\|_F
\end{array}
\right.
$$

So $F|_{x_{1:n}}$ lies inside a scaled convex hull of only $2d$ normalized vectors.
The convex-hull covering lemma then gives:

$$
\ln N_2(F|_{x_{1:n}},\alpha)
\leq
\frac{
b^2\|X\|_F^2\ln(2d)
}{
n\alpha^2
}
$$

This is the trick we want to generalize.
## One-Layer Neural Network
Now replace the vector parameter by a weight matrix:

$$
x\mapsto\sigma(Wx),
\qquad
W\in\mathbb R^{m\times d}
$$

where $\sigma$ is coordinate-wise ReLU.
Since ReLU is 1-Lipschitz:

$$
\|\sigma(A)-\sigma(B)\|_F
\leq
\|A-B\|_F
$$

So instead of covering $\sigma(XW^\top)$ directly, it is enough to cover:

$$
XW^\top
$$

How can we rewrite this as a convex combination of simple basis matrices?

$$
XW^\top
=
\sum_{i=1}^d\sum_{j=1}^m
W_{ji}Xe_ie_j^\top
$$

Normalize:

$$
v_{ij}
=
\frac{Xe_ie_j^\top}
{\|Xe_ie_j^\top\|_F}
$$

and absorb the magnitude into $\beta_{ij}$.
Then the same question appears: **how large is the total coefficient mass $\sum_{i,j}|\beta_{ij}|$?**
Since $\|Xe_ie_j^\top\|_F=\|Xe_i\|_2$:

$$
\left.
\begin{array}{lll}
\sum_{i,j}|\beta_{ij}|
&=
\sum_i
\left(\sum_j|W_{ji}|\right)
\|Xe_i\|_2\\
&\leq
\sqrt{
\sum_i\left(\sum_j|W_{ji}|\right)^2
}
\sqrt{\sum_i\|Xe_i\|_2^2}
&\text{Cauchy-Schwarz}\\
&=
\|W\|_{1,2}\|X\|_F
\end{array}
\right.
$$

where:

$$
\boxed{
\|W\|_{1,2}
=
\sqrt{
\sum_{i=1}^d
\left(\sum_{j=1}^m|W_{ji}|\right)^2
}
}
$$

So if $\|W\|_{1,2}\leq b$:

$$
\boxed{
\ln N_2(F|_{x_{1:n}},\alpha)
\leq
\frac{
b^2\|X\|_F^2\ln(2dm)
}{
nm\alpha^2
}
}
$$

Again, the parameter count $dm$ only appears inside a logarithm.
So the analysis naturally tells us something important:
**the norm of $W$ matters much more than the raw number of weights.**
## Multi-Layer Neural Network
Now consider:

$$
f_W(x)
=
\sigma(W_H\cdots\sigma(W_2\sigma(W_1x))\cdots)
$$

For each layer $h$ assume:

$$
\|W_h\|_{1,2}\leq b_h,
\qquad
\|W_h\|_2\leq s_h
$$

where $\|W_h\|_2$ is the spectral norm.
Why do we suddenly need the spectral norm?
Because approximation error from an earlier layer gets multiplied by later layers.
### How Does Error Propagate?
Suppose the input to layer $h$ has approximation error $\alpha_{h-1}$, and we approximate layer $h$ itself with additional error $\gamma_h$.
Then:

$$
\left.
\begin{array}{lll}
\text{new error}
&\leq
\gamma_h+s_h\alpha_{h-1}
&\text{ReLU Lipschitz + }\|W_h\|_2\leq s_h
\end{array}
\right.
$$

Thus define:

$$
\boxed{
\alpha_h
=
\gamma_h+s_h\alpha_{h-1},
\qquad
\alpha_0=0
}
$$

Expanding:

$$
\alpha_H
=
\sum_{h=1}^H
\gamma_h
\prod_{k=h+1}^H s_k
$$

So a small error at an early layer can be amplified by every later spectral norm.
This explains why the product:

$$
\prod_{h=1}^Hs_h
$$

will naturally appear in the final complexity.
### How Large Is the Full Cover?
The one-layer result tells us the number of representatives needed at layer $h$ depends on:

$$
b_h^2
\times
\|\text{input to layer }h\|_F^2
\times
\frac{1}{\gamma_h^2}
$$

The layer inputs themselves satisfy:

$$
\|M_h\|_F
\leq
\|X\|_F
\prod_{k=1}^hs_k
$$

So after accumulating all layers:

$$
\ln|S_H|
\lesssim
\|X\|_F^2\ln(2d_{\max}^2)
\sum_{h=1}^H
\frac{
b_h^2\prod_{k<h}s_k^2
}{
\gamma_h^2
}
$$

Now we have another problem:
**how should we distribute the allowed final approximation error across the layers?**
### Allocate the Error Budget
The final error is:

$$
\alpha_H
=
\sum_{h=1}^H
\gamma_h\prod_{k>h}s_k
$$

Write each layer's contribution as a fraction $\rho_h$ of the total error:

$$
\gamma_h\prod_{k>h}s_k
=
\alpha_H\rho_h,
\qquad
\rho\in\Delta_H
$$

so:

$$
\gamma_h
=
\frac{
\alpha_H\rho_h
}{
\prod_{k>h}s_k
}
$$

Substitute into the cover-size objective. Ignoring common factors, we need to minimize:

$$
\sum_{h=1}^H
\frac{
b_h^2
}{
\rho_h^2s_h^2
}
$$

subject to $\sum_h\rho_h=1$.
KKT gives:

$$
\boxed{
\rho_h
\propto
\left(\frac{b_h}{s_h}\right)^{2/3}
}
$$

and therefore:

$$
\min_{\rho\in\Delta_H}
\sum_h
\frac{b_h^2}{\rho_h^2s_h^2}
=
\left[
\sum_{h=1}^H
\left(\frac{b_h}{s_h}\right)^{2/3}
\right]^3
$$

Thus:

$$
\boxed{
\ln N(F|_{x_{1:n}},\alpha)
\leq
\frac{
\|X\|_F^2\ln(2d_{\max}^2)
}{
nd_H\alpha^2
}
\left(
\prod_{h=1}^Hs_h^2
\right)
\left[
\sum_{h=1}^H
\left(\frac{b_h}{s_h}\right)^{2/3}
\right]^3
}
$$

The remarkable part is that the width/parameter count only enters logarithmically.
## Spectral Complexity
Dudley converts the covering bound into approximately:

$$
R(F)
=
\tilde O\left(
\frac{\|X\|_F}{n}
\left(\prod_{h=1}^Hs_h\right)
\left[
\sum_{h=1}^H
\left(\frac{b_h}{s_h}\right)^{2/3}
\right]^{3/2}
\right)
$$

This motivates defining the spectral complexity of a particular network:

$$
\boxed{
\mathcal R(W)
=
\left(
\prod_{h=1}^H\|W_h\|_2
\right)
\left[
\sum_{h=1}^H
\left(
\frac{\|W_h\|_{1,2}}{\|W_h\|_2}
\right)^{2/3}
\right]^{3/2}
}
$$

So instead of:

$$
\text{complexity}\approx\#\text{parameters}
$$

the theory suggests:

$$
\boxed{
\text{complexity}\approx\text{size/norm structure of the learned weights}
}
$$

Does this actually explain neural-network generalization?
## Margin
Even after training error reaches zero, the network can continue becoming **more confident**.
For multiclass network $f_W$, define:

$$
\boxed{
\mathcal M(f_W,x,y)
=
f_W(x)_y
-
\max_{j\neq y}f_W(x)_j
}
$$

Then:

$$
\mathcal M>0
\iff
\text{correct prediction}
$$

and larger margin means greater confidence.
This suggests complexity should be judged **relative to the margin**.
A margin generalization bound has the form:

$$
\left.
\begin{array}{ll}
\Pr\left(\arg\max_j f_W(x)_j\neq y\right)
&\leq
\frac1n
\sum_{t=1}^n
\mathbb I\{\mathcal M(f_W,x_t,y_t)<\gamma\}\\
&\quad+
\tilde O\left(
\frac{
\|X\|_F\mathcal R(W)
}{
\gamma n
}
\right)
\end{array}
\right.
$$

There is a trade-off:

$$
\gamma\uparrow
\Rightarrow
\left\{
\begin{array}{l}
\text{more training samples have margin}<\gamma\\
\text{complexity term decreases}
\end{array}
\right.
$$

Importantly, $\gamma$ is chosen in the **analysis**, not as a training hyperparameter.
If training error is zero, choose:

$$
\gamma_{\min}
=
\min_t\mathcal M(f_W,x_t,y_t)
$$

Then the empirical-margin term becomes zero:

$$
\boxed{
\Pr(\text{test error})
\lesssim
\tilde O\left(
\frac{
\|X\|_F\mathcal R(W)
}{
\gamma_{\min}n
}
\right)
}
$$

Now we can explain why increasing spectral complexity does not necessarily mean worse generalization:

$$
\mathcal R(W)\uparrow
\quad\text{but if}\quad
\gamma_{\min}\uparrow
\text{ similarly}
\Rightarrow
\frac{\mathcal R(W)}{\gamma_{\min}}
\text{ can remain stable}
$$

So the more meaningful quantity is roughly:

$$
\boxed{
\frac{\text{spectral complexity}}{\text{margin}}
}
$$

## Normalized Margin Distribution
Instead of only using the minimum margin, we can study the entire empirical margin distribution.
Normalize:

$$
\frac{
\mathcal M(f_W,x_t,y_t)
}{
\|X\|_F\mathcal R(W)/n
}
$$

Then the margin bound can be viewed as:

$$
\Pr(\text{error})
\lesssim
\frac1n
\sum_t
\mathbb I
\left\{
\frac{
\mathcal M(f_W,x_t,y_t)
}{
\|X\|_F\mathcal R(W)/n
}
<\gamma
\right\}
+
\tilde O(1/\gamma)
$$

So if the normalized-margin distribution is shifted further to the right, the task is qualitatively easier.
The experiments suggest:

$$
\left.
\begin{array}{l}
\text{MNIST is easier than CIFAR10}\\
\text{random-label MNIST and CIFAR10 become similarly hard}\\
\text{CIFAR100 is almost as hard as random-label CIFAR10}\\
\text{random inputs are even harder than random labels}
\end{array}
\right.
$$

## What Does the Theory Explain?
We started with the puzzle:

$$
\#\text{parameters}\gg n
\qquad\text{but neural nets still generalize}
$$

Parameter-count complexity failed:

$$
\text{VC dimension / parameter count}
\not\approx
\text{actual generalization}
$$

Then:

$$
\left. 
\begin{array}{l} 
\text{linear norm bound}
&\to
\text{matrix norm bound}
\to
\text{multi-layer norm bound}\\
&\to
\text{spectral complexity}
\to
\text{margin-normalized complexity}
\end{array} 
\right.
$$

The resulting picture is:

$$
\boxed{
\left. 
\begin{array}{l} 
\text{generalization}
\text{ is controlled more by }\\
\frac{\text{norm-based complexity}}{\text{prediction margin}}
\text{ than by parameter count}
\end{array} 
\right.
}
$$

But one important question is still unanswered:
**why does training on real data produce networks with relatively low spectral complexity / favorable margins in the first place?**
The analysis assumes we ended up with such a network. It does not explain why SGD finds it.
That is an optimization/implicit-bias question:

$$
\boxed{
\text{Why does SGD prefer low-complexity solutions?}
}
$$

and remains an active research problem.
## Closing the Loop
The research path of Lecture 4 is:

$$
\left.
\begin{array}{l}
\text{pseudo-dimension not necessary for regression learning}\\
\to\text{missing scale}\\
\to\text{fat-shattering dimension}\\
\to\text{fat dimension controls covering number}\\
\to\text{tight regression learnability characterization}\\
\to\text{apply complexity theory to neural networks}\\
\to\text{parameter count fails}\\
\to\text{weight norms give dimension-light covers}\\
\to\text{extend linear }\to\text{ one-layer }\to\text{ deep networks}\\
\to\text{spectral complexity}\\
\to\text{spectral complexity alone still imperfect}\\
\to\text{add margin}\\
\to\text{normalized spectral complexity + margin explains generalization better}\\
\to\text{remaining question: SGD implicit bias}
\end{array}
\right.
$$

### Proof: Linear Cover Bound
Let:

$$
v_i=\frac{X_{:,i}}{\|X_{:,i}\|_2},
\qquad
\beta_i=\theta_i\|X_{:,i}\|_2
$$

Then:

$$
X\theta=\sum_i\beta_iv_i
$$

Use the dictionary $\{\pm v_i\}_{i=1}^d$ so all coefficients are nonnegative after absorbing signs.
The total coefficient mass satisfies:

$$
\left.
\begin{array}{lll}
\|\beta\|_1
&=
\sum_i|\theta_i|\|X_{:,i}\|_2\\
&\leq
\|\theta\|_2
\sqrt{\sum_i\|X_{:,i}\|_2^2}
&\text{Cauchy-Schwarz}\\
&=
\|\theta\|_2\|X\|_F\\
&\leq
b\|X\|_F
\end{array}
\right.
$$

Apply the scaled-convex-hull covering lemma with $2d$ base vectors:

$$
\ln N_2(F|_{x_{1:n}},\alpha)
\leq
\frac{
b^2\|X\|_F^2\ln(2d)
}{
n\alpha^2
}
$$

### Proof: Error Propagation Through Layers
Suppose $M_{h-1}$ approximates the true $(h-1)$-layer output $Z_{h-1}$ with:

$$
\|M_{h-1}-Z_{h-1}\|_F\leq\alpha_{h-1}
$$

Choose $M_h$ from the local layer-$h$ cover such that:

$$
\|M_h-\sigma(M_{h-1}W_h^\top)\|_F
\leq\gamma_h
$$

Then:

$$
\left.
\begin{array}{lll}
\|M_h-\sigma(Z_{h-1}W_h^\top)\|_F
&\leq
\|M_h-\sigma(M_{h-1}W_h^\top)\|_F\\
&\quad+
\|\sigma(M_{h-1}W_h^\top)-\sigma(Z_{h-1}W_h^\top)\|_F\\
&\leq
\gamma_h+
\|(M_{h-1}-Z_{h-1})W_h^\top\|_F
,\ \text{ ReLU is 1-Lipschitz}\\
&\leq
\gamma_h+
\|M_{h-1}-Z_{h-1}\|_F\|W_h\|_2\\
&\leq
\gamma_h+s_h\alpha_{h-1}\\
&=
\alpha_h
\end{array}
\right.
$$

Thus:

$$
\boxed{
\alpha_h=\gamma_h+s_h\alpha_{h-1}
}
$$

### Proof: Optimal Error Allocation
After propagating the layer errors:

$$
\alpha_H
=
\sum_{h=1}^H
\gamma_h\prod_{k>h}s_k
$$

Set:

$$
\alpha_H\rho_h
=
\gamma_h\prod_{k>h}s_k,
\qquad
\rho_h\geq0,\quad\sum_h\rho_h=1
$$

Then:

$$
\gamma_h
=
\frac{\alpha_H\rho_h}
{\prod_{k>h}s_k}
$$

and the relevant part of the covering-number objective becomes:

$$
\sum_{h=1}^H
\frac{b_h^2}{\rho_h^2s_h^2}
$$

The KKT condition gives:

$$
\rho_h
\propto
\left(\frac{b_h}{s_h}\right)^{2/3}
$$

and:

$$
\min_{\rho\in\Delta_H}
\sum_h
\frac{b_h^2}{\rho_h^2s_h^2}
=
\left[
\sum_h
\left(\frac{b_h}{s_h}\right)^{2/3}
\right]^3
$$

which produces the multi-layer covering bound.