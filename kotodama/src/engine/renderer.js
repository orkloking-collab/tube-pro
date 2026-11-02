// Renders one frame of an Episode at time t. Pure function of (episode, t).
import { W, H } from './env.js';
import { drawBG } from './backgrounds.js';
import { drawCharacter, anchors } from './body.js';
import { FX, SCREEN_FX } from './fx.js';
import { TITLES, drawSubtitle } from './text.js';
import { camAt } from './timeline.js';
import { clamp, smoothstep } from './util.js';

const GRADES = {
  sepia: (ctx) => { ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.82; ctx.fillStyle = '#a0784e'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.25; ctx.fillStyle = '#f0c890'; ctx.fillRect(0, 0, W, H); },
  night: (ctx) => { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 1; ctx.fillStyle = '#9aa2dc'; ctx.fillRect(0, 0, W, H); },
  sunset: (ctx) => { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.45; ctx.fillStyle = '#ff9a5a'; ctx.fillRect(0, 0, W, H); },
  cold: (ctx) => { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 1; ctx.fillStyle = '#d4d8f0'; ctx.fillRect(0, 0, W, H); },
  red: (ctx) => { ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.35; ctx.fillStyle = '#ff2a3a'; ctx.fillRect(0, 0, W, H); },
  dark: (ctx) => { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 1; ctx.fillStyle = '#6a6a8a'; ctx.fillRect(0, 0, W, H); },
  warm: (ctx) => { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.3; ctx.fillStyle = '#ffc070'; ctx.fillRect(0, 0, W, H); },
};

export function renderFrame(ctx, ep, t, outW) {
  const base = outW / W;
  const shot = ep.shotAt(t);
  const states = {};
  for (const id of shot.order) { const s = shot.charState(id, t); if (s) states[id] = s; }
  const cam = camAt(shot, t, states);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, outW, Math.round(H * base));
  drawBG(ctx, shot.bg, shot.bgVar, cam, base);
  const world = () => {
    ctx.setTransform(base, 0, 0, base, 0, 0);
    ctx.translate(W / 2 + cam.sx, H / 2 + cam.sy);
    if (cam.r) ctx.rotate(cam.r);
    ctx.scale(cam.z, cam.z);
    ctx.translate(-cam.x, -cam.y);
  };
  const screen = () => ctx.setTransform(base, 0, 0, base, 0, 0);
  const anchorCache = {};
  const view = { cam, states, anchor: (id) => { if (!states[id]) return null; return anchorCache[id] || (anchorCache[id] = anchors(states[id].def, states[id])); } };
  const active = shot.fx.filter((f) => t >= f.t0 && t < f.t0 + f.d);
  const drawFx = (f) => {
    const fn = f.title ? TITLES[f.type] : FX[f.type];
    if (!fn) return;
    const lt = t - f.t0, k = clamp(lt / f.d);
    ctx.save(); fn(ctx, f, k, lt, view); ctx.restore();
  };
  world();
  for (const f of active) if (!f.title && !SCREEN_FX.has(f.type) && f.layer === 'back') drawFx(f);
  const lw = 0.034 * clamp(1 / Math.sqrt(cam.z), 0.42, 1);
  const ids = Object.keys(states).sort((a, b) => (states[a].z || 0) - (states[b].z || 0));
  for (const id of ids) {
    const st = states[id];
    world();
    if (st.alpha < 1) ctx.globalAlpha = st.alpha;
    drawCharacter(ctx, st.def, st, t, { lw });
    ctx.globalAlpha = 1;
  }
  world();
  for (const f of active) if (!f.title && !SCREEN_FX.has(f.type) && f.layer !== 'back' && f.layer !== 'top') drawFx(f);
  screen();
  for (const f of active) if (!f.title && SCREEN_FX.has(f.type) && f.layer !== 'top') drawFx(f);
  if (shot.grade && GRADES[shot.grade]) { ctx.save(); GRADES[shot.grade](ctx); ctx.restore(); }
  world();
  for (const f of active) if (!f.title && !SCREEN_FX.has(f.type) && f.layer === 'top') drawFx(f);
  screen();
  for (const f of active) if (!f.title && SCREEN_FX.has(f.type) && f.layer === 'top') drawFx(f);
  // gentle vignette on everything (film look)
  FX.vignette(ctx, { a: shot.o.vignette ?? 0.35 });
  for (const f of active) if (f.title) drawFx(f);
  // transitions
  const lt = t - shot.t0, rem = shot.t1 - t;
  const inD = shot.o.inD || 0.5, outD = shot.o.outD || 0.5;
  if (shot.o.in === 'fade' && lt < inD) { ctx.fillStyle = `rgba(0,0,0,${1 - lt / inD})`; ctx.fillRect(0, 0, W, H); }
  if (shot.o.in === 'white' && lt < inD) { ctx.fillStyle = `rgba(255,255,255,${1 - lt / inD})`; ctx.fillRect(0, 0, W, H); }
  if (shot.o.out === 'fade' && rem < outD) { ctx.fillStyle = `rgba(0,0,0,${1 - rem / outD})`; ctx.fillRect(0, 0, W, H); }
  if (shot.o.out === 'white' && rem < outD) { ctx.fillStyle = `rgba(255,255,255,${1 - rem / outD})`; ctx.fillRect(0, 0, W, H); }
  // subtitles
  for (const sb of ep.subs) if (t >= sb.t0 && t < sb.t1) drawSubtitle(ctx, sb, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
