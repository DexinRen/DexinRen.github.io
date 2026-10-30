# dexin_website

Personal research website for Dexin Ren, built with [Astro](https://astro.build) as a fully static site.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs static files to dist/
npm run preview    # serve dist/ locally
```

Requires Node 18.20+ (Node 20 or 22 recommended).

## Deploy on GitHub Pages

The site is built and published by `.github/workflows/deploy.yml` on every push to `main`.

1. Name the repository `DexinRen.github.io` (GitHub → Settings → General → Repository name), so the site is served at
   `https://dexinren.github.io/` with no sub-path.
2. Settings → **Pages** → Build and deployment → Source: **GitHub Actions**.
3. Push to `main`. The Actions tab shows the build; the site is live a minute later.

`site` in `astro.config.mjs` is already set to `https://dexinren.github.io`.

## Notes (Obsidian → wiki pages)

Wiki pages are generated from the Obsidian vault and committed, so the deploy does not need the vault.

```bash
node scripts/sync-notes.mjs ~/MEGA/work   # read-only on the vault; rewrites src/content/wiki/ and public/notes-media/
```

`notes.manifest.json` lists every page: its title, area, and which notes (whole, or selected sections) it is built from,
plus optional typo fixes and related pages. Only notes that are finished and carry your own reasoning belong there.

## Where to edit things

| What | File |
| --- | --- |
| Name, contacts, nav, status line | `src/data/site.ts` |
| News items (Home) | `src/data/news.ts` |
| Publications + BibTeX | `src/data/publications.ts` |
| Project cards (Research page) | `src/data/projects.ts` |
| Project detail pages | `src/pages/research/<slug>.astro` |
| CV page (HTML) | `src/pages/cv.astro`; PDF at `public/cv/Dexin_Ren_CV.pdf` |
| Wiki pages | `notes.manifest.json`, then run `scripts/sync-notes.mjs` |
| Home portrait | `src/components/Portrait.astro` (pass `src` once you have a photo) |
| Colors, fonts, spacing | `src/styles/global.css` (tokens at the top; light + dark) |
| Figures & media | `public/media/<project>/` |

Charts are drawn client-side from small JSON specs (`src/scripts/charts.ts`, wrapped by `src/components/Chart.astro`),
so they stay sharp and legible at every screen width and follow light/dark theme. Every chart has a "Show data table" fallback.

## Content provenance

- RectifiedTraj numbers/figures: published tables and figures in the SIGSPATIAL 2026 short paper and *RectifiedTraj Revisited* (UMFM 2026).
- NeurogenesisGNN: aggregate cohort-level results only (no patient-level data).
- HAYSTAC: aggregate experiment summaries only (relative scores; no code, no absolute competition scores).
- TrafficWhatIf: research direction + generated visualizations only (unpublished; no implementation details).
- CV PDF on the site: phone number removed.
