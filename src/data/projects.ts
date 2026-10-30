// Card metadata for the Research page. Long-form content lives in src/pages/research/<slug>.astro
export interface Project {
  slug: string;
  title: string;
  subtitle: string;      // one line, shown on the collapsed card
  intro: string;         // 2–3 sentences, shown when the card expands
  image: string;         // shown when the card expands: a URL, 'inline:<CardVisual name>' or 'mask:<alpha-mask URL>'
  imageAlt: string;
  imageFit?: 'cover' | 'contain';
  period: string;
  role: string;
  status: 'Published' | 'Released' | 'Ongoing' | 'Early stage';
  tags: string[];
}

export const projects: Project[] = [
  {
    slug: 'rectifiedtraj',
    title: 'RectifiedTraj',
    subtitle: 'Map-free, causal GPS trajectory denoising',
    intro:
      'A lightweight, on-device GPS denoiser that corrects each point using only past observations. The extended study traced why direct-coordinate models break as trajectories cover more distance, and showed that predicting the correction instead keeps training and inference stable.',
    image: 'mask:/media/rectifiedtraj/qual/rt-hybrid.webp',
    imageAlt: 'GPS trajectories across central Tokyo after RectifiedTraj denoising: a fine street map of thin terracotta lines.',
    imageFit: 'cover',
    period: 'Aug 2025 – Sep 2026',
    role: 'First-author lead',
    status: 'Published',
    tags: ['Distribution shift', 'Generative models', 'On-device ML'],
  },
  {
    slug: 'neurogenesis-gnn',
    title: 'NeurogenesisGNN',
    subtitle: 'Estimating hippocampal neurogenesis from EEG',
    intro:
      'About 13,000 EEG clips, but only 30 independent patients. I built the pipeline from that fact outward: a supervised low-rank regression head on frozen EEG embeddings, a learned way to combine clip predictions into one patient estimate, and a separate treatment for zero-neurogenesis patients.',
    image: 'inline:neuro',
    imageAlt: 'Diagram: many EEG clips collapse into a single patient-level estimate.',
    imageFit: 'contain',
    period: 'Jun 2026 – present',
    role: 'Research assistant · pipeline owner',
    status: 'Ongoing',
    tags: ['Small-n / high-d', 'Biomedical ML', 'Evaluation design'],
  },
  {
    slug: 'haystac',
    title: 'Mobility anomaly detection',
    subtitle: 'Why a purpose-built Transformer lost to a simple MLP',
    intro:
      'A failure diagnosis on the HAYSTAC detection team. Controlled swaps showed the architecture explains only part of the gap. Training-loss rankings also turned out to be a poor guide for picking checkpoints, so I measured how well each candidate loss tracks real detection performance.',
    image: 'inline:haystac',
    imageAlt: 'Bar sketch comparing how well different training losses rank checkpoints.',
    imageFit: 'contain',
    period: 'Jun 2026 – Sep 2026',
    role: 'Research team member',
    status: 'Ongoing',
    tags: ['Failure analysis', 'Objectives & losses', 'Anomaly detection'],
  },
  {
    slug: 'trafficwhatif',
    title: 'TrafficWhatIf',
    subtitle: 'Data for intervention-aware traffic prediction',
    intro:
      'Traffic forecasters predict the future from the past, but planners need to know what happens after they change the road network. Real data for that question barely exists, so this project starts by designing the data: a benchmark aimed at unseen cities and transfer from simulation to the real world.',
    image: '/media/trafficwhatif/pasadena.webp',
    imageAlt: 'Simulated road-sensor occupancy over a city street grid.',
    imageFit: 'cover',
    period: 'Sep 2026 – present',
    role: 'Team lead',
    status: 'Early stage',
    tags: ['Synthetic data', 'Sim-to-real', 'Graph shift'],
  },
  {
    slug: 'dementia-counterfactuals',
    title: 'Correlation-aware counterfactuals',
    subtitle: 'More realistic lifestyle advice from a dementia risk model',
    intro:
      'Counterfactual explainers such as DiCE change one risk factor while holding the others fixed, but BMI, blood pressure and activity move together. I am building a latent model that fills in the correlated changes, so suggested lifestyle edits stay physiologically plausible.',
    image: 'inline:dementia',
    imageAlt: 'Diagram: an edited feature propagates through a latent model to correlated features.',
    imageFit: 'contain',
    period: '2026 – present',
    role: 'Research assistant (continuing project)',
    status: 'Early stage',
    tags: ['Counterfactuals', 'Representation learning', 'Health'],
  },
  {
    slug: 'qwen-math-sft',
    title: 'Math SFT for Qwen2.5',
    subtitle: 'Fine-tuning a 0.5B model to give checkable answers',
    intro:
      'Supervised fine-tuning of Qwen2.5-0.5B on the noisy, auto-generated OpenR1-Math-220k data, with my own split and a bootstrap evaluation of every checkpoint. The model learned to put its final answer where a grader can find it; general math accuracy dipped slightly, which is the cost of imitating noisy solutions.',
    image: 'inline:qwen',
    imageAlt: 'Line sketch: answer-format accuracy rises over training checkpoints while MATH500 stays flat.',
    imageFit: 'contain',
    period: 'Spring 2025',
    role: 'Solo project',
    status: 'Released',
    tags: ['LLM fine-tuning', 'Noisy supervision', 'Evaluation design'],
  },
];
