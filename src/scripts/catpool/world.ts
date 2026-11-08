// Devil-cat pool: table geometry and ball physics (metres, seconds). No dependencies.
// The same step() drives the live game and the computer player's look-ahead simulations.

export const TW = 2.54;           // play area (9-ft table)
export const TH = 1.27;
export const R = 0.0286;          // ball radius
export const RAIL = 0.13;         // drawn rail width around the play area

export type Cause = 'none' | 'player' | 'cat';
export interface Ball {
  id: number;                     // 0 = cue, 1–7 solids, 8 = black, 9–15 stripes
  x: number; y: number; vx: number; vy: number;
  potted: boolean;
  cause: Cause;                   // who set this ball moving (propagates through collisions)
  dist: number;                   // distance travelled since the shot began (for the AI's limited foresight)
  hugged: boolean;                // held by the cat: does not move on its own, acts as an immovable obstacle
  catCooldown: number;            // a single brush against the cat counts once
}

/** A moving capsule (segment + radius) the cat is made of; vx/vy is its surface velocity. */
export interface Capsule { ax: number; ay: number; bx: number; by: number; r: number; vx: number; vy: number }

export interface Pocket { x: number; y: number; r: number }
export const POCKETS: Pocket[] = [
  { x: -0.012, y: -0.012, r: 0.068 }, { x: TW / 2, y: -0.03, r: 0.062 }, { x: TW + 0.012, y: -0.012, r: 0.068 },
  { x: -0.012, y: TH + 0.012, r: 0.068 }, { x: TW / 2, y: TH + 0.03, r: 0.062 }, { x: TW + 0.012, y: TH + 0.012, r: 0.068 },
];

export interface StepEvents {
  potted: { id: number; cause: Cause }[];
  catTouches: { id: number; cause: Cause; dist: number }[];   // a player-driven ball ran into the cat
  firstHit: number | null;                                     // first object ball the cue ball touched
}

const DECEL = 0.42;               // rolling resistance (m/s²)
const E_BALL = 0.95;
const E_RAIL = 0.78;
const E_CAT = 0.35;               // fur is soft
const STOP = 0.012;

export const isSolid = (id: number) => id >= 1 && id <= 7;
export const isStripe = (id: number) => id >= 9 && id <= 15;

export function newRack(): Ball[] {
  const b = (id: number, x: number, y: number): Ball => ({ id, x, y, vx: 0, vy: 0, potted: false, cause: 'none', dist: 0, hugged: false, catCooldown: 0 });
  const balls: Ball[] = [b(0, TW * 0.25, TH / 2)];
  // standard-ish triangle: 8 in the middle, a solid and a stripe in the back corners
  const order = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 15, 7];
  const fx = TW * 0.72, d = 2 * R + 0.0008;
  let k = 0;
  for (let row = 0; row < 5; row++) {
    for (let i = 0; i <= row; i++) {
      balls.push(b(order[k++], fx + row * d * Math.sqrt(3) / 2, TH / 2 + (i - row / 2) * d));
    }
  }
  return balls;
}

export function cloneBalls(balls: Ball[]): Ball[] { return balls.map((b) => ({ ...b })); }

export function moving(balls: Ball[]): boolean {
  return balls.some((b) => !b.potted && !b.hugged && (b.vx !== 0 || b.vy !== 0));
}

function nearPocketMouth(x: number, y: number): boolean {
  const c = 0.075, s = 0.06;
  if ((x < c || x > TW - c) && (y < c || y > TH - c)) return true;   // corners
  if (Math.abs(x - TW / 2) < s && (y < 0.05 || y > TH - 0.05)) return true;   // sides
  return false;
}

/** Advance the world by dt. Capsules belong to the cat; hugged balls are immovable. */
export function step(balls: Ball[], caps: Capsule[], dt: number, ev: StepEvents) {
  // integrate + friction
  for (const b of balls) {
    if (b.potted || b.hugged) continue;
    if (b.catCooldown > 0) b.catCooldown -= dt;
    const sp = Math.hypot(b.vx, b.vy);
    if (sp === 0) continue;
    const ns = sp - DECEL * dt - 0.02 * sp * dt;
    if (ns <= STOP) { b.vx = 0; b.vy = 0; continue; }
    b.vx *= ns / sp; b.vy *= ns / sp;
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.dist += ns * dt;
  }
  // pockets
  for (const b of balls) {
    if (b.potted || b.hugged) continue;
    for (const p of POCKETS) {
      if (Math.hypot(b.x - p.x, b.y - p.y) < p.r) {
        b.potted = true; b.vx = 0; b.vy = 0;
        ev.potted.push({ id: b.id, cause: b.cause });
        break;
      }
    }
    if (!b.potted && (b.x < -R * 2 || b.x > TW + R * 2 || b.y < -R * 2 || b.y > TH + R * 2)) {
      b.potted = true; b.vx = 0; b.vy = 0; ev.potted.push({ id: b.id, cause: b.cause });
    }
  }
  // rails (open at the pocket mouths)
  for (const b of balls) {
    if (b.potted || b.hugged || nearPocketMouth(b.x, b.y)) continue;
    if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * E_RAIL; }
    if (b.x > TW - R) { b.x = TW - R; b.vx = -Math.abs(b.vx) * E_RAIL; }
    if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy) * E_RAIL; }
    if (b.y > TH - R) { b.y = TH - R; b.vy = -Math.abs(b.vy) * E_RAIL; }
  }
  // ball–ball
  for (let i = 0; i < balls.length; i++) {
    const a = balls[i];
    if (a.potted) continue;
    for (let j = i + 1; j < balls.length; j++) {
      const c = balls[j];
      if (c.potted) continue;
      const dx = c.x - a.x, dy = c.y - a.y;
      const d2 = dx * dx + dy * dy;
      if (d2 >= 4 * R * R || d2 === 0) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, over = 2 * R - d;
      const am = a.hugged ? 0 : 1, cm = c.hugged ? 0 : 1;   // inverse masses
      if (am + cm === 0) continue;
      a.x -= nx * over * am / (am + cm); a.y -= ny * over * am / (am + cm);
      c.x += nx * over * cm / (am + cm); c.y += ny * over * cm / (am + cm);
      const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
      if (rv >= 0) continue;
      // cause travels with the hit: the faster ball passes its cause to the one it strikes
      const src = Math.hypot(a.vx, a.vy) >= Math.hypot(c.vx, c.vy) ? a : c;
      const dst = src === a ? c : a;
      if (src.cause !== 'none' && !dst.hugged) dst.cause = src.cause;
      // poking a ball the cat is holding counts as poking the cat
      const free = a.hugged ? c : c.hugged ? a : null;
      if (free && free.cause === 'player' && -rv > 0.06 && free.catCooldown <= 0) {
        ev.catTouches.push({ id: free.id, cause: free.cause, dist: free.dist });
        free.catCooldown = 0.5;
      }
      const jimp = -(1 + E_BALL) * rv / (am + cm);
      a.vx -= jimp * am * nx; a.vy -= jimp * am * ny;
      c.vx += jimp * cm * nx; c.vy += jimp * cm * ny;
      if (ev.firstHit === null) {
        if (a.id === 0) ev.firstHit = c.id; else if (c.id === 0) ev.firstHit = a.id;
      }
    }
  }
  // ball–cat
  for (const b of balls) {
    if (b.potted || b.hugged) continue;
    for (const k of caps) {
      const ex = k.bx - k.ax, ey = k.by - k.ay;
      const L2 = ex * ex + ey * ey;
      let t = L2 > 0 ? ((b.x - k.ax) * ex + (b.y - k.ay) * ey) / L2 : 0;
      t = Math.max(0, Math.min(1, t));
      const px = k.ax + ex * t, py = k.ay + ey * t;
      const dx = b.x - px, dy = b.y - py;
      const d = Math.hypot(dx, dy), min = k.r + R;
      if (d >= min || d === 0) continue;
      const nx = dx / d, ny = dy / d;
      b.x = px + nx * min; b.y = py + ny * min;
      const ballIn = -(b.vx * nx + b.vy * ny);          // how hard the ball runs into the fur
      const catIn = k.vx * nx + k.vy * ny;              // how hard the cat pushes the ball
      const rv = (b.vx - k.vx) * nx + (b.vy - k.vy) * ny;
      if (rv < 0) {
        b.vx -= (1 + E_CAT) * rv * nx; b.vy -= (1 + E_CAT) * rv * ny;
      }
      if (ballIn > 0.06 && ballIn > catIn && b.cause === 'player') {
        if (b.catCooldown <= 0) ev.catTouches.push({ id: b.id, cause: b.cause, dist: b.dist });
        b.catCooldown = 0.5;
      } else if (catIn > 0.02) {
        b.cause = 'cat';                                // the cat moved it: never counts against anyone
      }
    }
  }
}

/** Fresh event bucket. */
export const newEvents = (): StepEvents => ({ potted: [], catTouches: [], firstHit: null });
