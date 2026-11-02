// Procedural background paintings. Each background = parallax layers pre-rendered once and cached,
// so every shot in the same location looks identical (layout consistency, like a real anime BG sheet).
import { env, W, H, GROUND, FONTS } from './env.js';
import { spline, fillStroke, line, ellipse, circle, poly, taper } from './draw.js';
import { rng, shade, mix, rgba, lerp, TAU, noise1, clamp } from './util.js';

export const BG_X0 = -700, BG_X1 = 2620, BG_Y0 = -400, BG_Y1 = 1400; // world rect covered by layers

const PAL = {
  day: { sky: ['#4f9fe0', '#9fd0f0', '#e4f3f8'], far: '#8fb0cc', mid: '#6f8fae', light: 1, wall: '#efe4cf', wood: '#5b3a28', roof: '#3e4a5c', ground: '#d8c29a', groundD: '#b9a074', lantern: '#e0423a', glow: 0 },
  sunset: { sky: ['#3d2a6a', '#e0607a', '#ffc27a'], far: '#7a4a7a', mid: '#5a3a62', light: 0.85, wall: '#f0c8a8', wood: '#4a2a28', roof: '#4a3a52', ground: '#c89a7a', groundD: '#a07060', lantern: '#ff6a4a', glow: 0.5 },
  night: { sky: ['#070a1e', '#141c44', '#2a2f5e'], far: '#1c2244', mid: '#151a36', light: 0.45, wall: '#5a5a78', wood: '#1c1626', roof: '#141a2a', ground: '#3a3a52', groundD: '#2a2a40', lantern: '#ff8a3a', glow: 1 },
};

function sky(ctx, p, r, opts = {}) {
  const g = ctx.createLinearGradient(0, BG_Y0, 0, GROUND - 100);
  g.addColorStop(0, p.sky[0]); g.addColorStop(0.55, p.sky[1]); g.addColorStop(1, p.sky[2]);
  ctx.fillStyle = g; ctx.fillRect(BG_X0, BG_Y0, BG_X1 - BG_X0, BG_Y1 - BG_Y0);
  if (opts.stars) {
    for (let i = 0; i < 380; i++) { const x = r.range(BG_X0, BG_X1), y = r.range(BG_Y0, 650), s = r() < 0.06 ? 2.6 : r.range(0.6, 1.6); circle(ctx, x, y, s, rgba('#ffffff', r.range(0.4, 1))); }
  }
  if (opts.moon) {
    const [mx, my] = opts.moon;
    const mg = ctx.createRadialGradient(mx, my, 40, mx, my, 260); mg.addColorStop(0, rgba('#fff6d8', 0.5)); mg.addColorStop(1, rgba('#fff6d8', 0));
    ctx.fillStyle = mg; ctx.fillRect(mx - 300, my - 300, 600, 600);
    circle(ctx, mx, my, 70, '#fff8e6');
    circle(ctx, mx - 18, my - 10, 14, rgba('#e6dcc0', 0.7)); circle(ctx, mx + 20, my + 18, 9, rgba('#e6dcc0', 0.6));
  }
  if (opts.sun) {
    const [sx, sy] = opts.sun;
    const sg = ctx.createRadialGradient(sx, sy, 30, sx, sy, 520); sg.addColorStop(0, rgba('#fff2c0', 0.95)); sg.addColorStop(0.2, rgba('#ffb070', 0.5)); sg.addColorStop(1, rgba('#ff8060', 0));
    ctx.fillStyle = sg; ctx.fillRect(sx - 600, sy - 600, 1200, 1200);
    circle(ctx, sx, sy, 85, '#fff4d0');
  }
  if (opts.clouds !== false) {
    const cc = opts.cloudColor || rgba('#ffffff', 0.9);
    for (let i = 0; i < (opts.cloudN || 9); i++) cloud(ctx, r.range(BG_X0, BG_X1), r.range(-150, 420), r.range(0.6, 1.5), cc, opts.cloudShade || rgba('#c8d8ea', 0.8), r);
  }
}

function cloud(ctx, x, y, s, col, shadeCol, r) {
  const n = 5 + Math.floor(r() * 4);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const cx = (i - n / 2) * 55 + r.range(-15, 15), cy = -Math.sin((i / (n - 1)) * Math.PI) * 50 + r.range(-10, 10); ctx.moveTo(cx + 60, cy); ctx.arc(cx, cy, 45 + r() * 30, 0, TAU); }
  ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 25, n * 30, 22, 0, 0, TAU); ctx.fillStyle = shadeCol; ctx.fill();
  ctx.restore();
}

function mountains(ctx, baseY, color, r, amp = 300, snow = false, n = 5) {
  ctx.beginPath(); ctx.moveTo(BG_X0, BG_Y1);
  const pts = [];
  for (let x = BG_X0; x <= BG_X1; x += 20) {
    let y = baseY;
    for (let k = 0; k < n; k++) y -= Math.max(0, Math.sin((x / (380 + k * 210)) + k * 2.1 + r() * 0.002)) * amp * (0.5 / (k + 1)) + noise1(x / 90, k + 3) * 8;
    pts.push([x, y]); ctx.lineTo(x, y);
  }
  ctx.lineTo(BG_X1, BG_Y1); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  return pts;
}

function fuji(ctx, x, baseY, w, h, col, snowCol) {
  ctx.beginPath(); ctx.moveTo(x - w, baseY); ctx.quadraticCurveTo(x - w * 0.25, baseY - h * 0.6, x - w * 0.09, baseY - h); ctx.lineTo(x + w * 0.09, baseY - h); ctx.quadraticCurveTo(x + w * 0.25, baseY - h * 0.6, x + w, baseY); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - w * 0.26, baseY - h * 0.62);
  for (let i = 0; i <= 8; i++) ctx.lineTo(x - w * 0.26 + (i / 8) * w * 0.52, baseY - h * 0.62 + (i % 2 ? 26 : -4));
  ctx.lineTo(x + w * 0.09, baseY - h); ctx.lineTo(x - w * 0.09, baseY - h); ctx.closePath(); ctx.fillStyle = snowCol; ctx.fill();
}

function roofShape(ctx, x0, x1, y, h, overhang, col, line, lw) {
  ctx.beginPath();
  ctx.moveTo(x0 - overhang, y + 6);
  ctx.quadraticCurveTo(x0 - overhang * 0.4, y - h * 0.15, x0 + (x1 - x0) * 0.12, y - h);
  ctx.lineTo(x1 - (x1 - x0) * 0.12, y - h);
  ctx.quadraticCurveTo(x1 + overhang * 0.4, y - h * 0.15, x1 + overhang, y + 6);
  ctx.quadraticCurveTo((x0 + x1) / 2, y - h * 0.05, x0 - overhang, y + 6);
  ctx.closePath();
  fillStroke(ctx, col, line, lw);
}

function house(ctx, x, baseY, w, h, p, r, opts = {}) {
  const lc = shade(p.wood, -0.4), lw = 3;
  const wall = opts.wall || p.wall;
  ctx.fillStyle = wall; ctx.fillRect(x, baseY - h, w, h); ctx.strokeStyle = lc; ctx.lineWidth = lw; ctx.strokeRect(x, baseY - h, w, h);
  // lower wooden panel
  ctx.fillStyle = p.wood; ctx.fillRect(x, baseY - h * 0.32, w, h * 0.32);
  for (let i = 0; i < w; i += 14) line(ctx, [[x + i, baseY - h * 0.32], [x + i, baseY]], shade(p.wood, -0.25), 2);
  // posts + beam
  for (const px of [x, x + w * 0.5, x + w]) { ctx.fillStyle = shade(p.wood, -0.1); ctx.fillRect(px - 7, baseY - h, 14, h); }
  ctx.fillStyle = shade(p.wood, -0.1); ctx.fillRect(x, baseY - h * 0.68, w, 12);
  // door with noren or lattice window
  const dx = x + w * 0.12, dw = w * 0.32;
  if (opts.noren !== false && r() < 0.65) {
    ctx.fillStyle = shade(p.wood, -0.5); ctx.fillRect(dx, baseY - h * 0.62, dw, h * 0.62);
    const nc = opts.norenColor || r.pick(['#2a3a7a', '#7a2a3a', '#2a5a4a', '#5a3a7a']);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = shade(nc, (i % 2) * 0.06 - (1 - p.light) * 0.4); ctx.fillRect(dx + i * dw / 3 + 2, baseY - h * 0.64, dw / 3 - 4, h * 0.3); }
    if (opts.norenMark) { ctx.font = `${h * 0.14}px ${FONTS.brush}`; ctx.fillStyle = rgba('#ffffff', 0.85); ctx.textAlign = 'center'; ctx.fillText(opts.norenMark, dx + dw / 2, baseY - h * 0.42); }
  } else {
    ctx.fillStyle = mix('#f6ecd0', p.wall, 0.3); ctx.fillRect(dx, baseY - h * 0.6, dw, h * 0.26);
    for (let i = 0; i < dw; i += 10) line(ctx, [[dx + i, baseY - h * 0.6], [dx + i, baseY - h * 0.34]], p.wood, 3);
  }
  // window glow at night
  const wx = x + w * 0.58, ww = w * 0.3;
  ctx.fillStyle = p.glow ? rgba('#ffcf7a', 0.85) : mix('#f6ecd0', p.wall, 0.4); ctx.fillRect(wx, baseY - h * 0.6, ww, h * 0.22);
  for (let i = 0; i < ww; i += 9) line(ctx, [[wx + i, baseY - h * 0.6], [wx + i, baseY - h * 0.38]], p.wood, 2.5);
  // roof
  roofShape(ctx, x, x + w, baseY - h, h * 0.42, 34, p.roof, lc, lw);
  for (let i = 1; i < 4; i++) line(ctx, [[x - 20 + i * 4, baseY - h - h * 0.42 * (i / 4) + 4], [x + w + 20 - i * 4, baseY - h - h * 0.42 * (i / 4) + 4]], shade(p.roof, 0.12), 2);
  if (opts.second) {
    const w2 = w * 0.7, x2 = x + (w - w2) / 2, h2 = h * 0.5, y2 = baseY - h - h * 0.3;
    ctx.fillStyle = wall; ctx.fillRect(x2, y2 - h2, w2, h2); ctx.strokeRect(x2, y2 - h2, w2, h2);
    ctx.fillStyle = p.glow ? rgba('#ffcf7a', 0.8) : shade(wall, -0.1); ctx.fillRect(x2 + w2 * 0.2, y2 - h2 * 0.75, w2 * 0.6, h2 * 0.45);
    for (let i = 0; i < w2 * 0.6; i += 10) line(ctx, [[x2 + w2 * 0.2 + i, y2 - h2 * 0.75], [x2 + w2 * 0.2 + i, y2 - h2 * 0.3]], p.wood, 2.5);
    roofShape(ctx, x2, x2 + w2, y2 - h2, h2 * 0.6, 30, p.roof, lc, lw);
  }
  // lanterns
  if (opts.lantern !== false && r() < 0.7) {
    const lx = x + w * (r() < 0.5 ? 0.1 : 0.9), ly = baseY - h - 5;
    line(ctx, [[lx, ly], [lx, ly + 30]], lc, 2);
    if (p.glow) { const g = ctx.createRadialGradient(lx, ly + 62, 5, lx, ly + 62, 120); g.addColorStop(0, rgba('#ffb050', 0.55)); g.addColorStop(1, rgba('#ffb050', 0)); ctx.fillStyle = g; ctx.fillRect(lx - 120, ly - 60, 240, 240); }
    ellipse(ctx, lx, ly + 62, 24, 34, 0, p.glow ? '#ffb070' : p.lantern, lc, 2.5);
    ctx.fillStyle = '#1a1010'; ctx.fillRect(lx - 14, ly + 26, 28, 7); ctx.fillRect(lx - 14, ly + 92, 28, 7);
  }
}

function sakura(ctx, x, baseY, s, p, r, petalCol = '#f7b6c8') {
  const tr = shade('#5a3a2e', -(1 - p.light) * 0.6);
  ctx.beginPath(); ctx.moveTo(x - 22 * s, baseY); ctx.quadraticCurveTo(x - 8 * s, baseY - 160 * s, x - 30 * s, baseY - 300 * s); ctx.lineTo(x + 6 * s, baseY - 310 * s); ctx.quadraticCurveTo(x + 14 * s, baseY - 150 * s, x + 26 * s, baseY); ctx.closePath();
  fillStroke(ctx, tr, shade(tr, -0.4), 3);
  taper(ctx, [[x - 10 * s, baseY - 240 * s], [x - 90 * s, baseY - 330 * s], [x - 170 * s, baseY - 350 * s]], 16 * s, 5 * s, tr);
  taper(ctx, [[x, baseY - 260 * s], [x + 100 * s, baseY - 340 * s], [x + 180 * s, baseY - 345 * s]], 16 * s, 5 * s, tr);
  const pc = shade(petalCol, -(1 - p.light) * 0.7);
  for (let i = 0; i < 46; i++) {
    const a = r() * TAU, d = Math.sqrt(r()) * 230 * s;
    const cx = x + Math.cos(a) * d * 1.25, cy = baseY - 360 * s + Math.sin(a) * d * 0.55;
    circle(ctx, cx, cy, (34 + r() * 30) * s, shade(pc, r.range(-0.12, 0.08)));
  }
  for (let i = 0; i < 22; i++) { const a = r() * TAU, d = Math.sqrt(r()) * 200 * s; circle(ctx, x + Math.cos(a) * d * 1.2, baseY - 390 * s + Math.sin(a) * d * 0.45, (14 + r() * 14) * s, rgba('#ffffff', 0.35 * p.light)); }
}

function groundStrip(ctx, y, p, r, kind = 'dirt') {
  const g = ctx.createLinearGradient(0, y, 0, BG_Y1);
  g.addColorStop(0, p.groundD); g.addColorStop(0.25, p.ground); g.addColorStop(1, shade(p.ground, -0.1));
  ctx.fillStyle = g; ctx.fillRect(BG_X0, y, BG_X1 - BG_X0, BG_Y1 - y);
  if (kind === 'dirt') for (let i = 0; i < 260; i++) { const x = r.range(BG_X0, BG_X1), yy = r.range(y + 10, BG_Y1); ellipse(ctx, x, yy, r.range(3, 14) * (0.6 + (yy - y) / 600), r.range(1, 3), 0, rgba(shade(p.ground, -0.3), 0.35)); }
  if (kind === 'stone') {
    for (let row = 0; row < 12; row++) { const yy = y + Math.pow(row, 1.5) * 18; line(ctx, [[BG_X0, yy], [BG_X1, yy]], rgba(shade(p.ground, -0.35), 0.6), 2); for (let x = BG_X0 + (row % 2) * 60; x < BG_X1; x += 120 + row * 10) line(ctx, [[x, yy], [x, y + Math.pow(row + 1, 1.5) * 18]], rgba(shade(p.ground, -0.35), 0.5), 2); }
  }
  if (kind === 'grass') for (let i = 0; i < 900; i++) { const x = r.range(BG_X0, BG_X1), yy = r.range(y, BG_Y1); const h = 10 + (yy - y) * 0.05; line(ctx, [[x, yy], [x + r.range(-6, 6), yy - h]], rgba(shade(p.ground, r.range(-0.35, 0.15)), 0.8), 2.2); }
}

// ------------------------------------------------------------------ painters
const PAINTERS = {
  village(L, v) {
    const p = PAL[v] || PAL.day;
    L(0, (ctx, r) => sky(ctx, p, r, { stars: v === 'night', moon: v === 'night' ? [1500, 160] : null, clouds: v !== 'night', cloudColor: v === 'sunset' ? rgba('#ffd0b0', 0.8) : undefined, cloudShade: v === 'sunset' ? rgba('#c07090', 0.7) : undefined, sun: v === 'sunset' ? [500, 520] : null }));
    L(0.12, (ctx, r) => { fuji(ctx, 1250, 760, 820, 520, p.far, v === 'night' ? '#8a90b0' : '#f4f8ff'); mountains(ctx, 760, shade(p.far, -0.08), r, 220); });
    L(0.4, (ctx, r) => {
      mountains(ctx, 820, p.mid, r, 120, false, 3);
      for (let x = BG_X0; x < BG_X1; x += r.range(140, 220)) { const h = r.range(70, 130); roofShape(ctx, x, x + 150, 780 - h * 0.2, 40, 20, shade(p.roof, 0.05), shade(p.roof, -0.3), 2); ctx.fillStyle = shade(p.wall, -0.25); ctx.fillRect(x, 780 - h * 0.2 + 4, 150, 60); }
      // academy pagoda on the hill
      const px = 1700, py = 640; for (let i = 0; i < 4; i++) { const w = 150 - i * 26; ctx.fillStyle = shade(p.wall, -0.2); ctx.fillRect(px - w * 0.35, py - i * 70 - 46, w * 0.7, 46); roofShape(ctx, px - w * 0.5, px + w * 0.5, py - i * 70 - 46, 28, 18, p.roof, shade(p.roof, -0.4), 2); }
      line(ctx, [[px, py - 330], [px, py - 280]], shade(p.roof, -0.3), 5);
    });
    L(1, (ctx, r) => {
      groundStrip(ctx, 770, p, r, 'dirt');
      let x = BG_X0 - 50;
      const marks = ['団子', '魚', '茶', '書', '米', '酒', '薬'];
      let k = 0;
      while (x < BG_X1) {
        const w = r.range(330, 470), h = r.range(250, 320);
        if (r() < 0.2) { sakura(ctx, x + 120, 790, 1.1, p, r); x += 260; continue; }
        house(ctx, x, 790, w, h, p, r, { second: r() < 0.5, norenMark: marks[k++ % marks.length] });
        x += w + r.range(40, 90);
      }
      // street edge stones
      for (let xx = BG_X0; xx < BG_X1; xx += 46) ellipse(ctx, xx, 800, 22, 9, 0, shade(p.groundD, -0.15), shade(p.groundD, -0.4), 2);
      // barrels / buckets
      for (let i = 0; i < 6; i++) { const bx = r.range(BG_X0, BG_X1); ctx.fillStyle = shade(p.wood, 0.2); ctx.fillRect(bx, 750, 40, 50); ctx.strokeStyle = shade(p.wood, -0.4); ctx.lineWidth = 3; ctx.strokeRect(bx, 750, 40, 50); line(ctx, [[bx, 762], [bx + 40, 762]], '#2a2a2a', 3); line(ctx, [[bx, 788], [bx + 40, 788]], '#2a2a2a', 3); }
    });
  },
  academy(L, v) {
    const p = PAL[v] || PAL.day;
    L(0, (ctx, r) => sky(ctx, p, r, { cloudN: 7 }));
    L(0.15, (ctx, r) => { mountains(ctx, 700, p.far, r, 260); mountains(ctx, 760, shade(p.far, -0.12), r, 140); });
    L(0.55, (ctx, r) => {
      // main hall
      const cx = 960, base = 760;
      ctx.fillStyle = '#9a9a9a'; ctx.fillRect(cx - 820, base - 40, 1640, 60);
      ctx.fillStyle = '#f2ead8'; ctx.fillRect(cx - 700, base - 330, 1400, 300);
      for (let i = 0; i <= 10; i++) { ctx.fillStyle = '#b8322e'; ctx.fillRect(cx - 700 + i * 140 - 12, base - 330, 24, 300); }
      ctx.fillStyle = '#3a2a24'; ctx.fillRect(cx - 700, base - 330, 1400, 26);
      for (let i = 0; i < 10; i++) { ctx.fillStyle = rgba('#5a3a2a', 0.85); ctx.fillRect(cx - 680 + i * 140 + 20, base - 260, 90, 200); for (let j = 0; j < 90; j += 15) line(ctx, [[cx - 660 + i * 140 + j, base - 260], [cx - 660 + i * 140 + j, base - 60]], '#c9a87a', 2); }
      roofShape(ctx, cx - 760, cx + 760, base - 330, 150, 90, '#2e3a4e', '#141a24', 4);
      ctx.fillStyle = '#f2ead8'; ctx.fillRect(cx - 420, base - 560, 840, 90);
      roofShape(ctx, cx - 480, cx + 480, base - 560, 130, 80, '#2e3a4e', '#141a24', 4);
      // name board
      ctx.fillStyle = '#2a1a14'; ctx.fillRect(cx - 150, base - 440, 300, 90); ctx.strokeStyle = '#c9a64a'; ctx.lineWidth = 6; ctx.strokeRect(cx - 150, base - 440, 300, 90);
      ctx.font = `64px ${FONTS.brush}`; ctx.fillStyle = '#e8c86a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('筆山学院', cx, base - 393); ctx.textBaseline = 'alphabetic';
      // banners
      for (const bx of [cx - 900, cx + 900]) { line(ctx, [[bx, base + 30], [bx, base - 520]], '#3a2a1a', 10); ctx.fillStyle = '#f4f0e4'; ctx.fillRect(bx + 6, base - 510, 110, 380); ctx.strokeStyle = '#2a1a14'; ctx.lineWidth = 3; ctx.strokeRect(bx + 6, base - 510, 110, 380); ctx.font = `100px ${FONTS.brush}`; ctx.fillStyle = '#16121c'; ctx.fillText('筆', bx + 61, base - 380); ctx.fillStyle = '#b8322e'; ctx.fillText('心', bx + 61, base - 220); }
    });
    L(0.8, (ctx, r) => {
      // spectators (silhouettes)
      for (let i = 0; i < 70; i++) {
        const x = BG_X0 + 100 + i * 50 + r.range(-10, 10); if (x > 520 && x < 1400) continue;
        const y = 800 + r.range(-6, 6), s = r.range(0.85, 1.1);
        const c = shade(r.pick(['#5a4a6a', '#4a5a6a', '#6a4a4a', '#4a6a5a', '#6a5a3a']), -0.25);
        circle(ctx, x, y - 120 * s, 22 * s, c); ctx.beginPath(); ctx.moveTo(x - 32 * s, y); ctx.quadraticCurveTo(x - 30 * s, y - 95 * s, x, y - 98 * s); ctx.quadraticCurveTo(x + 30 * s, y - 95 * s, x + 32 * s, y); ctx.closePath(); ctx.fillStyle = c; ctx.fill();
      }
    });
    L(1, (ctx, r) => {
      groundStrip(ctx, 800, { ...p, ground: '#cfcac0', groundD: '#a9a397' }, r, 'stone');
      // giant exam paper on the floor
      ctx.beginPath(); ctx.moveTo(620, 860); ctx.lineTo(1300, 860); ctx.lineTo(1420, 990); ctx.lineTo(500, 990); ctx.closePath(); fillStroke(ctx, '#2a1a1a', '#140c0c', 3);
      ctx.beginPath(); ctx.moveTo(650, 868); ctx.lineTo(1270, 868); ctx.lineTo(1380, 980); ctx.lineTo(540, 980); ctx.closePath(); fillStroke(ctx, '#fbf8f0', '#c8c0b0', 2);
      // judges table
      ctx.fillStyle = '#5a3a2a'; ctx.fillRect(BG_X0 + 200, 800, 420, 70); ctx.fillStyle = '#b8322e'; ctx.fillRect(BG_X0 + 200, 800, 420, 18);
    });
  },
  riverbank(L, v) {
    const p = PAL.sunset;
    L(0, (ctx, r) => sky(ctx, p, r, { sun: [700, 600], cloudColor: rgba('#ffc8a8', 0.75), cloudShade: rgba('#b0607a', 0.6), cloudN: 8 }));
    L(0.12, (ctx, r) => { mountains(ctx, 700, '#6a3a6a', r, 200); });
    L(0.35, (ctx, r) => {
      // river
      const g = ctx.createLinearGradient(0, 700, 0, 900); g.addColorStop(0, '#e98a7a'); g.addColorStop(1, '#6a3a6a');
      ctx.fillStyle = g; ctx.fillRect(BG_X0, 700, BG_X1 - BG_X0, 300);
      for (let i = 0; i < 160; i++) { const y = r.range(705, 900), x = r.range(BG_X0, BG_X1); line(ctx, [[x, y], [x + r.range(20, 90), y]], rgba(Math.abs(x - 700) < 260 ? '#fff0c0' : '#ffb0a0', r.range(0.25, 0.7)), 2); }
      // taiko bridge
      const bx = 1350, by = 720;
      ctx.beginPath(); ctx.moveTo(bx - 420, by); ctx.quadraticCurveTo(bx, by - 230, bx + 420, by); ctx.lineTo(bx + 420, by + 18); ctx.quadraticCurveTo(bx, by - 205, bx - 420, by + 18); ctx.closePath(); fillStroke(ctx, '#c8323a', '#4a1018', 3);
      for (let i = 0; i <= 14; i++) { const t = i / 14, x = bx - 420 + 840 * t, y = by - 230 * 2 * t * (1 - t) * 1.0 + 2; line(ctx, [[x, y], [x, y - 50]], '#c8323a', 6); }
      ctx.beginPath(); for (let i = 0; i <= 30; i++) { const t = i / 30; ctx.lineTo(bx - 420 + 840 * t, by - 230 * 2 * t * (1 - t) - 50); } ctx.strokeStyle = '#c8323a'; ctx.lineWidth = 8; ctx.stroke();
      for (const px of [bx - 300, bx + 300]) { ctx.fillStyle = '#5a2a2a'; ctx.fillRect(px - 10, by - 60, 20, 200); }
      ctx.save(); ctx.globalAlpha = 0.25; ctx.translate(0, by * 2 + 40); ctx.scale(1, -0.5); ctx.beginPath(); ctx.moveTo(bx - 420, by); ctx.quadraticCurveTo(bx, by - 230, bx + 420, by); ctx.lineWidth = 16; ctx.strokeStyle = '#c8323a'; ctx.stroke(); ctx.restore();
    });
    L(1, (ctx, r) => {
      const gp = { ...p, ground: '#7a8a4a', groundD: '#5a6a3a' };
      ctx.beginPath(); ctx.moveTo(BG_X0, 860); for (let x = BG_X0; x <= BG_X1; x += 40) ctx.lineTo(x, 830 + noise1(x / 300, 4) * 25); ctx.lineTo(BG_X1, BG_Y1); ctx.lineTo(BG_X0, BG_Y1); ctx.closePath();
      ctx.save(); ctx.clip(); groundStrip(ctx, 810, gp, r, 'grass'); ctx.restore();
      for (let i = 0; i < 40; i++) { const x = r.range(BG_X0, BG_X1); const h = r.range(80, 170); taper(ctx, [[x, 850], [x + r.range(-15, 15), 850 - h * 0.6], [x + r.range(-30, 30), 850 - h]], 6, 1, rgba('#3a4a2a', 0.9)); ellipse(ctx, x + 2, 850 - h, 5, 18, 0, '#8a6a3a'); }
    });
  },
  room(L, v) {
    L(0.94, (ctx, r) => {
      ctx.fillStyle = '#e8d8b8'; ctx.fillRect(BG_X0, BG_Y0, BG_X1 - BG_X0, BG_Y1 - BG_Y0);
      // shoji wall
      for (let x = BG_X0; x < BG_X1; x += 300) {
        ctx.fillStyle = '#f8f0dc'; ctx.fillRect(x + 10, 120, 280, 660); ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 12; ctx.strokeRect(x + 10, 120, 280, 660);
        for (let i = 1; i < 4; i++) line(ctx, [[x + 10 + i * 70, 120], [x + 10 + i * 70, 780]], '#8a6a4a', 4);
        for (let j = 1; j < 8; j++) line(ctx, [[x + 10, 120 + j * 82], [x + 290, 120 + j * 82]], '#8a6a4a', 4);
      }
      ctx.fillStyle = '#5a3a22'; ctx.fillRect(BG_X0, 60, BG_X1 - BG_X0, 60); ctx.fillRect(BG_X0, 780, BG_X1 - BG_X0, 30);
      // tokonoma with scroll
      ctx.fillStyle = '#d8c8a0'; ctx.fillRect(1280, 140, 420, 640); ctx.strokeStyle = '#4a2a1a'; ctx.lineWidth = 14; ctx.strokeRect(1280, 140, 420, 640);
      ctx.fillStyle = '#f6efe0'; ctx.fillRect(1420, 180, 140, 440); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(1410, 172, 160, 14); ctx.fillRect(1410, 616, 160, 14);
      ctx.font = `130px ${FONTS.brush}`; ctx.fillStyle = '#1a1414'; ctx.textAlign = 'center'; ctx.fillText('心', 1490, 420);
      ellipse(ctx, 1380, 740, 40, 14, 0, '#4a6a8a'); taper(ctx, [[1380, 735], [1375, 640], [1360, 590]], 6, 2, '#3a5a2a');
      // window light
      const g = ctx.createLinearGradient(0, 120, 300, 900); g.addColorStop(0, rgba('#fff4c8', 0.35)); g.addColorStop(1, rgba('#fff4c8', 0)); ctx.fillStyle = g; ctx.fillRect(BG_X0, 120, BG_X1 - BG_X0, 700);
    });
    L(1, (ctx, r) => {
      ctx.fillStyle = '#c8c080'; ctx.fillRect(BG_X0, 810, BG_X1 - BG_X0, BG_Y1 - 810);
      for (let x = BG_X0; x < BG_X1; x += 360) { ctx.strokeStyle = '#3a3a2a'; ctx.lineWidth = 8; ctx.strokeRect(x, 810, 360, 330); for (let i = 0; i < 360; i += 8) line(ctx, [[x + i, 814], [x + i, 1136]], rgba('#9a9450', 0.35), 2); }
      // low table with ink tools
      ctx.fillStyle = '#4a2a1a'; ctx.fillRect(700, 880, 560, 30); ctx.fillRect(730, 905, 24, 70); ctx.fillRect(1206, 905, 24, 70);
      ctx.fillStyle = '#fbf6ea'; ctx.fillRect(780, 868, 240, 14);
      ctx.fillStyle = '#1e1e26'; ctx.fillRect(1060, 862, 110, 20); ellipse(ctx, 1090, 866, 22, 5, 0, '#05050a');
    });
  },
  void(L, v) {
    L(0, (ctx, r) => {
      const g = ctx.createRadialGradient(960, 500, 100, 960, 500, 1500); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d8d6e4');
      ctx.fillStyle = g; ctx.fillRect(BG_X0, BG_Y0, BG_X1 - BG_X0, BG_Y1 - BG_Y0);
      for (let i = 0; i < 1500; i++) circle(ctx, r.range(BG_X0, BG_X1), r.range(BG_Y0, BG_Y1), r.range(0.5, 2), rgba('#a8a4bc', r.range(0.05, 0.2)));
      for (let i = 0; i < 26; i++) { ctx.save(); ctx.translate(r.range(BG_X0, BG_X1), r.range(-200, 900)); ctx.rotate(r.range(-0.6, 0.6)); const s = r.range(0.4, 1.1); ctx.fillStyle = rgba('#ffffff', 0.9); ctx.strokeStyle = rgba('#b8b4cc', 0.8); ctx.lineWidth = 2; ctx.fillRect(-60 * s, -80 * s, 120 * s, 160 * s); ctx.strokeRect(-60 * s, -80 * s, 120 * s, 160 * s); ctx.restore(); }
    });
    L(1, (ctx, r) => {
      if (v !== 'throne') { ctx.fillStyle = rgba('#c8c4d8', 0.5); ctx.fillRect(BG_X0, 950, BG_X1 - BG_X0, 400); return; }
      // throne of stacked blank paper
      ctx.fillStyle = rgba('#c8c4d8', 0.5); ctx.fillRect(BG_X0, 950, BG_X1 - BG_X0, 400);
      for (let i = 0; i < 18; i++) { ctx.fillStyle = i % 2 ? '#f6f6fa' : '#ebeaf2'; ctx.fillRect(760 - i * 2, 950 - i * 18, 400 + i * 4, 18); ctx.strokeStyle = '#b8b4cc'; ctx.lineWidth = 1.5; ctx.strokeRect(760 - i * 2, 950 - i * 18, 400 + i * 4, 18); }
      ctx.fillStyle = '#f6f6fa'; ctx.fillRect(1080, 300, 70, 330); ctx.strokeRect(1080, 300, 70, 330);
      ctx.fillRect(770, 300, 70, 330); ctx.strokeRect(770, 300, 70, 330);
    });
  },
  ink(L, v) {
    L(0, (ctx, r) => {
      const g = ctx.createRadialGradient(960, 540, 50, 960, 540, 1400); g.addColorStop(0, v === 'red' ? '#3a0a14' : '#1a1830'); g.addColorStop(1, '#030308');
      ctx.fillStyle = g; ctx.fillRect(BG_X0, BG_Y0, BG_X1 - BG_X0, BG_Y1 - BG_Y0);
      for (let i = 0; i < 60; i++) { const x = r.range(BG_X0, BG_X1), y = r.range(BG_Y0, BG_Y1), s = r.range(80, 300); const gg = ctx.createRadialGradient(x, y, 0, x, y, s); gg.addColorStop(0, rgba(v === 'red' ? '#6a1020' : '#2a2850', 0.35)); gg.addColorStop(1, rgba('#000000', 0)); ctx.fillStyle = gg; ctx.fillRect(x - s, y - s, s * 2, s * 2); }
    });
  },
  nightcity(L, v) {
    const p = PAL.night;
    L(0, (ctx, r) => { sky(ctx, { ...p, sky: ['#0a0614', '#2a1440', '#5a2a4a'] }, r, { stars: false, clouds: true, cloudColor: rgba('#2a1a3a', 0.9), cloudShade: rgba('#140a20', 0.9), cloudN: 14 }); });
    L(0.3, (ctx, r) => {
      for (let x = BG_X0; x < BG_X1; x += r.range(90, 180)) { const h = r.range(120, 340), w = r.range(90, 170); ctx.fillStyle = '#0c0a16'; ctx.fillRect(x, 820 - h, w, h + 200); roofShape(ctx, x, x + w, 820 - h, 40, 20, '#0c0a16', null, 0); for (let i = 0; i < 4; i++) if (r() < 0.5) { ctx.fillStyle = rgba('#ff9a4a', r.range(0.4, 0.9)); ctx.fillRect(x + 15 + i * 20, 840 - h + r.range(20, 80), 10, 14); } }
      // pagoda
      const px = 960; for (let i = 0; i < 5; i++) { const w = 220 - i * 34; ctx.fillStyle = '#0c0a16'; ctx.fillRect(px - w * 0.35, 760 - i * 90 - 60, w * 0.7, 62); roofShape(ctx, px - w * 0.55, px + w * 0.55, 760 - i * 90 - 60, 34, 24, '#0c0a16', null, 0); }
    });
    L(1, (ctx, r) => { ctx.fillStyle = '#08060e'; ctx.fillRect(BG_X0, 900, BG_X1 - BG_X0, 600); for (let x = BG_X0; x < BG_X1; x += 120) roofShape(ctx, x, x + 110, 930, 50, 20, '#120e1c', '#05040a', 2); });
  },
  hill(L, v) {
    const p = v === 'dawn' ? { ...PAL.sunset, sky: ['#2a3a7a', '#e0909a', '#ffd8a0'] } : PAL.day;
    L(0, (ctx, r) => sky(ctx, p, r, { sun: v === 'dawn' ? [1500, 760] : null, cloudColor: v === 'dawn' ? rgba('#ffd8c0', 0.8) : undefined, cloudShade: v === 'dawn' ? rgba('#a07090', 0.6) : undefined }));
    L(0.15, (ctx, r) => { fuji(ctx, 600, 820, 700, 420, v === 'dawn' ? '#6a5a8a' : '#8fb0cc', '#f4f0ff'); mountains(ctx, 820, v === 'dawn' ? '#5a4a7a' : '#7f9fbc', r, 160); });
    L(0.4, (ctx, r) => { mountains(ctx, 880, v === 'dawn' ? '#4a3a5a' : '#5f7f6a', r, 60, false, 2); for (let i = 0; i < 40; i++) { const x = r.range(BG_X0 + 400, BG_X1 - 400), y = r.range(850, 900); roofShape(ctx, x, x + 40, y, 14, 6, v === 'dawn' ? '#3a2a4a' : '#4a5a6a', null, 0); ctx.fillStyle = v === 'dawn' ? '#5a4a5a' : '#c8b898'; ctx.fillRect(x, y, 40, 14); } });
    L(1, (ctx, r) => {
      const gp = { ...p, ground: v === 'dawn' ? '#5a6a3a' : '#7aa04a', groundD: v === 'dawn' ? '#3a4a2a' : '#5a8a3a' };
      ctx.beginPath(); ctx.moveTo(BG_X0, 900); ctx.quadraticCurveTo(960, 760, BG_X1, 920); ctx.lineTo(BG_X1, BG_Y1); ctx.lineTo(BG_X0, BG_Y1); ctx.closePath(); ctx.save(); ctx.clip(); groundStrip(ctx, 760, gp, r, 'grass'); ctx.restore();
      sakura(ctx, 300, 900, 1.4, { light: v === 'dawn' ? 0.75 : 1 }, r);
    });
  },
  paper(L, v) {
    L(0, (ctx, r) => {
      ctx.fillStyle = '#2a1416'; ctx.fillRect(BG_X0, BG_Y0, BG_X1 - BG_X0, BG_Y1 - BG_Y0);
      ctx.fillStyle = '#fbf7ec'; ctx.fillRect(160, -60, 1600, 1200);
      for (let i = 0; i < 2500; i++) circle(ctx, r.range(160, 1760), r.range(-60, 1140), r.range(0.4, 1.4), rgba('#c8b898', r.range(0.05, 0.25)));
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(160, -60, 1600, 40);
      for (const x of [260, 1660]) { ctx.fillStyle = '#3a3a44'; ctx.fillRect(x - 60, -60, 120, 70); }
    });
  },
  plain(L, v) {
    L(0, (ctx) => { ctx.fillStyle = v || '#101018'; ctx.fillRect(BG_X0, BG_Y0, BG_X1 - BG_X0, BG_Y1 - BG_Y0); });
  },
};

// ------------------------------------------------------------------ cache + draw
const cache = new Map();
const ORDER = [];
export function getBG(name, variant = '') {
  const key = name + ':' + variant;
  if (cache.has(key)) return cache.get(key);
  const layers = [];
  const L = (p, paint) => layers.push({ p, paint });
  (PAINTERS[name] || PAINTERS.plain)(L, variant);
  const built = layers.map((ly, i) => {
    const res = ly.p < 0.3 ? 0.5 : 0.8;
    const cw = Math.ceil((BG_X1 - BG_X0) * res), ch = Math.ceil((BG_Y1 - BG_Y0) * res);
    const c = env.createCanvas(cw, ch);
    const ctx = c.getContext('2d');
    ctx.scale(res, res); ctx.translate(-BG_X0, -BG_Y0);
    ly.paint(ctx, rng(key + i));
    return { canvas: c, p: ly.p, res };
  });
  cache.set(key, built); ORDER.push(key);
  while (ORDER.length > 3) cache.delete(ORDER.shift());
  return built;
}

// draw layers given camera {x, y, z, r}; `base` = output transform scale
export function drawBG(ctx, name, variant, cam, base) {
  const layers = getBG(name, variant);
  for (const ly of layers) {
    const p = ly.p;
    const ex = 960 + (cam.x - 960) * p, ey = 540 + (cam.y - 540) * p, ez = 1 + (cam.z - 1) * p;
    ctx.setTransform(base, 0, 0, base, 0, 0);
    ctx.translate(W / 2 + (cam.sx || 0), H / 2 + (cam.sy || 0));
    if (cam.r) ctx.rotate(cam.r * p);
    ctx.scale(ez, ez);
    ctx.translate(-ex, -ey);
    // blit only the visible part of the (large) cached layer
    const m = cam.r ? 1.3 : 1.02;
    const hw = ((W / 2 + Math.abs(cam.sx || 0)) / ez) * m, hh = ((H / 2 + Math.abs(cam.sy || 0)) / ez) * m;
    const wx0 = Math.max(BG_X0, ex - hw), wx1 = Math.min(BG_X1, ex + hw), wy0 = Math.max(BG_Y0, ey - hh), wy1 = Math.min(BG_Y1, ey + hh);
    if (wx1 <= wx0 || wy1 <= wy0) continue;
    const r = ly.res;
    ctx.drawImage(ly.canvas, (wx0 - BG_X0) * r, (wy0 - BG_Y0) * r, (wx1 - wx0) * r, (wy1 - wy0) * r, wx0, wy0, wx1 - wx0, wy1 - wy0);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
