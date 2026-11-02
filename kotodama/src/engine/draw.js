// Low level vector helpers used by the rig, backgrounds and effects.
import { TAU } from './util.js';

// Catmull-Rom spline through points -> bezier segments (adds to current path)
export function spline(ctx, pts, closed = false, tension = 0.5, move = true) {
  const n = pts.length;
  if (n < 2) return;
  const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  if (move) ctx.moveTo(pts[0][0], pts[0][1]);
  else ctx.lineTo(pts[0][0], pts[0][1]);
  const segs = closed ? n : n - 1;
  const k = tension / 3;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    ctx.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k,
      p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k,
      p2[0], p2[1]
    );
  }
  if (closed) ctx.closePath();
}

export function poly(ctx, pts, close = true) {
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
}

// tapered capsule from A(radius ra) to B(radius rb) appended to the current path
export function capsule(ctx, ax, ay, bx, by, ra, rb) {
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy) || 1e-6;
  const ang = Math.atan2(dy, dx);
  // tangent angle offset for different radii
  const d = Math.asin(Math.max(-1, Math.min(1, (ra - rb) / len)));
  const a1 = ang + Math.PI / 2 + d, a2 = ang - Math.PI / 2 - d;
  ctx.moveTo(ax + Math.cos(a1) * ra, ay + Math.sin(a1) * ra);
  ctx.arc(ax, ay, ra, a1, a2 + TAU * (a2 < a1 ? 1 : 0), false);
  ctx.lineTo(bx + Math.cos(a2) * rb, by + Math.sin(a2) * rb);
  ctx.arc(bx, by, rb, a2, a1, false);
  ctx.closePath();
}

// a whole limb chain (list of [x,y,r]) drawn as one seamless outlined shape
export function limb(ctx, chain, fill, line, lw) {
  ctx.beginPath();
  for (let i = 0; i < chain.length - 1; i++) {
    const a = chain[i], b = chain[i + 1];
    capsule(ctx, a[0], a[1], b[0], b[1], a[2] + lw * 0.5, b[2] + lw * 0.5);
  }
  ctx.fillStyle = line; ctx.fill('nonzero');
  ctx.beginPath();
  for (let i = 0; i < chain.length - 1; i++) {
    const a = chain[i], b = chain[i + 1];
    capsule(ctx, a[0], a[1], b[0], b[1], a[2] - lw * 0.5, b[2] - lw * 0.5);
  }
  ctx.fillStyle = fill; ctx.fill('nonzero');
}

export function fillStroke(ctx, fill, line, lw) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (line && lw > 0) { ctx.strokeStyle = line; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}

export function shape(ctx, pts, fill, line, lw, smooth = true, closed = true) {
  ctx.beginPath();
  if (smooth) spline(ctx, pts, closed); else poly(ctx, pts, closed);
  fillStroke(ctx, fill, line, lw);
}

export function circle(ctx, x, y, r, fill, line, lw) {
  ctx.beginPath(); ctx.arc(x, y, Math.max(0.01, r), 0, TAU); fillStroke(ctx, fill, line, lw);
}

export function ellipse(ctx, x, y, rx, ry, rot, fill, line, lw) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, TAU); fillStroke(ctx, fill, line, lw);
}

export function line(ctx, pts, color, lw, smooth = false) {
  ctx.beginPath();
  if (smooth) spline(ctx, pts, false); else poly(ctx, pts, false);
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}

// tapered brush stroke along points (filled ribbon) – used for eyebrows, lashes, hair strands, ink
export function taper(ctx, pts, w0, w1, color, wMid = null) {
  const n = pts.length;
  if (n < 2) return;
  const left = [], right = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1e-6; dx /= l; dy /= l;
    const t = i / (n - 1);
    let w = wMid != null ? (t < 0.5 ? w0 + (wMid - w0) * (t * 2) : wMid + (w1 - wMid) * ((t - 0.5) * 2)) : w0 + (w1 - w0) * t;
    w *= 0.5;
    left.push([p[0] - dy * w, p[1] + dx * w]);
    right.push([p[0] + dy * w, p[1] - dx * w]);
  }
  ctx.beginPath();
  spline(ctx, left, false);
  spline(ctx, right.reverse(), false, 0.5, false);
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}

export function quadPts(p0, p1, p2, n = 8) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
  }
  return out;
}

export function rot(x, y, a) { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; }
