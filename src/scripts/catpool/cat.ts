// The devil cat: behaviour (a dice roll every second), anger, collision shape and drawing.
import { TW, TH, R, POCKETS, type Ball, type Capsule } from './world';

export type Act = 'stay' | 'tail' | 'roll' | 'walk' | 'poke' | 'scratch' | 'fetch';
type V = { x: number; y: number };

// local cat frame: facing +x, body centred on the origin
const BODY = { ax: -0.13, bx: 0.07, r: 0.085 };
const HEAD = { x: 0.175, r: 0.068 };
const TAIL_BASE = -0.205, TAIL_SEG = 0.085, TAIL_R = 0.02;
const HUG = { x: 0.06, y: 0.116 };            // a held ball sits against the belly, wrapped in the front paws
const MARGIN_X = 0.3, MARGIN_Y = 0.22;

// action probabilities per anger level: stay, tail, roll, walk, poke (the cat gets busier as it gets angrier)
const DICE: Record<number, number[]> = {
  1: [0.46, 0.28, 0.10, 0.08, 0.08],
  2: [0.34, 0.28, 0.13, 0.12, 0.13],
  3: [0.22, 0.26, 0.15, 0.17, 0.20],
};
const P_EIGHT = [0, 0.12, 0.28, 0.55];          // chance a poke goes for the 8, by anger level

export interface CatNews { text: string }

export class Cat {
  x = TW * 0.5; y = TH * 0.5; th = 0.4;
  act: Act = 'stay'; t = 0; dur = 1;
  awake = false;
  hug: number | null = null;
  tailPhase = 0; tailAmp = 0.25; tailCurl = 0.35;
  pawExt = 0;                                    // 0..1, front paw reaching out
  walkPhase = 0;
  // anger
  meter = 0; grudge = 0;
  get level() { return this.meter < 3 ? 1 : this.meter < 6 ? 2 : 3; }
  // action state
  private dice = 0;
  private from = { x: 0, y: 0, th: 0 };
  private to = { x: 0, y: 0, th: 0 };
  private target: V = { x: 0, y: 0 };
  private pokeId = -1;
  private pokeDone = false;
  private prevCaps: Capsule[] = [];
  news: string[] = [];

  constructor(private rnd: () => number = Math.random) {
    this.place();
  }

  /** Lie down somewhere away from the rack and the cue ball. */
  place() {
    this.x = TW * (0.45 + this.rnd() * 0.12); this.y = TH * (this.rnd() < 0.5 ? 0.24 : 0.76);
    this.th = this.rnd() * Math.PI * 2; this.act = 'stay'; this.t = 0; this.dur = 1; this.awake = false;
    this.hug = null; this.meter = 0; this.grudge = 0; this.prevCaps = [];
  }

  private toWorld(lx: number, ly: number): V {
    const c = Math.cos(this.th), s = Math.sin(this.th);
    return { x: this.x + lx * c - ly * s, y: this.y + lx * s + ly * c };
  }

  tailPoints(): V[] {
    const pts: V[] = [{ x: TAIL_BASE, y: 0 }];
    let ang = Math.PI, px = TAIL_BASE, py = 0;
    for (let i = 0; i < 3; i++) {
      ang += this.tailCurl * (i + 1) * 0.5 + this.tailAmp * Math.sin(this.tailPhase - i * 0.9);
      px += Math.cos(ang) * TAIL_SEG; py += Math.sin(ang) * TAIL_SEG;
      pts.push({ x: px, y: py });
    }
    return pts.map((p) => this.toWorld(p.x, p.y));
  }

  head(): V { return this.toWorld(HEAD.x + (this.pawExt > 0 ? 0.01 : 0), 0); }
  hugPoint(): V { return this.toWorld(HUG.x, HUG.y); }
  pawTip(): V { return this.toWorld(HEAD.x + 0.05 + this.pawExt * 0.11, -0.05); }

  /** Collision shape in world space, with surface velocities from the last physics step. */
  capsules(dt: number): Capsule[] {
    const caps = this.shape();
    caps.forEach((c, i) => {
      const p = this.prevCaps[i];
      if (p && dt > 0) {
        c.vx = ((c.ax + c.bx) - (p.ax + p.bx)) / 2 / dt;
        c.vy = ((c.ay + c.by) - (p.ay + p.by)) / 2 / dt;
        const sp = Math.hypot(c.vx, c.vy);
        if (sp > 3) { c.vx *= 3 / sp; c.vy *= 3 / sp; }       // a teleport (respawn) is not a swat
      }
    });
    this.prevCaps = caps.map((c) => ({ ...c }));
    return caps;
  }

  /** Collision shape without velocities (for checks that must not disturb the physics). */
  shape(): Capsule[] {
    const a = this.toWorld(BODY.ax, 0), b = this.toWorld(BODY.bx, 0), h = this.toWorld(HEAD.x, 0);
    const caps: Capsule[] = [
      { ax: a.x, ay: a.y, bx: b.x, by: b.y, r: BODY.r, vx: 0, vy: 0 },
      { ax: h.x, ay: h.y, bx: h.x, by: h.y, r: HEAD.r, vx: 0, vy: 0 },
    ];
    const tp = this.tailPoints();
    for (let i = 0; i < 3; i++) caps.push({ ax: tp[i].x, ay: tp[i].y, bx: tp[i + 1].x, by: tp[i + 1].y, r: TAIL_R, vx: 0, vy: 0 });
    if (this.pawExt > 0.05) {
      const p0 = this.toWorld(HEAD.x, -0.05), p1 = this.pawTip();
      caps.push({ ax: p0.x, ay: p0.y, bx: p1.x, by: p1.y, r: 0.022, vx: 0, vy: 0 });
    }
    return caps;
  }

  // ---------------------------------------------------------------- anger
  /** Add anger; returns how many levels it went up and whether it has just reached the scratch level. */
  anger(points: number): { ups: number; scratch: boolean; fetch: boolean } {
    const before = this.level;
    this.meter = Math.min(6, this.meter + points);
    const ups = this.level - before;
    let fetch = false;
    for (let i = 0; i < ups; i++) { this.grudge++; if (this.grudge % 5 === 0) fetch = true; }
    return { ups, scratch: this.level === 3 && before < 3, fetch };
  }
  calm() { this.meter = 0; }

  // ---------------------------------------------------------------- behaviour
  private begin(act: Act, dur: number) { this.act = act; this.t = 0; this.dur = dur; }

  startScratch() { this.releaseHug(); this.begin('scratch', 1.3); this.awake = true; }
  startFetch() { this.begin('fetch', 1.4); this.awake = true; }

  private releaseHug(balls?: Ball[]) {
    if (this.hug !== null && balls) {
      const b = balls.find((q) => q.id === this.hug);
      if (b) { b.hugged = false; b.vx = 0; b.vy = 0; }
    }
    this.hug = null;
  }

  private tryHug(balls: Ball[], chance: number) {
    if (this.hug !== null || this.rnd() > chance) return;
    const hp = this.hugPoint();
    let best: Ball | null = null, bd = 0.14;
    for (const b of balls) {
      if (b.potted || b.hugged) continue;
      const d = Math.hypot(b.x - hp.x, b.y - hp.y);
      if (d < bd && Math.hypot(b.vx, b.vy) < 0.3) { bd = d; best = b; }
    }
    if (best) {
      best.hugged = true; best.vx = 0; best.vy = 0; this.hug = best.id;
      this.news.push(best.id === 0 ? 'The cat is hugging your cue ball.' : `The cat hugs the ${best.id === 8 ? '8' : best.id} ball. Good luck poking that.`);
    }
  }

  private clampPose(p: { x: number; y: number }) {
    p.x = Math.min(TW - MARGIN_X, Math.max(MARGIN_X, p.x));
    p.y = Math.min(TH - MARGIN_Y, Math.max(MARGIN_Y, p.y));
  }

  private roll(balls: Ball[]) {
    const [ps, pt, pr, pw] = DICE[this.level];
    const u = this.rnd();
    if (u < ps) {
      this.begin('stay', 1); this.awake = false; this.tryHug(balls, 0.25);
    } else if (u < ps + pt) {
      this.begin('tail', 2 + this.rnd() * 1.5); this.awake = false;
    } else if (u < ps + pt + pr) {
      if (this.rnd() < 0.5) this.releaseHug(balls);
      const side = this.rnd() < 0.5 ? 1 : -1;
      const nx = -Math.sin(this.th) * side, ny = Math.cos(this.th) * side;
      this.from = { x: this.x, y: this.y, th: this.th };
      this.to = { x: this.x + nx * 0.17, y: this.y + ny * 0.17, th: this.th + Math.PI * side };
      this.clampPose(this.to);
      this.begin('roll', 1.4); this.awake = false;
    } else if (u < ps + pt + pr + pw) {
      this.releaseHug(balls);
      const a = this.rnd() * Math.PI * 2, d = 0.4 + this.rnd() * 0.7;
      this.target = { x: this.x + Math.cos(a) * d, y: this.y + Math.sin(a) * d };
      this.clampPose(this.target);
      this.begin('walk', 8); this.awake = true;
      this.news.push('The cat wakes up and wanders across the table…');
    } else {
      this.startPoke(balls);
    }
  }

  private startPoke(balls: Ball[]) {
    const live = balls.filter((b) => !b.potted && !b.hugged);
    if (!live.length) { this.begin('stay', 1); return; }
    const eight = live.find((b) => b.id === 8);
    let pick: Ball;
    if (eight && this.rnd() < P_EIGHT[this.level]) pick = eight;
    else {
      const near = live.filter((b) => Math.hypot(b.x - this.x, b.y - this.y) < 0.9);
      const pool = near.length ? near : live;
      pick = pool[Math.floor(this.rnd() * pool.length)];
    }
    this.releaseHug(balls);
    this.pokeId = pick.id; this.pokeDone = false;
    this.begin('poke', 7); this.awake = true;
  }

  /** Advance behaviour by dt. Mutates poked / hugged balls directly. */
  update(dt: number, balls: Ball[]) {
    this.t += dt;
    const lvl = this.level;
    // tail: lazy sway while asleep, lashing while busy or angry
    const lash = this.act === 'tail' ? 1 : this.act === 'scratch' ? 1.2 : this.awake ? 0.5 : 0.18;
    const targetAmp = (0.22 + 0.5 * lash) * (1 + (lvl - 1) * 0.25);
    this.tailAmp += (targetAmp - this.tailAmp) * Math.min(1, dt * 3);
    this.tailPhase += dt * (1.6 + lash * 4 + (lvl - 1) * 1.2);
    const curl = this.awake ? 0.22 : 0.62;                 // asleep, the tail wraps around the body
    this.tailCurl += (curl - this.tailCurl) * Math.min(1, dt * 1.5);
    this.pawExt = Math.max(0, this.pawExt - dt * 3);

    switch (this.act) {
      case 'stay':
      case 'tail':
        if (this.t >= this.dur) this.roll(balls);
        break;
      case 'roll': {
        const k = Math.min(1, this.t / this.dur), e = k * k * (3 - 2 * k);
        this.x = this.from.x + (this.to.x - this.from.x) * e;
        this.y = this.from.y + (this.to.y - this.from.y) * e;
        this.th = this.from.th + (this.to.th - this.from.th) * e;
        if (k >= 1) { this.tryHug(balls, 0.35); this.begin('stay', 1); }
        break;
      }
      case 'walk':
        if (this.walkTo(this.target, dt, 0) || this.t > this.dur) { this.begin('stay', 1); this.awake = false; }
        break;
      case 'poke': {
        const b = balls.find((q) => q.id === this.pokeId);
        if (!b || b.potted || b.hugged || this.t > this.dur) { this.begin('stay', 1); break; }
        const h = this.head();
        const reach = Math.hypot(b.x - h.x, b.y - h.y) < HEAD.r + R + 0.1;
        if (!this.pokeDone && !reach) { this.walkTo(b, dt, HEAD.r + R + 0.06); break; }
        // face the ball, then swat
        const want = Math.atan2(b.y - this.y, b.x - this.x);
        this.turnTo(want, dt * 1.5);
        if (!this.pokeDone && Math.abs(angDiff(want, this.th)) < 0.25) {
          this.pawExt = 1; this.pokeDone = true;
          let dx: number, dy: number, sp: number;
          if (b.id === 8) {
            // the cat knows the rules: send the 8 to the nearest pocket
            const p = POCKETS.reduce((m, q) => (Math.hypot(q.x - b.x, q.y - b.y) < Math.hypot(m.x - b.x, m.y - b.y) ? q : m));
            dx = p.x - b.x; dy = p.y - b.y;
            const d = Math.hypot(dx, dy);
            sp = Math.sqrt(2 * 0.45 * d) + 0.45;
            this.news.push(lvl >= 2 ? 'The cat eyes the 8 ball and swats it toward a pocket!' : 'The cat bats the 8 ball.');
          } else {
            const base = Math.atan2(b.y - h.y, b.x - h.x) + (this.rnd() - 0.5) * 1.2;
            dx = Math.cos(base); dy = Math.sin(base); sp = 0.8 + this.rnd() * 0.9;
            this.news.push(b.id === 0 ? 'The cat swats your cue ball.' : `The cat swats the ${b.id} ball.`);
          }
          const n = Math.hypot(dx, dy) || 1;
          b.vx = dx / n * sp; b.vy = dy / n * sp; b.cause = 'cat';
          this.t = this.dur - 0.6;                       // linger a moment, then lie down
        }
        break;
      }
      case 'scratch':
        if (this.t > 0.35 && this.t < 0.75) this.pawExt = 1;
        if (this.t >= this.dur) { this.begin('stay', 1); this.awake = false; }
        break;
      case 'fetch':
        if (this.t > 0.5 && this.t < 0.9) this.pawExt = 1;
        if (this.t >= this.dur) { this.begin('stay', 1); this.awake = false; }
        break;
    }
    // a held ball follows the cat
    if (this.hug !== null) {
      const b = balls.find((q) => q.id === this.hug);
      if (!b || b.potted) this.hug = null;
      else { const p = this.hugPoint(); b.vx = (p.x - b.x) / Math.max(dt, 1e-3); b.vy = (p.y - b.y) / Math.max(dt, 1e-3); b.x = p.x; b.y = p.y; }
    }
  }

  private turnTo(want: number, k: number) {
    const d = angDiff(want, this.th);
    this.th += Math.sign(d) * Math.min(Math.abs(d), k * 2.6);
  }

  /** Step towards a point; returns true when within `stopAt`. */
  private walkTo(p: V, dt: number, stopAt: number): boolean {
    const dx = p.x - this.x, dy = p.y - this.y, d = Math.hypot(dx, dy);
    if (d <= Math.max(0.03, stopAt)) return true;
    this.turnTo(Math.atan2(dy, dx), dt);
    const facing = Math.cos(angDiff(Math.atan2(dy, dx), this.th));
    const sp = 0.32 * Math.max(0, facing);
    this.x += Math.cos(this.th) * sp * dt; this.y += Math.sin(this.th) * sp * dt;
    const c = { x: this.x, y: this.y }; this.clampPose(c); this.x = c.x; this.y = c.y;
    this.walkPhase += dt * 9 * Math.max(0.2, facing);
    return false;
  }

  // ---------------------------------------------------------------- drawing (world units; caller sets the transform)
  draw(ctx: CanvasRenderingContext2D, col: { fur: string; edge: string; eye: string; ink: string; glow: string }, now: number) {
    const lvl = this.level;
    const breathe = this.awake ? 0 : Math.sin(now * 1.8) * 0.004;
    // tail (behind the body)
    const tp = this.tailPoints();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const tw = TAIL_R * 2 * (lvl === 3 ? 1.35 : 1);
    const path = () => {                                   // one smooth curve through the tail joints
      ctx.beginPath(); ctx.moveTo(tp[0].x, tp[0].y);
      for (let i = 1; i < tp.length - 1; i++) {
        const mx = (tp[i].x + tp[i + 1].x) / 2, my = (tp[i].y + tp[i + 1].y) / 2;
        ctx.quadraticCurveTo(tp[i].x, tp[i].y, mx, my);
      }
      ctx.lineTo(tp[tp.length - 1].x, tp[tp.length - 1].y);
    };
    path(); ctx.strokeStyle = col.edge; ctx.lineWidth = tw + 0.008; ctx.stroke();
    path(); ctx.strokeStyle = col.fur; ctx.lineWidth = tw; ctx.stroke();

    ctx.save();
    ctx.translate(this.x, this.y); ctx.rotate(this.th);
    // legs when walking
    if (this.awake && (this.act === 'walk' || this.act === 'poke')) {
      const s = Math.sin(this.walkPhase) * 0.035;
      ctx.fillStyle = col.fur; ctx.strokeStyle = col.edge; ctx.lineWidth = 0.006;
      for (const [lx, ly, ph] of [[0.06, 0.085, s], [0.06, -0.085, -s], [-0.11, 0.08, -s], [-0.11, -0.08, s]] as const) {
        ctx.beginPath(); ctx.ellipse(lx + ph, ly, 0.035, 0.022, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    }
    // body
    const puff = lvl === 3 ? 1.07 : 1;
    ctx.fillStyle = col.fur; ctx.strokeStyle = col.edge; ctx.lineWidth = 0.007;
    ctx.beginPath(); ctx.ellipse(-0.03, 0, (0.155 + breathe) * puff, (0.092 + breathe) * puff, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (lvl === 3) {                                      // bristling fur along the spine
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) {
        const x = -0.16 + i * 0.026, y = (i % 2 ? 0.018 : -0.018);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = col.glow; ctx.lineWidth = 0.006; ctx.stroke();
    }
    // a few darker stripes on the back
    ctx.strokeStyle = col.edge; ctx.lineWidth = 0.006;
    for (const sx of [-0.1, -0.05, 0]) { ctx.beginPath(); ctx.moveTo(sx, -0.06); ctx.quadraticCurveTo(sx + 0.02, 0, sx, 0.06); ctx.stroke(); }
    // front paws (resting) and the reaching paw
    ctx.fillStyle = col.fur; ctx.strokeStyle = col.edge; ctx.lineWidth = 0.006;
    const reach = this.pawExt * 0.11;
    for (const [px, py, ext] of [[0.13, 0.055, 0], [0.13, -0.055, reach]] as const) {
      ctx.beginPath(); ctx.ellipse(px + ext, py, 0.034, 0.022, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    if (this.pawExt > 0.3) {                              // claws out
      ctx.strokeStyle = col.ink; ctx.lineWidth = 0.004;
      for (const dy of [-0.012, 0, 0.012]) { ctx.beginPath(); ctx.moveTo(0.16 + reach, -0.055 + dy); ctx.lineTo(0.18 + reach, -0.055 + dy * 1.3); ctx.stroke(); }
    }
    // head
    ctx.save(); ctx.translate(HEAD.x, 0);
    // ears: forward when calm, flattened back when annoyed
    const earBack = lvl === 1 ? 0 : lvl === 2 ? 0.55 : 0.9;
    for (const side of [1, -1]) {
      ctx.save(); ctx.rotate(side * (0.75 + earBack * 0.9));
      ctx.beginPath(); ctx.moveTo(0.04, -0.03); ctx.lineTo(0.098 - earBack * 0.02, 0); ctx.lineTo(0.04, 0.03); ctx.closePath();
      ctx.fillStyle = col.fur; ctx.fill(); ctx.strokeStyle = col.edge; ctx.lineWidth = 0.006; ctx.stroke();
      ctx.restore();
    }
    if (lvl === 3) {                                      // tiny devil horns
      ctx.fillStyle = col.glow;
      for (const side of [1, -1]) {
        ctx.beginPath(); ctx.moveTo(0.0, side * 0.035); ctx.quadraticCurveTo(-0.045, side * 0.07, -0.06, side * 0.06); ctx.lineTo(-0.01, side * 0.025); ctx.closePath(); ctx.fill();
      }
    }
    ctx.beginPath(); ctx.arc(0, 0, HEAD.r, 0, Math.PI * 2);
    ctx.fillStyle = col.fur; ctx.fill(); ctx.strokeStyle = col.edge; ctx.lineWidth = 0.007; ctx.stroke();
    // eyes (on the forward half of the head)
    for (const side of [1, -1]) {
      const ex = 0.03, ey = side * 0.026;
      if (this.awake || lvl === 3) {
        if (lvl === 3) { ctx.shadowColor = col.glow; ctx.shadowBlur = 8; }
        ctx.fillStyle = lvl === 3 ? col.glow : col.eye;
        ctx.beginPath(); ctx.ellipse(ex, ey, 0.014, 0.011, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(ex + 0.002, ey, 0.009, 0.0035, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = col.edge; ctx.lineWidth = 0.005;
        ctx.beginPath(); ctx.arc(ex, ey, 0.011, Math.PI * 0.35 + (side > 0 ? 0 : 0), Math.PI * 1.65 - 0.0, true); ctx.stroke();
      }
    }
    // nose + whiskers
    ctx.fillStyle = col.glow; ctx.beginPath(); ctx.arc(0.06, 0, 0.007, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = col.edge; ctx.lineWidth = 0.003;
    for (const side of [1, -1]) for (const k of [-1, 0, 1]) {
      ctx.beginPath(); ctx.moveTo(0.05, side * 0.012); ctx.lineTo(0.075 + k * 0.01, side * (0.07 + k * 0.012)); ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }
}

export function angDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
