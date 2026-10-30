// Display order and colour family for each wiki area (area slugs come from notes.manifest.json).
export const families = [
  { key: 'theory', label: 'Learning theory', slot: 2 },
  { key: 'online', label: 'Online learning & bandits', slot: 3 },
  { key: 'ml', label: 'Machine learning', slot: 1 },
  { key: 'math', label: 'Probability & numerical math', slot: 4 },
  { key: 'kitchen', label: 'Kitchen', slot: 5 },
] as const;

export const areas: { slug: string; family: (typeof families)[number]['key']; blurb: string }[] = [
  { slug: 'learning-theory', family: 'theory', blurb: 'Why learning from samples works: reference classes, symmetrization, covering numbers, chaining, fat-shattering, and what this says about neural networks.' },
  { slug: 'online-learning', family: 'online', blurb: 'Learning as a repeated game: protocols and feedback, regret, online-to-batch, Hedge, and bandit algorithms.' },
  { slug: 'machine-learning', family: 'ml', blurb: 'Generative models and the optimizers that train them.' },
  { slug: 'probability', family: 'math', blurb: 'Mixtures, tail bounds and conditional reasoning.' },
  { slug: 'numerical-linear-algebra', family: 'math', blurb: 'Solving least squares stably.' },
  { slug: 'cookbook', family: 'kitchen', blurb: 'Sichuan home cooking, with the notes I took when a step went wrong.' },
  { slug: 'kitchen-modules', family: 'kitchen', blurb: 'Reusable bases, sauces and enhancers that the dishes are composed from, the way I would structure a codebase.' },
];

export const familyOf = (areaSlug: string) => {
  const key = areas.find((a) => a.slug === areaSlug)?.family ?? 'math';
  return families.find((f) => f.key === key)!;
};
