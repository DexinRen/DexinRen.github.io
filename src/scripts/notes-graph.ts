// Force-directed graph of notes: notes are circles, tags are small nodes; links/related topics and tags are edges.
import { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCollide, type SimulationNodeDatum } from 'd3-force';

interface NoteIn { id: string; title: string; areaSlug: string; url: string; tags: string[]; links: string[]; related?: string[] }
interface GNode extends SimulationNodeDatum { id: string; label: string; kind: 'note' | 'tag'; url?: string; color: string; r: number; fam: number }
interface GLink { source: GNode; target: GNode; kind: 'ref' | 'tag' }

export function mountGraph(canvas: HTMLCanvasElement, notes: NoteIn[], famSlot: Record<string, number>, panel: HTMLElement) {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  const color = (slot: number) => v(`--series-${slot}`);
  const ink = v('--ink'), ink3 = v('--ink-3'), line = v('--line-strong'), bg = v('--surface'), ref = v('--series-ref');

  // ---- build graph
  const tagUse = new Map<string, number>();
  notes.forEach((n) => n.tags.forEach((t) => tagUse.set(t, (tagUse.get(t) ?? 0) + 1)));
  const noteNodes: GNode[] = notes.map((n) => ({ id: n.id, label: n.title, kind: 'note', url: n.url, color: color(famSlot[n.areaSlug] ?? 4), r: 5, fam: famSlot[n.areaSlug] ?? 4 }));
  const tagNodes: GNode[] = [...tagUse.entries()].filter(([, c]) => c >= 2).map(([t]) => ({ id: 'tag:' + t, label: '#' + t, kind: 'tag', color: ref, r: 3, fam: 0 }));
  const byId = new Map([...noteNodes, ...tagNodes].map((n) => [n.id, n]));
  const links: GLink[] = [];
  notes.forEach((n) => {
    [...n.links, ...(n.related ?? [])].forEach((l) => byId.has(l) && links.push({ source: byId.get(n.id)!, target: byId.get(l)!, kind: 'ref' }));
    n.tags.forEach((t) => byId.has('tag:' + t) && links.push({ source: byId.get(n.id)!, target: byId.get('tag:' + t)!, kind: 'tag' }));
  });
  const nodes = [...noteNodes, ...tagNodes];
  const deg = new Map<string, number>();
  links.forEach((l) => { deg.set(l.source.id, (deg.get(l.source.id) ?? 0) + 1); deg.set(l.target.id, (deg.get(l.target.id) ?? 0) + 1); });
  nodes.forEach((n) => { n.r = (n.kind === 'note' ? 5 : 3) + Math.sqrt(deg.get(n.id) ?? 0) * 1.4; });
  const neighbors = new Map<string, Set<string>>();
  links.forEach((l) => {
    if (!neighbors.has(l.source.id)) neighbors.set(l.source.id, new Set());
    if (!neighbors.has(l.target.id)) neighbors.set(l.target.id, new Set());
    neighbors.get(l.source.id)!.add(l.target.id); neighbors.get(l.target.id)!.add(l.source.id);
  });

  // ---- layout: families pulled toward four corners of a diamond so they read as regions
  const famPos: Record<number, [number, number]> = { 1: [-160, 40], 2: [150, -60], 3: [120, 150], 4: [-120, -140], 5: [-260, 200], 0: [0, 0] };
  const sim = forceSimulation<GNode>(nodes)
    .force('link', forceLink<GNode, GLink>(links).id((d) => d.id).distance((l) => (l.kind === 'ref' ? 40 : 55)).strength((l) => (l.kind === 'ref' ? 0.7 : 0.25)))
    .force('charge', forceManyBody<GNode>().strength((d) => (d.kind === 'note' ? -60 : -30)))
    .force('x', forceX<GNode>((d) => famPos[d.fam][0]).strength(0.06))
    .force('y', forceY<GNode>((d) => famPos[d.fam][1]).strength(0.06))
    .force('collide', forceCollide<GNode>((d) => d.r + 2));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { sim.stop(); for (let i = 0; i < 300; i++) sim.tick(); }

  // ---- view transform
  const ctx = canvas.getContext('2d')!;
  let W = 0, H = 0, dpr = 1;
  const view = { x: 0, y: 0, k: 1 };
  let hover: GNode | null = null, selected: GNode | null = null;
  let autoFit = true; // keep the whole graph in view until the reader pans or zooms
  const touch = matchMedia('(hover: none), (pointer: coarse)').matches;

  // On-screen radius never drops below ~4px (notes) / 2.5px (tags), so small screens stay tappable.
  const rad = (n: GNode) => Math.max(n.r, (n.kind === 'note' ? 4 : 2.5) / view.k);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    if (autoFit) fit();
    draw();
  }

  function fit() {
    const pad = 28;
    const xs = nodes.map((n) => n.x!), ys = nodes.map((n) => n.y!);
    const [x0, x1, y0, y1] = [Math.min(...xs) - 10, Math.max(...xs) + 10, Math.min(...ys) - 10, Math.max(...ys) + 22];
    view.k = Math.min(2, (W - 2 * pad) / (x1 - x0 || 1), (H - 2 * pad) / (y1 - y0 || 1));
    view.x = W / 2 - ((x0 + x1) / 2) * view.k;
    view.y = H / 2 - ((y0 + y1) / 2) * view.k;
  }
  const toWorld = (sx: number, sy: number) => [(sx - view.x) / view.k, (sy - view.y) / view.k];

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(view.x, view.y); ctx.scale(view.k, view.k);
    const focus = selected ?? hover;
    const near = focus ? neighbors.get(focus.id) ?? new Set() : null;
    // edges
    links.forEach((l) => {
      const on = focus && (l.source === focus || l.target === focus);
      ctx.globalAlpha = focus ? (on ? 0.9 : 0.08) : l.kind === 'ref' ? 0.55 : 0.28;
      ctx.strokeStyle = l.kind === 'ref' ? (on ? ink : line) : ref;
      ctx.lineWidth = (l.kind === 'ref' ? 1.4 : 0.9) / Math.sqrt(view.k);
      ctx.setLineDash(l.kind === 'tag' ? [3 / view.k, 3 / view.k] : []);
      ctx.beginPath(); ctx.moveTo(l.source.x!, l.source.y!); ctx.lineTo(l.target.x!, l.target.y!); ctx.stroke();
    });
    ctx.setLineDash([]);
    // nodes
    nodes.forEach((n) => {
      const dim = focus && n !== focus && !near!.has(n.id);
      ctx.globalAlpha = dim ? 0.18 : 1;
      ctx.beginPath(); ctx.arc(n.x!, n.y!, rad(n), 0, Math.PI * 2);
      ctx.fillStyle = n.color; ctx.fill();
      ctx.lineWidth = 2 / view.k; ctx.strokeStyle = bg; ctx.stroke();
      if (n === focus) { ctx.lineWidth = 2.5 / view.k; ctx.strokeStyle = ink; ctx.stroke(); }
    });
    // labels
    const fs = 12 / view.k;
    ctx.font = `${fs}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const placed: [number, number, number, number][] = [];
    const overlaps = (r: [number, number, number, number]) => placed.some((q) => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]);
    const priority = (n: GNode) => (n === focus ? 1e6 : 0) + (deg.get(n.id) ?? 0);
    [...nodes].sort((a, b) => priority(b) - priority(a)).forEach((n) => {
      const show = n === focus || (near && near.has(n.id)) || (!focus && view.k > 1.7 && n.kind === 'note') || (!focus && n.kind === 'note' && (deg.get(n.id) ?? 0) >= 6);
      if (!show) return;
      const text = n.label.length > 42 ? n.label.slice(0, 40) + '…' : n.label;
      const w = ctx.measureText(text).width, top = n.y! + rad(n) + 3 / view.k;
      const box: [number, number, number, number] = [n.x! - w / 2, top, n.x! + w / 2, top + fs * 1.2];
      if (n !== focus && overlaps(box)) return;
      placed.push(box);
      ctx.globalAlpha = 1;
      ctx.lineWidth = 3 / view.k; ctx.strokeStyle = bg; ctx.strokeText(text, n.x!, n.y! + rad(n) + 3 / view.k);
      ctx.fillStyle = n.kind === 'tag' ? ink3 : ink; ctx.fillText(text, n.x!, n.y! + rad(n) + 3 / view.k);
    });
    ctx.restore();
  }
  sim.on('tick', () => { if (autoFit) fit(); draw(); });

  // ---- hit testing
  function pick(sx: number, sy: number) {
    const [x, y] = toWorld(sx, sy);
    let best: GNode | null = null, bd = Infinity;
    nodes.forEach((n) => { const d = Math.hypot(n.x! - x, n.y! - y); if (d < rad(n) + (touch ? 12 : 6) / view.k && d < bd) { bd = d; best = n; } });
    return best as GNode | null;
  }
  function showPanel(n: GNode | null) {
    if (!n) { panel.hidden = true; return; }
    panel.hidden = false;
    panel.innerHTML = n.kind === 'note'
      ? `<p class="gp-t">${n.label.replace(/</g, '&lt;')}</p><a class="btn" href="${n.url}">Open note →</a>`
      : `<p class="gp-t">${n.label}</p><p class="small muted">Tag shared by ${neighbors.get(n.id)?.size ?? 0} notes</p>`;
  }

  // ---- pointer interaction: pan, pinch-zoom, drag nodes, hover, tap
  const pts = new Map<number, { x: number; y: number }>();
  let dragNode: GNode | null = null, moved = false, pinchD = 0, last = { x: 0, y: 0 };
  const local = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    const p = local(e); pts.set(e.pointerId, p); moved = false; last = p;
    if (pts.size === 1) {
      dragNode = pick(p.x, p.y);
      if (dragNode) { dragNode.fx = dragNode.x; dragNode.fy = dragNode.y; }
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()]; pinchD = Math.hypot(a.x - b.x, a.y - b.y); dragNode = null;
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = local(e);
    if (!pts.has(e.pointerId)) {
      if (!touch) { const h = pick(p.x, p.y); if (h !== hover) { hover = h; canvas.style.cursor = h ? 'pointer' : 'grab'; draw(); } }
      return;
    }
    const prev = pts.get(e.pointerId)!; pts.set(e.pointerId, p);
    if (Math.hypot(p.x - last.x, p.y - last.y) > 4) moved = true;
    if (pts.size === 2) {
      const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2; zoomAt(cx, cy, d / (pinchD || d)); pinchD = d;
    } else if (dragNode) {
      autoFit = false; const [x, y] = toWorld(p.x, p.y); dragNode.fx = x; dragNode.fy = y; sim.alphaTarget(0.3).restart();
    } else { autoFit = false; view.x += p.x - prev.x; view.y += p.y - prev.y; draw(); }
  });
  const end = (e: PointerEvent) => {
    const p = local(e); pts.delete(e.pointerId);
    if (dragNode) { dragNode.fx = null; dragNode.fy = null; sim.alphaTarget(0); }
    if (!moved && pts.size === 0) {
      const n = pick(p.x, p.y);
      if (n && n.kind === 'note' && (!touch || selected === n)) { location.href = n.url!; return; }
      selected = n; showPanel(n); draw();
    }
    dragNode = null;
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', (e) => { pts.delete(e.pointerId); dragNode = null; });
  canvas.addEventListener('pointerleave', () => { if (!touch && hover) { hover = null; draw(); } });
  function zoomAt(sx: number, sy: number, f: number) {
    autoFit = false; const k = Math.max(0.3, Math.min(5, view.k * f)); const r = k / view.k;
    view.x = sx - (sx - view.x) * r; view.y = sy - (sy - view.y) * r; view.k = k; draw();
  }
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); const p = local(e as unknown as PointerEvent); zoomAt(p.x, p.y, Math.exp(-e.deltaY * 0.0015)); }, { passive: false });

  // ---- external controls
  const api = {
    zoom: (f: number) => zoomAt(W / 2, H / 2, f),
    reset: () => { autoFit = true; fit(); selected = null; showPanel(null); draw(); },
    focus: (id: string) => {
      const n = byId.get(id); if (!n) return;
      const go = () => { autoFit = false; view.k = 1.6; view.x = W / 2 - n.x! * view.k; view.y = H / 2 - n.y! * view.k; selected = n; showPanel(n); draw(); };
      if (reduce) go(); else setTimeout(go, 1600);
    },
  };
  new ResizeObserver(resize).observe(canvas);
  resize();
  return api;
}
