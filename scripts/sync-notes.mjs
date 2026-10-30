#!/usr/bin/env node
// Build the site's wiki pages from your Obsidian vault, as listed in notes.manifest.json.
//
// Usage:  node scripts/sync-notes.mjs <path-to-obsidian-vault>
//         e.g. node scripts/sync-notes.mjs ~/MEGA/work
//
// Each manifest page is assembled from one or more vault notes. A source can be a whole note or
// selected sections of it (a heading plus everything under it), so one long note can be peeled
// into several topic pages. Optional find/replace "fixes" correct typos without touching the vault.
//
// Outputs (all regenerated on every run):
//   src/content/wiki/<area>/<page>.md   page bodies with frontmatter
//   public/notes-media/<image>          images embedded with ![[...]]
//   src/data/wiki-index.json            titles, urls, tags and links (used for wikilinks + graph)
//
// Your vault is only read, never modified.

import fs from 'node:fs';
import path from 'node:path';
import { slug as headingSlug } from 'github-slugger';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT_NOTES = path.join(ROOT, 'src/content/wiki');
const OUT_MEDIA = path.join(ROOT, 'public/notes-media');
const OUT_INDEX = path.join(ROOT, 'src/data/wiki-index.json');
const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp)$/i;
const COURSE_TAG = /^(csci|math|ee|cs)\d+/i;

// ---------------------------------------------------------------- pure helpers
const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, ' ').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');

const keyOf = (s) => s.trim().toLowerCase();

const basenameNoExt = (p) => path.basename(p).replace(/\.md$/i, '');

// Lines made only of Obsidian tags (e.g. "#CSCI675 #ConvexOptimization") become frontmatter tags.
const extractTagLines = (body) => {
  // Obsidian tags may contain any letters (e.g. #怪味), digits, _, / and -.
  const tagLine = /^\s*(#\p{L}[\p{L}\p{N}_/-]*\s*)+$/u;
  const lines = body.split('\n');
  const tags = lines.filter((l) => tagLine.test(l)).flatMap((l) => l.match(/#\p{L}[\p{L}\p{N}_/-]*/gu).map((t) => t.slice(1)));
  return { tags, body: lines.filter((l) => !tagLine.test(l)).join('\n') };
};

const wikilinkTargets = (body) =>
  [...body.matchAll(/(?<!!)\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)].map((m) => path.basename(m[1].trim()));

const imageEmbeds = (body) =>
  [...body.matchAll(/!\[\[([^\]|#]+?)(?:\|[^\]]*)?\]\]/g)].map((m) => m[1].trim()).filter((f) => IMAGE_EXT.test(f));

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    if (d.name.startsWith('.')) return [];
    const full = path.join(dir, d.name);
    return d.isDirectory() ? walk(full) : [full];
  });

const yamlString = (s) => JSON.stringify(s); // JSON strings are valid YAML scalars

// ---------------------------------------------------------------- headings and sections
// Headings outside code fences and display math: [{ i, level, text, line }]
const headingsOf = (lines) =>
  lines.reduce(
    (acc, line, i) => {
      if (/^\s*(```|~~~)/.test(line)) return { ...acc, fence: !acc.fence };
      if (!acc.fence && (line.match(/\$\$/g) ?? []).length % 2 === 1) return { ...acc, math: !acc.math };
      const m = !acc.fence && !acc.math && line.match(/^(#{1,6})\s+(.*?)\s*$/);
      return m ? { ...acc, heads: [...acc.heads, { i, level: m[1].length, text: m[2], line: line.trim() }] } : acc;
    },
    { heads: [], fence: false, math: false },
  ).heads;

// A section spec is "## Heading" (prefix match on the heading line) or { start: "## Heading", toEnd: true }.
const sectionRange = (lines, heads, rel) => (spec) => {
  const start = typeof spec === 'string' ? spec : spec.start;
  const h = heads.find((x) => x.line.startsWith(start.trim()));
  if (!h) throw new Error(`Section "${start}" not found in ${rel}`);
  if (typeof spec === 'object' && spec.toEnd) return [h.i, lines.length];
  const next = heads.find((x) => x.i > h.i && x.level <= h.level);
  return [h.i, next ? next.i : lines.length];
};

const inRanges = (ranges) => (i) => ranges.some(([a, b]) => i >= a && i < b);

// Shift heading levels so the shallowest heading becomes "##" (the page title is the h1).
const demoteHeadings = (text) => {
  const lines = text.split('\n');
  const heads = headingsOf(lines);
  const min = Math.min(...heads.map((h) => h.level));
  if (!heads.length || min === 2) return text;
  const shift = 2 - min;
  const at = new Map(heads.map((h) => [h.i, h]));
  return lines
    .map((l, i) => (at.has(i) ? '#'.repeat(Math.min(6, at.get(i).level + shift)) + ' ' + at.get(i).text : l))
    .join('\n');
};

const extractSource = (vault) => (src) => {
  const raw = fs.readFileSync(path.join(vault, src.from), 'utf8').replace(/\r\n/g, '\n');
  const { tags, body } = extractTagLines(raw);
  const lines = body.split('\n');
  const heads = headingsOf(lines);
  const range = sectionRange(lines, heads, src.from);
  const keep = src.sections ? inRanges(src.sections.map(range)) : () => true;
  const drop = inRanges((src.exclude ?? []).map(range));
  const text = lines.filter((_, i) => keep(i) && !drop(i)).join('\n').trim();
  const included = heads.filter((h) => keep(h.i) && !drop(h.i)).map((h) => h.text);
  return { from: src.from, text, tags, headings: included };
};

const applyFixes = (text, fixes, title) =>
  (fixes ?? []).reduce((t, f) => {
    if (!t.includes(f.find)) console.warn(`  fix not applied on "${title}" (text changed in vault?): ${f.find.slice(0, 60)}`);
    return t.split(f.find).join(f.replace);
  }, text);

// ---------------------------------------------------------------- Obsidian -> standard Markdown
// Applied outside fenced code blocks only.
const mapOutsideFences = (text, fn) =>
  text.split(/(^```[\s\S]*?^```[ \t]*$|^````[\s\S]*?^````[ \t]*$)/m).map((part, i) => (i % 2 ? part : fn(part))).join('');

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Obsidian accepts display math glued to text ("text\n$$", "$$x", "x$$"); remark-math needs
// the $$ fences on their own lines with a blank line before and after.
const countFences = (s) => (s.match(/\$\$/g) ?? []).length;

// Returns the output lines for one source line and whether a display block is still open after it.
const splitMathText = (lead, blank, s, inMath) => {
  const L = (t) => (t.trim() ? [lead + t.trim()] : []);
  if (inMath) {
    const i = s.indexOf('$$');
    if (i < 0) return { out: L(s).length ? [lead + s] : [lead], inMath: true };
    const rest = splitMathText(lead, blank, s.slice(i + 2), false);
    return { out: [...L(s.slice(0, i)), lead + '$$', blank, ...rest.out], inMath: rest.inMath };
  }
  const n = countFences(s);
  if (n === 2 && s.startsWith('$$') && s.endsWith('$$') && s.length > 4)
    return { out: [blank, lead + '$$', lead + s.slice(2, -2), lead + '$$', blank], inMath: false };
  if (n % 2 === 0) return { out: L(s), inMath: false };
  const j = s.lastIndexOf('$$');
  return { out: [...L(s.slice(0, j)), blank, lead + '$$', ...L(s.slice(j + 2))], inMath: true };
};

const splitMathLine = (line, inMath) => {
  if (!inMath && !line.includes('$$')) return { out: [line], inMath };
  // Indented fences inside list items rarely have indented bodies in Obsidian; hoist them to column 0.
  const [, rawLead, s] = line.match(/^(\s*(?:>\s*)*)(.*?)\s*$/);
  const lead = rawLead.includes('>') ? rawLead : '';
  const blank = lead.includes('>') ? lead.trimEnd() : '';
  if (inMath && !s.includes('$$')) return { out: [line], inMath };
  return splitMathText(lead, blank, s, inMath);
};

const normalizeDisplayMath = (chunk) =>
  chunk
    .split('\n')
    .reduce((acc, line) => {
      const r = splitMathLine(line, acc.inMath);
      return { lines: acc.lines.concat(r.out), inMath: r.inMath };
    }, { lines: [], inMath: false })
    .lines.join('\n')
    .replace(/\n{3,}/g, '\n\n');

// LaTeX-style \\( x \\) delimiters (pasted from elsewhere) -> $x$
const latexParens = (chunk) => chunk.replace(/\\\((.+?)\\\)/g, (_, x) => `$${x.replace(/\$/g, '').trim()}$`);

const convertObsidian = (urlOf) => (body) =>
  mapOutsideFences(body, (chunk) =>
    normalizeDisplayMath(latexParens(chunk))
      // image embeds: ![[file.png|300]]
      .replace(/!\[\[([^\]|#]+?\.(?:png|jpe?g|gif|svg|webp))(?:\|(\d+)(?:x\d+)?)?\]\]/gi, (_, file, width) =>
        width
          ? `<img src="/notes-media/${encodeURI(file.trim().toLowerCase())}" width="${width}" alt="" loading="lazy" />`
          : `![](</notes-media/${file.trim().toLowerCase()}>)`)
      // note embeds ![[Note]] become plain links
      .replace(/!\[\[([^\]]+)\]\]/g, '[[$1]]')
      // wikilinks: [[Target#Heading|Alias]]
      .replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, target, alias) => {
        const [page, ...headings] = target.split('#');
        const label = (alias?.trim() || (page.trim() ? path.basename(page.trim()) : headings.at(-1) ?? target)).trim();
        const url = page.trim() ? urlOf(path.basename(page.trim()), headings.at(-1)?.trim()) : '';
        const anchor = headings.length ? '#' + headingSlug(headings.at(-1).trim()) : '';
        if (page.trim() && !url) return `<span class="wl-missing" title="Not published yet">${escapeHtml(label)}</span>`;
        return `[${label.replace(/[[\]]/g, '')}](${url}${anchor})`;
      }),
  );

// ---------------------------------------------------------------- build the page records
const buildPage = (vault, manifest, orderInArea) => (page) => {
  const area = manifest.areas[page.area];
  if (!area) throw new Error(`Unknown area "${page.area}" on page "${page.title}"`);
  const parts = page.sources.map(extractSource(vault));
  const body = applyFixes(demoteHeadings(parts.map((p) => p.text).join('\n\n')), page.fixes, page.title);
  const noteSlug = page.slug ?? slugify(page.title);
  const credits = (page.credits ?? []).map((key) => {
    const c = manifest.credits[key];
    if (!c) throw new Error(`Unknown credit "${key}" on page "${page.title}"`);
    const lectures = page.lectures ?? [];
    return {
      text: c.text,
      courseLink: c.link ?? null,
      lectureLinks: c.lectureUrlPattern ? lectures.map((n) => ({ label: `Lecture ${n} (PDF)`, url: c.lectureUrlPattern.replace('{n}', n) })) : [],
    };
  });
  const tags = [...new Set([...(page.tags ?? []), ...parts.flatMap((p) => p.tags)])].filter((t) => !COURSE_TAG.test(t));
  return {
    title: page.title, body, tags, credits,
    area: area.name, areaSlug: page.area, noteSlug,
    id: `${page.area}/${noteSlug}`,
    url: `/notes/${page.area}/${noteSlug}/`,
    order: orderInArea(page),
    sources: parts.map((p) => ({ from: p.from, headings: p.headings })),
    targets: wikilinkTargets(body),
    images: imageEmbeds(body),
  };
};

const toMarkdown = (convert) => (r) =>
  [
    '---',
    `title: ${yamlString(r.title)}`,
    `area: ${yamlString(r.area)}`,
    `areaSlug: ${yamlString(r.areaSlug)}`,
    `tags: ${JSON.stringify(r.tags)}`,
    `order: ${r.order}`,
    `sources: ${JSON.stringify(r.sources.map((s) => s.from))}`,
    `credits: ${JSON.stringify(r.credits)}`,
    '---',
    '',
    convert(r.body).trimStart(),
  ].join('\n');

// Wikilink lookup: "note" -> first page built from that note (or with that title);
// "note#heading" -> the page that contains that heading.
const linkTables = (records) => {
  const byNote = Object.fromEntries(
    records.flatMap((r) => [[keyOf(r.title), r], ...r.sources.map((s) => [keyOf(basenameNoExt(s.from)), r])]).reverse(),
  );
  const byHeading = Object.fromEntries(
    records.flatMap((r) => r.sources.flatMap((s) => s.headings.map((h) => [keyOf(basenameNoExt(s.from)) + '#' + keyOf(h), r]))),
  );
  return { byNote, byHeading };
};

// ---------------------------------------------------------------- main (side effects at the edge)
const main = (vaultArg) => {
  if (!vaultArg) throw new Error('Usage: node scripts/sync-notes.mjs <path-to-obsidian-vault>');
  const vault = path.resolve(vaultArg.replace(/^~(?=$|\/)/, process.env.HOME ?? '~'));
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'notes.manifest.json'), 'utf8'));

  const missing = manifest.pages.flatMap((p) => p.sources.map((s) => s.from)).filter((rel) => !fs.existsSync(path.join(vault, rel)));
  if (missing.length) throw new Error(`Listed in manifest but not found in vault:\n  ${[...new Set(missing)].join('\n  ')}`);

  const orderInArea = (page) => manifest.pages.filter((p) => p.area === page.area).indexOf(page);
  const records = manifest.pages.map(buildPage(vault, manifest, orderInArea));
  const dupes = records.map((r) => r.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dupes.length) throw new Error(`Two pages map to the same URL: ${dupes.join(', ')} (set a "slug")`);

  const tables = linkTables(records);
  const resolve = (target, heading) =>
    (heading && tables.byHeading[keyOf(target) + '#' + keyOf(heading)]) || tables.byNote[keyOf(target)] || null;
  const resolveTargets = (r) => [...new Set(r.targets.map((t) => resolve(t)?.id).filter((id) => id && id !== r.id))];
  // "related": listed in the manifest, plus pages peeled from the same vault note
  const bySlug = Object.fromEntries(records.map((r) => [r.noteSlug, r.id]));
  const sameSource = (r) => records.filter((o) => o !== r && o.sources.some((s) => r.sources.some((t) => t.from === s.from))).map((o) => o.id);
  const relatedOf = (r) => {
    const page = manifest.pages.find((p) => (p.slug ?? slugify(p.title)) === r.noteSlug);
    const listed = (page.related ?? []).map((sl) => bySlug[sl] ?? (() => { throw new Error(`Unknown related slug "${sl}" on "${r.title}"`); })());
    return [...new Set([...listed, ...sameSource(r)])].filter((id) => !resolveTargets(r).includes(id));
  };

  // images: find each embedded file anywhere in the vault (Obsidian resolves by file name)
  const vaultImages = walk(vault).filter((f) => IMAGE_EXT.test(f));
  const findImage = (name) => vaultImages.find((f) => path.basename(f).toLowerCase() === name.toLowerCase());
  const wanted = [...new Set(records.flatMap((r) => r.images))];
  const unresolvedImages = wanted.filter((n) => !findImage(n));

  fs.rmSync(OUT_NOTES, { recursive: true, force: true });
  fs.rmSync(OUT_MEDIA, { recursive: true, force: true });
  fs.mkdirSync(OUT_MEDIA, { recursive: true });
  const render = toMarkdown(convertObsidian((target, heading) => resolve(target, heading)?.url ?? ''));
  records.forEach((r) => {
    const out = path.join(OUT_NOTES, r.areaSlug, `${r.noteSlug}.md`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, render(r));
  });
  wanted.filter(findImage).forEach((n) => fs.copyFileSync(findImage(n), path.join(OUT_MEDIA, n.toLowerCase())));

  const index = {
    generated: new Date().toISOString(),
    notes: records.map((r) => ({ id: r.id, title: r.title, area: r.area, areaSlug: r.areaSlug, url: r.url, tags: r.tags, links: resolveTargets(r), related: relatedOf(r) })),
  };
  fs.mkdirSync(path.dirname(OUT_INDEX), { recursive: true });
  fs.writeFileSync(OUT_INDEX, JSON.stringify(index, null, 1));

  console.log(`Synced ${records.length} pages from ${new Set(records.flatMap((r) => r.sources.map((s) => s.from))).size} notes, ${wanted.length - unresolvedImages.length} images.`);
  if (unresolvedImages.length) console.log(`Images not found in vault: ${unresolvedImages.join(', ')}`);
};

main(process.argv[2]);
