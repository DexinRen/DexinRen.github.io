// Lightweight responsive SVG charts (no dependencies).
// Each chart is a <div data-chart='{json}'> rendered at its real pixel width, so text stays legible on phones.
// Colors come from CSS custom properties (--series-1..4, --series-ref), so light/dark themes just work.

type Slot = 1 | 2 | 3 | 4 | 'ref';
interface LineSeries { name: string; values: (number | null)[]; slot: Slot; dashed?: boolean }
interface LineSpec {
  type: 'line'; x: string[]; series: LineSeries[]; yLog?: boolean; yLabel?: string; unit?: string;
  height?: number; decimals?: number; yMin?: number; yMax?: number; xLabel?: string;
}
interface BarItem { label: string; value: number; slot?: Slot; note?: string }
interface HBarSpec { type: 'hbar'; items: BarItem[]; unit?: string; decimals?: number; xLabel?: string; log?: boolean; signed?: boolean }
interface GroupSpec { type: 'ghbar'; series: { name: string; slot: Slot }[]; groups: { label: string; values: number[] }[]; unit?: string; decimals?: number; xLabel?: string; max?: number }
type Spec = LineSpec | HBarSpec | GroupSpec;

const NS = 'http://www.w3.org/2000/svg';
const col = (s: Slot) => (s === 'ref' ? 'var(--series-ref)' : `var(--series-${s})`);

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  parent?.appendChild(n);
  return n;
}
function text(parent: Element, x: number, y: number, s: string, cls = 'ct', anchor = 'start') {
  const t = el('text', { x, y, class: cls, 'text-anchor': anchor }, parent);
  t.textContent = s;
  return t;
}
let measurer: SVGSVGElement | null = null;
function textWidth(strs: string[]) {
  if (!measurer) {
    measurer = document.createElementNS(NS, 'svg');
    measurer.setAttribute('class', 'chart-svg');
    measurer.style.cssText = 'position:absolute;visibility:hidden;left:-9999px;top:0';
    document.body.appendChild(measurer);
  }
  let w = 0;
  for (const str of strs) {
    const t = el('text', { class: 'ct ink' }, measurer);
    t.textContent = str;
    w = Math.max(w, t.getComputedTextLength());
    t.remove();
  }
  return w;
}
const fmt = (v: number, d = 2, unit = '') => {
  const a = Math.abs(v);
  let s: string;
  if (a >= 1e6) s = v.toExponential(1).replace('e+', 'e');
  else if (a >= 1000) s = Math.round(v).toLocaleString('en-US');
  else s = v.toFixed(d);
  return s.replace(/^-/, '\u2212') + unit;
};
const logTick = (v: number) => (v >= 1e6 ? `1e${Math.round(Math.log10(v))}` : v >= 1000 ? `${v / 1000}k` : `${v}`);

function tickDec(t: number[]) {
  const step = t.length > 1 ? Math.abs(t[1] - t[0]) : 1;
  if (step >= 1) return 0;
  return (String(+step.toFixed(6)).split('.')[1] ?? '').length;
}
function niceTicks(min: number, max: number, n = 5) {
  const span = max - min || 1;
  const step0 = span / n;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= n) ?? 10 * mag;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(10));
  return out;
}

// ---------------------------------------------------------------- tooltip
function tooltip(host: HTMLElement) {
  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.hidden = true;
  host.appendChild(tip);
  return {
    show(html: string, x: number, y: number) {
      tip.innerHTML = html; tip.hidden = false;
      const w = tip.offsetWidth, hw = host.clientWidth;
      let left = x + 14;
      if (left + w > hw) left = x - w - 14;
      tip.style.left = `${Math.max(0, left)}px`;
      tip.style.top = `${Math.max(0, y - 10)}px`;
    },
    hide() { tip.hidden = true; },
  };
}
const sw = (s: Slot, dashed = false) =>
  `<span class="sw${dashed ? ' dashed' : ''}" style="--c:${col(s)}"></span>`;

function legend(host: HTMLElement, items: { name: string; slot: Slot; dashed?: boolean }[]) {
  if (items.length < 2) return;
  const lg = document.createElement('ul');
  lg.className = 'chart-legend';
  lg.innerHTML = items.map((i) => `<li>${sw(i.slot, i.dashed)}${i.name}</li>`).join('');
  host.appendChild(lg);
}

// ---------------------------------------------------------------- line
function line(host: HTMLElement, s: LineSpec) {
  legend(host, s.series);
  const W = host.clientWidth;
  const narrow = W < 520;
  const H = s.height ?? (narrow ? 260 : 300);
  const m = { t: 14, r: narrow ? 14 : 132, b: s.xLabel ? 46 : 30, l: 50 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const svg = el('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'chart-svg', role: 'img', 'aria-label': s.yLabel ?? 'line chart' });
  host.appendChild(svg);
  const all = s.series.flatMap((x) => x.values).filter((v): v is number => v != null);
  let y: (v: number) => number; let ticks: number[];
  if (s.yLog) {
    const lo = Math.floor(Math.log10(s.yMin ?? Math.min(...all))), hi = Math.ceil(Math.log10(s.yMax ?? Math.max(...all)));
    ticks = Array.from({ length: hi - lo + 1 }, (_, i) => 10 ** (lo + i));
    y = (v) => m.t + ih - ((Math.log10(v) - lo) / (hi - lo)) * ih;
  } else {
    ticks = niceTicks(s.yMin ?? Math.min(0, ...all), s.yMax ?? Math.max(...all));
    const lo = ticks[0], hi = ticks[ticks.length - 1];
    y = (v) => m.t + ih - ((v - lo) / (hi - lo)) * ih;
  }
  const n = s.x.length;
  const x = (i: number) => m.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);

  const grid = el('g', {}, svg);
  for (const t of ticks) {
    el('line', { x1: m.l, x2: m.l + iw, y1: y(t), y2: y(t), class: 'cg' }, grid);
    text(grid, m.l - 8, y(t) + 4, s.yLog ? logTick(t) : fmt(t, tickDec(ticks)), 'ct', 'end');
  }
  // long series (e.g. one point per checkpoint): label only every k-th point so ticks never overlap
  const every = Math.max(1, Math.ceil(s.x.length / (narrow ? 5 : 10)));
  s.x.forEach((lab, i) => { if (i % every === 0) text(grid, x(i), m.t + ih + 18, lab, 'ct', 'middle'); });
  if (s.xLabel) text(grid, m.l + iw / 2, H - 6, s.xLabel, 'ct muted', 'middle');
  if (s.yLabel) {
    const t = text(grid, 0, 0, s.yLabel, 'ct muted', 'middle');
    t.setAttribute('transform', `translate(12 ${m.t + ih / 2}) rotate(-90)`);
  }

  // lines (reference first so it sits underneath)
  const order = [...s.series].sort((a, b) => (a.slot === 'ref' ? -1 : 0) - (b.slot === 'ref' ? -1 : 0));
  const labelYs: { y: number; s: LineSeries }[] = [];
  for (const se of order) {
    const pts = se.values.map((v, i) => (v == null ? null : [x(i), y(v)] as const)).filter(Boolean) as [number, number][];
    el('path', {
      d: pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(''),
      fill: 'none', style: `stroke:${col(se.slot)}`, 'stroke-width': se.slot === 'ref' ? 1.5 : 2,
      'stroke-dasharray': se.dashed ? '5 4' : '', 'stroke-linejoin': 'round', 'stroke-linecap': 'round',
    }, svg);
    for (const p of pts) el('circle', { cx: p[0], cy: p[1], r: se.slot === 'ref' ? 3 : 4, style: `fill:${col(se.slot)}`, class: 'cm' }, svg);
    const last = pts[pts.length - 1];
    if (last) labelYs.push({ y: last[1], s: se });
  }
  // direct labels at the right edge (de-collided)
  if (!narrow && s.series.length <= 6) {
    labelYs.sort((a, b) => a.y - b.y);
    for (let i = 1; i < labelYs.length; i++) if (labelYs[i].y - labelYs[i - 1].y < 14) labelYs[i].y = labelYs[i - 1].y + 14;
    for (const l of labelYs) text(svg, m.l + iw + 10, l.y + 4, l.s.name, 'ct lbl');
  }

  // hover layer
  const tip = tooltip(host);
  const cross = el('line', { y1: m.t, y2: m.t + ih, class: 'cx', visibility: 'hidden' }, svg);
  const hit = el('rect', { x: m.l - 10, y: 0, width: iw + 20, height: H, fill: 'transparent' }, svg);
  const move = (ev: PointerEvent) => {
    const r = svg.getBoundingClientRect();
    const px = ev.clientX - r.left;
    const i = Math.max(0, Math.min(n - 1, Math.round(((px - m.l) / iw) * (n - 1))));
    cross.setAttribute('x1', String(x(i))); cross.setAttribute('x2', String(x(i))); cross.setAttribute('visibility', 'visible');
    const rows = s.series
      .filter((se) => se.values[i] != null)
      .map((se) => `<div class="tr">${sw(se.slot, se.dashed)}<span>${se.name}</span><b>${fmt(se.values[i] as number, s.decimals ?? 2, s.unit ?? '')}</b></div>`)
      .join('');
    tip.show(`<div class="th">${s.x[i]}</div>${rows}`, x(i), ev.clientY - r.top);
  };
  hit.addEventListener('pointermove', move);
  hit.addEventListener('pointerdown', move);
  hit.addEventListener('pointerleave', () => { tip.hide(); cross.setAttribute('visibility', 'hidden'); });
}

// ---------------------------------------------------------------- horizontal bars (supports signed + log)
function hbar(host: HTMLElement, s: HBarSpec) {
  const W = host.clientWidth;
  const narrow = W < 520;
  const rowH = narrow ? 40 : 26, barH = narrow ? 14 : 16;
  const labW = narrow ? 0 : Math.min(W * 0.42, textWidth(s.items.map((i) => i.label)) + 12);
  const hasNeg = !s.log && s.items.some((i) => i.value < 0);
  const pad = hasNeg ? 46 : 0;
  const m = { t: 8, r: 64, b: s.xLabel ? 38 : 22, l: labW + 8 + pad };
  const iw = W - m.l - m.r;
  const H = m.t + s.items.length * rowH + m.b;
  const svg = el('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'chart-svg', role: 'img', 'aria-label': s.xLabel ?? 'bar chart' });
  host.appendChild(svg);
  const vals = s.items.map((i) => i.value);
  let xs: (v: number) => number; let ticks: number[];
  if (s.log) {
    const lo = Math.floor(Math.log10(Math.min(...vals))), hi = Math.ceil(Math.log10(Math.max(...vals)));
    ticks = Array.from({ length: hi - lo + 1 }, (_, i) => 10 ** (lo + i)).filter((_, i, a) => a.length <= 8 || i % 2 === 0 || i === a.length - 1);
    xs = (v) => m.l + ((Math.log10(v) - lo) / (hi - lo)) * iw;
  } else {
    ticks = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), narrow ? 4 : 6);
    const lo = ticks[0], hi = ticks[ticks.length - 1];
    xs = (v) => m.l + ((v - lo) / (hi - lo)) * iw;
  }
  const base = s.log ? m.l : xs(0);
  for (const t of ticks) {
    el('line', { x1: xs(t), x2: xs(t), y1: m.t, y2: H - m.b + 4, class: 'cg' }, svg);
    text(svg, xs(t), H - m.b + 18, s.log ? logTick(t) + (s.unit ?? '') : fmt(t, tickDec(ticks)), 'ct', 'middle');
  }
  if (s.xLabel) {
    if (narrow) text(svg, 0, H - 4, s.xLabel, 'ct muted');
    else text(svg, m.l + iw / 2, H - 4, s.xLabel, 'ct muted', 'middle');
  }
  if (!s.log) el('line', { x1: base, x2: base, y1: m.t - 2, y2: H - m.b + 4, class: 'cz' }, svg);
  const tip = tooltip(host);
  s.items.forEach((it, i) => {
    const yTop = m.t + i * rowH + (narrow ? 18 : (rowH - barH) / 2);
    const x1 = xs(it.value);
    const left = Math.min(base, x1), w = Math.max(1.5, Math.abs(x1 - base));
    if (narrow) text(svg, m.l - pad, yTop - 5, it.label, 'ct ink');
    else text(svg, m.l - pad - 10, yTop + barH / 2 + 4, it.label, 'ct ink', 'end');
    // 4px rounded data-end, square at the baseline
    const r = Math.min(4, w / 2);
    const pos = it.value >= 0 || s.log;
    const d = pos
      ? `M${left},${yTop}h${w - r}a${r},${r} 0 0 1 ${r},${r}v${barH - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(w - r)}z`
      : `M${left + w},${yTop}h${-(w - r)}a${r},${r} 0 0 0 ${-r},${r}v${barH - 2 * r}a${r},${r} 0 0 0 ${r},${r}h${w - r}z`;
    el('path', { d, style: `fill:${col(it.slot ?? 'ref')}` }, svg);
    const vs = (s.signed && it.value > 0 ? '+' : '') + fmt(it.value, s.decimals ?? 2, s.unit ?? '');
    text(svg, pos ? left + w + 6 : left - 6, yTop + barH / 2 + 4, vs, 'ct val', pos ? 'start' : 'end');
    const hit = el('rect', { x: 0, y: m.t + i * rowH, width: W, height: rowH, fill: 'transparent' }, svg);
    const show = (ev: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      tip.show(`<div class="th">${it.label}</div><div class="tr">${sw(it.slot ?? 'ref')}<b>${vs}</b></div>${it.note ? `<div class="tn">${it.note}</div>` : ''}`, ev.clientX - r.left, ev.clientY - r.top);
    };
    hit.addEventListener('pointermove', show);
    hit.addEventListener('pointerdown', show);
    hit.addEventListener('pointerleave', () => tip.hide());
  });
}

// ---------------------------------------------------------------- grouped horizontal bars
function ghbar(host: HTMLElement, s: GroupSpec) {
  legend(host, s.series);
  const W = host.clientWidth;
  const narrow = W < 520;
  const k = s.series.length, barH = 12, gap = 2;
  const groupH = k * barH + (k - 1) * gap + (narrow ? 34 : 20);
  const labW = narrow ? 0 : Math.min(W * 0.4, textWidth(s.groups.map((g) => g.label)) + 12);
  const m = { t: 6, r: 56, b: s.xLabel ? 38 : 22, l: labW + 8 };
  const iw = W - m.l - m.r;
  const H = m.t + s.groups.length * groupH + m.b;
  const svg = el('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'chart-svg', role: 'img', 'aria-label': s.xLabel ?? 'grouped bar chart' });
  host.appendChild(svg);
  const max = s.max ?? Math.max(...s.groups.flatMap((g) => g.values));
  const ticks = niceTicks(0, max, narrow ? 4 : 5);
  const hi = ticks[ticks.length - 1];
  const xs = (v: number) => m.l + (v / hi) * iw;
  for (const t of ticks) {
    el('line', { x1: xs(t), x2: xs(t), y1: m.t, y2: H - m.b + 4, class: 'cg' }, svg);
    text(svg, xs(t), H - m.b + 18, fmt(t, 0), 'ct', 'middle');
  }
  if (s.xLabel) {
    if (narrow) text(svg, 0, H - 4, s.xLabel, 'ct muted');
    else text(svg, m.l + iw / 2, H - 4, s.xLabel, 'ct muted', 'middle');
  }
  el('line', { x1: m.l, x2: m.l, y1: m.t - 2, y2: H - m.b + 4, class: 'cz' }, svg);
  const tip = tooltip(host);
  s.groups.forEach((g, gi) => {
    const y0 = m.t + gi * groupH + (narrow ? 20 : 8);
    if (narrow) text(svg, m.l, y0 - 6, g.label, 'ct ink');
    else text(svg, m.l - 10, y0 + (k * barH + (k - 1) * gap) / 2 + 4, g.label, 'ct ink', 'end');
    g.values.forEach((v, si) => {
      const yy = y0 + si * (barH + gap);
      const w = Math.max(1.5, xs(v) - m.l), r = Math.min(4, w / 2);
      el('path', { d: `M${m.l},${yy}h${w - r}a${r},${r} 0 0 1 ${r},${r}v${barH - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(w - r)}z`, style: `fill:${col(s.series[si].slot)}` }, svg);
      text(svg, m.l + w + 6, yy + barH - 2, fmt(v, s.decimals ?? 0, s.unit ?? ''), 'ct val');
    });
    const hit = el('rect', { x: 0, y: y0 - (narrow ? 20 : 8), width: W, height: groupH, fill: 'transparent' }, svg);
    const show = (ev: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      tip.show(`<div class="th">${g.label}</div>` + s.series.map((se, si) => `<div class="tr">${sw(se.slot)}<span>${se.name}</span><b>${fmt(g.values[si], s.decimals ?? 0, s.unit ?? '')}</b></div>`).join(''), ev.clientX - r.left, ev.clientY - r.top);
    };
    hit.addEventListener('pointermove', show);
    hit.addEventListener('pointerdown', show);
    hit.addEventListener('pointerleave', () => tip.hide());
  });
}

// ---------------------------------------------------------------- mount
function render(host: HTMLElement) {
  const spec = JSON.parse(host.dataset.chart!) as Spec;
  host.querySelectorAll(':scope > svg, :scope > .chart-legend, :scope > .chart-tip').forEach((n) => n.remove());
  if (spec.type === 'line') line(host, spec);
  else if (spec.type === 'hbar') hbar(host, spec);
  else ghbar(host, spec);
}
export function mountCharts() {
  const hosts = Array.from(document.querySelectorAll<HTMLElement>('[data-chart]'));
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const h = e.target as HTMLElement;
      const w = Math.round(e.contentRect.width);
      if (w && h.dataset.w !== String(w)) { h.dataset.w = String(w); render(h); }
    }
  });
  hosts.forEach((h) => ro.observe(h));
}
