// @ts-check
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// KaTeX macros for commands Obsidian's MathJax accepts but KaTeX does not.
const katexMacros = {
  '\\set': '\\left\\{#1\\right\\}',
};

// Static output, deployed to GitHub Pages by .github/workflows/deploy.yml.
// The repo is named DexinRen.github.io, so the site is served from the domain root (no `base` needed).
export default defineConfig({
  site: 'https://dexinren.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  markdown: {
    // Plain code blocks styled by our own CSS (keeps the warm theme in light and dark mode).
    syntaxHighlight: false,
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { macros: katexMacros, throwOnError: false, strict: false }]],
  },
});
