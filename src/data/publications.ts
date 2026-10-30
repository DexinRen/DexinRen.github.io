export interface Pub {
  title: string;
  authors: string[];          // "Dexin Ren" is bolded automatically
  venue: string;
  venueShort: string;
  year: number;
  type: string;               // e.g. "Short research paper"
  status?: string;            // e.g. "To appear"
  links: { label: string; href: string }[];
  project?: string;           // slug of related project page
  selected?: boolean;
  bibtex: string;
}

const rtAuthors = ['Dexin Ren', 'Shang-Ling Hsu', 'Chen Chu', 'Lifeng Lin', 'Ryosuke Shibasaki', 'Noboru Koshizuka', 'Cyrus Shahabi'];

export const pubs: Pub[] = [
  {
    title: 'RectifiedTraj: Map-Free Causal GPS Trajectory Denoising with Rectified Flow',
    authors: rtAuthors,
    venue: 'ACM SIGSPATIAL International Conference on Advances in Geographic Information Systems',
    venueShort: 'SIGSPATIAL 2026',
    year: 2026,
    type: 'Short research paper',
    status: 'To appear',
    links: [
      { label: 'DOI', href: 'https://doi.org/10.1145/3841645.3843430' },
      { label: 'Poster', href: '/media/rectifiedtraj/rectifiedtraj_poster.pdf' },
      { label: 'Code', href: 'https://github.com/DexinRen/RectifiedTraj' },
    ],
    project: 'rectifiedtraj',
    selected: true,
    bibtex: `@inproceedings{ren2026rectifiedtraj,
  title     = {RectifiedTraj: Map-Free Causal GPS Trajectory Denoising with Rectified Flow},
  author    = {Ren, Dexin and Hsu, Shang-Ling and Chu, Chen and Lin, Lifeng and Shibasaki, Ryosuke and Koshizuka, Noboru and Shahabi, Cyrus},
  booktitle = {Proceedings of the ACM SIGSPATIAL International Conference on Advances in Geographic Information Systems},
  year      = {2026},
  doi       = {10.1145/3841645.3843430}
}`,
  },
  {
    title: 'RectifiedTraj Revisited: An Expanded Evaluation of Map-Free Causal GPS Trajectory Denoising',
    authors: rtAuthors,
    venue: 'UMFM Workshop at ACM SIGSPATIAL',
    venueShort: 'UMFM @ SIGSPATIAL 2026',
    year: 2026,
    type: 'Long research paper (workshop)',
    status: 'To appear',
    links: [
      { label: 'DOI', href: 'https://doi.org/10.1145/3849729.3856129' },
      { label: 'Code', href: 'https://github.com/DexinRen/RectifiedTraj' },
    ],
    project: 'rectifiedtraj',
    selected: true,
    bibtex: `@inproceedings{ren2026rectifiedtrajrevisited,
  title     = {RectifiedTraj Revisited: An Expanded Evaluation of Map-Free Causal GPS Trajectory Denoising},
  author    = {Ren, Dexin and Hsu, Shang-Ling and Chu, Chen and Lin, Lifeng and Shibasaki, Ryosuke and Koshizuka, Noboru and Shahabi, Cyrus},
  booktitle = {Proceedings of the UMFM Workshop at ACM SIGSPATIAL},
  year      = {2026},
  doi       = {10.1145/3849729.3856129}
}`,
  },
  {
    title: 'Variational Autoencoder for Anti-Cancer Drug Response Prediction',
    authors: ['Hongyuan Dong', 'Jiaqing Xie', 'Zhi Jing', 'Dexin Ren'],
    venue: 'AI for Public Health Workshop at ICLR',
    venueShort: 'AI4PH @ ICLR 2021',
    year: 2021,
    type: 'Workshop paper',
    links: [{ label: 'arXiv', href: 'https://arxiv.org/abs/2008.09763' }],
    bibtex: `@article{dong2020vae,
  title   = {Variational Autoencoder for Anti-Cancer Drug Response Prediction},
  author  = {Dong, Hongyuan and Xie, Jiaqing and Jing, Zhi and Ren, Dexin},
  journal = {arXiv preprint arXiv:2008.09763},
  year    = {2020}
}`,
  },
];
