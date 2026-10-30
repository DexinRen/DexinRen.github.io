---
title: "Gradient-Based Optimizers: From SGD to AdamW"
area: "Machine Learning & Generative Models"
areaSlug: "machine-learning"
tags: ["optimization","deep_learning","AI"]
order: 2
sources: ["Wiki/AI Wiki/Basics/Optimization.md"]
credits: []
---

## 1. First Order Optimization

### 1.1 Principle

In 1-D, we know the derivative of a function as:

$$
\frac{df}{dx}=\lim\limits_{h\rightarrow 0}\frac{f(x+h)-f(x)}{h}
$$

we can get the gradient of a vector in multi-dimensions as the optimization direction. Since the target is to minimize the loss, the direction of steepest descent is the **negative gradient**

### 1.2 Gradients

There are two approaches:
- **Numeric gradient** : approximate, slow (with $O$(dim)), easy to write
- **Analytic gradient**: exact, fast, error-prone (compute by calculus)

In practice: Always use analytic gradient, but check implementation
with numerical gradient. This is called a **gradient check**.

### 1.3 First Order Algo

#### 1.3.1 Gradient Descent (<span class="wl-missing" title="Not published yet">GD</span>):
```python
def gradient_descent(data, loss_fn, num_steps):
    # vanilla gradient descent
    w = initalize_weights()
    for t in range(num_steps):
        dw = compute_gradient(loss_fn, data, w)
        w -= learning_rate * dw
```

##### Hyper-paremeters:
- weight initialization method
- number of steps
- learning rate

##### Problems:
- slow

#### 1.3.2 Stochastic Gradient Descent (<span class="wl-missing" title="Not published yet">SGD</span>):

it is expensive and slow to compute gradient and adjust $W$ for each data point, we can make multiple data points a minibatch, and use the loss expectation of each minibatch as the loss to compute the gradient, we call this Stochastic Gradient Descent method.

In this case, we have our loss function to a mini-batch as:

$$
\begin{align*}
\underset{\text{mini-batch}}{L(W)}&=\mathbb{E}_{(x,y)\sim p_{data}}[L(x,y,W)]+\lambda R(W)\\
&\approx \frac{1}{N}\sum\limits_{i=1}^N L(x,y,W)+\lambda R(W)
\end{align*}
$$

Thus we have:

$$
\begin{align*}
\underset{\text{mini-batch}}{\nabla_W L(W)}&=\nabla_W \mathbb{E}_{(x,y)\sim p_{data}}[L(x,y,W)]+\lambda \nabla_W R(W)\\
&\approx \frac{1}{N}\sum\limits_{i=1}^N \nabla_W L_W(x,y,W)+\lambda\nabla_W R(W)
\end{align*}
$$

```python
def SGD(data, loss_fn, num_steps):
    # stochastic gradient descent
    # notice the loss_fn in here is mini-batch version
    w = initalize_weights()
    for t in range(num_steps):
        minibach = sample_data(data, batch_size)
        dw = compute_gradient(loss_fn, minibatch, w)
        w -= learning_rate * dw

def loss_fn
```

###### Problems
- loss function has high **condition number** (very sensitive to changes and error in the input)
- will be trapped in saddle point or local minimum point, since the grad = 0
- gradient comes from mini-batch, so it can be noisy

#### 1.3.2 SGD with Momentum
**This is a frequently used algo in many paper, it can out-perform Adam, but requires more tunning on hyper-parameters**

Using gradient to guide our preceding direction is theoretically similar to physics, and we can use the past gradient as the velocity (so each step is a unit time), so we come up with the SGD with momentum: 

$$
\begin{array}{l}
v_{t+1} = \rho v_t +\nabla f(x_t)\\
x_{t+1} = x_t - \alpha v_{t+1}
\end{array}
$$

```python
def SGD_Momentum():
    v = 0
    for t in range(num_steps):
        dw = compute_gradient(w)
        # rho = 0.9 or 0.99 by default
        # rho means friction or loss of prev velocity
        v  = rho * v + dw
        w -= learning_rate * v
```

#### 1.3.3 Nesterov Momentum

$$
\begin{array}{l}
v_{t+1} = \rho v_t +\alpha \nabla f(x_t + \rho v_t)\\
x_{t+1} = x_t + v_{t+1}
\end{array}
$$

Because we want to update in terms of $x_t, \nabla f(x_t)$, we can change the variables $\tilde x_t = x_t + \rho v_t$ and we have:

$$
\begin{array}{l}
v_{t+1} &= \rho v_t +\alpha \nabla f(\tilde x_t)\\
\tilde x_{t+1} &=\tilde x_t -\rho v_t + (1+\rho)v_{t+1}\\
&=\tilde x_t +\rho v_{t+1} + \rho(v_{t+1}-v_t)\\
\end{array}
$$

And here is the code for Nesterov Momentum:
```python
def Nesterov_Momentum():
    v = 0
    for t in range(num_steps):
        dw = compute_gradient(w)
        old_v = v
        v = rho * v - learning_rate * dw
        w-= rho * old_v - (1+rho) * v 
```

#### 1.3.4 AdaGrad

In this algo, we added element-wise scaling of the gradient based on the historical sum of squares in each dimentsion.

```python
def AdaGrad():
    grad_squared = 0 # historical sum
    for t in range(num_steps):
        dw = compute_gradient(w)
        grad_squared += dw * dw 
        # use 1e-7 to prevent DIV0 error
        w -= learning_rate * dw /(grad_squared.sqrt() + 1e-7)
```

##### 1.3.4-Cons:
when num_steps is too large, drad_squared will accumulated and becomes big, and the divide operation makes the value change of w very small

#### 1.3.5 RMSProp: "Leak Adagrad"

We can decay the historical sum of squares (grad_squared) to eliminate the cons of AdaGrad

```python
def RMSProp():
    grad_squared = 0 # historical sum
    for t in range(num_steps):
        dw = compute_gradient(w)
        # use decay_rate to shrink the size of grad_squared
        # use 1-decay_rate to enlarge the effect to current dw to grad_squared
        grad_squared = decay_rate * grad_squared + (1-decay_rate) * dw * dw 
        w -= learning_rate * dw /(grad_squared.sqrt() + 1e-7)
```

#### 1.3.6 Adam (almost): RMSProp+Momentum

```python
def Adam_alsmost():
    moment1 = 0
    moment2 = 0
    grad_squared = 0 # historical sum
    for t in range(num_steps):
        dw = compute_gradient(w)
        # use RMSProp at (rho *v + dw) in Momentum algo
        # moment1 is v in momentum algo
        moment1 = beta1 * moment1 + (1 - beta1) * dw
        # moment2 is grad_squared in RMSProp algo
        moment2 = beta2 * moment1 + (1 - beta2) * dw * dw #()
        w -= learning_rate * moment1 / (moment2.sqrt() + 1e-7)
```

##### 1.3.6-cons
Assume beta2 = 0.999, when t = 0, moment2 will be very small, which means moment1/moment2.sqrt() will be very large, leading to a very large first step

To fix this we should add a bias correction

#### 1.3.7 Adam with bias correction

We can use bias correction for the fact that first and second moment estimates start at zero
```python
def AdamAlsmostBias():
    moment1 = 0
    moment2 = 0
    grad_squared = 0 # historical sum
    for t in range(num_steps):
        dw = ComputeGradient(w)
        moment1 = beta1 * moment1 + (1 - beta1) * dw
        moment2 = beta2 * moment2 + (1 - beta2) * dw * dw
        # adding bias correction
        # moment will be restriant to a large value when t=0
        moment1_unbias = moment1 / (1 - beta1 ** t)
        moment2_unbias = moment2 / (1 - beta2 ** t)
        w -= learning_rate * moment1_unbias / (moment2_unbias.sqrt() + 1e-7)
```
Adam with beta1 $= 0.9$ and beta2 $= 0.999$, and learning_rate = $1e-3, 5e-4, 1e-4$ is grate starting point for many models

#### 1.3.8 Adam with L2 regularization

```python
def AdamL2(l, alpha=0.001, beta1=0.9, beta2=0.999,eps=1e-8):
    # start initialization
    t = 0 # time step
    mt = 0 # 1st momentum (when t=0)
    vt = 0 # 2nd momentum (when t=0)
    wt = InitializeW(n)      # w_t   in R^n
    nt = InitializeIta(n)    # ita_t in R^1, learning rata
    # repeat until stop criterion is met  
    stop_criterion = True
    while stop_criterion:
        t = t + 1
        # select the t-th mini-batch
        batch = SelectBatch(t)
        # grad_t = ComputeGradient(w{t-1}, batch_t)+lambda * w{t-1}
        grad  = ComputeGradient(wt, batch) + l * w_t  
        
        # mt = beta1*m{t-1} + (1-beta1) * grad
        # bt = beta2*v{t-1} + (1-beta2) * (grad^2)
        mt = beta1 * mt + (1-beta1) * grad 
        vt = beta2 * vt + (1-beta2) * (grad ** 2)
        
        # mt_unbias = mt / (1 - beta1^t)
        # vt_unbias = vt / (1 - beta2^t)
        mt_unbias = np.divide(mt, np.subtract(1, np.power(beta1, t)))
        vt_unbias = np.divide(vt, np.subtract(1, np.power(beta2, t)))

		# learning rata change function
        nt = SetScheduleMultiplier(t) 
        # wt = w{t-1}-nt*[alpha*mt_unbias/(sqrt(vt_unbias)+eps]
        wt = wt - nt * np.divide(np.mul(alpha, mt_unbias), 
                                 np.add(np.sqrt(vt_unbias),eps))
        stop_criterion = CheckStop()
        
    return wt
```

#### 1.3.9 AdamW (**Recommanded Default Optimizer**)
```python
def AdamW(l, alpha=0.001, beta1=0.9, beta2=0.999,epsilon=1e-8):
    # start initialization
    t = 0 # time step
    mt = 0 # 1st momentum (when t=0)
    vt = 0 # 2nd momentum (when t=0)
    wt = InitializeW(n)      # w_t   in R^n
    nt = InitializeIta(n)    # ita_t in R^1, learning rata
    # repeat until stop criterion is met  
    stop_criterion = True
    while stop_criterion:
        t = t + 1
        # select the t-th mini-batch
        batch = SelectBatch(t)
        # grad_t = ComputeGradient(w{t-1}, batch_t)
        grad  = ComputeGradient(wt, batch)
        
        # mt = beta1*m{t-1} + (1-beta1) * grad
        # bt = beta2*v{t-1} + (1-beta2) * (grad^2)
        mt = beta1 * mt + (1-beta1) * grad 
        vt = beta2 * vt + (1-beta2) * (grad ** 2)
        
        # mt_unbias = mt / (1 - beta1^t)
        # vt_unbias = vt / (1 - beta2^t)
        mt_unbias = np.divide(mt, np.subtract(1, np.power(beta1, t)))
        vt_unbias = np.divide(vt, np.subtract(1, np.power(beta2, t)))
		# learning rata change function
        nt = SetScheduleMultiplier(t) 
        # wt = w{t-1}-nt*{ [alpha*mt_unbias/(sqrt(vt_unbias)+eps]
        #      + l*w{t-1} }
        wt = wt - nt * np.add(np.divide(np.mul(alpha, mt_unbias), np.add(np.sqrt(vt_unbias),eps)), np.mul(l, wt))
        stop_criterion = CheckStop()
        
    return wt
```

#### 1.3.10 Pseudo-code for Adam:
![](</notes-media/ch04_1-3-10_adam_varieties.png>)

#### 1.3.11 L-BFGS
If you can afford full batch updates then try this algo, but do not forget to disable all source of noise

## 2. Second Order Optimization

We can use gradient and Hessian matrix to make quadratic approximation, and we take step to minimize that approximation  

Such algorithm tends to take small step in area with high curvature, and big step in area with low curvature

### 2.1 Principle

Second Order Taylor Expansion on vectors $\in \mathbb{R}^n$:

$$
L(w)\approx L(w_0)+(w-w_0)^T \nabla_w L(w_0)+\frac{1}{2}(w-w_0)^T \textbf{H}_w L(w_0)(w-w_0)
$$

And given the weight matrix $w$ and the input vector $X =\{x_i\}_{i=1}^n$, we have the Hessian matrix as $(H_w)_{i,j}=\frac{\partial^2 w}{\partial x_{i}\partial x_{j}}$:

$$
\textbf{H}_w =
\left[
\begin{array}{ccc}
\frac{\partial^2 w}{\partial x_{1}^{2}} & \frac{\partial^2 w}{\partial x_{1}\partial x_{2}}&\dots&\frac{\partial^2 w}{\partial x_{1}\partial x_{n}}\\
\frac{\partial^2 w}{\partial x_{2}\partial x_{1}} & \frac{\partial^2 w}{\partial x_{2}^2}&\dots&\frac{\partial^2 w}{\partial x_{2}\partial x_{n}}\\
\vdots & \vdots & \ddots & \vdots\\
\frac{\partial^2 w}{\partial x_{n}\partial x_{1}}& \frac{\partial^2 w}{\partial x_{n}\partial x_{2}}&\dots&\frac{\partial^2 w}{\partial x_{n}^2}
\end{array}
\right]
$$

Then by solving for the critical point we get the Newton parameter update:

$$
w^* = w_0 - \textbf{H}_w L(w_0)^{-1}\nabla_w L(w_0)
$$

Normally, second order optimization is **impractical** since Hessian has $O(N^2)$ elements, and invertion would take $O(N^3)$. Since usually $N=\text{(tens or hundres of) Millions}$, this is super costy

## 3. Regularization vs Weight Decay

As we discussed in lecture 3: linear classifier, full Loss function based on regularization is:

$$
\begin{array}{rl}
L(w) & = L_\text{patch}(w, X)+L_\text{reg}(w)\\
     & = \frac{1}{n} \sum\limits_{x_i\in X} L(w, x_i)+\lambda R(W)\\
\end{array}
$$

Where $L(w, x_i)$ is the loss of W on data $x_i\in X$, and $L_\text{reg}(w)$ aims to prevent the model from overfitting, and $R(W)$ is the **regularization** function we will discuss in this section

#### 3.1 L2 Regularization

With L2 regularization function, the loss function will be

$$
\begin{array}{rl}
L(w) & = \frac{1}{n} \sum\limits_{x_i\in X} L(w, x_i)+\lambda |w|^2\\
\end{array}
$$

And hereby the optimization algo with L2 regularization will be:

$$
\begin{array}{l}
L(w)=L_\text{data}(w)+\lambda|w|^2\\
g_t = \nabla L(w_t)=\nabla L_\text{data}(w_t)+2\lambda w_t\\
s_t = \text{optimizer}(g_t)\\
w_{t+1} = w_t -\alpha s_t
\end{array}
$$

#### 3.2 Weight Decay

if we use weight decay instead of L2 regularization, the optimization algo will be 

$$
\begin{array}{l}
L(w)=L_\text{data}(w)\\
g_t = \nabla L(w_t)=\nabla L_\text{data}(w_t)\\
s_t = \text{optimizer}(g_t)+2\lambda w_t\\
w_{t+1} = w_t -\alpha s_t
\end{array}
$$

## 4. Comparison
L2 Regularization and Weight Decay are equivalent for SGD, SGD+Momentum so people often use the terms interchangeably!

But they are not the same for adaptive methods (AdaGrad, RMSProp, Adam, etc)

### 4.1 First Order Algo Comparison
![](</notes-media/ch04_3_1st_order_algo_compare.png>)

### 4.2 Suggestions
#### 4.2.1 which algo to use?
We can use AdamW as default optimizer, SGD with momentum can sometimes offer better result but requires more tunning on hyper-parameters

If we can afford full-batch update we can also try L-BFGS (but we have to trun off all source of noise)