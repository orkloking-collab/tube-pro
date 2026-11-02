// Visual effects. World-space effects are drawn with the camera transform; screen-space ones in 1920x1080 frame space.
import { env, W, H, GROUND, FONTS } from './env.js';
import { spline, fillStroke, line, ellipse, circle, poly, taper, capsule } from './draw.js';
import { rng, hash, hash2, shade, rgba, lerp, clamp, TAU, noise1, ease, smoothstep, onTwos } from './util.js';

// ---------- kanji stroke writing (stroke order data: Make Me a Hanzi / hanzi-writer-data) ----------
const pathCache = new Map();
function kanjiData(ch) {
  let d = pathCache.get(ch);
  if (d) return d;
  const raw = env.kanji[ch];
  if (!raw) return null;
  d = {
    paths: raw.strokes.map((s) => new env.Path2D(s)),
    medians: raw.medians.map((m) => { let len = 0; const segs = []; for (let i = 1; i < m.length; i++) { const l = Math.hypot(m[i][0] - m[i - 1][0], m[i][1] - m[i - 1][1]); segs.push(l); len += l; } return { pts: m, segs, len: len || 1 }; }),
  };
  pathCache.set(ch, d);
  return d;
}

// progress 0..1 across all strokes; returns position of the writing tip in glyph space
export function drawKanji(ctx, ch, x, y, size, progress, color, opts = {}) {
  const d = kanjiData(ch);
  if (!d) {
    ctx.save(); ctx.font = `${size}px ${FONTS.brush}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= clamp(progress * 1.5);
    if (opts.glow) { ctx.shadowColor = opts.glow; ctx.shadowBlur = size * 0.15; }
    ctx.fillStyle = color; ctx.fillText(ch, x, y); ctx.restore(); return null;
  }
  const n = d.paths.length;
  const total = d.medians.reduce((a, m) => a + m.len + 120, 0);
  let budget = progress * total;
  let tip = null;
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  const s = size / 1024;
  ctx.scale(s, s);
  ctx.translate(0, 900); ctx.scale(1, -1);
  const done = progress >= 1;
  if (done && opts.glow) { ctx.shadowColor = opts.glow; ctx.shadowBlur = (opts.glowSize || 0.12) * size / s * s * 1.0; }
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const m = d.medians[i];
    if (budget <= 0) break;
    const need = m.len + 120;
    if (budget >= need || done) { if (opts.outline) { ctx.save(); ctx.shadowBlur = 0; ctx.lineWidth = 46; ctx.lineJoin = 'round'; ctx.strokeStyle = opts.outline; ctx.stroke(d.paths[i]); ctx.restore(); } ctx.fill(d.paths[i]); budget -= need; continue; }
    // partial stroke
    const q = clamp(budget / m.len);
    budget = 0;
    ctx.save();
    ctx.clip(d.paths[i]);
    ctx.beginPath();
    let remain = q * m.len;
    ctx.moveTo(m.pts[0][0], m.pts[0][1]);
    let last = m.pts[0];
    for (let k = 1; k < m.pts.length && remain > 0; k++) {
      const l = m.segs[k - 1];
      if (remain >= l) { ctx.lineTo(m.pts[k][0], m.pts[k][1]); last = m.pts[k]; remain -= l; }
      else { const f = remain / l; last = [lerp(m.pts[k - 1][0], m.pts[k][0], f), lerp(m.pts[k - 1][1], m.pts[k][1], f)]; ctx.lineTo(last[0], last[1]); remain = 0; }
    }
    ctx.strokeStyle = color; ctx.lineWidth = 230; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
    tip = last;
  }
  ctx.restore();
  if (tip) return [x - size / 2 + tip[0] * s, y - size / 2 + (900 - tip[1]) * s];
  return null;
}

function sparkTip(ctx, p, r, col) {
  if (!p) return;
  const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
  g.addColorStop(0, rgba('#ffffff', 0.95)); g.addColorStop(0.3, rgba(col, 0.7)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fill();
}

function starBurst(ctx, x, y, r0, r1, n, col, seed, rotA = 0) {
  const r = rng(seed);
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rotA + (i / (n * 2)) * TAU; const rr = i % 2 ? r0 : r1 * r.range(0.6, 1.15); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}

function blob(ctx, x, y, r, seed, wob = 0.3, n = 9) {
  const R = rng(seed); const pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; const rr = r * (1 - wob / 2 + R() * wob); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  ctx.beginPath(); spline(ctx, pts, true);
}

export const FX = {
  // ---------------- world space ----------------
  kanji(ctx, e, k, lt) {
    const wr = e.write ?? 0.6;
    const prog = clamp(k / wr);
    const fade = e.fade === false || (e.fadeAt ?? 0.85) >= 1 ? 1 : 1 - smoothstep(e.fadeAt ?? 0.85, 1, k);
    const pulse = 1 + (k > wr ? Math.sin((k - wr) * 30) * 0.015 : 0);
    ctx.save(); ctx.globalAlpha = fade;
    const sz = e.size * pulse * (e.grow ? lerp(1, e.grow, ease.out(clamp((k - wr) / (1 - wr)))) : 1);
    if (e.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, sz * 0.9); g.addColorStop(0, rgba(e.glow, 0.35 * prog)); g.addColorStop(1, rgba(e.glow, 0)); ctx.fillStyle = g; ctx.fillRect(e.x - sz, e.y - sz, sz * 2, sz * 2); ctx.restore(); }
    const tip = drawKanji(ctx, e.ch, e.x, e.y, sz, prog, e.color || '#120e18', { glow: e.glow, outline: e.outline });
    if (tip && e.glow) sparkTip(ctx, tip, sz * 0.12, e.glow);
    ctx.restore();
  },
  impact(ctx, e, k) {
    const s = e.size || 160, col = e.color || '#ffffff';
    const r = rng(e.seed || 7);
    const kk = onTwos(k * (e.d || 0.4), 24) / (e.d || 0.4);
    ctx.save();
    ctx.globalAlpha = 1 - smoothstep(0.5, 1, kk);
    starBurst(ctx, e.x, e.y, s * 0.35 * (1 + kk), s * (0.8 + kk * 0.9), 12, col, (e.seed || 7) + Math.floor(kk * 4));
    starBurst(ctx, e.x, e.y, s * 0.2 * (1 + kk), s * (0.45 + kk * 0.5), 10, e.inner || '#fff6a0', (e.seed || 7) + 3);
    ctx.beginPath(); ctx.arc(e.x, e.y, s * (0.3 + kk * 1.6), 0, TAU); ctx.strokeStyle = rgba(col, 1 - kk); ctx.lineWidth = s * 0.08 * (1 - kk) + 2; ctx.stroke();
    for (let i = 0; i < 14; i++) { const a = r() * TAU, d0 = s * (0.4 + kk * r.range(1.2, 2.4)); line(ctx, [[e.x + Math.cos(a) * d0, e.y + Math.sin(a) * d0], [e.x + Math.cos(a) * (d0 + s * 0.3), e.y + Math.sin(a) * (d0 + s * 0.3)]], col, s * 0.03 * (1 - kk) + 1); }
    ctx.restore();
  },
  shockwave(ctx, e, k) {
    const s = e.size || 400;
    ctx.save(); ctx.globalAlpha = 1 - k;
    ctx.beginPath(); ctx.ellipse(e.x, e.y, s * ease.out(k), s * ease.out(k) * (e.flat || 1), 0, 0, TAU);
    ctx.strokeStyle = e.color || '#ffffff'; ctx.lineWidth = 30 * (1 - k) + 3; ctx.stroke();
    ctx.restore();
  },
  inkSplash(ctx, e, k) {
    const s = e.size || 120, r = rng(e.seed || 3);
    const g = ease.outExpo(clamp(k * 3));
    ctx.save(); ctx.globalAlpha = 1 - smoothstep(0.7, 1, k);
    ctx.fillStyle = e.color || '#0e0a16';
    blob(ctx, e.x, e.y, s * 0.5 * g, e.seed || 3, 0.5, 11); ctx.fill();
    for (let i = 0; i < 16; i++) { const a = r() * TAU, d = s * r.range(0.5, 1.4) * g; circle(ctx, e.x + Math.cos(a) * d, e.y + Math.sin(a) * d + k * k * 60, s * r.range(0.04, 0.14) * (1 - k * 0.5), e.color || '#0e0a16'); }
    ctx.restore();
  },
  slashArc(ctx, e, k) {
    const s = e.size || 300, a0 = (e.ang || 0) - 1.2, sweep = 2.4;
    const head = ease.out(clamp(k * 1.6)), tail = ease.in(clamp(k * 1.6 - 0.35));
    if (head <= tail) return;
    ctx.save();
    ctx.translate(e.x, e.y); if (e.flip) ctx.scale(-1, 1);
    ctx.beginPath();
    ctx.arc(0, 0, s, a0 + sweep * tail, a0 + sweep * head);
    ctx.arc(0, 0, s * 0.82, a0 + sweep * head, a0 + sweep * tail, true);
    ctx.closePath();
    ctx.fillStyle = e.color || '#e8fbff'; ctx.shadowColor = e.glow || '#6fe6ff'; ctx.shadowBlur = 30; ctx.fill();
    ctx.restore();
  },
  fire(ctx, e, k, lt) {
    const n = e.n || 40, r = rng(e.seed || 11);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const fade = (1 - smoothstep(0.8, 1, k)) * smoothstep(0, 0.1, k);
    for (let i = 0; i < n; i++) {
      const life = 0.6 + r() * 0.6, ph = ((lt + r() * 5) % life) / life;
      const x = e.x + (r() - 0.5) * e.w + Math.sin(lt * 6 + i) * 10, y = e.y - ph * e.h;
      const sz = (e.size || 40) * (1 - ph) * r.range(0.6, 1.3);
      const g = ctx.createRadialGradient(x, y, 0, x, y, sz);
      g.addColorStop(0, rgba('#fff2a0', 0.9 * fade)); g.addColorStop(0.4, rgba(e.color || '#ff7a20', 0.7 * fade)); g.addColorStop(1, rgba('#ff2a00', 0));
      ctx.fillStyle = g; ctx.fillRect(x - sz, y - sz, sz * 2, sz * 2);
    }
    ctx.restore();
  },
  water(ctx, e, k, lt) {
    const w = e.w || 600, h = e.h || 260;
    const g = ease.out(clamp(k * 2)), f = 1 - smoothstep(0.75, 1, k);
    ctx.save(); ctx.globalAlpha = f;
    ctx.beginPath(); ctx.moveTo(e.x - w / 2, e.y);
    for (let i = 0; i <= 24; i++) { const q = i / 24; ctx.lineTo(e.x - w / 2 + q * w, e.y - h * g * Math.sin(q * Math.PI) * (0.8 + 0.2 * Math.sin(q * 12 + lt * 8))); }
    ctx.closePath();
    const gr = ctx.createLinearGradient(0, e.y - h, 0, e.y); gr.addColorStop(0, '#bff4ff'); gr.addColorStop(1, '#1f6fd0');
    ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = '#e8fdff'; ctx.lineWidth = 6; ctx.stroke();
    for (let i = 0; i < 18; i++) { const r = rng(i + 50); const q = r(); circle(ctx, e.x - w / 2 + q * w, e.y - h * g * Math.sin(q * Math.PI) - r() * 60 * g, r.range(4, 12), rgba('#e8fdff', 0.9)); }
    ctx.restore();
  },
  windSwirl(ctx, e, k, lt) {
    const s = e.size || 300, f = Math.sin(k * Math.PI);
    ctx.save(); ctx.globalAlpha = f;
    for (let j = 0; j < 6; j++) {
      ctx.beginPath();
      for (let i = 0; i < 40; i++) { const a = i * 0.25 + lt * 8 + j; const rr = s * (0.2 + i / 50) * (1 + j * 0.1); ctx.lineTo(e.x + Math.cos(a) * rr, e.y + Math.sin(a) * rr * 0.45 - i * 3); }
      ctx.strokeStyle = rgba(j % 2 ? '#d8fff0' : '#9ff2d8', 0.8); ctx.lineWidth = 5 - j * 0.5; ctx.stroke();
    }
    ctx.restore();
  },
  erase(ctx, e, k, lt) {
    // white "blank page" erasure: square paper fragments eating the area
    const r = rng(e.seed || 5);
    const n = e.n || 120;
    const prog = e.reverse ? 1 - k : k;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const px = r(), py = r(), delay = r() * 0.6;
      const q = clamp((prog - delay) / 0.4);
      if (q <= 0) continue;
      const x = e.x + (px - 0.5) * e.w, y = e.y + (py - 0.5) * e.h;
      const s = (e.cell || 26) * (0.5 + q * 0.7) * r.range(0.7, 1.3);
      const drift = e.float ? q * q * 120 : 0;
      ctx.globalAlpha = e.float ? 1 - q * 0.8 : 1;
      ctx.save(); ctx.translate(x + drift * 0.3, y - drift); ctx.rotate(r() * 0.8 * (e.float ? q : 0.2));
      ctx.fillStyle = r() < 0.3 ? '#e8e6f0' : '#ffffff'; ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.strokeStyle = rgba('#a8a4bc', 0.6); ctx.lineWidth = 1.5; ctx.strokeRect(-s / 2, -s / 2, s, s);
      ctx.restore();
    }
    ctx.restore();
  },
  whiteBlot(ctx, e, k) {
    // solid erased patch (blank area left behind)
    ctx.save(); ctx.globalAlpha = e.alpha ?? 1;
    blob(ctx, e.x, e.y, (e.r || 120) * (e.grow ? ease.out(k) : 1), e.seed || 2, 0.35, 12);
    ctx.fillStyle = '#fbfaff'; ctx.fill(); ctx.strokeStyle = rgba('#b8b4cc', 0.9); ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  },
  glow(ctx, e, k, lt) {
    const r = (e.r || 200) * (1 + Math.sin(lt * (e.pulse || 6)) * 0.06);
    const a = (e.a ?? 0.8) * (e.fadeIn ? smoothstep(0, 0.3, k) : 1) * (e.fadeOut === false ? 1 : 1 - smoothstep(0.8, 1, k));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r); g.addColorStop(0, rgba(e.color || '#ffd070', a)); g.addColorStop(1, rgba(e.color || '#ffd070', 0));
    ctx.fillStyle = g; ctx.fillRect(e.x - r, e.y - r, r * 2, r * 2); ctx.restore();
  },
  dust(ctx, e, k) {
    const r = rng(e.seed || 9);
    ctx.save(); ctx.globalAlpha = (1 - k) * 0.8;
    for (let i = 0; i < 9; i++) { const dir = r() < 0.5 ? -1 : 1; circle(ctx, e.x + dir * k * r.range(40, 160), e.y - r.range(5, 40) - k * 30, r.range(18, 40) * (0.6 + k), e.color || '#d8c8a8'); }
    ctx.restore();
  },
  aura(ctx, e, k, lt, view) {
    // flame aura: closed silhouette around the whole body, pointed tongues on top, soft radial falloff
    const a = view.anchor(e.who);
    if (!a) return;
    const U = a.U, sz = e.size || 1;
    const top = a.head[1] - U * 0.75, bot = a.feet[1] + U * 0.05;
    const cx = (a.head[0] + a.feet[0] + a.chest[0]) / 3, cy = (top + bot) / 2, h = bot - top;
    const col = e.color || '#ffcf4a', col2 = e.color2 || '#ff3a3a';
    const f = (e.fadeIn ? smoothstep(0, 0.25, k) : 1) * (1 - smoothstep(0.85, 1, k)) * (e.alpha ?? 1);
    const t2 = onTwos(lt, 12);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = f;
    for (let j = 0; j < 3; j++) {
      const rx = U * (1.25 + j * 0.28) * sz, ry = h * (0.56 + j * 0.06) * sz;
      ctx.beginPath();
      const n = 40;
      for (let i = 0; i <= n; i++) {
        const ang = (i / n) * TAU, ex = Math.sin(ang), ey = -Math.cos(ang);
        let r = 1;
        if (ey < 0.3) { const up = (0.3 - ey) / 1.3; r += up * (i % 2 ? 0.08 : 0.32 + 0.4 * Math.abs(noise1(i * 1.7 + t2 * 7 + j * 4, j))); }
        ctx.lineTo(cx + ex * rx * (i % 2 && ey < 0.3 ? 0.9 : 1), cy + ey * ry * r);
      }
      ctx.closePath();
      const g = ctx.createRadialGradient(cx, cy + h * 0.15, U * 0.3, cx, cy, ry * 1.25);
      g.addColorStop(0, rgba(col, 0.0)); g.addColorStop(0.45, rgba(j === 1 ? col2 : col, 0.1)); g.addColorStop(0.8, rgba(j === 1 ? col2 : col, 0.26)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ctx.fill();
    }
    // rising flame streaks
    const r = rng(77);
    for (let i = 0; i < 14; i++) {
      const life = 0.5 + r() * 0.5, ph = ((t2 + r() * 3) % life) / life;
      const x = cx + (r() - 0.5) * U * 2.4 * sz, y = bot - ph * h * 1.1;
      const L = U * (0.4 + r() * 0.5) * (1 - ph);
      ctx.beginPath(); ctx.moveTo(x - U * 0.05, y); ctx.quadraticCurveTo(x + Math.sin(ph * 6 + i) * U * 0.1, y - L * 0.6, x, y - L); ctx.lineTo(x + U * 0.05, y); ctx.closePath();
      ctx.fillStyle = rgba(i % 3 ? col : col2, 0.5 * (1 - ph)); ctx.fill();
    }
    ctx.restore();
  },
  scribble(ctx, e, k, lt) {
    // Kakeru's unreadable "First Script": wild looping strokes revealed over time
    const r = rng(e.seed || 21), s = e.size || 300;
    const prog = clamp(k / (e.write ?? 0.5));
    const pts = [];
    let x = 0, y = 0, a = r() * TAU;
    for (let i = 0; i < 90; i++) { a += (r() - 0.5) * 1.6 + Math.sin(i * 0.4) * 0.5; x += Math.cos(a) * 0.09; y += Math.sin(a) * 0.09; x *= 0.93; y *= 0.93; pts.push([e.x + x * s, e.y + y * s]); }
    const nShow = Math.max(2, Math.floor(pts.length * prog));
    const shown = pts.slice(0, nShow);
    const f = (e.fadeAt ?? 0.9) >= 1 ? 1 : 1 - smoothstep(e.fadeAt ?? 0.9, 1, k);
    ctx.save(); ctx.globalAlpha = f;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); spline(ctx, shown, false); ctx.strokeStyle = e.color || '#ff3a4a'; ctx.lineWidth = s * 0.07; if (!e.plain) { ctx.shadowColor = e.glow || '#ffcf4a'; ctx.shadowBlur = 40; } ctx.stroke();
    ctx.shadowBlur = 0;
    if (!e.plain) {
      ctx.beginPath(); spline(ctx, shown, false); ctx.strokeStyle = '#fff4d0'; ctx.lineWidth = s * 0.022; ctx.stroke();
      if (prog < 1) sparkTip(ctx, shown[shown.length - 1], s * 0.15, e.glow || '#ffcf4a');
    }
    ctx.restore();
  },
  beast(ctx, e, k, lt) {
    // the Roaring Scribble: an ink beast of crimson-gold strokes charging along a path
    const q = ease.inOut3(clamp(k / (e.travel ?? 0.7)));
    const x = lerp(e.x0, e.x1, q), y = lerp(e.y0, e.y1, q) + Math.sin(lt * 10) * 8;
    const s = (e.size || 260) * (0.6 + 0.4 * smoothstep(0, 0.2, k));
    const f = 1 - smoothstep(0.88, 1, k);
    const t2 = onTwos(lt, 12);
    const dir = e.x1 >= e.x0 ? 1 : -1;
    ctx.save(); ctx.globalAlpha = f; ctx.translate(x, y); ctx.scale(dir, 1);
    // trailing streaks
    for (let i = 0; i < 16; i++) { const r = rng(i + 400); const yy = (r() - 0.5) * s * 1.2; line(ctx, [[-s * 0.5, yy], [-s * (1.4 + r() * 1.8), yy + (r() - 0.5) * 30]], rgba(i % 3 ? '#ff3a4a' : '#ffcf4a', 0.7), r.range(4, 14)); }
    // mane (jagged ink)
    ctx.beginPath();
    for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU; const rr = s * (i % 2 ? 0.55 : 0.85 + 0.2 * Math.abs(noise1(i * 3 + t2 * 8, 1))); ctx.lineTo(Math.cos(a) * rr - s * 0.1, Math.sin(a) * rr * 0.85); }
    ctx.closePath(); ctx.fillStyle = '#0c0812'; ctx.shadowColor = '#ff3a4a'; ctx.shadowBlur = 50; ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ff3a4a'; ctx.lineWidth = 6; ctx.stroke();
    // head + open jaws
    ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.35); ctx.quadraticCurveTo(s * 0.4, -s * 0.5, s * 0.75, -s * 0.12); ctx.lineTo(s * 0.35, -s * 0.02); ctx.lineTo(s * 0.7, s * 0.12); ctx.quadraticCurveTo(s * 0.3, s * 0.42, -s * 0.3, s * 0.3); ctx.closePath();
    ctx.fillStyle = '#16101e'; ctx.fill(); ctx.strokeStyle = '#ffcf4a'; ctx.lineWidth = 5; ctx.stroke();
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(s * (0.38 + i * 0.07), -s * (0.06 + i * 0.012)); ctx.lineTo(s * (0.41 + i * 0.07), s * 0.04); ctx.lineTo(s * (0.44 + i * 0.07), -s * (0.07 + i * 0.012)); ctx.fillStyle = '#fff4d0'; ctx.fill(); }
    // eye
    ctx.beginPath(); ctx.moveTo(s * 0.12, -s * 0.24); ctx.lineTo(s * 0.34, -s * 0.2); ctx.lineTo(s * 0.14, -s * 0.15); ctx.closePath(); ctx.fillStyle = '#ffe680'; ctx.shadowColor = '#ffcf4a'; ctx.shadowBlur = 30; ctx.fill(); ctx.shadowBlur = 0;
    // scribble strokes over the body
    for (let j = 0; j < 4; j++) { const r = rng(j * 31 + Math.floor(t2 * 12)); const pts = []; for (let i = 0; i < 7; i++) pts.push([(r() - 0.6) * s * 1.1, (r() - 0.5) * s]); ctx.beginPath(); spline(ctx, pts, false); ctx.strokeStyle = j % 2 ? '#ff3a4a' : '#ffcf4a'; ctx.lineWidth = 7; ctx.stroke(); }
    ctx.restore();
  },
  dragon(ctx, e, k, lt) {
    // Shiori's flawless 龍: an ink dragon gliding along a sine path
    const len = e.len || 900, s = e.size || 70;
    const head = lerp(e.x0, e.x1, ease.inOut(clamp(k / (e.travel ?? 0.85))));
    const f = smoothstep(0, 0.08, k) * (1 - smoothstep(0.9, 1, k));
    const dir = e.x1 >= e.x0 ? 1 : -1;
    const P = (u) => [head - dir * u * len, e.y + Math.sin(u * 7 - lt * 5) * (e.amp || 90) * (0.3 + u) - u * (e.rise || 0)];
    ctx.save(); ctx.globalAlpha = f;
    const pts = []; for (let i = 0; i <= 26; i++) pts.push(P(i / 26));
    ctx.shadowColor = e.glow || '#3fe0d0'; ctx.shadowBlur = 30;
    taper(ctx, pts, s * 1.1, s * 0.1, e.color || '#0e1420', s * 1.25);
    ctx.shadowBlur = 0;
    // spine fins
    for (let i = 2; i < 24; i += 2) { const a = pts[i], b = pts[i + 1]; const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); const w = s * 0.5 * (1 - i / 26); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + Math.cos(ang - 1.9) * w * 1.6, a[1] + Math.sin(ang - 1.9) * w * 1.6); ctx.lineTo(b[0], b[1]); ctx.fillStyle = e.glow || '#3fe0d0'; ctx.fill(); }
    // head
    const h0 = pts[0], h1 = pts[1];
    const ang = Math.atan2(h0[1] - h1[1], h0[0] - h1[0]);
    ctx.translate(h0[0], h0[1]); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(-s * 0.4, -s * 0.6); ctx.quadraticCurveTo(s * 0.8, -s * 0.7, s * 1.5, -s * 0.15); ctx.lineTo(s * 0.9, 0); ctx.lineTo(s * 1.4, s * 0.25); ctx.quadraticCurveTo(s * 0.6, s * 0.7, -s * 0.4, s * 0.55); ctx.closePath();
    ctx.fillStyle = e.color || '#0e1420'; ctx.fill(); ctx.strokeStyle = e.glow || '#3fe0d0'; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.5); ctx.quadraticCurveTo(-s * 0.9, -s * 1.3, -s * 1.5, -s * 1.1); ctx.strokeStyle = e.glow || '#3fe0d0'; ctx.lineWidth = 6; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 1.2, s * 0.2); ctx.quadraticCurveTo(s * 1.0 + Math.sin(lt * 6) * 10, s * 1.0, s * 0.3, s * 1.4); ctx.strokeStyle = rgba('#bff', 0.8); ctx.lineWidth = 3; ctx.stroke();
    ellipse(ctx, s * 0.55, -s * 0.28, s * 0.16, s * 0.08, 0.2, '#e8ffff');
    ctx.restore();
  },
  shield(ctx, e, k, lt) {
    const g = ease.outBack(clamp(k * 4)), f = 1 - smoothstep(0.85, 1, k);
    const w = (e.w || 260) * g, h = (e.h || 520) * g;
    const crack = e.crackAt != null && k > e.crackAt;
    ctx.save(); ctx.globalAlpha = f;
    ctx.fillStyle = rgba(e.color || '#6fe6ff', 0.22); ctx.strokeStyle = rgba(e.color || '#6fe6ff', 0.95); ctx.lineWidth = 6; ctx.shadowColor = e.color || '#6fe6ff'; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.rect(e.x - w / 2, e.y - h / 2, w, h); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
    if (g > 0.5) drawKanji(ctx, '盾', e.x, e.y, Math.min(w, h) * 0.8, 1, rgba('#e8fdff', 0.9));
    if (crack) { ctx.beginPath(); ctx.moveTo(e.x - w * 0.1, e.y - h / 2); ctx.lineTo(e.x + w * 0.1, e.y - h * 0.1); ctx.lineTo(e.x - w * 0.15, e.y + h * 0.15); ctx.lineTo(e.x + w * 0.05, e.y + h / 2); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.stroke(); }
    ctx.restore();
  },
  frog(ctx, e, k, lt) {
    // comedic flame-frog scribble hopping away
    const hops = e.hops || 4;
    const q = k * hops, i = Math.floor(q), f = q - i;
    const x = lerp(e.x0, e.x1, k), y = lerp(e.y0 ?? e.y, e.y1 ?? e.y, k) - Math.sin(f * Math.PI) * (e.hop || 80);
    const s = e.size || 50;
    ctx.save(); ctx.translate(x, y); if (e.x1 < e.x0) ctx.scale(-1, 1);
    ctx.beginPath(); ctx.moveTo(-s, 0); ctx.quadraticCurveTo(-s * 0.9, -s * 1.1, 0, -s * 0.9); ctx.quadraticCurveTo(s * 1.0, -s * 0.8, s, 0); ctx.closePath();
    ctx.fillStyle = '#1a1420'; ctx.fill(); ctx.strokeStyle = '#ff5a3a'; ctx.lineWidth = 3; ctx.stroke();
    circle(ctx, s * 0.3, -s * 0.85, s * 0.22, '#fff'); circle(ctx, s * 0.36, -s * 0.85, s * 0.1, '#111');
    circle(ctx, -s * 0.2, -s * 0.95, s * 0.2, '#fff'); circle(ctx, -s * 0.14, -s * 0.95, s * 0.09, '#111');
    for (let j = 0; j < 3; j++) FX.glow(ctx, { x: -s * 0.2 + j * s * 0.2, y: -s * 1.2 - Math.abs(Math.sin(lt * 12 + j)) * s * 0.4, r: s * 0.35, color: '#ff8a2a', a: 0.9, fadeOut: false }, 0.5, lt);
    ctx.restore();
  },
  blankWave(ctx, e, k, lt) {
    // the Blank spreading over the world (cold open)
    const r = (e.r || 1400) * ease.inOut(k);
    ctx.save();
    blob(ctx, e.x, e.y, r, 4, 0.18, 24);
    ctx.fillStyle = '#fbfaff'; ctx.fill();
    ctx.lineWidth = 10; ctx.strokeStyle = rgba('#c8c4dc', 0.9); ctx.stroke();
    FX.erase(ctx, { x: e.x, y: e.y, w: r * 2.2, h: r * 2.2, n: 80, seed: 9, cell: 40, float: true }, clamp(k * 1.3), lt);
    ctx.restore();
  },
  rays(ctx, e, k, lt) {
    const n = e.n || 16, len = e.len || 1600;
    const f = smoothstep(0, 0.2, k) * (1 - smoothstep(0.8, 1, k)) * (e.a ?? 0.5);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(e.x, e.y); ctx.rotate(lt * (e.spin ?? 0.15));
    for (let i = 0; i < n; i++) { ctx.rotate(TAU / n); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, -len * 0.06); ctx.lineTo(len, len * 0.06); ctx.closePath(); ctx.fillStyle = rgba(e.color || '#fff2b0', f * (i % 2 ? 0.5 : 1)); ctx.fill(); }
    ctx.restore();
  },
  sheets(ctx, e, k, lt) {
    const r = rng(e.seed || 77);
    for (let i = 0; i < (e.n || 18); i++) {
      const x = r.range(-200, 2100) + Math.sin(lt * 0.5 + i) * 40, y = ((r.range(-300, 1200) - lt * r.range(20, 60)) % 1500 + 1500) % 1500 - 200;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(lt * 0.8 + i) * 0.6); const s = r.range(0.5, 1.2);
      ctx.fillStyle = rgba('#ffffff', 0.95); ctx.fillRect(-50 * s, -65 * s, 100 * s, 130 * s); ctx.strokeStyle = rgba('#b0acc4', 0.8); ctx.lineWidth = 2; ctx.strokeRect(-50 * s, -65 * s, 100 * s, 130 * s);
      ctx.restore();
    }
  },
  lightning(ctx, e, k, lt) {
    if (k > 0.35 && k < 0.5) return;
    const r = rng((e.seed || 1) + Math.floor(k * 3));
    let x = e.x, y = e.y0 ?? -200;
    ctx.save(); ctx.strokeStyle = '#f4ecff'; ctx.lineWidth = 6; ctx.shadowColor = '#b090ff'; ctx.shadowBlur = 30; ctx.globalAlpha = 1 - k;
    ctx.beginPath(); ctx.moveTo(x, y);
    while (y < (e.y1 || 700)) { x += r.range(-60, 60); y += r.range(40, 90); ctx.lineTo(x, y); }
    ctx.stroke(); ctx.restore();
  },

  // ---------------- screen space (1920x1080) ----------------
  speedlines(ctx, e, k, lt) {
    const t2 = Math.floor(lt * 12);
    const r = rng((e.seed || 1) * 1000 + t2);
    const cx = e.cx ?? 960, cy = e.cy ?? 540;
    const inner = e.inner || 330;
    const f = (e.fade === false ? 1 : smoothstep(0, 0.1, k) * (1 - smoothstep(0.9, 1, k))) * (e.alpha ?? 1);
    ctx.save(); ctx.globalAlpha = f; ctx.fillStyle = e.color || '#ffffff';
    const n = e.n || 90;
    for (let i = 0; i < n; i++) {
      const a = r() * TAU, w = r.range(0.004, 0.018), ri = inner * r.range(0.9, 1.6);
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * ri, cy + Math.sin(a) * ri);
      ctx.lineTo(cx + Math.cos(a - w) * 2400, cy + Math.sin(a - w) * 2400); ctx.lineTo(cx + Math.cos(a + w) * 2400, cy + Math.sin(a + w) * 2400); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  },
  hlines(ctx, e, k, lt) {
    const t2 = Math.floor(lt * 12);
    const r = rng((e.seed || 2) * 1000 + t2);
    const f = (e.fade === false ? 1 : smoothstep(0, 0.1, k) * (1 - smoothstep(0.9, 1, k))) * (e.alpha ?? 0.8);
    ctx.save(); ctx.globalAlpha = f;
    for (let i = 0; i < (e.n || 60); i++) { const y = r() * H, x = r() * W, l = r.range(200, 900); ctx.fillStyle = e.color || '#ffffff'; ctx.fillRect(x - l / 2, y, l, r.range(2, 7)); }
    ctx.restore();
  },
  flash(ctx, e, k) {
    ctx.save(); ctx.globalAlpha = (e.a ?? 1) * (1 - ease.out(k)); ctx.fillStyle = e.color || '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  invert(ctx, e, k) {
    if (k > (e.until ?? 0.5)) return;
    ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  tint(ctx, e, k) {
    const f = e.fadeIn ? smoothstep(0, 0.3, k) : 1;
    ctx.save(); ctx.globalAlpha = (e.a ?? 0.3) * f; if (e.blend) ctx.globalCompositeOperation = e.blend; ctx.fillStyle = e.color || '#000000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  petals(ctx, e, k, lt) {
    const r = rng(e.seed || 33);
    ctx.save();
    for (let i = 0; i < (e.n || 40); i++) {
      const sp = r.range(60, 140), x0 = r.range(-200, W + 200), y0 = r.range(0, H + 200);
      const x = ((x0 + lt * sp * 0.7 + Math.sin(lt * 1.5 + i) * 40) % (W + 400) + W + 400) % (W + 400) - 200;
      const y = ((y0 + lt * sp) % (H + 200)) - 100;
      ctx.save(); ctx.translate(x, y); ctx.rotate(lt * 2 + i); ctx.scale(1, 0.4 + 0.6 * Math.abs(Math.sin(lt * 3 + i)));
      ellipse(ctx, 0, 0, 12, 7, 0, e.color || '#ffc4d4'); ctx.restore();
    }
    ctx.restore();
  },
  rain(ctx, e, k, lt) {
    const r = rng(5);
    ctx.save(); ctx.strokeStyle = rgba('#aab8ff', 0.45); ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 220; i++) { const x0 = r() * (W + 300), sp = r.range(1600, 2400); const y = ((r() * H + lt * sp) % (H + 100)) - 50; const x = x0 - y * 0.25; ctx.moveTo(x, y); ctx.lineTo(x - 12, y + 45); }
    ctx.stroke(); ctx.restore();
  },
  embers(ctx, e, k, lt) {
    const r = rng(e.seed || 8);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < (e.n || 50); i++) { const x = (r() * W + Math.sin(lt + i) * 30), y = H - ((r() * H + lt * r.range(40, 160)) % (H + 50)); circle(ctx, x, y, r.range(2, 5), rgba(e.color || '#ffaa40', r.range(0.4, 0.9))); }
    ctx.restore();
  },
  vignette(ctx, e) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${e.a ?? 0.55})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
  letterbox(ctx, e, k) {
    const h = (e.h || 110) * (e.animate ? ease.out(clamp(k * 4)) : 1);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h);
  },
  menace(ctx, e, k, lt) {
    // ゴゴゴ — the classic tension onomatopoeia
    ctx.save(); ctx.font = `${e.size || 90}px ${FONTS.title}`; ctx.textAlign = 'center';
    const n = e.n || 4;
    for (let i = 0; i < n; i++) {
      const x = (e.x ?? 1600) + Math.sin(lt * 20 + i) * 4, y = (e.y ?? 200) + i * (e.size || 90) * 0.9;
      ctx.save(); ctx.translate(x + i * 20, y); ctx.rotate(-0.15);
      ctx.lineWidth = 10; ctx.strokeStyle = '#ffffff'; ctx.strokeText('ゴ', 0, 0); ctx.fillStyle = e.color || '#6a2a9a'; ctx.fillText('ゴ', 0, 0); ctx.restore();
    }
    ctx.restore();
  },
  sfxText(ctx, e, k, lt) {
    const s = (e.size || 150) * (0.7 + 0.3 * ease.outBack(clamp(k * 5)));
    ctx.save(); ctx.globalAlpha = 1 - smoothstep(0.75, 1, k);
    ctx.translate(e.x ?? 960, e.y ?? 300); ctx.rotate(e.rot ?? -0.1);
    ctx.font = `${s}px ${e.font === 'jp' ? FONTS.title : FONTS.comic}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = s * 0.14; ctx.strokeStyle = e.stroke || '#16101e'; ctx.lineJoin = 'round'; ctx.strokeText(e.text, 0, 0);
    ctx.fillStyle = e.color || '#ffd23a'; ctx.fillText(e.text, 0, 0);
    ctx.restore();
  },
};

FX.fishline = (ctx, e, k, lt, view) => {
  const a = view.anchor(e.who); if (!a) return;
  const p = a.brushTip; const ex = p[0] + (e.dx ?? 60), ey = e.y ?? 860;
  ctx.save(); ctx.strokeStyle = 'rgba(240,240,240,0.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.quadraticCurveTo(ex, (p[1] + ey) / 2 + 30, ex, ey + Math.sin(lt * 2) * 3); ctx.stroke();
  ellipse(ctx, ex, ey + Math.sin(lt * 2) * 3, 7, 5, 0, '#ff4a3a'); ctx.restore();
};
FX.drop = (ctx, e, k) => {
  const y = lerp(e.y0 ?? -100, e.y, ease.in(clamp(k / 0.6)));
  if (k > 0.6) return;
  ctx.save(); ctx.fillStyle = e.color || '#120e18'; ctx.beginPath(); ctx.moveTo(e.x, y - 40); ctx.quadraticCurveTo(e.x + 18, y, e.x, y + 14); ctx.quadraticCurveTo(e.x - 18, y, e.x, y - 40); ctx.fill(); ctx.restore();
};
FX.inkPool = (ctx, e, k) => {
  // permanent ink blot left on paper
  ctx.save(); ctx.globalAlpha = e.alpha ?? 1; ctx.fillStyle = e.color || '#120e18';
  blob(ctx, e.x, e.y, (e.r || 60) * ease.outExpo(clamp(k * (e.speed || 6))), e.seed || 5, 0.4, 12); ctx.fill(); ctx.restore();
};

FX.altar = (ctx, e, k, lt) => {
  // small family altar with grandma's portrait, candles and incense
  const x = e.x, y = e.y, s = e.s || 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#3a2216'; ctx.fillRect(-120, -40, 240, 40); ctx.fillStyle = '#4a2c1c'; ctx.fillRect(-100, -260, 200, 220);
  ctx.strokeStyle = '#1e120a'; ctx.lineWidth = 5; ctx.strokeRect(-100, -260, 200, 220); ctx.strokeRect(-120, -40, 240, 40);
  ctx.fillStyle = '#c9a64a'; ctx.fillRect(-56, -236, 112, 140); ctx.fillStyle = '#d9c8a8'; ctx.fillRect(-46, -226, 92, 120);
  ctx.fillStyle = '#b9b4ba'; ctx.beginPath(); ctx.arc(0, -186, 26, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, -214, 12, 0, TAU); ctx.fill();
  ctx.fillStyle = '#f0d2b8'; ctx.beginPath(); ctx.arc(0, -178, 20, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(-7, -180, 4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.beginPath(); ctx.arc(7, -180, 4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -170, 6, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.fillStyle = '#6a4a8a'; ctx.beginPath(); ctx.moveTo(-34, -106); ctx.quadraticCurveTo(0, -150, 34, -106); ctx.fill();
  for (const cx of [-80, 80]) { ctx.fillStyle = '#f4ecd8'; ctx.fillRect(cx - 6, -86, 12, 46); FX.glow(ctx, { x: cx, y: -96, r: 26, color: '#ffb050', a: 0.9, fadeOut: false }, 0.5, lt); ellipse(ctx, cx, -94, 4, 8, 0, '#ffd27a'); }
  ctx.strokeStyle = 'rgba(220,220,230,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 30; i++) ctx.lineTo(Math.sin(i * 0.5 + lt * 2) * 8, -60 - i * 6); ctx.stroke();
  ctx.restore();
};
FX.kite = (ctx, e, k, lt) => {
  const q = ease.inOut(clamp(k / (e.travel ?? 1)));
  const x = lerp(e.x0, e.x1, q) + Math.sin(lt * 3) * (e.wob ?? 30), y = lerp(e.y0, e.y1, q) + Math.cos(lt * 2.3) * (e.wob ?? 30) * 0.6;
  const s = e.size || 60, a = Math.sin(lt * 4) * 0.3 + (e.spin ? lt * 8 : 0);
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.7, 0); ctx.lineTo(0, s * 1.2); ctx.lineTo(-s * 0.7, 0); ctx.closePath(); fillStroke(ctx, '#e84a4a', '#3a1010', 3);
  line(ctx, [[0, -s], [0, s * 1.2]], '#3a1010', 2); line(ctx, [[-s * 0.7, 0], [s * 0.7, 0]], '#3a1010', 2);
  circle(ctx, 0, 0, s * 0.22, '#fff4d0');
  ctx.beginPath(); for (let i = 0; i < 12; i++) ctx.lineTo(Math.sin(i * 0.9 + lt * 6) * 14, s * 1.2 + i * 14); ctx.strokeStyle = '#3a1010'; ctx.lineWidth = 2; ctx.stroke();
  for (let i = 2; i < 12; i += 3) { ctx.save(); ctx.translate(Math.sin(i * 0.9 + lt * 6) * 14, s * 1.2 + i * 14); ctx.fillStyle = i % 2 ? '#ffd23a' : '#4a8aff'; ctx.fillRect(-8, -3, 16, 6); ctx.restore(); }
  ctx.restore();
};

export const SCREEN_FX = new Set(['speedlines', 'hlines', 'flash', 'invert', 'tint', 'petals', 'rain', 'embers', 'vignette', 'letterbox', 'menace', 'sfxText']);
