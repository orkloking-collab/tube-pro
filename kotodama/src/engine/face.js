// Anime head + face renderer.
// Head space: head height = 1 (top of skull -> chin), origin at cranium centre, character faces +x (3/4 view).
// Every character's face is generated from its model-sheet parameters, so it can never drift off-model.
import { spline, taper, line, ellipse, circle, fillStroke, poly } from './draw.js';
import { shade, rgba, clamp, lerp, TAU } from './util.js';

export const EXPRESSIONS = {
  neutral:     { open: 1, slant: 0, brow: 0, browAng: 0, mouth: 'line' },
  smile:       { open: 0.9, slant: 0, brow: 0.01, browAng: -0.1, mouth: 'smile' },
  grin:        { open: 1, slant: 0.1, brow: 0.02, browAng: 0.1, mouth: 'grin' },
  happy:       { shape: 'happy', brow: 0.03, browAng: -0.3, mouth: 'openSmile', blush: 0.35 },
  laugh:       { shape: 'happy', brow: 0.04, browAng: -0.4, mouth: 'wide', blush: 0.3 },
  angry:       { open: 0.85, slant: 0.9, brow: -0.02, browAng: 1, mouth: 'teeth' },
  shout:       { open: 0.95, slant: 0.8, brow: -0.01, browAng: 1, mouth: 'wide' },
  determined:  { open: 0.85, slant: 0.5, brow: -0.01, browAng: 0.7, mouth: 'line' },
  focused:     { open: 0.78, slant: 0.4, brow: -0.01, browAng: 0.5, mouth: 'flat' },
  surprised:   { open: 1.12, pupil: 0.7, brow: 0.06, browAng: -0.3, mouth: 'o' },
  shocked:     { open: 1.18, pupil: 0.35, iris: 0.62, hl: false, brow: 0.07, browAng: -0.6, mouth: 'wide', gloom: 0.6, sweat: 1 },
  sad:         { open: 0.72, slant: -0.6, brow: 0.02, browAng: -1, mouth: 'frown' },
  cry:         { open: 0.6, slant: -0.7, brow: 0.03, browAng: -1, mouth: 'wobble', tears: 1 },
  teary:       { open: 0.8, slant: -0.4, brow: 0.03, browAng: -0.7, mouth: 'smile', tears: 0.6, blush: 0.3 },
  smug:        { open: 0.55, slant: 0.25, brow: 0.0, browAng: 0.3, mouth: 'smirk' },
  annoyed:     { open: 0.5, slant: 0.1, flat: 1, brow: -0.01, browAng: 0.6, mouth: 'flat', vein: 1 },
  embarrassed: { open: 0.9, slant: -0.2, brow: 0.03, browAng: -0.6, mouth: 'wobble', blush: 1, sweat: 1 },
  worried:     { open: 0.9, slant: -0.4, brow: 0.03, browAng: -0.8, mouth: 'frown', sweat: 1 },
  pain:        { open: 0.35, slant: 0.7, brow: -0.01, browAng: 0.9, mouth: 'teeth', sweat: 1 },
  cold:        { open: 0.72, slant: 0.15, brow: 0, browAng: 0.15, mouth: 'line' },
  evil:        { open: 0.68, slant: 0.6, brow: -0.01, browAng: 0.9, mouth: 'evil' },
  panic:       { open: 1.2, pupil: 0.45, iris: 0.75, brow: 0.07, browAng: -0.8, mouth: 'wide', sweat: 1 },
  closed:      { shape: 'closed', brow: 0, browAng: 0, mouth: 'line' },
  calm:        { shape: 'closed', brow: 0.01, browAng: -0.2, mouth: 'smile' },
  sleepy:      { open: 0.3, brow: 0, browAng: -0.2, mouth: 'line' },
  sparkle:     { open: 1.1, sparkle: 1, brow: 0.05, browAng: -0.3, mouth: 'openSmile', blush: 0.4 },
  dazed:       { shape: 'swirl', brow: 0.04, browAng: -0.5, mouth: 'wobble', sweat: 1 },
  pout:        { open: 0.8, slant: 0.3, brow: 0, browAng: 0.6, mouth: 'cat', blush: 0.6 },
  serious:     { open: 0.8, slant: 0.3, brow: -0.01, browAng: 0.45, mouth: 'frown' },
};

const DEFAULT_EX = { open: 1, slant: 0, pupil: 1, iris: 1, hl: true, brow: 0, browAng: 0, mouth: 'line', shape: 'normal' };
export function resolveExpr(name) { return { ...DEFAULT_EX, ...(EXPRESSIONS[name] || EXPRESSIONS.neutral) }; }

// skin outline of the head (facing right), in head units
export function headPath(ctx, f) {
  const j = f.jaw || 0;     // squarer jaw for big guys
  const c = f.chin || 0;    // pointier chin
  const pts = [
    [0.02, -0.5], [0.3, -0.39], [0.4, -0.18], [0.415, -0.03], [0.4, 0.11],
    [0.35 + j * 0.03, 0.26], [0.25 + j * 0.05, 0.4 + j * 0.02], [0.13 + c * 0.02, 0.475 + c * 0.03], [0.03 - j * 0.02, 0.45 + j * 0.03],
    [-0.12 - j * 0.05, 0.34 + j * 0.03], [-0.22 - j * 0.04, 0.19], [-0.34, 0.06], [-0.42, -0.14], [-0.33, -0.4],
  ];
  ctx.beginPath();
  spline(ctx, pts, true, 0.5);
}

function drawEar(ctx, f, skin, lineC, lw) {
  ctx.beginPath();
  ctx.ellipse(-0.25, 0.07, 0.075, 0.115, -0.15, 0, TAU);
  fillStroke(ctx, skin, lineC, lw);
  line(ctx, [[-0.27, 0.02], [-0.235, 0.06], [-0.255, 0.12]], shade(skin, -0.35), lw * 0.7, true);
}

function eyePaths(cx, cy, w, h, m, ex, open) {
  // returns point helpers for an eye; m = +1 (near eye, outer corner at -x) or -1 (far eye)
  const X = (x) => cx + m * x, Y = (y) => cy + y;
  const s = ex.slant || 0;
  const o = clamp(open, 0, 1.3);
  const flat = ex.flat || 0;
  const lowY = 0.42 * h;
  const topY = (y) => lerp(lowY, y, o);
  return {
    X, Y,
    O: [X(-0.5 * w), Y(topY(0.04 * h))],
    C1: [X(-0.44 * w), Y(topY(lerp(-0.5 * h, -0.36 * h, flat) + s * 0.04 * h))],
    C2: [X(0.22 * w), Y(topY(lerp(-0.62 * h, -0.4 * h, flat) + s * 0.26 * h))],
    I: [X(0.5 * w), Y(topY(-0.06 * h + s * 0.2 * h))],
    B1: [X(0.46 * w), Y(0.28 * h)],
    B2: [X(0.06 * w), Y(0.56 * h)],
    B3: [X(-0.38 * w), Y(0.4 * h)],
  };
}

function drawEye(ctx, def, f, cx, cy, w, h, m, ex, open, look, t) {
  const lineC = f.lash || '#1a0f1a';
  const lw = 0.012;
  if (ex.shape === 'happy' || ex.shape === 'closed' || open < 0.12) {
    const up = ex.shape === 'happy' ? -1 : 1;
    const X = (x) => cx + m * x;
    taper(ctx, [[X(-0.55 * w), cy + 0.12 * h], [X(-0.2 * w), cy + 0.12 * h + up * 0.22 * h], [X(0.25 * w), cy + 0.12 * h + up * 0.2 * h], [X(0.5 * w), cy + 0.05 * h]], 0.012, 0.01, lineC, 0.035);
    return;
  }
  if (ex.shape === 'swirl') {
    ctx.beginPath();
    for (let i = 0; i < 40; i++) { const a = i * 0.45, r = 0.004 + i * 0.0028; ctx.lineTo(cx + m * Math.cos(a) * r * (w / 0.24), cy + 0.05 * h + Math.sin(a) * r * 1.1); }
    ctx.strokeStyle = lineC; ctx.lineWidth = 0.012; ctx.stroke();
    return;
  }
  const P = eyePaths(cx, cy, w, h, m, ex, open);
  // eye white
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(P.O[0], P.O[1]);
  ctx.bezierCurveTo(P.C1[0], P.C1[1], P.C2[0], P.C2[1], P.I[0], P.I[1]);
  ctx.lineTo(P.B1[0], P.B1[1]);
  ctx.quadraticCurveTo(P.B2[0], P.B2[1], P.B3[0], P.B3[1]);
  ctx.closePath();
  ctx.fillStyle = f.eyeWhite || '#fbf8ff';
  ctx.fill();
  ctx.clip();
  // iris
  const ir = ex.iris || 1;
  const ix = cx + m * 0.04 * w + look[0] * 0.16 * w, iy = cy + 0.1 * h + look[1] * 0.08 * h;
  const rx = 0.34 * w * ir, ry = 0.46 * h * ir;
  const g = ctx.createLinearGradient(0, iy - ry, 0, iy + ry);
  g.addColorStop(0, shade(f.eye, -0.55));
  g.addColorStop(0.45, f.eye);
  g.addColorStop(1, shade(f.eye, 0.45));
  ellipse(ctx, ix, iy, rx, ry, 0, g, shade(f.eye, -0.7), 0.008);
  // pupil
  const pr = ex.pupil || 1;
  ellipse(ctx, ix + look[0] * 0.02 * w, iy - 0.02 * h, rx * 0.42 * pr, ry * 0.45 * pr, 0, shade(f.eye, -0.8));
  if (f.glowEye) ellipse(ctx, ix, iy, rx * 0.5, ry * 0.5, 0, rgba(f.glowEye, 0.85));
  // lid shadow
  ctx.beginPath();
  ctx.moveTo(P.O[0], P.O[1]);
  ctx.bezierCurveTo(P.C1[0], P.C1[1], P.C2[0], P.C2[1], P.I[0], P.I[1]);
  ctx.lineTo(P.I[0], P.I[1] + 0.12 * h);
  ctx.bezierCurveTo(P.C2[0], P.C2[1] + 0.2 * h, P.C1[0], P.C1[1] + 0.2 * h, P.O[0], P.O[1] + 0.1 * h);
  ctx.closePath();
  ctx.fillStyle = rgba(shade(f.eye, -0.6), 0.32);
  ctx.fill();
  // highlights (light from upper-left in screen space)
  if (ex.hl !== false) {
    ellipse(ctx, ix - 0.11 * w, iy - 0.17 * h, 0.1 * w * ir, 0.11 * h * ir, -0.4, '#ffffff');
    ellipse(ctx, ix + 0.1 * w, iy + 0.18 * h, 0.05 * w * ir, 0.05 * h * ir, 0, rgba('#ffffff', 0.85));
  }
  if (ex.sparkle) {
    const s = 0.07 * w * (1 + 0.25 * Math.sin(t * 9));
    ctx.beginPath();
    const sx = ix - 0.06 * w, sy = iy - 0.12 * h;
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU, r = i % 2 ? s * 0.35 : s * 1.4; ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); }
    ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
  }
  ctx.restore();
  // upper lash line (thick) with outer flick
  const lashPts = [[P.O[0], P.O[1]], [lerp(P.O[0], P.C1[0], 0.5), lerp(P.O[1], P.C1[1], 0.6)], [lerp(P.C1[0], P.C2[0], 0.5), lerp(P.C1[1], P.C2[1], 0.5) - 0.0 * h], [lerp(P.C2[0], P.I[0], 0.55), lerp(P.C2[1], P.I[1], 0.5)], [P.I[0], P.I[1]]];
  taper(ctx, lashPts, 0.028, 0.008, lineC, 0.042);
  // outer flick
  taper(ctx, [[P.O[0], P.O[1] - 0.01], [P.O[0] - m * 0.07 * w, P.O[1] + 0.06 * h], [P.O[0] - m * 0.11 * w, P.O[1] + 0.13 * h]], 0.03, 0.004, lineC);
  if (f.lashes) {
    for (let i = 0; i < 2; i++) taper(ctx, [[P.O[0] + m * 0.02 * w, P.O[1] - 0.04 * h - i * 0.07 * h], [P.O[0] - m * (0.12 + i * 0.03) * w, P.O[1] - (0.12 + i * 0.12) * h]], 0.016, 0.002, lineC);
  }
  // lower lash
  taper(ctx, [[P.B3[0] + m * 0.08 * w, P.B3[1] + 0.03 * h], [lerp(P.B3[0], P.B1[0], 0.5), P.B2[1] - 0.035 * h], [P.B1[0] - m * 0.12 * w, P.B1[1] + 0.12 * h]], 0.004, 0.003, rgba(lineC, 0.8), 0.011);
}

function drawBrow(ctx, f, near, ex, brCol) {
  const b = ex.brow || 0, a = ex.browAng || 0;
  const th = f.browThick || 1;
  if (near) {
    const outer = [-0.18, -0.12 - b + a * 0.015], inner = [0.07, -0.155 - b + a * 0.055];
    const mid = [(outer[0] + inner[0]) / 2, (outer[1] + inner[1]) / 2 - 0.018 + a * 0.004];
    taper(ctx, [outer, mid, inner], 0.012 * th, 0.034 * th, brCol);
  } else {
    const inner = [0.19, -0.155 - b + a * 0.055], outer = [0.34, -0.12 - b + a * 0.012];
    const mid = [(outer[0] + inner[0]) / 2, (outer[1] + inner[1]) / 2 - 0.014];
    taper(ctx, [inner, mid, outer], 0.03 * th, 0.01 * th, brCol);
  }
}

// mouth shapes in 3/4 view, centred at M
export function drawMouth(ctx, f, shapeName, open = 0) {
  const mx = 0.18, my = 0.335;
  const lc = f.line || '#2a1418';
  const inside = '#5b1b26', tongue = '#d8646f';
  const lw = 0.011;
  const P = (x, y) => [mx + x, my + y];
  const filled = (pts, fill = inside, tong = true) => {
    ctx.save();
    ctx.beginPath(); spline(ctx, pts, true, 0.45);
    ctx.fillStyle = fill; ctx.fill();
    if (tong) { ctx.clip(); ellipse(ctx, mx + 0.005, my + 0.075 + open * 0.02, 0.06, 0.035, 0, tongue); }
    ctx.restore();
    ctx.beginPath(); spline(ctx, pts, true, 0.45); ctx.strokeStyle = lc; ctx.lineWidth = lw; ctx.stroke();
  };
  switch (shapeName) {
    case 'smile': line(ctx, [P(-0.07, -0.012), P(-0.01, 0.022), P(0.055, -0.016)], lc, lw, true); break;
    case 'frown': line(ctx, [P(-0.06, 0.018), P(0, -0.012), P(0.05, 0.016)], lc, lw, true); break;
    case 'flat': line(ctx, [P(-0.055, 0.004), P(0.05, 0)], lc, lw); break;
    case 'smirk': line(ctx, [P(-0.05, 0.008), P(0.02, 0.006), P(0.065, -0.03)], lc, lw, true); break;
    case 'o': ellipse(ctx, mx, my + 0.02, 0.03, 0.042, 0, inside, lc, lw); break;
    case 'open': filled([P(-0.05, -0.002), P(0, -0.008), P(0.045, -0.006), P(0.03, 0.035), P(-0.01, 0.045), P(-0.04, 0.028)], inside, false); break;
    case 'mid': filled([P(-0.06, -0.004), P(0, -0.012), P(0.055, -0.008), P(0.035, 0.06), P(-0.01, 0.075), P(-0.05, 0.045)]); break;
    case 'wide': {
      const pts = [P(-0.09, -0.01), P(-0.01, -0.03), P(0.075, -0.022), P(0.05, 0.08), P(-0.005, 0.135), P(-0.07, 0.07)];
      filled(pts);
      ctx.save(); ctx.beginPath(); spline(ctx, pts, true, 0.45); ctx.clip();
      ctx.fillStyle = '#fff'; ctx.fillRect(mx - 0.1, my - 0.05, 0.2, 0.05); ctx.restore();
      ctx.beginPath(); spline(ctx, pts, true, 0.45); ctx.strokeStyle = lc; ctx.lineWidth = lw; ctx.stroke();
      break;
    }
    case 'openSmile': filled([P(-0.075, -0.018), P(-0.01, -0.005), P(0.06, -0.022), P(0.04, 0.045), P(-0.005, 0.08), P(-0.055, 0.04)]); break;
    case 'grin': {
      const pts = [P(-0.085, -0.02), P(-0.01, -0.012), P(0.07, -0.035), P(0.05, 0.03), P(0, 0.065), P(-0.06, 0.035)];
      ctx.beginPath(); spline(ctx, pts, true, 0.45); fillStroke(ctx, '#ffffff', lc, lw);
      line(ctx, [P(-0.075, 0.008), P(0, 0.018), P(0.06, -0.004)], rgba(lc, 0.7), lw * 0.7, true);
      break;
    }
    case 'teeth': {
      const pts = [P(-0.065, -0.012), P(0.06, -0.022), P(0.058, 0.03), P(-0.06, 0.04)];
      ctx.beginPath(); poly(ctx, pts); fillStroke(ctx, '#ffffff', lc, lw);
      line(ctx, [P(-0.062, 0.012), P(0.058, 0.004)], lc, lw * 0.6);
      for (let i = -2; i <= 2; i++) line(ctx, [P(i * 0.022, -0.015), P(i * 0.022 + 0.002, 0.035)], rgba(lc, 0.6), lw * 0.5);
      break;
    }
    case 'cat': line(ctx, [P(-0.05, -0.005), P(-0.03, 0.018), P(-0.005, 0.0), P(0.02, 0.018), P(0.045, -0.006)], lc, lw, true); break;
    case 'wobble': line(ctx, [P(-0.06, 0.01), P(-0.035, -0.006), P(-0.01, 0.01), P(0.015, -0.006), P(0.045, 0.008)], lc, lw, true); break;
    case 'evil': {
      const pts = [P(-0.1, -0.035), P(-0.01, 0.0), P(0.08, -0.05), P(0.05, 0.03), P(-0.01, 0.06), P(-0.07, 0.03)];
      ctx.beginPath(); spline(ctx, pts, true, 0.45); fillStroke(ctx, '#ffffff', lc, lw);
      ctx.beginPath(); for (let i = 0; i <= 8; i++) ctx.lineTo(mx - 0.085 + i * 0.019, my + 0.012 + (i % 2 ? 0.018 : -0.006)); ctx.strokeStyle = lc; ctx.lineWidth = lw * 0.7; ctx.stroke();
      break;
    }
    default: line(ctx, [P(-0.055, 0.0), P(0, 0.006), P(0.048, -0.004)], lc, lw, true);
  }
}

// lip flap: deterministic mouth openness while speaking
export function flapShape(t, t0, loud) {
  const k = Math.floor((t - t0) * 12); // anime mouth flaps on twos
  const r = (Math.sin(k * 12.9898 + t0 * 78.233) * 43758.5453) % 1;
  const v = Math.abs(r);
  if (loud) return v < 0.25 ? 'mid' : 'wide';
  return v < 0.3 ? 'line' : v < 0.7 ? 'open' : 'mid';
}

export function drawFace(ctx, def, st, t) {
  const f = def.face;
  const ex = st.exObj;
  const look = st.look || [0, 0];
  const open = (ex.open ?? 1) * (st.blink ?? 1);
  const skinShadow = shade(f.skin, -0.18);
  // cheek blush
  const blush = Math.max(ex.blush || 0, st.blush || 0);
  if (blush > 0) {
    ellipse(ctx, -0.02, 0.24, 0.1, 0.045, 0, rgba('#ff6f8a', 0.35 * blush));
    ellipse(ctx, 0.3, 0.24, 0.06, 0.04, 0, rgba('#ff6f8a', 0.35 * blush));
    for (let i = 0; i < 3; i++) line(ctx, [[-0.07 + i * 0.04, 0.26], [-0.05 + i * 0.04, 0.22]], rgba('#d0405a', 0.6 * blush), 0.008);
  }
  // nose
  ctx.beginPath(); ctx.moveTo(0.31, 0.16); ctx.lineTo(0.355, 0.235); ctx.lineTo(0.3, 0.245); ctx.closePath();
  ctx.fillStyle = rgba(skinShadow, 0.8); ctx.fill();
  line(ctx, [[0.335, 0.215], [0.355, 0.238], [0.325, 0.245]], shade(f.skin, -0.45), 0.009);
  // eyes
  const es = f.eyeSize || 1;
  const ew = 0.24 * es, eh = 0.27 * es * (f.eyeTall || 1);
  if (!f.noEyes) {
    drawEye(ctx, def, f, -0.04, 0.05, ew, eh, 1, ex, open, look, t);
    drawEye(ctx, def, f, 0.275, 0.05, ew * 0.6, eh * 0.96, -1, ex, open, look, t);
  }
  // mouth
  drawMouth(ctx, f, st.mouthShape || ex.mouth, 0);
  if (f.wrinkles) {
    line(ctx, [[0.24, 0.29], [0.28, 0.36], [0.27, 0.42]], rgba(shade(f.skin, -0.4), 0.6), 0.008, true);
    line(ctx, [[-0.12, 0.17], [-0.06, 0.2]], rgba(shade(f.skin, -0.4), 0.5), 0.007);
  }
  if (f.scar) line(ctx, [[0.02, 0.18], [0.13, 0.3]], shade(f.skin, -0.35), 0.014);
  if (f.bandage) {
    ctx.save(); ctx.translate(0.1, 0.2); ctx.rotate(-0.2);
    ctx.beginPath(); ctx.rect(-0.07, -0.025, 0.14, 0.05); fillStroke(ctx, '#f3e6cf', shade(f.skin, -0.5), 0.007);
    line(ctx, [[-0.03, -0.02], [-0.03, 0.02]], rgba('#b49a7a', 0.8), 0.005); line(ctx, [[0.03, -0.02], [0.03, 0.02]], rgba('#b49a7a', 0.8), 0.005);
    ctx.restore();
  }
}

export function drawBrows(ctx, def, st) {
  const f = def.face;
  if (f.noBrows) return;
  const col = f.brow || def.hair?.line || '#1a1020';
  drawBrow(ctx, f, true, st.exObj, col);
  drawBrow(ctx, f, false, st.exObj, col);
}

export function drawFaceExtras(ctx, def, st, t) {
  const ex = st.exObj;
  const tears = Math.max(ex.tears || 0, st.tears || 0);
  if (tears > 0) {
    const a = 0.85 * tears;
    const wob = Math.sin(t * 7) * 0.01;
    ctx.beginPath();
    ctx.moveTo(-0.08, 0.17); ctx.quadraticCurveTo(-0.1 + wob, 0.3, -0.07, 0.42 + 0.03 * Math.sin(t * 3)); ctx.lineTo(-0.04, 0.42); ctx.quadraticCurveTo(-0.06, 0.3, -0.03, 0.17); ctx.closePath();
    fillStroke(ctx, rgba('#9fd8ff', a), rgba('#3d7fb8', a), 0.007);
    ellipse(ctx, 0.29, 0.2, 0.018, 0.03, 0, rgba('#9fd8ff', a), rgba('#3d7fb8', a), 0.006);
  }
  if (ex.gloom || st.gloom) {
    const g = Math.max(ex.gloom || 0, st.gloom || 0);
    ctx.save(); headPath(ctx, def.face); ctx.clip();
    const gr = ctx.createLinearGradient(0, -0.5, 0, 0.15);
    gr.addColorStop(0, rgba('#1d2a6b', 0.75 * g)); gr.addColorStop(1, rgba('#1d2a6b', 0));
    ctx.fillStyle = gr; ctx.fillRect(-0.6, -0.6, 1.2, 0.8);
    for (let i = 0; i < 7; i++) line(ctx, [[-0.2 + i * 0.08, -0.35], [-0.2 + i * 0.08, -0.08 + (i % 2) * 0.05]], rgba('#14174a', 0.7 * g), 0.012);
    ctx.restore();
  }
  if (ex.sweat || st.sweat) {
    const y = -0.18 + ((t * 0.25) % 0.12);
    ctx.beginPath(); ctx.moveTo(0.45, y - 0.09); ctx.quadraticCurveTo(0.52, y + 0.02, 0.45, y + 0.05); ctx.quadraticCurveTo(0.38, y + 0.02, 0.45, y - 0.09);
    fillStroke(ctx, '#bfe6ff', '#3b84c4', 0.01);
    ellipse(ctx, 0.435, y + 0.01, 0.012, 0.02, 0, '#ffffff');
  }
  if (ex.vein || st.vein) {
    const s = 1 + 0.12 * Math.sin(t * 14);
    ctx.save(); ctx.translate(0.3, -0.33); ctx.scale(s, s);
    for (let i = 0; i < 4; i++) {
      ctx.save(); ctx.rotate(i * Math.PI / 2 + 0.4);
      ctx.beginPath(); ctx.moveTo(0.02, 0.02); ctx.quadraticCurveTo(0.05, 0.01, 0.07, 0.05); ctx.strokeStyle = '#d6203a'; ctx.lineWidth = 0.022; ctx.lineCap = 'round'; ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
}
