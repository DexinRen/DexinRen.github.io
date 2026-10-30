---
title: "Least Squares with QR and Householder Reflectors"
area: "Numerical Linear Algebra"
areaSlug: "numerical-linear-algebra"
tags: ["linear_algebra"]
order: 0
sources: ["Course/Math/MATH 501/In-Class/QR decomposition.md","Course/Math/MATH 501/In-Class/Householder Reflector.md"]
credits: [{"text":"Based on USC MATH 501 (Numerical Analysis, Spring 2026). These notes contain my own understanding and the intuition I added; any mistakes are mine.","courseLink":null,"lectureLinks":[]}]
---

## Intuition: Least Squares via QR

We want to solve

$$
\min_x \|Ax - b\|_2^2 .
$$

If $Q$ is orthogonal, then

$$
Q^T Q = I \;\Rightarrow\; Q^{-1} = Q^T,
\qquad \|Qy\|_2 = \|y\|_2.
$$

For columns $q_i$ of $Q$:

$$
q_i^T q_j = 0 \ (i\neq j), \qquad \|q_i\|_2 = 1.
$$

Examples of orthogonal matrices include permutation and rotation matrices.

---
## QR factorization
Let

$$
A = QR,
$$

where:
- $Q$ has orthonormal columns,
- $R$ is upper triangular.

Example ($m=3,n=2$):

$$
A=[a_1\ a_2]
=
\underbrace{[q_1\ q_2\ q_3]}_{Q}
\underbrace{\begin{bmatrix}
r_{11} & r_{12}\\
0 & r_{22}\\
0 & 0
\end{bmatrix}}_{\tilde R}.
$$

---
## Key step: transform the objective
Start with

$$
\|Ax-b\|_2 = \|QRx-b\|_2.
$$

Use orthogonality:

$$
\|QRx-b\|_2
= \|Q^T(QRx-b)\|_2
= \|Rx - Q^Tb\|_2.
$$

Write

$$
Q^Tb =
\begin{bmatrix}
c\\ d
\end{bmatrix},
\quad
c\in\mathbb{R}^n,\ d\in\mathbb{R}^{m-n}.
$$

Then

$$
\|Rx-Q^Tb\|_2^2
=
\|Rx-c\|_2^2 + \|d\|_2^2.
$$

Since $\|d\|_2^2$ does not depend on $x$, the minimizer satisfies

$$
Rx = c.
$$

This is solved by back substitution.  
The minimal residual norm is $\|d\|_2$.

---
## QR Decomposition (Gram–Schmidt)

Given

$$
A=[c_1\ c_2],
$$

construct $A=QR$.
### Step 1

$$
r_{11} = \|c_1\|_2,
\qquad
q_1 = \frac{c_1}{r_{11}}.
$$

### Step 2
Project $c_2$ onto $q_1$:

$$
r_{12} = q_1^T c_2 = \frac{c_1^T c_2}{c_1^T c_1}.
$$

Remove the projection:

$$
\hat q_2
= c_2 - (q_1^T c_2)q_1
= c_2 - \frac{c_1^T c_2}{c_1^T c_1}\,c_1.
$$

Normalize:

$$
r_{22}=\|\hat q_2\|_2,
\qquad
q_2=\frac{\hat q_2}{r_{22}}.
$$

Thus

$$
A=[q_1\ q_2]
\begin{bmatrix}
r_{11} & r_{12}\\
0 & r_{22}
\end{bmatrix}.
$$

## Third vector (general case)

For $A=[c_1\ c_2\ c_3]$:

$$
r_{13}=q_1^T c_3,\qquad r_{23}=q_2^T c_3,
$$

$$
\hat q_3
= c_3 - (q_1^T c_3)q_1 - (q_2^T c_3)q_2.
$$

Normalize:

$$
r_{33}=\|\hat q_3\|_2,
\qquad
q_3=\frac{\hat q_3}{r_{33}}.
$$

---
## Summary link
Gram–Schmidt constructs $Q$ with $Q^TQ=I$, which allows

$$
\min_x\|Ax-b\|_2
=
\min_x\|Rx-Q^Tb\|_2,
$$

reducing least squares to a triangular system.

## Why we use QR

We want to solve

$$
\min_x \|Ax-b\|_2,\qquad A\in\mathbb{R}^{m\times n},\ m\ge n.
$$

**Common but dangerous approach (normal equations):**

$$
A^TAx = A^Tb.
$$

**Problems**
1. **Condition number is squared**

$$
\kappa(A^TA)=\kappa(A)^2,
$$

so if $A$ is even moderately ill-conditioned, errors blow up.

2. **Forming $A^TA$ loses information in floating point.** Each entry is a dot product

$$
(A^TA)_{ij}=\sum_{k=1}^m a_{k i}a_{k j},
$$

so rounding accumulates; off-diagonals can suffer cancellation. Even with an “exact” solve, the system may already be corrupted, giving a plausible solution with too-large residual $\|Ax-b\|_2$ or high sensitivity to tiny perturbations.

3. **Gaussian elimination on $A$ is not a least-squares method.** It targets $Ax=b$ (usually inconsistent when $m>n$), so it either fails or implicitly selects constraints/approximations with no minimization guarantee.

4. **Explicit inverse/pseudoinverse is unstable/slow.**

$$
x=(A^TA)^{-1}A^Tb \quad\text{or}\quad x=A^\dagger b
$$

adds extra operations and rounding error; factorization-based solves are preferred.

**Why QR fixes this**
Let $A=QR$ with $Q^TQ=I$. Orthogonal transforms preserve the 2-norm:

$$
\|Ax-b\|_2=\|QRx-b\|_2=\|Q^T(QRx-b)\|_2=\|Rx-Q^Tb\|_2.
$$

Write

$$
Q^Tb=\begin{bmatrix}c\\ d\end{bmatrix}
$$

then

$$
\|Rx-Q^Tb\|_2^2=\|Rx-c\|_2^2+\|d\|_2^2,
$$

so the minimizer satisfies the **triangular system**

$$
Rx=c
$$

(back-substitution). This avoids forming $A^TA$ (no $\kappa^2$ blow-up), uses stable orthogonal operations, and $R$’s diagonal reveals near-rank-deficiency (use pivoted QR/SVD if needed).

## Householder Transformation

### 1. How to perform it
Let $u \in \mathbb{R}^n$ be a unit vector, $\|u\|_2 = 1$. Define the Householder matrix as

$$
H = I - 2uu^T .
$$

For any vector $x \in \mathbb{R}^n$,

$$
Hx = (I - 2uu^T)x = x - 2u(u^Tx).
$$

$H$ is symmetric ($H^T = H$) and orthogonal ($H^TH = I$). In practice, $u$ is constructed from $x$ and normalized so that applying $H$ zeros out selected components of $x$ (typically all but the first).

### 2. Intuition
The Householder transformation is a reflection across a hyperplane orthogonal to $u$. Decompose $x$ as $x = x_\parallel + x_\perp$ with $x_\parallel = (u^Tx)u$ and $x_\perp \perp u$. Applying $H$ flips the parallel component and keeps the orthogonal component unchanged:

$$
Hx = x_\perp - x_\parallel.
$$

Thus a single reflection can eliminate many coordinates at once.

### 3. Why we use it
Naive methods like Gaussian elimination and Gram–Schmidt use non-orthogonal operations, which amplify rounding errors and lead to numerical instability. Normal equations square the condition number. Householder transformations avoid these issues because $H$ is orthogonal: norms and angles are preserved, errors are not magnified, and multiple components are eliminated in one step. Repeated Householder reflections form the basis of the QR factorization $A = QR$, which is the standard stable method for least-squares problems.