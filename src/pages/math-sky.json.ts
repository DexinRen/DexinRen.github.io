import katex from 'katex';
import { formulas } from '../data/sky-formulas';

// Pre-rendered KaTeX HTML for the background shooting stars (see components/MathSky.astro).
export const GET = () =>
  new Response(JSON.stringify(formulas.map((f) => katex.renderToString(f, { throwOnError: false, output: 'html' }))), {
    headers: { 'Content-Type': 'application/json' },
  });
