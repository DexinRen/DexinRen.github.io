// Formulas for the background shooting stars, taken (or trimmed) from my notes and papers.
// Keep them short: long formulas look bad when tilted along the flight path.
export const formulas = [
  String.raw`v_\theta(X_\tau,\tau)`,                         // RectifiedTraj velocity field
  String.raw`R_{T}=O(\sqrt{T})`,                             // regret
  String.raw`\eta=\sqrt{\tfrac{\ln N}{T}}`,                  // Hedge learning rate
  String.raw`p_t(i)\propto e^{-\eta L_{t-1}(i)}`,            // exponential weights
  String.raw`\sigma\sqrt{2\ln|F|}`,                          // sub-Gaussian maximal inequality
  String.raw`\mathbb E[U_f]=0`,
  String.raw`\max\leq\sum`,
  String.raw`\epsilon_{1:n}`,                                // Rademacher signs
  String.raw`C\sqrt{\tfrac{2\ln|\mathcal F|}{n}}`,           // finite-class bound
  String.raw`s_i(f(x_i)-y_i)\geq\tfrac{\alpha}{2}`,          // fat-shattering margin
  String.raw`\nabla_x\log p_t(x)`,                           // score
  String.raw`\mathrm{KL}(q_{\phi}(z|x)\,\|\,p(z))`,          // VAE
  String.raw`\sum_k\pi_k\mathcal N(x\mid\mu_k,\Sigma_k)`,     // GMM
  String.raw`\mu=\mathbb E[X]`,
  String.raw`\mathbb{P}(A\mid B)`,
  String.raw`\frac{d\sigma^{2}(t)}{dt}`,                     // score-based noise schedule
];
