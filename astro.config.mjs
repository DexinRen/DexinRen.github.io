// @ts-check
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { writeFileSync } from 'node:fs';

const SITE = 'https://dexinren.github.io';

// Writes dist/sitemap.xml after the build (no extra dependency): every HTML page except the 404 page.
// robots.txt points search engines to it.
const sitemap = () => ({
  name: 'local-sitemap',
  hooks: {
    'astro:build:done': ({ dir, pages }) => {
      const urls = pages
        .map((p) => p.pathname)
        .filter((p) => (p === '' || p.endsWith('/')) && !p.startsWith('404'))
        .sort()
        .map((p) => `  <url><loc>${new URL(p, SITE + '/').href}</loc></url>`);
      writeFileSync(new URL('sitemap.xml', dir),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
    },
  },
});

// KaTeX macros for commands Obsidian's MathJax accepts but KaTeX does not.
const katexMacros = {
  '\\set': '\\left\\{#1\\right\\}',
};

// Static output, deployed to GitHub Pages by .github/workflows/deploy.yml.
// The repo is named DexinRen.github.io, so the site is served from the domain root (no `base` needed).
export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
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
