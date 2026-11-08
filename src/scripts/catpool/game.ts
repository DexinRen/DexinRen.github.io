// Devil-cat pool: rules, turns, computer player, rendering and input.
import {
  TW, TH, R, RAIL, POCKETS, newRack, step, newEvents, cloneBalls, moving, isSolid, isStripe,
  type Ball, type Capsule, type StepEvents,
} from './world';
import { Cat } from './cat';

type Group = 'solid' | 'stripe';
interface Player { name: string; hp: number; group: Group | null; ai: boolean }
type Phase = 'aim' | 'place' | 'rolling' | 'ai' | 'over';

const H = 1 / 240;                 // physics step
const VMAX = 5;                    // fastest shot (m/s)
const PULL_MAX = 0.45;             // drag distance for full power (m)
const AI_SIGHT = 2.0;              // the computer only foresees each ball's first ~2 m of travel
const BALL_COL: Record<number, string> = {
  1: '#e8b923', 2: '#2b59c3', 3: '#d13b2f', 4: '#6b3fa0', 5: '#e87a1c', 6: '#1f8a4c', 7: '#8a2b2b', 8: '#151515',
};
const colOf = (id: number) => BALL_COL[id > 8 ? id - 8 : id];
const groupOf = (id: number): Group | null => (isSolid(id) ? 'solid' : isStripe(id) ? 'stripe' : null);
const inGroup = (id: number, g: Group) => (g === 'solid' ? isSolid(id) : isStripe(id));

interface Shot { potted: { id: number; cause: string }[]; firstHit: number | null; isBreak: boolean; t: number; rest: number }

export function mountCatPool(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const msgEl = $('.cp-msg'), overEl = $('.cp-over'), clawEl = $('.cp-claw');
  const modeBtn = $<HTMLButtonElement>('.cp-mode'), newBtn = $<HTMLButtonElement>('.cp-new');
  const playerEls = [0, 1].map((i) => $(`.cp-p[data-i="${i}"]`));
  const angerEl = $('.cp-anger'), grudgeEl = $('.cp-grudge');

  let vsAI = true;
  let balls: Ball[] = [];
  let cat = new Cat();
  let players: Player[] = [];
  let cur = 0;
  let phase: Phase = 'aim';
  let ballInHand = false;
  let shot: Shot | null = null;
  let firstShot = true;
  let aim: { px: number; py: number; on: boolean } = { px: 0, py: 0, on: false };
  let placeGhost: { x: number; y: number } | null = null;
  let ai: { wait: number; queue: (() => Cand | null)[]; best: Cand | null; stroke: number; replan?: boolean } | null = null;
  let shake = 0;
  let log: string[] = [];

  // ------------------------------------------------------------ setup
  function reset() {
    balls = newRack();
    cat = new Cat();
    players = [
      { name: 'You', hp: 3, group: null, ai: false },
      { name: vsAI ? 'Computer' : 'Player 2', hp: 3, group: null, ai: vsAI },
    ];
    cur = 0; phase = 'aim'; ballInHand = false; shot = null; firstShot = true; ai = null; log = [];
    overEl.hidden = true;
    say('Break! Drag back from the cue ball to aim; let go to shoot. Try not to touch the cat.');
    renderHud();
  }

  function say(t: string) { log.unshift(t); log = log.slice(0, 3); msgEl.innerHTML = log.map((l, i) => `<span class="${i ? 'old' : ''}">${l}</span>`).join(''); }
  const cue = () => balls[0];
  const live = () => balls.filter((b) => !b.potted);
  const left = (g: Group) => balls.filter((b) => !b.potted && inGroup(b.id, g)).length;
  const human = () => !players[cur].ai;

  // ------------------------------------------------------------ geometry helpers
  function freeSpot(x: number, y: number, ignore?: Ball): { x: number; y: number } {
    for (let ring = 0; ring < 40; ring++) {
      for (let k = 0; k < Math.max(1, ring * 6); k++) {
        const a = (k / Math.max(1, ring * 6)) * Math.PI * 2, rr = ring * R * 1.2;
        const px = Math.min(TW - R, Math.max(R, x + Math.cos(a) * rr)), py = Math.min(TH - R, Math.max(R, y + Math.sin(a) * rr));
        if (validSpot(px, py, ignore)) return { x: px, y: py };
      }
    }
    return { x, y };
  }
  function validSpot(x: number, y: number, ignore?: Ball): boolean {
    if (x < R || x > TW - R || y < R || y > TH - R) return false;
    for (const b of balls) if (b !== ignore && !b.potted && Math.hypot(b.x - x, b.y - y) < 2 * R + 0.002) return false;
    for (const c of cat.shape()) if (segDist(x, y, c) < c.r + R + 0.005) return false;
    return true;
  }
  function segDist(x: number, y: number, c: Capsule) {
    const ex = c.bx - c.ax, ey = c.by - c.ay, L2 = ex * ex + ey * ey;
    let t = L2 ? ((x - c.ax) * ex + (y - c.ay) * ey) / L2 : 0; t = Math.max(0, Math.min(1, t));
    return Math.hypot(x - (c.ax + ex * t), y - (c.ay + ey * t));
  }
  /** Does the cue stick (from just behind the cue ball, `len` long, pointing away from dir) overlap the cat? */
  function stickHitsCat(dx: number, dy: number, pull: number, caps: Capsule[]): boolean {
    const c = cue(), len = 0.25 + pull;
    for (let s = 0; s <= 1; s += 0.05) {
      const px = c.x - dx * (R + 0.01 + s * len), py = c.y - dy * (R + 0.01 + s * len);
      for (const k of caps) if (segDist(px, py, k) < k.r + 0.008) return true;
    }
    return false;
  }
  function respotCue() {
    const c = cue(), p = freeSpot(TW * 0.25, TH / 2, c);
    Object.assign(c, { x: p.x, y: p.y, vx: 0, vy: 0, potted: false, hugged: false, cause: 'none' });
  }

  // ------------------------------------------------------------ anger
  function addAnger(points: number, who: number, why: string) {
    const r = cat.anger(points);
    if (why) say(why);
    if (r.ups > 0 && cat.level === 2) say('The cat flattens its ears. It is getting annoyed.');
    if (r.fetch) fetchBall();
    if (r.scratch) scratch(who);
    renderHud();
  }
  function scratch(who: number) {
    cat.startScratch();
    players[who].hp = Math.max(0, players[who].hp - 1);
    cat.calm();
    shake = 0.45;
    clawEl.classList.remove('go'); void clawEl.offsetWidth; clawEl.classList.add('go');
    say(`The cat lost its temper and scratched ${players[who].ai ? 'the computer' : who === 0 ? 'you' : 'Player 2'}! (−1 HP)`);
    renderHud();
    if (players[who].hp === 0) finish(1 - who, `${players[who].name === 'You' ? 'You were' : players[who].name + ' was'} scratched out of the game.`);
  }
  function fetchBall() {
    const pool = balls.filter((b) => b.potted && b.id !== 0 && b.id !== 8);
    if (!pool.length) { say('The cat checks the pockets for a ball to steal, but they are empty.'); return; }
    const b = pool[Math.floor(Math.random() * pool.length)];
    cat.startFetch();
    const h = cat.head(), p = freeSpot(h.x + Math.cos(cat.th) * 0.12, h.y + Math.sin(cat.th) * 0.12, b);
    Object.assign(b, { x: p.x, y: p.y, vx: 0, vy: 0, potted: false, hugged: false, cause: 'cat' });
    say(`Grudge! The cat drags the ${b.id} ball back out of a pocket.`);
  }

  // ------------------------------------------------------------ rules
  function finish(winner: number, why: string) {
    phase = 'over'; ai = null; aim.on = false;
    const youWin = vsAI ? winner === 0 : true;
    overEl.hidden = false;
    overEl.querySelector('.t')!.textContent = vsAI ? (youWin ? 'You win!' : 'You lose') : `${players[winner].name} wins!`;
    overEl.querySelector('.s')!.textContent = why;
    say(why);
    renderHud();
  }

  /** The 8 went down while `who` was at the table. */
  function eightDown(who: number, byCat: boolean, isBreak: boolean): boolean {
    const p = players[who], e = balls.find((b) => b.id === 8)!;
    if (isBreak) {
      const s = freeSpot(TW * 0.72, TH / 2, e);
      Object.assign(e, { x: s.x, y: s.y, vx: 0, vy: 0, potted: false });
      say('The 8 dropped on the break. Back on its spot it goes.');
      return false;
    }
    const cleared = p.group !== null && left(p.group) === 0;
    const name = p.name === 'You' ? 'you' : p.name;
    if (cleared) finish(who, byCat ? `The cat sank the 8 for ${name}, and ${name === 'you' ? 'your' : 'their'} group was already cleared. Thanks, cat.` : `${p.name} cleared the group and sank the 8.`);
    else finish(1 - who, byCat ? `The cat sank the 8 on ${name === 'you' ? 'your' : name + "'s"} turn before the group was cleared. It knows the rules.` : `The 8 went down early. ${p.name === 'You' ? 'You lose' : p.name + ' loses'}.`);
    return true;
  }

  /** A ball the cat knocked in between shots counts for whoever's turn it is. */
  function catPot(id: number) {
    if (phase === 'over') return;
    if (id === 0) { respotCue(); say('The cat knocked the cue ball into a pocket. Not your fault: it is back on the table.'); return; }
    if (id === 8) { eightDown(cur, true, false); return; }
    say(`The cat knocked the ${id} ball into a pocket. It counts for ${players[cur].name === 'You' ? 'you' : players[cur].name}.`);
    checkOpponentCleared(cur, [id]);
    renderHud();
  }

  function checkOpponentCleared(who: number, ids: number[]): boolean {
    const o = players[1 - who];
    if (o.group && left(o.group) === 0 && ids.some((id) => inGroup(id, o.group!))) {
      finish(1 - who, `${players[who].name === 'You' ? 'You' : players[who].name} pocketed the last of ${o.name === 'You' ? 'your' : o.name + "'s"} balls, so ${o.name === 'You' ? 'you win' : o.name + ' wins'}.`);
      return true;
    }
    return false;
  }

  function shoot(dx: number, dy: number, speed: number, pull: number) {
    const c = cue();
    const caps = cat.shape();
    for (const b of balls) { b.cause = 'none'; b.dist = 0; }
    shot = { potted: [], firstHit: null, isBreak: firstShot, t: 0, rest: 0 };
    firstShot = false;
    phase = 'rolling'; aim.on = false; ballInHand = false;
    if (stickHitsCat(dx, dy, pull, caps)) addAnger(2, cur, `${players[cur].name === 'You' ? 'You' : players[cur].name} poked the cat with the cue.`);
    if (c.hugged) { addAnger(1, cur, 'The cat is holding the cue ball. It did not move, and the cat did not like being poked.'); return; }
    c.cause = 'player'; c.vx = dx * speed; c.vy = dy * speed;
  }

  function resolve() {
    const s = shot!; shot = null;
    if (phase === 'over') return;
    const p = players[cur], o = players[1 - cur];
    const ids = s.potted.map((q) => q.id);
    const cueFoul = s.potted.some((q) => q.id === 0 && q.cause !== 'cat');
    if (ids.includes(0)) respotCue();
    if (ids.includes(8)) {
      if (cueFoul && !s.isBreak) { finish(1 - cur, `${p.name === 'You' ? 'You' : p.name} sank the 8 and scratched. That loses.`); return; }
      const byCat = s.potted.find((q) => q.id === 8)!.cause === 'cat';
      if (eightDown(cur, byCat, s.isBreak)) return;
    }
    // first legal pot assigns the groups
    if (!p.group) {
      const first = ids.find((id) => groupOf(id));
      if (first !== undefined && !s.isBreak) {
        p.group = groupOf(first)!; o.group = p.group === 'solid' ? 'stripe' : 'solid';
        say(`${p.name === 'You' ? 'You are' : p.name + ' is'} ${p.group === 'solid' ? 'SOLIDS: the plain-coloured balls 1–7' : 'STRIPES: the white balls with a colour band, 9–15'}. ${o.name === 'You' ? 'You get' : o.name + ' gets'} the ${o.group}s.`);
      }
    }
    if (checkOpponentCleared(cur, ids)) return;
    const potted = ids.filter((id) => id !== 0).length;
    if (cueFoul) {
      say(`Scratch! ${o.name === 'You' ? 'You get' : o.name + ' gets'} ball in hand.`);
      next(true);
    } else if (potted > 0) {
      say(`${potted} ball${potted > 1 ? 's' : ''} down. ${p.name === 'You' ? 'Shoot again.' : p.name + ' shoots again.'}`);
      next(false, true);
    } else {
      next(false);
    }
  }

  function next(inHand: boolean, same = false) {
    if (!same) cur = 1 - cur;
    ballInHand = inHand;
    renderHud();
    if (players[cur].ai) { phase = 'ai'; startAI(); }
    else if (inHand) { phase = 'place'; say(`${players[cur].name === 'You' ? 'Your' : players[cur].name + "'s"} ball in hand: click the table to place the cue ball.`); }
    else phase = 'aim';
  }

  // ------------------------------------------------------------ computer player
  interface Cand { dx: number; dy: number; v: number; place?: { x: number; y: number }; score: number }

  function simulate(bs: Ball[], caps: Capsule[], cx: number, cy: number, dx: number, dy: number, v: number) {
    const w = cloneBalls(bs);
    const c = w[0]; c.x = cx; c.y = cy; c.potted = false;
    for (const b of w) { b.cause = 'none'; b.dist = 0; }
    c.cause = 'player'; c.vx = dx * v; c.vy = dy * v;
    const ev = newEvents();
    const still = caps.map((k) => ({ ...k, vx: 0, vy: 0 }));
    for (let t = 0; t < 7; t += 1 / 200) { step(w, still, 1 / 200, ev); if (!moving(w)) break; }
    return ev;
  }

  function scoreShot(ev: StepEvents, me: Player): number {
    let s = 0;
    const g = me.group, og: Group | null = g ? (g === 'solid' ? 'stripe' : 'solid') : null;
    const ids = ev.potted.map((q) => q.id);
    const clearedBefore = g ? left(g) === 0 : false;
    for (const id of ids) {
      if (id === 0) s -= 25;
      else if (id === 8) s += clearedBefore ? 200 : -300;
      else if (!g) s += 9;
      else if (inGroup(id, g)) s += 10;
      else s -= 5;
    }
    if (og && ids.filter((id) => inGroup(id, og)).length >= left(og) && left(og) > 0) s -= 200;
    for (const t of ev.catTouches) if (t.dist < AI_SIGHT) s -= 30;   // it only sees the first stretch of each path
    if (ev.firstHit === null) s -= 2;
    return s;
  }

  let aiWaits = 0;
  function startAI() {
    const me = players[cur];
    if (cue().hugged && aiWaits < 3) {
      aiWaits++;
      ai = { wait: 1.6, queue: [], best: null, stroke: 0, replan: true };
      say(`${me.name} waits for the cat to let go of the cue ball…`);
      return;
    }
    aiWaits = 0;
    const caps = cat.shape();
    const cleared = me.group !== null && left(me.group) === 0;
    const targets = live().filter((b) => b.id !== 0 && !b.hugged && (cleared ? b.id === 8 : b.id !== 8 && (!me.group || inGroup(b.id, me.group))));
    const queue: (() => Cand | null)[] = [];
    const speeds = [1.5, 2.4, 3.4];
    for (const t of targets) for (const p of POCKETS) {
      const pdx = p.x - t.x, pdy = p.y - t.y, pd = Math.hypot(pdx, pdy);
      const ux = pdx / pd, uy = pdy / pd;
      const gx = t.x - ux * 2 * R, gy = t.y - uy * 2 * R;
      // cue position: where it is, or (ball in hand) lined up straight behind the ghost ball
      const places = ballInHand ? [{ x: gx - ux * 0.3, y: gy - uy * 0.3 }] : [{ x: cue().x, y: cue().y }];
      for (const pl of places) {
        if (ballInHand && !validSpot(pl.x, pl.y, cue())) continue;
        const ax = gx - pl.x, ay = gy - pl.y, ad = Math.hypot(ax, ay);
        if (ad < 1e-6) continue;
        const dx = ax / ad, dy = ay / ad;
        if (dx * ux + dy * uy < 0.3) continue;               // too thin a cut
        for (const v of speeds) queue.push(() => {
          const ev = simulate(balls, caps, pl.x, pl.y, dx, dy, v);
          let sc = scoreShot(ev, me);
          if (ev.potted.some((q) => q.id === t.id)) sc += 4;
          if (stickHitsCat(dx, dy, v / VMAX * PULL_MAX, caps)) sc -= 30;
          return { dx, dy, v, place: ballInHand ? pl : undefined, score: sc };
        });
      }
    }
    // a few plain safety shots in case nothing pots
    for (let k = 0; k < 10; k++) queue.push(() => {
      const pl = ballInHand ? freeSpot(TW * 0.25, TH / 2, cue()) : { x: cue().x, y: cue().y };
      const tg = targets[Math.floor(Math.random() * Math.max(1, targets.length))] ?? live()[1];
      if (!tg) return null;
      const a = Math.atan2(tg.y - pl.y, tg.x - pl.x) + (Math.random() - 0.5) * 0.3;
      const dx = Math.cos(a), dy = Math.sin(a), v = 1.2 + Math.random() * 1.6;
      const ev = simulate(balls, caps, pl.x, pl.y, dx, dy, v);
      let sc = scoreShot(ev, me) - 1;
      if (stickHitsCat(dx, dy, v / VMAX * PULL_MAX, caps)) sc -= 30;
      return { dx, dy, v, place: ballInHand ? pl : undefined, score: sc };
    });
    ai = { wait: 0.8, queue, best: null, stroke: 0 };
    say(`${me.name} is thinking…`);
  }

  function aiTick(dt: number) {
    if (!ai) return;
    if (ai.wait > 0) { ai.wait -= dt; return; }
    if (ai.replan) { startAI(); return; }
    if (ai.queue.length) {
      const t0 = performance.now();
      while (ai.queue.length && performance.now() - t0 < 8) {
        const c = ai.queue.shift()!();
        if (c && (!ai.best || c.score > ai.best.score)) ai.best = c;
      }
      return;
    }
    const b = ai.best;
    if (!b) { next(false); return; }
    if (b.place && ai.stroke === 0) {
      const c = cue(); Object.assign(c, { x: b.place.x, y: b.place.y, vx: 0, vy: 0, potted: false });
    }
    // show the cue stick drawing back, then strike (with a little human error)
    ai.stroke += dt;
    const pull = (b.v / VMAX) * PULL_MAX * Math.min(1, ai.stroke / 0.6);
    aim = { px: cue().x - b.dx * (R + pull), py: cue().y - b.dy * (R + pull), on: true };
    if (ai.stroke >= 0.9) {
      const err = (Math.random() - 0.5) * 0.02, a = Math.atan2(b.dy, b.dx) + err;
      ai = null;
      shoot(Math.cos(a), Math.sin(a), b.v * (0.96 + Math.random() * 0.08), (b.v / VMAX) * PULL_MAX);
    }
  }

  // ------------------------------------------------------------ input
  const portrait = () => root.clientWidth < 560;
  let S = 1;                                   // px per metre
  function toWorld(ev: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    const X = (ev.clientX - r.left) / S, Y = (ev.clientY - r.top) / S;
    return portrait() ? { x: Y - RAIL, y: TH + RAIL - X } : { x: X - RAIL, y: Y - RAIL };
  }
  canvas.addEventListener('pointerdown', (e) => {
    const p = toWorld(e);
    if (phase === 'place' && human()) {
      if (validSpot(p.x, p.y, cue())) {
        Object.assign(cue(), { x: p.x, y: p.y, vx: 0, vy: 0, potted: false, hugged: false });
        phase = 'aim'; placeGhost = null; say('Placed. Now drag back to aim.');
      }
      return;
    }
    if (phase !== 'aim' || !human() || moving([cue()])) return;
    canvas.setPointerCapture(e.pointerId);
    aim = { px: p.x, py: p.y, on: true };
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = toWorld(e);
    if (phase === 'place' && human()) placeGhost = p;
    if (aim.on && phase === 'aim') { aim.px = p.x; aim.py = p.y; }
  });
  const release = () => {
    if (!aim.on || phase !== 'aim') return;
    const c = cue(), dx = c.x - aim.px, dy = c.y - aim.py, d = Math.hypot(dx, dy);
    const pull = Math.min(PULL_MAX, Math.max(0, d - R * 1.5));
    aim.on = false;
    if (pull < 0.02) return;
    shoot(dx / d, dy / d, (pull / PULL_MAX) * VMAX, pull);
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', () => { aim.on = false; });

  modeBtn.addEventListener('click', () => { vsAI = !vsAI; modeBtn.textContent = vsAI ? 'Mode: vs computer' : 'Mode: 2 players'; reset(); });
  newBtn.addEventListener('click', reset);
  overEl.querySelector('button')?.addEventListener('click', reset);

  // ------------------------------------------------------------ HUD
  let hudKey = '';
  function renderHud() {
    const key = JSON.stringify([players, cur, phase, cat.level, cat.grudge]);
    if (key === hudKey) return;
    hudKey = key;
    players.forEach((p, i) => {
      const el = playerEls[i];
      el.classList.toggle('on', i === cur && phase !== 'over');
      el.querySelector('.n')!.textContent = p.name;
      const g = el.querySelector('.g')!;
      if (!p.group) g.innerHTML = 'open table · first pot picks';
      else if (left(p.group) === 0) g.innerHTML = `<b class="mb eight"></b>now the 8`;
      else g.innerHTML = `<b class="mb ${p.group}"></b>${p.group === 'solid' ? 'solids' : 'stripes'} · ${left(p.group)} left`;
      el.querySelector('.hp')!.innerHTML = [0, 1, 2].map((k) => `<i class="${k < p.hp ? 'full' : ''}"></i>`).join('');
    });
    angerEl.innerHTML = [1, 2, 3].map((k) => `<i class="${cat.level >= k ? 'on l' + k : ''}"></i>`).join('') + `<span>${['', 'sleepy', 'annoyed', 'furious'][cat.level]}</span>`;
    grudgeEl.innerHTML = [0, 1, 2, 3, 4].map((k) => `<i class="${k < cat.grudge % 5 ? 'on' : ''}"></i>`).join('');
  }

  // ------------------------------------------------------------ drawing
  function css(name: string) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  let theme = { dark: false, fur: '', edge: '' };
  function readTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    theme = { dark, fur: dark ? '#151212' : '#2b2626', edge: dark ? '#857a72' : '#5a504b' };
  }
  readTheme();
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function resize() {
    const w = root.querySelector<HTMLElement>('.cp-stage')!.clientWidth;
    const pw = portrait();
    const ww = pw ? TH + 2 * RAIL : TW + 2 * RAIL, wh = pw ? TW + 2 * RAIL : TH + 2 * RAIL;
    S = w / ww;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.width = `${w}px`; canvas.style.height = `${wh * S}px`;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(wh * S * dpr);
  }
  window.addEventListener('resize', resize);

  function worldTransform(extra = 0) {
    const dpr = canvas.width / (S * (portrait() ? TH + 2 * RAIL : TW + 2 * RAIL));
    const s = S * dpr;
    const ox = (Math.random() - 0.5) * extra, oy = (Math.random() - 0.5) * extra;
    if (portrait()) ctx.setTransform(0, s, -s, 0, (RAIL + TH) * s + ox, RAIL * s + oy);
    else ctx.setTransform(s, 0, 0, s, RAIL * s + ox, RAIL * s + oy);
    return s;
  }

  function drawTable() {
    const felt = theme.dark ? '#2e5a46' : '#3f7258', cushion = theme.dark ? '#244a39' : '#33604a';
    const wood = theme.dark ? '#4a3021' : '#6e4529', wood2 = theme.dark ? '#5a3a28' : '#83552f';
    ctx.fillStyle = wood; roundRect(-RAIL, -RAIL, TW + 2 * RAIL, TH + 2 * RAIL, 0.07); ctx.fill();
    ctx.strokeStyle = wood2; ctx.lineWidth = 0.012; roundRect(-RAIL + 0.02, -RAIL + 0.02, TW + 2 * RAIL - 0.04, TH + 2 * RAIL - 0.04, 0.055); ctx.stroke();
    ctx.fillStyle = cushion; ctx.fillRect(-0.045, -0.045, TW + 0.09, TH + 0.09);
    ctx.fillStyle = felt; ctx.fillRect(0, 0, TW, TH);
    // diamonds
    ctx.fillStyle = '#e9dcc0';
    for (let i = 1; i < 8; i++) if (i !== 4) for (const y of [-0.085, TH + 0.085]) { ctx.beginPath(); ctx.arc((TW / 8) * i, y, 0.009, 0, Math.PI * 2); ctx.fill(); }
    for (let i = 1; i < 4; i++) for (const x of [-0.085, TW + 0.085]) { ctx.beginPath(); ctx.arc(x, (TH / 4) * i, 0.009, 0, Math.PI * 2); ctx.fill(); }
    // head string + foot spot
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 0.004;
    ctx.beginPath(); ctx.moveTo(TW * 0.25, 0); ctx.lineTo(TW * 0.25, TH); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(TW * 0.72, TH / 2, 0.007, 0, Math.PI * 2); ctx.fill();
    // pockets
    for (const p of POCKETS) { ctx.fillStyle = '#120d0a'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r - 0.004, 0, Math.PI * 2); ctx.fill(); }
  }
  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  /** Soft rings under the balls the player at the table should go for (their group, or the 8 once it is cleared). */
  function drawTargets(now: number) {
    const p = players[cur];
    if (!p || p.ai || !p.group || (phase !== 'aim' && phase !== 'place')) return;
    const cleared = left(p.group) === 0;
    const a = 0.35 + 0.2 * Math.sin(now * 2.5);
    ctx.strokeStyle = `rgba(255, 236, 170, ${a})`; ctx.lineWidth = 0.007;
    for (const b of balls) {
      if (b.potted || (cleared ? b.id !== 8 : !inGroup(b.id, p.group))) continue;
      ctx.beginPath(); ctx.arc(b.x, b.y, R + 0.011, 0, Math.PI * 2); ctx.stroke();
    }
  }
  function drawBall(b: Ball, pxPerM: number) {
    const x = b.x, y = b.y;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.arc(x + 0.005, y + 0.006, R, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
    if (b.id === 0) ctx.fillStyle = '#f6f1e6';
    else if (isStripe(b.id)) ctx.fillStyle = '#f6f1e6';
    else ctx.fillStyle = colOf(b.id);
    ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    if (isStripe(b.id)) { ctx.fillStyle = colOf(b.id); ctx.fillRect(x - R, y - R * 0.55, 2 * R, R * 1.1); }
    if (b.id !== 0 && R * pxPerM > 8) {
      ctx.fillStyle = '#fbf7ee'; ctx.beginPath(); ctx.arc(x, y, R * 0.48, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1a1a'; ctx.font = `600 ${R * 0.62}px Inter, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.save(); ctx.translate(x, y); if (portrait()) ctx.rotate(-Math.PI / 2); ctx.fillText(String(b.id), 0, R * 0.04); ctx.restore();
    }
    const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.05, x, y, R);
    g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.35, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.25)');
    ctx.fillStyle = g; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    ctx.restore();
  }
  function drawAim() {
    if (!aim.on) return;
    const c = cue(), dx0 = c.x - aim.px, dy0 = c.y - aim.py, d = Math.hypot(dx0, dy0);
    if (d < 1e-4) return;
    const dx = dx0 / d, dy = dy0 / d;
    const pull = Math.min(PULL_MAX, Math.max(0, d - R * 1.5));
    // aim line to the first ball or rail, with a ghost ball
    let tHit = Infinity, hitBall: Ball | null = null;
    for (const b of balls) {
      if (b.potted || b === c) continue;
      const fx = b.x - c.x, fy = b.y - c.y, proj = fx * dx + fy * dy;
      if (proj <= 0) continue;
      const perp2 = fx * fx + fy * fy - proj * proj;
      if (perp2 > 4 * R * R) continue;
      const t = proj - Math.sqrt(4 * R * R - perp2);
      if (t < tHit) { tHit = t; hitBall = b; }
    }
    const tx = dx > 0 ? (TW - R - c.x) / dx : dx < 0 ? (R - c.x) / dx : Infinity;
    const ty = dy > 0 ? (TH - R - c.y) / dy : dy < 0 ? (R - c.y) / dy : Infinity;
    const tWall = Math.min(tx, ty);
    const t = Math.min(tHit, tWall);
    ctx.setLineDash([0.025, 0.02]); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 0.005;
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + dx * t, c.y + dy * t); ctx.stroke(); ctx.setLineDash([]);
    if (hitBall && tHit <= tWall) {
      const gx = c.x + dx * tHit, gy = c.y + dy * tHit;
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(gx, gy, R, 0, Math.PI * 2); ctx.stroke();
      const ox = hitBall.x - gx, oy = hitBall.y - gy, od = Math.hypot(ox, oy) || 1;
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(hitBall.x, hitBall.y); ctx.lineTo(hitBall.x + ox / od * 0.18, hitBall.y + oy / od * 0.18); ctx.stroke();
    }
    // the cue stick, drawn back by the pull
    const tip = R + 0.012 + pull, len = 1.25;
    const ax = c.x - dx * tip, ay = c.y - dy * tip, bx = c.x - dx * (tip + len), by = c.y - dy * (tip + len);
    const hot = stickHitsCat(dx, dy, pull, cat.shape());
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 0.024; ctx.beginPath(); ctx.moveTo(ax + 0.006, ay + 0.008); ctx.lineTo(bx + 0.006, by + 0.008); ctx.stroke();
    ctx.strokeStyle = hot ? '#d9432f' : '#d8b98a'; ctx.lineWidth = 0.018; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.strokeStyle = '#3a2618'; ctx.lineWidth = 0.022; ctx.beginPath(); ctx.moveTo(c.x - dx * (tip + len * 0.6), c.y - dy * (tip + len * 0.6)); ctx.lineTo(bx, by); ctx.stroke();
    ctx.strokeStyle = '#eef2f5'; ctx.lineWidth = 0.016; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax - dx * 0.012, ay - dy * 0.012); ctx.stroke();
    // power meter along the stick
    const pw = pull / PULL_MAX;
    root.style.setProperty('--cp-power', String(pw));
  }

  function draw(now: number) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    worldTransform(shake > 0 ? 0.012 * S * (canvas.width / canvas.clientWidth) * shake : 0);
    drawTable();
    drawTargets(now);
    for (const b of balls) if (!b.potted && !b.hugged) drawBall(b, S);
    cat.draw(ctx, { fur: theme.fur, edge: theme.edge, eye: '#e3a63c', ink: '#111', glow: '#e2412e' }, now);
    for (const b of balls) if (!b.potted && b.hugged) drawBall(b, S);
    if (phase === 'place' && human() && placeGhost) {
      const ok = validSpot(placeGhost.x, placeGhost.y, cue());
      ctx.globalAlpha = 0.6; drawBall({ ...cue(), x: placeGhost.x, y: placeGhost.y, potted: false }, 99); ctx.globalAlpha = 1;
      if (!ok) { ctx.strokeStyle = '#d9432f'; ctx.lineWidth = 0.006; ctx.beginPath(); ctx.arc(placeGhost.x, placeGhost.y, R + 0.01, 0, Math.PI * 2); ctx.stroke(); }
    }
    if (phase === 'aim' && human() && !aim.on && !moving([cue()])) {
      const c = cue(), pulse = 0.5 + 0.5 * Math.sin(now * 3);
      ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.3 * pulse})`; ctx.lineWidth = 0.005;
      ctx.beginPath(); ctx.arc(c.x, c.y, R + 0.015 + pulse * 0.01, 0, Math.PI * 2); ctx.stroke();
    }
    drawAim();
  }

  // ------------------------------------------------------------ main loop
  let last = performance.now(), acc = 0;
  function frame(nowMs: number) {
    const dt = Math.min(0.05, (nowMs - last) / 1000); last = nowMs; acc += dt;
    const ev = newEvents();
    while (acc >= H) {
      acc -= H;
      if (phase !== 'over') cat.update(H, balls);
      step(balls, cat.capsules(H), H, ev);
    }
    if (shake > 0) shake = Math.max(0, shake - dt);
    while (cat.news.length) say(cat.news.shift()!);
    if (phase !== 'over') {
      // events from this frame
      for (let k = 0; k < ev.catTouches.length; k++) if (shot) addAnger(1, cur, `${players[cur].name === 'You' ? 'Your' : players[cur].name + "'s"} ball bumped into the cat.`);
      for (const p of ev.potted) {
        if (shot) shot.potted.push(p);
        else catPot(p.id);
        if (phase === 'over') break;
      }
      if (shot && ev.firstHit !== null && shot.firstHit === null) shot.firstHit = ev.firstHit;
      if (shot && phase === 'rolling') {
        shot.t += dt;
        shot.rest = moving(balls) ? 0 : shot.rest + dt;
        if (shot.rest > 0.35 || shot.t > 16) resolve();
      }
      if (phase === 'ai') aiTick(dt);
      renderHud();
    }
    draw(nowMs / 1000);
    requestAnimationFrame(frame);
  }

  resize();
  reset();
  requestAnimationFrame(frame);
  return { reset };
}
