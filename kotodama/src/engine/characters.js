// MODEL SHEETS. Each character is defined exactly once here; every frame of every episode
// is drawn from these numbers, which is what keeps designs 100% on-model.
import { spline, fillStroke, line, ellipse, circle, poly, capsule, taper, shape, rot } from './draw.js';
import { shade, rgba, lerp, TAU, D2R, rng } from './util.js';

const L = '#22141c'; // default line colour (warm dark)

const bodyTeen = { torso: 1.72, neck: 0.16, upper: 0.98, fore: 0.88, thigh: 1.36, shin: 1.3, shoulder: 0.92, hipW: 0.95, chest: 1, waist: 1, limb: 1 };

function scarfTails(ctx, def, S, lw, t, st, color) {
  const n = S.neck;
  const wind = 0.4 + (st.wind || 0);
  for (let k = 0; k < 2; k++) {
    const len = k ? 1.25 : 1.55, ph = k * 1.3;
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const q = i / 6;
      pts.push([n[0] - 0.18 - q * len * (0.55 + wind * 0.45), n[1] + 0.12 + q * len * (0.75 - wind * 0.55) + Math.sin(t * 7 - i * 0.9 + ph) * 0.07 * q * (1 + wind)]);
    }
    taper(ctx, pts, 0.24, 0.13, L, 0.26);
    taper(ctx, pts.map((p) => [p[0], p[1]]), 0.18, 0.08, k ? shade(color, -0.15) : color, 0.2);
  }
}

// ---------------------------------------------------------------- KAKERU
const kakeru = {
  id: 'kakeru', name: 'Kakeru', full: 'Kakeru Sumizome', jp: '墨染 翔', color: '#ff5a4f',
  u: 96, line: L, defaultExpr: 'grin',
  body: { ...bodyTeen },
  face: { skin: '#ffe0c8', eye: '#f2a516', lash: '#1b1020', line: L, bandage: true, browThick: 1.15 },
  hair: { style: 'kakeru', color: '#1d1b30', tip: '#d4223f', line: '#0d0b16', shine: '#55538a' },
  item: { kind: 'brush', len: 1.15, r: 0.05, tip: 0.32, color: '#b8864a', band: '#3a2a1a', ink: '#120e18', back: 0.3 },
  outfit: {
    top: '#24305e', sleeve: '#24305e', sleeveLen: 'short', wrap: '#f1ead8', pants: '#3b3a48', shoes: '#2a1c18', sole: '#c9a77a', shinWrap: '#d9cfbd',
    torsoDetail(ctx, d, T) {
      ctx.beginPath(); ctx.moveTo(0.05, -T + 0.02); ctx.lineTo(0.19, -T + 0.03); ctx.lineTo(0.2, -T * 0.6); ctx.lineTo(0.14, -T * 0.58); ctx.closePath();
      fillStroke(ctx, '#e9e2d6', L, 0.02);
      line(ctx, [[0.04, -T + 0.02], [0.13, -T * 0.42]], '#d4223f', 0.05);
      line(ctx, [[0.2, -T + 0.03], [0.24, -T * 0.45]], '#d4223f', 0.04);
      // sash
      ctx.beginPath(); ctx.moveTo(-0.6, -T * 0.4); ctx.lineTo(0.6, -T * 0.44); ctx.lineTo(0.6, -T * 0.27); ctx.lineTo(-0.6, -T * 0.23); ctx.closePath();
      fillStroke(ctx, '#c11f3a', L, 0.025);
      line(ctx, [[-0.6, -T * 0.32], [0.6, -T * 0.355]], rgba('#7a0f22', 0.7), 0.015);
      // back emblem hint (ink doodle)
      line(ctx, [[-0.42, -T + 0.75], [-0.3, -T + 0.95], [-0.4, -T + 1.05]], rgba('#9fb0e8', 0.5), 0.03, true);
    },
    torsoOver(ctx, d, T, lw) {
      // jacket hem flaring over the hips
      ctx.beginPath(); ctx.moveTo(-0.33, -T * 0.24); ctx.lineTo(0.26, -T * 0.27); ctx.lineTo(0.32, 0.3); ctx.lineTo(0.02, 0.26); ctx.lineTo(-0.42, 0.32); ctx.closePath();
      fillStroke(ctx, '#24305e', L, lw);
      line(ctx, [[0.24, -T * 0.27], [0.3, 0.29]], '#d4223f', 0.06);
      line(ctx, [[-0.42, 0.31], [0.02, 0.25], [0.32, 0.29]], '#d4223f', 0.05);
      // sash knot
      ctx.beginPath(); ctx.moveTo(0.18, -T * 0.34); ctx.lineTo(0.34, -T * 0.2); ctx.lineTo(0.26, -T * 0.08); ctx.closePath(); fillStroke(ctx, '#c11f3a', L, lw * 0.8);
    },
    back(ctx, d, S, lw, t, st) {
      scarfTails(ctx, d, S, lw, t, st, '#d4223f');
      // spare brush tucked in the sash (diagonal behind the hip)
      ctx.save(); ctx.translate(S.hip[0], S.hip[1]); ctx.rotate(S.lean);
      ctx.beginPath(); capsule(ctx, -0.25, -d.body.torso * 0.5, -0.62, 0.3, 0.05, 0.045); fillStroke(ctx, '#9a6e3c', L, lw * 0.8);
      ctx.beginPath(); ctx.moveTo(-0.22, -d.body.torso * 0.5 - 0.02); ctx.quadraticCurveTo(-0.1, -d.body.torso * 0.6, -0.08, -d.body.torso * 0.72); ctx.quadraticCurveTo(-0.2, -d.body.torso * 0.62, -0.3, -d.body.torso * 0.5); ctx.closePath(); fillStroke(ctx, '#15111a', L, lw * 0.6);
      ctx.restore();
    },
    front(ctx, d, S, lw) {
      // scarf wrap around the neck
      const n = S.neck;
      ctx.save(); ctx.translate(n[0], n[1] + 0.05); ctx.rotate(S.lean * 0.8);
      ctx.beginPath(); spline(ctx, [[-0.36, -0.02], [-0.1, -0.14], [0.26, -0.1], [0.36, 0.06], [0.1, 0.2], [-0.3, 0.16]], true, 0.5);
      fillStroke(ctx, '#d4223f', L, lw);
      line(ctx, [[-0.28, 0.06], [0.0, 0.1], [0.3, 0.04]], rgba('#7a0f22', 0.8), lw * 0.7, true);
      ctx.restore();
    },
  },
};

// ---------------------------------------------------------------- SHIORI
const shiori = {
  id: 'shiori', name: 'Shiori', full: 'Shiori Kaisho', jp: '楷書 栞', color: '#6fd6e8',
  u: 92, line: L, defaultExpr: 'cold',
  body: { ...bodyTeen, torso: 1.68, shoulder: 0.8, hipW: 0.9, chest: 0.98, waist: 0.86, limb: 0.88, thigh: 1.38, shin: 1.34 },
  face: { skin: '#ffe6d6', eye: '#1fb3c6', lash: '#1a1030', line: L, lashes: true, eyeSize: 1.05, eyeTall: 1.05, chin: 0.6, browThick: 0.8 },
  hair: { style: 'shiori', color: '#30234f', line: '#130c22', shine: '#7e6ab8', ribbon: '#f6f4ff' },
  item: { kind: 'brush', len: 2.3, r: 0.045, tip: 0.38, color: '#2a2f4a', band: '#c9a64a', ink: '#0e1a24', tassel: '#2fb7a5', back: 0.55 },
  outfit: {
    top: '#f7f5fb', sleeve: '#f7f5fb', flap: '#eceaf6', flapLen: 0.75, pants: '#2c2f6b', shoes: '#f2efe8', legW: [0.27, 0.31, 0.38], sole: '#5a4a3a',
    torsoDetail(ctx, d, T) {
      // crossed collar
      line(ctx, [[-0.1, -T + 0.04], [0.26, -T * 0.42]], '#2c2f6b', 0.07);
      line(ctx, [[0.14, -T + 0.04], [0.06, -T * 0.55]], '#c8cbe8', 0.04);
      // hakama top
      ctx.beginPath(); ctx.moveTo(-0.6, -T * 0.42); ctx.lineTo(0.6, -T * 0.46); ctx.lineTo(0.6, 0.4); ctx.lineTo(-0.6, 0.4); ctx.closePath();
      fillStroke(ctx, '#2c2f6b', L, 0.025);
      line(ctx, [[-0.6, -T * 0.4], [0.6, -T * 0.44]], '#f2efe8', 0.05);
      line(ctx, [[-0.1, -T * 0.3], [-0.12, 0.3]], rgba('#14164a', 0.7), 0.02);
    },
    skirt(ctx, d, S, lw) {
      // hakama pleated front panel joining the legs
      const kn = S.LN.knee, kf = S.LF.knee;
      ctx.beginPath(); ctx.moveTo(S.hip[0] - 0.36, S.hip[1] - 0.05); ctx.lineTo(S.hip[0] + 0.3, S.hip[1] - 0.05);
      ctx.lineTo(Math.max(kn[0], kf[0]) + 0.3, Math.max(kn[1], kf[1]) - 0.1); ctx.lineTo(Math.min(kn[0], kf[0]) - 0.3, Math.max(kn[1], kf[1]) - 0.1); ctx.closePath();
      fillStroke(ctx, '#2c2f6b', L, lw);
      for (let i = 0; i < 3; i++) line(ctx, [[S.hip[0] - 0.15 + i * 0.15, S.hip[1] + 0.05], [lerp(Math.min(kn[0], kf[0]), Math.max(kn[0], kf[0]), (i + 1) / 4), Math.max(kn[1], kf[1]) - 0.15]], rgba('#14164a', 0.7), lw * 0.6);
    },
  },
};

// ---------------------------------------------------------------- BOKUSAI
const bokusai = {
  id: 'bokusai', name: 'Bokusai', full: 'Master Bokusai', jp: '墨斎', color: '#e8b45a',
  u: 100, line: L, defaultExpr: 'calm',
  body: { ...bodyTeen, torso: 1.55, thigh: 1.02, shin: 0.98, upper: 0.88, fore: 0.82, shoulder: 0.98, chest: 1.12, waist: 1.25, hipW: 1.1, limb: 1.05 },
  face: { skin: '#f2cfae', eye: '#3a2a1a', lash: '#2a1a14', line: L, eyeSize: 0.75, wrinkles: true, noBrows: true },
  hair: { style: 'bokusai', color: '#f2f0ea', line: '#6b6355' },
  item: { kind: 'brush', len: 3.0, r: 0.09, tip: 0.6, color: '#6b4426', band: '#c9a64a', ink: '#100c12', back: 0.9 },
  outfit: {
    top: '#7a5434', sleeve: '#7a5434', flap: '#6c4a2e', flapLen: 0.8, pants: '#6c4a2e', shoes: '#3a2a1a', legW: [0.3, 0.32, 0.34],
    torsoDetail(ctx, d, T) {
      line(ctx, [[-0.12, -T + 0.04], [0.3, -T * 0.4]], '#e8dcc0', 0.08);
      ctx.beginPath(); ctx.moveTo(-0.7, -T * 0.42); ctx.lineTo(0.7, -T * 0.46); ctx.lineTo(0.7, -T * 0.33); ctx.lineTo(-0.7, -T * 0.29); ctx.closePath(); fillStroke(ctx, '#c9b07a', L, 0.022);
      for (let i = 0; i < 6; i++) line(ctx, [[-0.5 + i * 0.18, -T * 0.42], [-0.45 + i * 0.18, -T * 0.3]], rgba('#7a6440', 0.8), 0.015);
      for (let i = 0; i < 4; i++) ellipse(ctx, -0.3 + i * 0.2, -T * 0.75 + (i % 2) * 0.3, 0.05, 0.04, 0, rgba('#5a3a20', 0.6));
    },
    back(ctx, d, S, lw, t, st) {
      if (st.noBackBrush) return;
      ctx.save(); ctx.translate(S.neck[0], S.neck[1]); ctx.rotate(S.lean + 0.55);
      ctx.beginPath(); capsule(ctx, 0, -1.2, 0, 1.7, 0.1, 0.09); fillStroke(ctx, '#6b4426', L, lw);
      ctx.beginPath(); capsule(ctx, 0, -1.25, 0, -0.95, 0.12, 0.12); fillStroke(ctx, '#c9a64a', L, lw * 0.8);
      ctx.beginPath(); ctx.moveTo(-0.16, -1.25); ctx.quadraticCurveTo(-0.2, -1.65, 0, -1.95); ctx.quadraticCurveTo(0.2, -1.65, 0.16, -1.25); ctx.closePath(); fillStroke(ctx, '#121016', L, lw);
      ctx.restore();
    },
    front(ctx, d, S, lw, t) {
      // sake gourd
      const x = S.hip[0] + 0.32, y = S.hip[1] - 0.25;
      ctx.save(); ctx.translate(x, y); ctx.rotate(0.25 + Math.sin(t * 2) * 0.05);
      circle(ctx, 0, 0.18, 0.17, '#d98c3a', L, lw); circle(ctx, 0, -0.06, 0.11, '#d98c3a', L, lw);
      ctx.beginPath(); ctx.rect(-0.04, -0.22, 0.08, 0.08); fillStroke(ctx, '#7a3a1a', L, lw * 0.8);
      line(ctx, [[-0.1, 0.04], [0.1, 0.04]], '#7a2a2a', lw * 1.4);
      ctx.restore();
    },
  },
  headFront(ctx, d, st, t, lw) {
    const ex = st.exObj;
    // big droopy eyebrows
    const up = (ex.brow || 0) * 1.5, ang = ex.browAng || 0;
    ctx.beginPath(); spline(ctx, [[-0.22, -0.08 - up], [-0.12, -0.17 - up + ang * 0.03], [0.08, -0.16 - up + ang * 0.05], [0.0, -0.08 - up], [-0.15, -0.04 - up]], true); fillStroke(ctx, '#f2f0ea', '#6b6355', lw * 0.8);
    ctx.beginPath(); spline(ctx, [[0.18, -0.15 - up + ang * 0.04], [0.36, -0.15 - up], [0.42, -0.06 - up], [0.3, -0.08 - up]], true); fillStroke(ctx, '#f2f0ea', '#6b6355', lw * 0.8);
    // beard + moustache
    const sw = Math.sin(t * 1.5) * 0.02;
    const mo = st.mouthShape && st.mouthShape !== 'line' ? 0.04 : 0;
    ctx.beginPath(); spline(ctx, [[-0.16, 0.18], [0.05, 0.3], [0.3, 0.28], [0.38, 0.36], [0.3, 0.6], [0.2 + sw, 0.95], [0.08 + sw, 1.15], [0.0 + sw, 0.9], [-0.12, 0.6], [-0.2, 0.35]], true, 0.45);
    fillStroke(ctx, '#f2f0ea', '#6b6355', lw);
    line(ctx, [[0.05, 0.5], [0.08 + sw, 0.85]], rgba('#9a917f', 0.7), lw * 0.6, true);
    line(ctx, [[0.18, 0.5], [0.16 + sw, 0.8]], rgba('#9a917f', 0.7), lw * 0.6, true);
    if (mo) ellipse(ctx, 0.18, 0.4, 0.06, 0.03 + mo * 0.5, 0, '#5b1b26');
    ctx.beginPath(); ctx.moveTo(0.06, 0.32); ctx.quadraticCurveTo(0.2, 0.26, 0.4, 0.33); ctx.quadraticCurveTo(0.48, 0.42, 0.42, 0.5); ctx.quadraticCurveTo(0.35, 0.38, 0.2, 0.36); ctx.quadraticCurveTo(0.05, 0.42, -0.06, 0.48); ctx.quadraticCurveTo(-0.06, 0.36, 0.06, 0.32); ctx.closePath();
    fillStroke(ctx, '#ffffff', '#6b6355', lw * 0.8);
  },
  hat(ctx, d, st, t, lw) {
    ctx.beginPath(); ctx.moveTo(-0.85, -0.18); ctx.quadraticCurveTo(0.02, -0.95, 0.02, -0.95); ctx.quadraticCurveTo(0.02, -0.95, 0.9, -0.22); ctx.quadraticCurveTo(0.05, -0.3, -0.85, -0.18); ctx.closePath();
    fillStroke(ctx, '#d6b56a', L, lw);
    for (let i = 1; i < 6; i++) line(ctx, [[0.02, -0.93], [-0.85 + i * 0.29, -0.2]], rgba('#9a7a3a', 0.7), lw * 0.5);
  },
};

// ---------------------------------------------------------------- NASHI (villain)
const nashi = {
  id: 'nashi', name: 'Nashi', full: 'Nashi, the Seventh Margin', jp: '無し', color: '#e8e8f0',
  u: 88, line: '#1a1622', defaultExpr: 'neutral',
  body: { ...bodyTeen, torso: 1.95, thigh: 1.62, shin: 1.58, upper: 1.1, fore: 1.0, shoulder: 0.88, chest: 0.95, waist: 0.85, hipW: 0.9, limb: 0.92 },
  face: {
    skin: '#e9e4f0', eye: '#d2203a', line: '#1a1622',
    mask(ctx, d, st, t, lw) {
      const pts = [[0.06, -0.44], [0.34, -0.34], [0.44, -0.12], [0.45, 0.1], [0.38, 0.3], [0.22, 0.47], [0.08, 0.52], [-0.06, 0.42], [-0.13, 0.2], [-0.14, -0.1], [-0.08, -0.36]];
      ctx.beginPath(); spline(ctx, pts, true); fillStroke(ctx, '#f6f4f0', '#1a1622', lw);
      ctx.save(); ctx.beginPath(); spline(ctx, pts, true); ctx.clip();
      ctx.beginPath(); ctx.ellipse(-0.25, 0.05, 0.25, 0.6, 0, 0, TAU); ctx.fillStyle = rgba('#b9b4c8', 0.6); ctx.fill();
      ctx.restore();
      const glow = 0.6 + 0.4 * Math.sin(t * 3);
      for (const [x, w] of [[-0.02, 0.14], [0.29, 0.09]]) {
        ctx.beginPath(); ctx.moveTo(x - w, 0.07); ctx.quadraticCurveTo(x, 0.0, x + w, 0.05); ctx.quadraticCurveTo(x, 0.1, x - w, 0.07); ctx.closePath(); ctx.fillStyle = '#120e18'; ctx.fill();
        ellipse(ctx, x + w * 0.1, 0.06, w * 0.25, 0.025, 0, rgba('#ff2a48', glow));
      }
      const cr = st.crack || 0.35;
      ctx.beginPath(); ctx.moveTo(0.16, -0.44); ctx.lineTo(0.12, -0.3); ctx.lineTo(0.18, -0.2); ctx.lineTo(0.14, -0.08 + (1 - cr) * 0.05);
      if (cr > 0.5) { ctx.lineTo(0.2, 0.08); ctx.lineTo(0.15, 0.22); ctx.lineTo(0.22, 0.4); }
      ctx.strokeStyle = '#120e18'; ctx.lineWidth = lw * 0.9; ctx.stroke();
      if (cr > 0.8) { ctx.beginPath(); ctx.moveTo(0.18, -0.2); ctx.lineTo(0.3, -0.25); ctx.lineTo(0.38, -0.18); ctx.moveTo(0.2, 0.08); ctx.lineTo(0.05, 0.12); ctx.lineTo(-0.05, 0.08); ctx.stroke(); }
    },
  },
  hair: { style: 'nashi', color: '#f2f2fa', line: '#5a5670', shine: '#ffffff' },
  item: { kind: 'blade', len: 2.4, w: 0.15, back: 0.25 },
  outfit: {
    top: '#f2f1f6', sleeve: '#f2f1f6', gloves: '#1c1a24', cuff: '#1c1a24', pants: '#2e2c3a', shoes: '#141218', legW: [0.2, 0.16, 0.13],
    torsoDetail(ctx, d, T) {
      ctx.beginPath(); ctx.moveTo(0.02, -T + 0.02); ctx.lineTo(0.2, -T + 0.03); ctx.lineTo(0.16, 0.3); ctx.lineTo(0.06, 0.3); ctx.closePath(); fillStroke(ctx, '#1c1a24', '#1a1622', 0.02);
      for (let i = 0; i < 4; i++) circle(ctx, 0.23, -T + 0.5 + i * 0.35, 0.03, '#9a96aa');
      ctx.beginPath(); ctx.moveTo(-0.6, -T * 0.38); ctx.lineTo(0.6, -T * 0.42); ctx.lineTo(0.6, -T * 0.34); ctx.lineTo(-0.6, -T * 0.3); ctx.closePath(); fillStroke(ctx, '#1c1a24', null, 0);
    },
    torsoOver(ctx, d, T, lw) {
      // high collar
      ctx.beginPath(); ctx.moveTo(-0.3, -T + 0.12); ctx.lineTo(-0.2, -T - 0.25); ctx.lineTo(0.22, -T - 0.18); ctx.lineTo(0.24, -T + 0.06); ctx.closePath(); fillStroke(ctx, '#f2f1f6', '#1a1622', lw);
      line(ctx, [[-0.2, -T - 0.2], [0.2, -T - 0.14]], rgba('#9a96aa', 0.8), lw * 0.6);
    },
    skirt(ctx, d, S, lw, t, st) {
      const kn = S.LN.knee, kf = S.LF.knee;
      const low = Math.max(kn[1], kf[1]) + 0.55;
      const fl = Math.sin(t * 3) * 0.08 + (st.wind || 0) * 0.3;
      ctx.beginPath(); ctx.moveTo(S.hip[0] - 0.38, S.hip[1] - 0.25); ctx.lineTo(S.hip[0] + 0.3, S.hip[1] - 0.25);
      ctx.lineTo(Math.max(kn[0], kf[0]) + 0.28, low - 0.05);
      ctx.lineTo(lerp(kn[0], kf[0], 0.5), low + 0.05);
      ctx.lineTo(Math.min(kn[0], kf[0]) - 0.45 - fl, low + 0.1);
      ctx.lineTo(Math.min(kn[0], kf[0]) - 0.75 - fl * 1.6, low - 0.05);
      ctx.closePath();
      fillStroke(ctx, '#f2f1f6', '#1a1622', lw);
      line(ctx, [[S.hip[0] + 0.1, S.hip[1] - 0.1], [lerp(kn[0], kf[0], 0.5) + 0.05, low]], rgba('#9a96aa', 0.9), lw * 0.7);
      line(ctx, [[S.hip[0] - 0.25, S.hip[1] - 0.1], [Math.min(kn[0], kf[0]) - 0.5 - fl, low]], rgba('#9a96aa', 0.6), lw * 0.6);
    },
  },
};

// ---------------------------------------------------------------- GONDA (exam proctor)
const gonda = {
  id: 'gonda', name: 'Gonda', full: 'Instructor Gonda Tetsuzo', jp: '権田 鉄蔵', color: '#8fd16a',
  u: 98, line: L, defaultExpr: 'serious',
  body: { ...bodyTeen, torso: 2.0, thigh: 1.42, shin: 1.32, upper: 1.06, fore: 0.98, shoulder: 1.35, chest: 1.3, waist: 1.22, hipW: 1.18, limb: 1.3 },
  face: { skin: '#e8b98f', eye: '#4a3a20', lash: '#1a1010', line: L, jaw: 1, scar: true, eyeSize: 0.82, browThick: 1.7 },
  hair: { style: 'gonda', color: '#23241e', line: '#0e0e0a', shine: '#4a4c40' },
  outfit: {
    top: '#3c5a3a', sleeve: '#3c5a3a', pants: '#1f1d24', shoes: '#2a1c18', legW: [0.26, 0.24, 0.22], cuff: '#c9a64a',
    torsoDetail(ctx, d, T) {
      ctx.beginPath(); ctx.moveTo(-0.05, -T + 0.02); ctx.lineTo(0.22, -T + 0.03); ctx.lineTo(0.3, -T * 0.4); ctx.lineTo(0.1, -T * 0.38); ctx.closePath(); fillStroke(ctx, '#bfbfb8', L, 0.022);
      line(ctx, [[-0.05, -T + 0.02], [0.1, -T * 0.38]], '#c9a64a', 0.07);
      ctx.beginPath(); ctx.moveTo(-0.8, -T * 0.38); ctx.lineTo(0.8, -T * 0.42); ctx.lineTo(0.8, -T * 0.28); ctx.lineTo(-0.8, -T * 0.24); ctx.closePath(); fillStroke(ctx, '#1f1d24', L, 0.022);
      circle(ctx, -0.35, -T + 0.55, 0.09, '#c9a64a', L, 0.015);
    },
  },
};

// ---------------------------------------------------------------- CHIYO (grandmother, flashbacks)
const chiyo = {
  id: 'chiyo', name: 'Grandma Chiyo', full: 'Chiyo Sumizome', jp: '墨染 千代', color: '#d9a6e8',
  u: 94, line: L, defaultExpr: 'calm',
  body: { ...bodyTeen, torso: 1.5, thigh: 1.08, shin: 1.02, upper: 0.86, fore: 0.8, shoulder: 0.84, chest: 0.95, waist: 1.05, hipW: 1.05, limb: 0.92 },
  face: { skin: '#f0d2b8', eye: '#5a4030', lash: '#2a1a1a', line: L, eyeSize: 0.78, wrinkles: true },
  hair: { style: 'chiyo', color: '#b9b4ba', line: '#5a5258' },
  outfit: {
    top: '#6a4a8a', sleeve: '#6a4a8a', flap: '#5e4080', pants: '#6a4a8a', shoes: '#e8e0d0', legW: [0.27, 0.27, 0.26],
    torsoDetail(ctx, d, T) {
      line(ctx, [[-0.1, -T + 0.04], [0.26, -T * 0.42]], '#efe6d8', 0.07);
      ctx.beginPath(); ctx.moveTo(-0.6, -T * 0.5); ctx.lineTo(0.6, -T * 0.54); ctx.lineTo(0.6, -T * 0.2); ctx.lineTo(-0.6, -T * 0.16); ctx.closePath(); fillStroke(ctx, '#d6a24a', L, 0.022);
      line(ctx, [[-0.6, -T * 0.34], [0.6, -T * 0.37]], '#a0303a', 0.035);
    },
    skirt(ctx, d, S, lw) {
      const a = S.LN.ankle, b = S.LF.ankle;
      ctx.beginPath(); ctx.moveTo(S.hip[0] - 0.36, S.hip[1] - 0.2); ctx.lineTo(S.hip[0] + 0.32, S.hip[1] - 0.2); ctx.lineTo(Math.max(a[0], b[0]) + 0.2, Math.max(a[1], b[1]) - 0.08); ctx.lineTo(Math.min(a[0], b[0]) - 0.25, Math.max(a[1], b[1]) - 0.08); ctx.closePath();
      fillStroke(ctx, '#6a4a8a', L, lw);
      line(ctx, [[S.hip[0] + 0.15, S.hip[1] - 0.1], [Math.max(a[0], b[0]) + 0.05, Math.max(a[1], b[1]) - 0.1]], '#efe6d8', lw * 1.2);
    },
  },
};

// ---------------------------------------------------------------- KANEMARU (snobby rival candidate)
const kanemaru = {
  id: 'kanemaru', name: 'Kanemaru', full: 'Toru Kanemaru', jp: '金丸 透', color: '#f2d04a',
  u: 94, line: L, defaultExpr: 'smug',
  body: { ...bodyTeen, shoulder: 0.95 },
  face: { skin: '#ffe2cc', eye: '#7a4ad8', lash: '#1b1020', line: L, chin: 0.4 },
  hair: { style: 'kanemaru', color: '#f0c850', line: '#8a6a1a', shine: '#fff2b0' },
  outfit: {
    top: '#f4f0e6', sleeve: '#f4f0e6', pants: '#6a2a3a', shoes: '#1a1418', cuff: '#d4a832',
    torsoDetail(ctx, d, T) {
      line(ctx, [[-0.1, -T + 0.04], [0.26, -T * 0.42]], '#d4a832', 0.08);
      ctx.beginPath(); ctx.moveTo(-0.6, -T * 0.4); ctx.lineTo(0.6, -T * 0.44); ctx.lineTo(0.6, -T * 0.3); ctx.lineTo(-0.6, -T * 0.26); ctx.closePath(); fillStroke(ctx, '#6a2a3a', L, 0.022);
      circle(ctx, 0.15, -T * 0.36, 0.06, '#f2d04a', L, 0.015);
    },
  },
};

// ---------------------------------------------------------------- NIJIMI (living ink-blot mascot)
const nijimi = {
  id: 'nijimi', name: 'Nijimi', full: 'Nijimi', jp: '滲み', color: '#9aa6ff',
  u: 70, defaultExpr: 'happy',
  body: { torso: 1, thigh: 0, shin: 0 },
  custom(ctx, d, st, t, opts) {
    const U = d.u * (st.scale || 1);
    const bob = Math.abs(Math.sin(t * (st.motion === 'run' ? 14 : 3))) * (st.motion === 'run' ? 0.35 : 0.08) + (st.pose?.air || 0);
    const ex = st.expr || 'happy';
    ctx.save();
    ctx.translate(st.x, st.y - bob * U);
    if (st.facing < 0) ctx.scale(-1, 1);
    const sq = 1 + Math.sin(t * 6) * 0.04;
    ctx.scale(U * sq, U / sq);
    // shadow
    ctx.save(); ctx.scale(1, 0.25); circle(ctx, 0, bob * 4 + 0.1, 0.55, rgba('#000000', 0.18)); ctx.restore();
    // body blob
    const pts = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU;
      const r = 0.55 + Math.sin(a * 3 + t * 4) * 0.035 + Math.sin(a * 5 - t * 3) * 0.02;
      pts.push([Math.cos(a) * r, -0.52 + Math.sin(a) * r * 0.9 + (Math.sin(a) > 0.6 ? 0.08 : 0)]);
    }
    ctx.beginPath(); spline(ctx, pts, true);
    const g = ctx.createRadialGradient(-0.15, -0.75, 0.05, 0, -0.5, 0.7);
    g.addColorStop(0, '#3a3a5e'); g.addColorStop(1, '#0f0d1a');
    fillStroke(ctx, g, '#05040a', 0.045);
    // drips
    for (let i = 0; i < 3; i++) { const x = -0.3 + i * 0.28, l = 0.08 + 0.05 * Math.sin(t * 2 + i); ctx.beginPath(); capsule(ctx, x, -0.12, x, -0.1 + l, 0.05, 0.035); ctx.fillStyle = '#0f0d1a'; ctx.fill(); }
    // little arms
    const wave = st.pose === 'cheer' || ex === 'cheer' ? Math.sin(t * 14) * 0.25 : Math.sin(t * 3) * 0.08;
    ctx.beginPath(); capsule(ctx, -0.5, -0.45, -0.75, -0.6 - wave, 0.07, 0.06); ctx.fillStyle = '#16142a'; ctx.fill();
    ctx.beginPath(); capsule(ctx, 0.5, -0.45, 0.76, -0.62 + wave, 0.07, 0.06); ctx.fill();
    // shine
    ellipse(ctx, -0.22, -0.85, 0.12, 0.06, -0.5, rgba('#8f9cff', 0.55));
    // eyes
    const blink = st.blink ?? 1;
    const eyeY = -0.55;
    for (const ex0 of [-0.18, 0.2]) {
      if (ex === 'happy' || ex === 'cheer' || blink < 0.2) {
        line(ctx, [[ex0 - 0.09, eyeY + 0.03], [ex0, eyeY - 0.06], [ex0 + 0.09, eyeY + 0.03]], '#ffffff', 0.05);
      } else {
        const big = ex === 'surprised' || ex === 'shocked' ? 1.25 : 1;
        ellipse(ctx, ex0, eyeY, 0.12 * big, 0.15 * big, 0, '#ffffff');
        ellipse(ctx, ex0 + 0.03, eyeY + 0.02, ex === 'shocked' ? 0.03 : 0.06, ex === 'shocked' ? 0.04 : 0.08, 0, '#0b0a14');
        circle(ctx, ex0 + 0.0, eyeY - 0.04, 0.025, '#ffffff');
        if (ex === 'sad' || ex === 'worried') line(ctx, [[ex0 - 0.12, eyeY - 0.2 + (ex0 > 0 ? 0.04 : 0)], [ex0 + 0.1, eyeY - 0.2 + (ex0 > 0 ? 0 : 0.04)]], '#ffffff', 0.035);
        if (ex === 'angry') line(ctx, [[ex0 - 0.12, eyeY - 0.2 + (ex0 > 0 ? 0 : -0.03)], [ex0 + 0.1, eyeY - 0.17 + (ex0 > 0 ? -0.03 : 0)]], '#ffffff', 0.04);
      }
    }
    // mouth
    const talk = st.mouthShape && st.mouthShape !== 'line';
    if (talk || ex === 'cheer' || ex === 'surprised' || ex === 'shocked') ellipse(ctx, 0.02, -0.33, 0.07, talk ? 0.05 : 0.07, 0, '#ff7a9a', '#ffffff', 0.02);
    else if (ex === 'sad' || ex === 'worried') line(ctx, [[-0.06, -0.3], [0.02, -0.35], [0.1, -0.3]], '#ffffff', 0.035, true);
    else line(ctx, [[-0.07, -0.36], [0.02, -0.3], [0.11, -0.36]], '#ffffff', 0.035, true);
    if (ex === 'happy' || ex === 'cheer') { ellipse(ctx, -0.36, -0.4, 0.07, 0.04, 0, rgba('#ff7aa0', 0.6)); ellipse(ctx, 0.38, -0.4, 0.07, 0.04, 0, rgba('#ff7aa0', 0.6)); }
    if (ex === 'worried' || ex === 'shocked') { ctx.beginPath(); ctx.moveTo(0.55, -0.95); ctx.quadraticCurveTo(0.62, -0.82, 0.55, -0.78); ctx.quadraticCurveTo(0.48, -0.82, 0.55, -0.95); fillStroke(ctx, '#bfe6ff', '#3b84c4', 0.02); }
    ctx.restore();
  },
};

// ---------------------------------------------------------------- generic extras
const EXTRA_HAIR = ['short', 'bob', 'spiky2', 'ponytail', 'short', 'bob'];
const EXTRA_HAIRC = ['#2a2230', '#4a3020', '#1e2a3a', '#6a3a2a', '#3a2a4a', '#202020', '#8a5a2a'];
const EXTRA_TOP = ['#8a3a3a', '#3a6a8a', '#5a7a3a', '#7a5a9a', '#a07a3a', '#3a4a6a', '#6a6a6a', '#2f6f6a'];
const EXTRA_SKIN = ['#ffe0c8', '#f2cfae', '#ffd9bd', '#e8bf98'];
export function makeExtra(seed, opts = {}) {
  const r = rng(seed * 7919 + 13);
  const girl = opts.girl ?? r() < 0.45;
  const top = opts.top || r.pick(EXTRA_TOP);
  return {
    id: 'extra' + seed, name: opts.name || 'Villager', full: opts.name || 'Villager', color: '#cccccc', u: 90 + r() * 8, line: L, defaultExpr: opts.expr || 'neutral',
    body: { ...bodyTeen, torso: 1.65 + r() * 0.2, shoulder: girl ? 0.8 : 0.9 + r() * 0.12, waist: girl ? 0.9 : 1, hipW: 1, chest: 1, limb: girl ? 0.92 : 1 },
    face: { skin: r.pick(EXTRA_SKIN), eye: r.pick(['#4a3a2a', '#2a4a6a', '#3a6a3a', '#6a3a2a']), lash: '#1b1020', line: L, lashes: girl, eyeSize: 0.9 + r() * 0.15 },
    hair: { style: opts.hair || (girl ? r.pick(['bob', 'ponytail', 'bob']) : r.pick(['short', 'spiky2', 'short'])), color: r.pick(EXTRA_HAIRC), line: '#120c12' },
    outfit: {
      top, sleeve: top, pants: opts.pants || r.pick(['#2a2a3a', '#3a3040', '#4a4a5a', '#2c2f4a']), shoes: '#2a1c18',
      torsoDetail(ctx, d, T) {
        line(ctx, [[-0.1, -T + 0.04], [0.26, -T * 0.42]], shade(top, 0.5), 0.06);
        ctx.beginPath(); ctx.moveTo(-0.6, -T * 0.4); ctx.lineTo(0.6, -T * 0.44); ctx.lineTo(0.6, -T * 0.3); ctx.lineTo(-0.6, -T * 0.26); ctx.closePath(); fillStroke(ctx, shade(top, -0.35), L, 0.022);
      },
    },
  };
}

export const CAST = { kakeru, shiori, bokusai, nashi, gonda, chiyo, kanemaru, nijimi };
for (let i = 1; i <= 12; i++) CAST['extra' + i] = makeExtra(i);
CAST.youngKakeru = { ...kakeru, id: 'youngKakeru', name: 'Little Kakeru', u: 104, body: { ...kakeru.body, torso: 1.25, thigh: 0.9, shin: 0.85, upper: 0.72, fore: 0.66, limb: 0.85 }, face: { ...kakeru.face, bandage: false, eyeSize: 1.15 }, outfit: { ...kakeru.outfit, back: (ctx, d, S, lw, t, st) => scarfTails(ctx, d, S, lw, t, st, '#d4223f') } };
CAST.hakuo = { ...nashi, id: 'hakuo', name: '???', full: 'The White King', color: '#ffffff', u: 96, body: { ...nashi.body, torso: 2.05 } };
CAST.kid = { ...makeExtra(21, { girl: true, name: 'Little Girl', hair: 'ponytail', top: '#e86a8a' }), id: 'kid' };
CAST.father = { ...makeExtra(30, { name: 'Lord Kaisho' }), id: 'father', name: 'Lord Kaisho (letter)', color: '#7fa8c8' };
export function getChar(id) { return CAST[id]; }
