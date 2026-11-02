// Skeleton rig + body/outfit renderer. All units are "head units" (u), character faces +x.
import { limb, capsule, spline, fillStroke, line, ellipse, circle, poly, taper, rot } from './draw.js';
import { D2R, shade, rgba, clamp, lerp, TAU, noise1 } from './util.js';
import { HAIR } from './hair.js';
import { headPath, drawFace, drawBrows, drawFaceExtras, resolveExpr, flapShape } from './face.js';

export const POSE_KEYS = ['lean', 'head', 'nA1', 'nA2', 'fA1', 'fA2', 'nL1', 'nL2', 'fL1', 'fL2', 'air', 'rot', 'sx', 'sy', 'seat', 'itemAng', 'dx'];

// ---------------- pose library (degrees). limbs: 0 = straight down, + = forward. elbows bend +, knees bend - ----------------
const B = { lean: 2, head: 0, nA1: -6, nA2: 10, fA1: 8, fA2: 12, nL1: -5, nL2: -2, fL1: 7, fL2: -4, air: 0, rot: 0, sx: 1, sy: 1, seat: 0, itemAng: 0, dx: 0, handN: 'open', handF: 'open' };
const P = (o) => ({ ...B, ...o });
export const POSES = {
  stand: P({}),
  fists: P({ nA1: -10, nA2: 14, fA1: 10, fA2: 14, handN: 'fist', handF: 'fist' }),
  guard: P({ lean: 10, head: 4, nA1: 30, nA2: 110, fA1: 50, fA2: 100, nL1: -24, nL2: -12, fL1: 30, fL2: -30, handN: 'fist', handF: 'fist' }),
  ready: P({ lean: 12, head: 2, nA1: 18, nA2: 60, fA1: 40, fA2: 50, nL1: -26, nL2: -14, fL1: 30, fL2: -36, handN: 'fist', handF: 'open' }),
  punch: P({ lean: 18, head: 2, nA1: 10, nA2: 115, fA1: 90, fA2: 2, nL1: -32, nL2: -4, fL1: 38, fL2: -32, handN: 'fist', handF: 'fist' }),
  punchN: P({ lean: 20, head: 2, nA1: 88, nA2: 2, fA1: -20, fA2: 90, nL1: -30, nL2: -4, fL1: 40, fL2: -34, handN: 'fist', handF: 'fist' }),
  windup: P({ lean: -8, head: -4, nA1: -60, nA2: 80, fA1: 30, fA2: 90, nL1: -18, nL2: -16, fL1: 24, fL2: -20, handN: 'fist', handF: 'fist' }),
  kick: P({ lean: -14, head: -4, nA1: -30, nA2: 70, fA1: 40, fA2: 90, nL1: -6, nL2: -3, fL1: 98, fL2: -4, handN: 'fist', handF: 'fist' }),
  point: P({ lean: 3, head: -2, nA1: -8, nA2: 18, fA1: 80, fA2: 4, handF: 'point', handN: 'fist' }),
  pointUp: P({ lean: -2, head: -8, nA1: -8, nA2: 18, fA1: 150, fA2: 8, handF: 'point', handN: 'fist' }),
  fistUp: P({ lean: -2, head: -6, nA1: 160, nA2: 16, fA1: 12, fA2: 40, handN: 'fist', handF: 'fist', nL1: -10, fL1: 12 }),
  fistPump: P({ lean: 6, head: 4, nA1: 30, nA2: 125, fA1: 10, fA2: 40, handN: 'fist', handF: 'fist' }),
  cheer: P({ lean: -4, head: -8, nA1: 165, nA2: 10, fA1: 155, fA2: 10, handN: 'fist', handF: 'fist', nL1: -12, fL1: 14 }),
  armsCross: P({ lean: -1, head: -2, nA1: 25, nA2: 120, fA1: 20, fA2: 200, handN: 'fist', handF: 'fist' }),
  hips: P({ lean: -2, head: -3, nA1: -38, nA2: 82, fA1: 40, fA2: -82, handN: 'fist', handF: 'fist', nL1: -10, fL1: 12 }),
  thinking: P({ lean: 4, head: 8, nA1: 22, nA2: 148, fA1: 14, fA2: 96, handN: 'fist', handF: 'open' }),
  bow: P({ lean: 42, head: 14, nA1: -40, nA2: 6, fA1: -36, fA2: 6 }),
  slump: P({ lean: 20, head: 24, nA1: -16, nA2: 6, fA1: -14, fA2: 8, nL1: -2, fL1: 4 }),
  shock: P({ lean: -10, head: -10, nA1: 40, nA2: 60, fA1: 60, fA2: 50, nL1: -14, nL2: -10, fL1: 16, fL2: -12, handN: 'open', handF: 'open' }),
  hurt: P({ lean: -24, head: -26, nA1: -50, nA2: 30, fA1: 70, fA2: 40, nL1: -26, nL2: -6, fL1: 20, fL2: -18, handN: 'open', handF: 'open' }),
  knock: P({ lean: -30, head: -30, nA1: -80, nA2: 20, fA1: 100, fA2: 20, nL1: 30, nL2: -10, fL1: 50, fL2: -30, air: 0.6, rot: -18, handN: 'open', handF: 'open' }),
  crouch: P({ lean: 34, head: -18, nA1: 30, nA2: 70, fA1: 50, fA2: 60, nL1: 70, nL2: -140, fL1: 85, fL2: -150, handN: 'fist', handF: 'open' }),
  kneel: P({ lean: 14, head: 12, nA1: 10, nA2: 30, fA1: 50, fA2: 50, nL1: -25, nL2: -95, fL1: 85, fL2: -88, handN: 'open', handF: 'open' }),
  downKnee: P({ lean: 36, head: 24, nA1: 52, nA2: 6, fA1: 40, fA2: 40, nL1: -20, nL2: -100, fL1: 80, fL2: -95, handN: 'open', handF: 'open' }),
  jump: P({ lean: 8, head: -6, nA1: 120, nA2: 30, fA1: 140, fA2: 20, nL1: 50, nL2: -100, fL1: 20, fL2: -60, air: 1.6, handN: 'fist', handF: 'fist' }),
  leap: P({ lean: 22, head: -4, nA1: -40, nA2: 40, fA1: 80, fA2: 20, nL1: -40, nL2: -50, fL1: 70, fL2: -20, air: 1.2, handN: 'fist', handF: 'fist' }),
  land: P({ lean: 30, head: -12, nA1: -30, nA2: 40, fA1: 60, fA2: 40, nL1: 40, nL2: -110, fL1: 70, fL2: -120, handN: 'fist', handF: 'open' }),
  brushUp: P({ lean: -4, head: -8, nA1: 150, nA2: 30, fA1: 30, fA2: 60, nL1: -18, nL2: -8, fL1: 24, fL2: -18, handN: 'brush', handF: 'open', itemAng: -20 }),
  brushDown: P({ lean: 22, head: 6, nA1: 60, nA2: 10, fA1: -20, fA2: 50, nL1: -30, nL2: -6, fL1: 40, fL2: -40, handN: 'brush', handF: 'open', itemAng: 30 }),
  brushSide: P({ lean: 10, head: 0, nA1: 95, nA2: 5, fA1: 10, fA2: 60, nL1: -24, nL2: -8, fL1: 30, fL2: -26, handN: 'brush', handF: 'open', itemAng: 0 }),
  brushHold: P({ lean: 4, head: 0, nA1: 30, nA2: 70, fA1: 10, fA2: 30, handN: 'brush', handF: 'open', itemAng: -60 }),
  brushFloor: P({ lean: 40, head: 18, nA1: 40, nA2: 20, fA1: 50, fA2: 30, nL1: -30, nL2: -40, fL1: 50, fL2: -60, handN: 'brush', handF: 'brush', itemAng: 50 }),
  slash: P({ lean: 24, head: 4, nA1: 100, nA2: 0, fA1: -10, fA2: 40, nL1: -36, nL2: -4, fL1: 44, fL2: -38, handN: 'brush', handF: 'open', itemAng: 10 }),
  slashUp: P({ lean: -6, head: -10, nA1: 160, nA2: 10, fA1: 0, fA2: 40, nL1: -20, nL2: -10, fL1: 30, fL2: -20, handN: 'brush', handF: 'open', itemAng: -10 }),
  block: P({ lean: 4, head: 6, nA1: 55, nA2: 120, fA1: 62, fA2: 115, nL1: -24, nL2: -10, fL1: 26, fL2: -26, handN: 'fist', handF: 'fist' }),
  wave: P({ lean: 0, head: 4, nA1: 115, nA2: 60, fA1: 8, fA2: 14, handN: 'palm', handF: 'open' }),
  shrug: P({ lean: 0, head: 6, nA1: -10, nA2: 110, fA1: 20, fA2: 100, handN: 'palm', handF: 'palm' }),
  sit: P({ lean: 4, head: 4, nA1: 20, nA2: 40, fA1: 30, fA2: 50, nL1: 85, nL2: -80, fL1: 80, fL2: -85, seat: 1.25, handN: 'open', handF: 'open' }),
  sitFloor: P({ lean: 4, head: 4, nA1: 22, nA2: 50, fA1: 28, fA2: 55, nL1: 88, nL2: -4, fL1: 82, fL2: -2, seat: 0.45, handN: 'open', handF: 'open' }),
  sitHug: P({ lean: 15, head: 10, nA1: 35, nA2: 55, fA1: 42, fA2: 50, nL1: 136, nL2: -136, fL1: 130, fL2: -128, seat: 0.45, handN: 'fist', handF: 'fist' }),
  lying: P({ lean: 0, head: 0, nA1: 20, nA2: 10, fA1: 30, fA2: 20, nL1: 4, nL2: -2, fL1: 8, fL2: -6, rot: -90, seat: 0.5, handN: 'open', handF: 'open' }),
  float: P({ lean: 0, head: 6, nA1: -20, nA2: 10, fA1: -14, fA2: 12, nL1: 0, nL2: -6, fL1: 6, fL2: -12, air: 0.5 }),
  bladeReady: P({ lean: 6, head: 2, nA1: 40, nA2: 40, fA1: 10, fA2: 30, nL1: -14, nL2: -6, fL1: 20, fL2: -14, handN: 'brush', handF: 'open', itemAng: -40 }),
  bladeSwing: P({ lean: 26, head: 8, nA1: 110, nA2: 0, fA1: -30, fA2: 40, nL1: -34, nL2: -4, fL1: 42, fL2: -36, handN: 'brush', handF: 'open', itemAng: 10 }),
  bladeRaise: P({ lean: -8, head: -12, nA1: 170, nA2: 4, fA1: 10, fA2: 40, nL1: -12, nL2: -4, fL1: 16, fL2: -10, handN: 'brush', handF: 'open', itemAng: 0 }),
  palmOut: P({ lean: 8, head: 0, nA1: 85, nA2: 5, fA1: 10, fA2: 30, handN: 'palm', handF: 'open', nL1: -16, fL1: 18 }),
  handOnChest: P({ lean: 2, head: 6, nA1: 26, nA2: 130, fA1: 6, fA2: 14, handN: 'open', handF: 'open' }),
  facepalm: P({ lean: 6, head: 16, nA1: 30, nA2: 150, fA1: 10, fA2: 20, handN: 'open', handF: 'open' }),
  scratchHead: P({ lean: 0, head: 8, nA1: 8, nA2: 14, fA1: 150, fA2: 115, handN: 'open', handF: 'open' }),
  reach: P({ lean: 14, head: -4, nA1: 6, nA2: 20, fA1: 95, fA2: 2, handN: 'open', handF: 'open', nL1: -18, fL1: 22 }),
};

export function poseVec(p) {
  if (!p) return { ...B };
  if (typeof p === 'string') return { ...(POSES[p] || B) };
  const base = p.base ? POSES[p.base] || B : B;
  return { ...base, ...p };
}

export function blendPose(a, b, k) {
  if (k <= 0) return a;
  if (k >= 1) return b;
  const o = {};
  for (const key of POSE_KEYS) o[key] = lerp(a[key] ?? B[key], b[key] ?? B[key], k);
  o.handN = k < 0.5 ? a.handN : b.handN;
  o.handF = k < 0.5 ? a.handF : b.handF;
  return o;
}

// procedural motion cycles layered on top of the pose
export function applyMotion(p, motion, t, speed = 1) {
  if (!motion || motion === 'none') return p;
  const o = { ...p };
  if (motion === 'idle') {
    o.head += Math.sin(t * 1.3) * 1.2;
    o.sy = (o.sy || 1) * (1 + Math.sin(t * 2.4) * 0.006);
    o.nA1 += Math.sin(t * 2.4) * 1.2; o.fA1 -= Math.sin(t * 2.4) * 1.2;
  } else if (motion === 'walk') {
    const ph = t * 5.2 * speed, s = Math.sin(ph), c = Math.cos(ph);
    o.nL1 = 24 * s; o.fL1 = -24 * s;
    o.nL2 = -6 - 28 * Math.max(0, -c); o.fL2 = -6 - 28 * Math.max(0, c);
    o.nA1 = -18 * s; o.fA1 = 18 * s; o.nA2 = 18; o.fA2 = 18;
    o.lean = (p.lean || 0) + 3; o.head += Math.sin(ph * 2) * 1.2;
  } else if (motion === 'run') {
    const ph = t * 9.5 * speed, s = Math.sin(ph), c = Math.cos(ph);
    o.nL1 = 10 + 52 * s; o.fL1 = 10 - 52 * s;
    o.nL2 = -20 - 80 * Math.max(0, -c); o.fL2 = -20 - 80 * Math.max(0, c);
    o.nA1 = -50 * s; o.fA1 = 50 * s; o.nA2 = 85; o.fA2 = 85;
    o.lean = 18; o.head = -6; o.air = 0.12 * Math.abs(Math.sin(ph));
    o.handN = 'fist'; o.handF = 'fist';
  } else if (motion === 'float') {
    o.air = (o.air || 0) + 0.15 + Math.sin(t * 2) * 0.12;
  } else if (motion === 'shiver') {
    o.dx = Math.sin(t * 60) * 0.03;
  } else if (motion === 'breathe') {
    o.lean += Math.sin(t * 6) * 3; o.head += Math.sin(t * 6) * 3;
  }
  return o;
}

// ---------------- skeleton ----------------
const dirDown = (deg) => [Math.sin(deg * D2R), Math.cos(deg * D2R)];

export function solveSkeleton(def, p) {
  const b = def.body;
  const T = b.torso, TH = b.thigh, SH = b.shin, UA = b.upper, FA = b.fore;
  const lean = p.lean * D2R;
  const hip = [p.dx || 0, 0];
  const R = (x, y) => { const r = rot(x, y, lean); return [hip[0] + r[0], hip[1] + r[1]]; };
  const neck = R(0, -T);
  const shN = R(-0.4 * b.shoulder, -T + 0.28), shF = R(0.24 * b.shoulder, -T + 0.26);
  const hipN = R(-0.17 * b.hipW, 0.02), hipF = R(0.13 * b.hipW, 0.02);
  const legs = (h, a1, a2) => { const d1 = dirDown(a1); const k = [h[0] + d1[0] * TH, h[1] + d1[1] * TH]; const d2 = dirDown(a1 + a2); const a = [k[0] + d2[0] * SH, k[1] + d2[1] * SH]; return { hip: h, knee: k, ankle: a, shinAng: a1 + a2 }; };
  const arms = (s, a1, a2) => { const d1 = dirDown(a1 + p.lean); const e = [s[0] + d1[0] * UA, s[1] + d1[1] * UA]; const d2 = dirDown(a1 + a2 + p.lean); const w = [e[0] + d2[0] * FA, e[1] + d2[1] * FA]; return { sh: s, elbow: e, wrist: w, foreAng: a1 + a2 + p.lean }; };
  const LN = legs(hipN, p.nL1, p.nL2), LF = legs(hipF, p.fL1, p.fL2);
  const AN = arms(shN, p.nA1, p.nA2), AF = arms(shF, p.fA1, p.fA2);
  // ground contact: lowest of feet / knees
  let low;
  if (p.seat > 0) low = p.seat;
  else low = Math.max(LN.ankle[1] + 0.13, LF.ankle[1] + 0.13, LN.knee[1] + 0.16, LF.knee[1] + 0.16);
  const oy = -low - (p.air || 0);
  const headAng = (p.head + p.lean * 0.6) * D2R;
  const nd = rot(0, -b.neck, headAng * 0.5 + lean * 0.5);
  const headC = [neck[0] + nd[0] + Math.sin(headAng) * 0.5, neck[1] + nd[1] - Math.cos(headAng) * 0.5];
  return { oy, hip, neck, shN, shF, LN, LF, AN, AF, headC, headAng, lean, T };
}

// ---------------- drawing ----------------
function drawHand(ctx, kind, w, ang, r, skin, lc, lw) {
  const dx = Math.sin(ang * D2R), dy = Math.cos(ang * D2R);
  if (kind === 'none') return;
  if (kind === 'fist' || kind === 'brush') {
    const cx = w[0] + dx * r * 0.7, cy = w[1] + dy * r * 0.7;
    ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.15, r * 1.0, Math.atan2(dy, dx), 0, TAU); fillStroke(ctx, skin, lc, lw);
    line(ctx, [[cx - dy * r * 0.5 + dx * r * 0.3, cy + dx * r * 0.5 + dy * r * 0.3], [cx + dy * r * 0.5 + dx * r * 0.3, cy - dx * r * 0.5 + dy * r * 0.3]], rgba(lc, 0.5), lw * 0.6);
  } else if (kind === 'point') {
    const cx = w[0] + dx * r * 0.6, cy = w[1] + dy * r * 0.6;
    ctx.beginPath(); capsule(ctx, cx, cy, cx + dx * r * 2.6, cy + dy * r * 2.6, r * 0.38, r * 0.3); fillStroke(ctx, skin, lc, lw);
    ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.05, r * 0.95, Math.atan2(dy, dx), 0, TAU); fillStroke(ctx, skin, lc, lw);
  } else {
    // open / palm: mitten
    const L = r * 2.3;
    const cx = w[0] + dx * L * 0.45, cy = w[1] + dy * L * 0.45;
    ctx.beginPath(); ctx.ellipse(cx, cy, L * 0.55, r * 0.95, Math.atan2(dy, dx), 0, TAU); fillStroke(ctx, skin, lc, lw);
    const tx = w[0] + dx * r * 0.4 + dy * r * 0.9, ty = w[1] + dy * r * 0.4 - dx * r * 0.9;
    ctx.beginPath(); capsule(ctx, w[0] + dx * r * 0.2, w[1] + dy * r * 0.2, tx, ty, r * 0.36, r * 0.3); fillStroke(ctx, skin, lc, lw);
  }
}

function drawItem(ctx, item, w, ang, lc, lw, t) {
  if (!item) return;
  const a = ang * D2R;
  const dx = Math.sin(a), dy = Math.cos(a);
  const L = item.len, back = item.back ?? 0.35;
  const x0 = w[0] - dx * back, y0 = w[1] - dy * back;
  const x1 = w[0] + dx * (L - back), y1 = w[1] + dy * (L - back);
  if (item.kind === 'brush') {
    ctx.beginPath(); capsule(ctx, x0, y0, x1, y1, item.r, item.r * 0.9); fillStroke(ctx, item.color, lc, lw * 0.8);
    if (item.band) { const bx = lerp(x0, x1, 0.82), by = lerp(y0, y1, 0.82); ctx.beginPath(); capsule(ctx, bx, by, lerp(x0, x1, 0.88), lerp(y0, y1, 0.88), item.r * 1.2, item.r * 1.2); fillStroke(ctx, item.band, lc, lw * 0.6); }
    // bristles
    const tx = x1 + dx * item.tip, ty = y1 + dy * item.tip;
    ctx.beginPath(); ctx.moveTo(x1 - dy * item.r * 1.6, y1 + dx * item.r * 1.6);
    ctx.quadraticCurveTo(x1 + dx * item.tip * 0.6 - dy * item.r * 1.8, y1 + dy * item.tip * 0.6 + dx * item.r * 1.8, tx, ty);
    ctx.quadraticCurveTo(x1 + dx * item.tip * 0.6 + dy * item.r * 1.8, y1 + dy * item.tip * 0.6 - dx * item.r * 1.8, x1 + dy * item.r * 1.6, y1 - dx * item.r * 1.6);
    ctx.closePath(); fillStroke(ctx, item.ink || '#141018', lc, lw * 0.6);
    if (item.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; circle(ctx, tx, ty, item.r * 3 * (1 + 0.2 * Math.sin(t * 20)), rgba(item.glow, 0.5)); ctx.restore(); }
    if (item.tassel) line(ctx, [[x0, y0], [x0 - dx * 0.2 + Math.sin(t * 3) * 0.05, y0 - dy * 0.2 + 0.25]], item.tassel, lw * 1.6);
  } else if (item.kind === 'blade') {
    ctx.beginPath(); capsule(ctx, x0, y0, w[0] + dx * 0.25, w[1] + dy * 0.25, 0.06, 0.06); fillStroke(ctx, '#1a1a22', lc, lw * 0.8);
    const gx = w[0] + dx * 0.28, gy = w[1] + dy * 0.28;
    ctx.beginPath(); poly(ctx, [[gx - dy * 0.16, gy + dx * 0.16], [gx + dy * 0.16, gy - dx * 0.16], [gx + dy * 0.16 + dx * 0.06, gy - dx * 0.16 + dy * 0.06], [gx - dy * 0.16 + dx * 0.06, gy + dx * 0.16 + dy * 0.06]]); fillStroke(ctx, '#d9d9e6', lc, lw * 0.8);
    const bw = item.w || 0.13;
    const p1 = [gx + dx * 0.06 - dy * bw, gy + dy * 0.06 + dx * bw], p2 = [gx + dx * 0.06 + dy * bw * 0.6, gy + dy * 0.06 - dx * bw * 0.6];
    const p3 = [x1 + dy * bw * 0.3, y1 - dx * bw * 0.3], p4 = [x1 + dx * 0.15 - dy * bw, y1 + dy * 0.15 + dx * bw];
    ctx.beginPath(); poly(ctx, [p1, p2, p3, p4]); fillStroke(ctx, '#f7f7ff', lc, lw * 0.8);
    line(ctx, [[lerp(p1[0], p2[0], 0.5), lerp(p1[1], p2[1], 0.5)], [lerp(p3[0], p4[0], 0.4), lerp(p3[1], p4[1], 0.4)]], rgba('#9aa0c0', 0.8), lw * 0.6);
  }
}

function sleeveFlap(ctx, a, color, lc, lw, t, len = 0.7) {
  // wide kimono sleeve hanging under the forearm (gravity always points down)
  const e = a.elbow, w = a.wrist;
  const sw = Math.sin(t * 2 + e[0]) * 0.04;
  const L = len * 0.62;
  ctx.beginPath();
  ctx.moveTo(lerp(a.sh[0], e[0], 0.75), lerp(a.sh[1], e[1], 0.75));
  ctx.lineTo(lerp(e[0], w[0], 0.8), lerp(e[1], w[1], 0.8));
  ctx.quadraticCurveTo(lerp(e[0], w[0], 0.8) + sw, lerp(e[1], w[1], 0.8) + L * 0.7, lerp(e[0], w[0], 0.55) - 0.05 + sw, Math.max(e[1], w[1]) + L);
  ctx.quadraticCurveTo(e[0] - 0.12 + sw, Math.max(e[1], w[1]) + L * 0.9, lerp(a.sh[0], e[0], 0.75) - 0.04, lerp(a.sh[1], e[1], 0.75) + 0.08);
  ctx.closePath();
  fillStroke(ctx, color, lc, lw);
}

function drawArm(ctx, def, a, hand, item, shadeK, lw, t, isNear, st) {
  const o = def.outfit, lc = def.line;
  const skin = shade(def.face.skin, -shadeK * 0.6);
  const sleeve = shade(o.sleeve, -shadeK);
  const ru = 0.135 * (def.body.limb || 1), re = 0.11 * (def.body.limb || 1), rw = 0.088 * (def.body.limb || 1);
  if (o.flap) sleeveFlap(ctx, a, shade(o.flap, -shadeK), lc, lw, t, o.flapLen || 0.7);
  if (o.sleeveLen === 'short') {
    limb(ctx, [[...a.sh, ru], [...a.elbow, re], [...a.wrist, rw]], skin, lc, lw);
    limb(ctx, [[...a.sh, ru + 0.03], [lerp(a.sh[0], a.elbow[0], 0.95), lerp(a.sh[1], a.elbow[1], 0.95), re + 0.035]], sleeve, lc, lw);
    if (o.wrap) limb(ctx, [[lerp(a.elbow[0], a.wrist[0], 0.68), lerp(a.elbow[1], a.wrist[1], 0.68), rw + 0.015], [...a.wrist, rw + 0.012]], shade(o.wrap, -shadeK), lc, lw * 0.7);
  } else {
    limb(ctx, [[...a.sh, ru], [...a.elbow, re], [...a.wrist, rw + 0.01]], sleeve, lc, lw);
    if (o.cuff) limb(ctx, [[lerp(a.elbow[0], a.wrist[0], 0.8), lerp(a.elbow[1], a.wrist[1], 0.8), rw + 0.03], [...a.wrist, rw + 0.03]], shade(o.cuff, -shadeK), lc, lw * 0.8);
  }
  const handColor = o.gloves ? shade(o.gloves, -shadeK) : skin;
  if (isNear && item && hand === 'brush') { drawItem(ctx, item, a.wrist, a.foreAng + (st.pose.itemAng || 0), lc, lw, t); }
  drawHand(ctx, hand, a.wrist, a.foreAng, 0.105 * (def.body.limb || 1), handColor, lc, lw);
}

function drawLeg(ctx, def, L, shadeK, lw) {
  const o = def.outfit, lc = def.line;
  const pc = shade(o.pants, -shadeK);
  const r = o.legW || [0.19, 0.15, 0.115];
  limb(ctx, [[...L.hip, r[0]], [...L.knee, r[1]], [...L.ankle, r[2]]], pc, lc, lw);
  if (o.shinWrap) limb(ctx, [[lerp(L.knee[0], L.ankle[0], 0.3), lerp(L.knee[1], L.ankle[1], 0.3), r[1] - 0.005], [...L.ankle, r[2] + 0.005]], shade(o.shinWrap, -shadeK), lc, lw * 0.8);
  // shoe
  const fa = clamp(L.shinAng * 0.55, -70, 80) * D2R;
  const fdx = Math.cos(fa), fdy = Math.sin(fa);
  const ax = L.ankle[0], ay = L.ankle[1] + 0.04;
  const sc = shade(o.shoes, -shadeK);
  ctx.beginPath();
  ctx.moveTo(ax - fdx * 0.14 + fdy * 0.0, ay - fdy * 0.14 - 0.08);
  ctx.quadraticCurveTo(ax + fdx * 0.12 - fdy * 0.12, ay + fdy * 0.12 - 0.12, ax + fdx * 0.42 - fdy * 0.02, ay + fdy * 0.42 + 0.02);
  ctx.quadraticCurveTo(ax + fdx * 0.48 + fdy * 0.06, ay + fdy * 0.48 + 0.1, ax + fdx * 0.3 + fdy * 0.1, ay + fdy * 0.3 + 0.1);
  ctx.lineTo(ax - fdx * 0.16 + fdy * 0.1, ay - fdy * 0.16 + 0.1);
  ctx.closePath();
  fillStroke(ctx, sc, lc, lw);
  if (o.sole) line(ctx, [[ax - fdx * 0.16 + fdy * 0.08, ay - fdy * 0.16 + 0.08], [ax + fdx * 0.38 + fdy * 0.08, ay + fdy * 0.38 + 0.08]], o.sole, lw * 1.4);
}

function torsoPoints(def, T) {
  const b = def.body, s = b.shoulder, c = b.chest || 1, wst = b.waist || 1;
  return [
    [-0.13, -T + 0.02], [-0.5 * s, -T + 0.2], [-0.44 * s, -T + 0.62], [-0.31 * wst, -T * 0.42], [-0.33 * b.hipW, 0.12],
    [0.27 * b.hipW, 0.12], [0.22 * wst, -T * 0.42], [0.32 * c, -T + 0.62], [0.3 * s, -T + 0.16], [0.13, -T + 0.03],
  ];
}

function drawTorso(ctx, def, S, lw, t, st) {
  const o = def.outfit, lc = def.line, T = S.T;
  ctx.save();
  ctx.translate(S.hip[0], S.hip[1]); ctx.rotate(S.lean);
  const pts = torsoPoints(def, T);
  ctx.beginPath(); spline(ctx, pts, true, 0.3);
  fillStroke(ctx, o.top, lc, lw);
  // cel shadow along the front edge
  ctx.save(); ctx.beginPath(); spline(ctx, pts, true, 0.3); ctx.clip();
  ctx.beginPath(); ctx.moveTo(0.12, -T); ctx.quadraticCurveTo(0.42, -T * 0.5, 0.2, 0.2); ctx.lineTo(0.6, 0.2); ctx.lineTo(0.6, -T); ctx.closePath();
  ctx.fillStyle = rgba('#140a28', 0.18); ctx.fill();
  if (o.torsoDetail) o.torsoDetail(ctx, def, T, lw, t, st);
  ctx.restore();
  if (o.torsoOver) o.torsoOver(ctx, def, T, lw, t, st);
  ctx.restore();
}

function drawNeck(ctx, def, S, lw) {
  const skin = def.face.skin;
  const n = S.neck, hc = S.headC;
  const hx = hc[0] - 0.05, hy = hc[1] + 0.2;
  ctx.beginPath(); capsule(ctx, n[0] - 0.02, n[1] + 0.06, hx, hy, 0.12, 0.105);
  fillStroke(ctx, skin, def.line, lw);
  // chin shadow
  ctx.beginPath(); ctx.ellipse(hx + 0.02, hy + 0.05, 0.11, 0.07, 0, 0, TAU); ctx.fillStyle = rgba(shade(skin, -0.35), 0.55); ctx.fill();
}

export function drawCharacter(ctx, def, st, t, opts = {}) {
  if (def.custom) return def.custom(ctx, def, st, t, opts);
  const p = st.pose;
  const S = solveSkeleton(def, p);
  const U = def.u * (st.scale || 1);
  const lw = (opts.lw || 0.034);
  const wind = st.wind || 0;
  ctx.save();
  ctx.translate(st.x, st.y);
  if (st.facing < 0) ctx.scale(-1, 1);
  ctx.scale(U * (p.sx || 1), U * (p.sy || 1));
  ctx.translate(0, S.oy);
  if (p.rot) { ctx.translate(S.hip[0], S.hip[1]); ctx.rotate(p.rot * D2R); ctx.translate(-S.hip[0], -S.hip[1]); }
  const headT = () => { ctx.translate(S.headC[0], S.headC[1]); ctx.rotate(S.headAng); };
  const H = def.hair;
  const hairStyle = HAIR[H.style] || HAIR.none;
  const hst = { ...H, lw: lw * 0.95 };
  const fst = { ...st, headWorldAng: S.headAng + (p.rot || 0) * D2R };
  // --- back layer ---
  ctx.save(); headT(); hairStyle.back(ctx, hst, t, wind, def.face, fst); ctx.restore();
  if (def.outfit.back) def.outfit.back(ctx, def, S, lw, t, st);
  // far limbs (shaded)
  drawArm(ctx, def, S.AF, p.handF, null, 0.16, lw, t, false, st);
  drawLeg(ctx, def, S.LF, 0.16, lw);
  drawLeg(ctx, def, S.LN, 0, lw);
  if (def.outfit.skirt) def.outfit.skirt(ctx, def, S, lw, t, st);
  drawNeck(ctx, def, S, lw);
  drawTorso(ctx, def, S, lw, t, st);
  if (def.outfit.front) def.outfit.front(ctx, def, S, lw, t, st);
  // --- head ---
  ctx.save(); headT();
  headPath(ctx, def.face); fillStroke(ctx, def.face.skin, def.line, lw);
  // ear
  ctx.beginPath(); ctx.ellipse(-0.25, 0.07, 0.075, 0.115, -0.15, 0, TAU); fillStroke(ctx, def.face.skin, def.line, lw * 0.9);
  line(ctx, [[-0.27, 0.02], [-0.235, 0.06], [-0.255, 0.12]], shade(def.face.skin, -0.35), lw * 0.6, true);
  if (def.face.mask) def.face.mask(ctx, def, st, t, lw);
  else drawFace(ctx, def, st, t);
  hairStyle.front(ctx, hst, t, wind, def.face, fst);
  if (!def.face.mask) drawBrows(ctx, def, st);
  if (def.headFront) def.headFront(ctx, def, st, t, lw);
  drawFaceExtras(ctx, def, st, t);
  if (st.hat && def.hat) def.hat(ctx, def, st, t, lw);
  ctx.restore();
  // near arm last
  drawArm(ctx, def, S.AN, p.handN, st.item || def.item, 0, lw, t, true, st);
  ctx.restore();
  return S;
}

// world-space anchor points (used by camera framing and effects)
export function anchors(def, st) {
  const U = def.u * (st.scale || 1);
  if (def.custom) return { head: [st.x, st.y - U * 0.8], chest: [st.x, st.y - U * 0.5], feet: [st.x, st.y], hand: [st.x + U * 0.5 * st.facing, st.y - U * 0.5], U, height: U * 1.2 };
  const p = st.pose;
  const S = solveSkeleton(def, p);
  const f = st.facing < 0 ? -1 : 1;
  const tr = (q) => {
    let x = q[0], y = q[1] + S.oy;
    if (p.rot) { const r = rot(x - S.hip[0], y - S.oy - S.hip[1], p.rot * D2R); x = S.hip[0] + r[0]; y = S.hip[1] + S.oy + r[1]; }
    return [st.x + f * x * U * (p.sx || 1), st.y + y * U * (p.sy || 1)];
  };
  const tip = (a) => { const d = dirDown(a.foreAng); return [a.wrist[0] + d[0] * 0.2, a.wrist[1] + d[1] * 0.2]; };
  return {
    head: tr(S.headC), chest: tr([S.neck[0], S.neck[1] + 0.6]), hip: tr(S.hip), feet: [st.x, st.y],
    hand: tr(tip(S.AN)), handF: tr(tip(S.AF)), U, height: U * (def.body.torso + def.body.thigh + def.body.shin + 1.3),
    brushTip: (() => { const it = st.item || def.item; if (!it) return tr(tip(S.AN)); const a = (S.AN.foreAng + (p.itemAng || 0)) * D2R; const L = it.len - (it.back ?? 0.35) + (it.tip || 0); return tr([S.AN.wrist[0] + Math.sin(a) * L, S.AN.wrist[1] + Math.cos(a) * L]); })(),
  };
}

export function buildState(def, s, t) {
  // turn the timeline values into a draw-ready state
  const ex = resolveExpr(s.expr || def.defaultExpr || 'neutral');
  return { ...s, exObj: ex };
}
