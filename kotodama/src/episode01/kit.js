// Screenplay toolkit: scene() turns a list of beats into shots with automatic coverage, while
// carrying every character's state (position, pose, expression...) across cuts.
import { GROUND } from '../engine/env.js';
import { CAST } from '../engine/characters.js';
import { lineDuration } from '../engine/timeline.js';

export const G = GROUND;
const clone = (o) => JSON.parse(JSON.stringify(o));
export const WIDE = { x: 960, y: 540, z: 1 };

export function syncStage(stage, shot) {
  const t = shot.t1 - 1e-4;
  for (const id of shot.order) {
    const o = {};
    for (const [k, tr] of shot.chars[id]) o[k] = tr.at(t);
    stage.cast[id] = o;
  }
}

function visible(stage, id) { const c = stage.cast[id]; return c && c.visible !== false && (c.alpha ?? 1) > 0; }
function nearest(stage, who, others) {
  const x = stage.cast[who].x ?? 960;
  return others.slice().sort((a, b) => Math.abs((stage.cast[a].x ?? 960) - x) - Math.abs((stage.cast[b].x ?? 960) - x))[0];
}
function pushIn(cam, k) { return cam.frame || cam.two ? { ...cam, zm: (cam.zm || 1) * k } : { ...cam, z: (cam.z || 1) * k }; }

export function autoCam(stage, who, n, o = {}) {
  if (!visible(stage, who)) return stage.lastCam || WIDE;
  const others = Object.keys(stage.cast).filter((id) => id !== who && visible(stage, id) && id !== 'nijimi');
  let kind = o.frame;
  if (!kind) {
    if (o.style === 'shout') kind = n % 2 ? 'medium' : 'close';
    else if (others.length && n % 5 === 3) kind = 'two';
    else kind = n % 3 === 2 ? 'medium' : 'close';
  }
  if (kind === 'two') { const other = o.to || nearest(stage, who, others); return other ? { two: [who, other] } : { frame: [who, 'medium'], side: 'l' }; }
  return { frame: [who, kind], side: 'l' };
}

// beats:
//   ['who', 'text', opts]          dialogue (opts: expr pose look style hold cam frame fx sfx shake before after d)
//   { narr, cam, d }               narration over the stage
//   { react: id, expr, pose, d }   silent reaction close-up
//   { wide: seconds, cam, title }  establishing / wide shot
//   { shot: fn(s, stage), cam, d, ...shotOpts }   custom shot
//   { set: { id: props } } / { remove: id } / { music } / { sfx } / { note }
export function scene(E, setup, beats) {
  const stage = { cast: clone(setup.cast || {}), lastCam: setup.cam || WIDE };
  if (setup.heading) E.scene(setup.heading);
  if (setup.music !== undefined) E.musicNow(setup.music, setup.musicOpts || {});
  let n = 0;
  const castFor = (extra) => {
    if (extra.noCast) return {};
    const c = clone(stage.cast);
    if (extra.only) for (const id of Object.keys(c)) if (!extra.only.includes(id)) delete c[id];
    return c;
  };
  const base = (extra = {}) => ({ bg: setup.bg, var: setup.var, grade: setup.grade, fx: extra.noCast ? [] : setup.fx, vignette: setup.vignette, ...extra, cast: castFor(extra) });
  const run = (o, fn) => { const shot = E.shot(o, fn); syncStage(stage, shot); stage.lastCam = o.cam; return shot; };
  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    if (!b) continue;
    if (Array.isArray(b)) {
      // group consecutive lines by the same speaker into one shot unless a cut is requested
      const group = [b];
      while (i + 1 < beats.length && Array.isArray(beats[i + 1]) && beats[i + 1][0] === b[0] && !(beats[i + 1][2] || {}).cam && !(beats[i + 1][2] || {}).cut) group.push(beats[++i]);
      const [who, , o0 = {}] = b;
      const cam = o0.cam || autoCam(stage, who, n, o0);
      const total = group.reduce((a, [, text, o = {}]) => a + (o.d ?? lineDuration(text) + (o.hold || 0)), 0);
      run({ ...base(o0.shotOpts || {}), cam, in: o0.in, out: group[group.length - 1][2]?.out }, (s) => {
        if (o0.push !== false) s.cam(pushIn(cam, o0.pushK || 1.045), total, 'inOut');
        for (const [w, text, o = {}] of group) {
          if (o.before) o.before(s, stage);
          if (o.fx) for (const f of o.fx) s.fx(f[0], f[1] || {}, f[2] ?? 0.6);
          if (o.shake) s.shake(o.shake, 0.4);
          const lineStart = s.t;
          s.say(w, text, o);
          if (o.after) { const keep = s.t; s.t = lineStart; o.after(s, stage); s.t = Math.max(keep, s.t); }
        }
      });
      n++;
    } else if (b.narr) {
      run({ ...base(b.shotOpts || {}), cam: b.cam || stage.lastCam }, (s) => { if (b.camTo) s.cam(b.camTo, b.camD ?? 4, 'inOut'); if (b.fn) s.par((q) => b.fn(q, stage)); s.narr(b.narr, { d: b.d }); });
    } else if (b.react) {
      const cam = b.cam || { frame: [b.react, b.frame || 'close'], side: 'l' };
      run({ ...base(), cam }, (s) => {
        s.cam(pushIn(cam, 1.06), b.d ?? 1.1);
        if (b.expr) s.expr(b.react, b.expr);
        if (b.pose) s.pose(b.react, b.pose, 0.15);
        if (b.sfx) s.sfx(b.sfx);
        if (b.fx) for (const f of b.fx) s.fx(f[0], f[1] || {}, f[2] ?? 0.6);
        if (b.fn) s.par((q) => b.fn(q, stage));
        s.wait(b.d ?? 1.1);
      });
    } else if (b.wide !== undefined) {
      const cam = b.cam || WIDE;
      run({ ...base(b.shotOpts || {}), cam, in: b.in, out: b.out }, (s) => {
        if (b.camTo) s.cam(b.camTo, b.camD ?? b.wide, b.ease || 'inOut');
        if (b.title) s.title(b.title.type || 'caption', b.title, b.title.d ?? Math.min(b.wide, 3.5));
        if (b.sfx) s.sfx(b.sfx);
        if (b.fn) s.par((q) => b.fn(q, stage));
        s.wait(b.wide);
      });
    } else if (b.shot) {
      const { shot: fn, cam, d, ...rest } = b;
      run({ ...base(rest), cam: cam || stage.lastCam, d }, (s) => fn(s, stage));
    } else if (b.set) {
      for (const [id, props] of Object.entries(b.set)) stage.cast[id] = { ...(stage.cast[id] || {}), ...props };
    } else if (b.remove) {
      delete stage.cast[b.remove];
    } else if (b.music !== undefined) {
      E.musicNow(b.music, b);
    } else if (b.sfx) {
      E.sfx.push({ t: E.t, name: b.sfx, vol: b.vol ?? 1, rate: 1 });
    } else if (b.note) {
      E.script.push({ type: 'action', text: b.note, t: E.t });
    }
  }
  return stage;
}

// ------------------------------------------------------------------ action helpers (inside a shot builder)
export function posOf(s, id) {
  const c = s.s.chars[id];
  return { x: c.get('x').at(s.t), y: c.get('y').at(s.t), f: c.get('facing').at(s.t), U: CAST[id.split('#')[0]].u * (c.get('scale').at(s.t) || 1) };
}

// brush-writing: the character strokes while the kanji writes itself in the air in front of them
export function write(s, who, ch, o = {}) {
  const p = posOf(s, who);
  const x = o.x ?? p.x + p.f * p.U * 2.3, y = o.y ?? p.y - p.U * 4.3;
  const d = o.d ?? 1.4;
  const poses = o.poses || ['brushUp', 'brushDown', 'brushSide', 'brushDown', 'brushUp', 'brushSide'];
  poses.forEach((ps, i) => s.at((i * d) / poses.length, (b) => b.pose(who, ps, 0.07)));
  s.at(d, (b) => b.pose(who, o.end || 'brushHold', 0.15));
  const fxd = o.hold ? d / 0.55 + o.hold : d / 0.55;
  s.fx('kanji', { ch, x, y, size: o.size ?? p.U * 2.7, color: o.color || '#16101e', glow: o.glow, outline: o.outline, write: d / fxd, fadeAt: o.fadeAt ?? 0.88, fade: o.fade, grow: o.grow, layer: o.layer }, fxd);
  s.sfx('brush'); s.sfx('brush', { at: d * 0.45 }); s.sfx('kanji', { at: d * 0.95, vol: 0.7 });
  return { x, y, d, end: s.t + d };
}

export function scribble(s, who, o = {}) {
  const p = posOf(s, who);
  const x = o.x ?? p.x + p.f * p.U * 2.4, y = o.y ?? p.y - p.U * 4.2;
  const d = o.d ?? 1.2;
  const poses = ['brushUp', 'brushSide', 'brushDown', 'brushUp', 'brushDown', 'brushSide', 'brushUp', 'brushDown'];
  poses.forEach((ps, i) => s.at((i * d) / poses.length, (b) => b.pose(who, ps, 0.05)));
  s.at(d, (b) => b.pose(who, o.end || 'brushHold', 0.15));
  const fxd = d / 0.5 + (o.hold || 0);
  s.fx('scribble', { x, y, size: o.size ?? p.U * 3, color: o.color || '#16101e', glow: o.glow || '#000000', plain: o.plain, seed: o.seed || 21, write: d / fxd, fadeAt: o.fadeAt ?? 0.9, layer: o.layer }, fxd);
  s.sfx('scribble');
  return { x, y, d };
}
