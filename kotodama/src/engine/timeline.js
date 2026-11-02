// Screenplay DSL -> timeline. A shot is a list of keyed tracks; any time t can be evaluated instantly
// (no simulation state), which makes rendering deterministic and seekable.
import { poseVec, blendPose, applyMotion, buildState, anchors } from './body.js';
import { CAST } from './characters.js';
import { lerp, clamp, getEase, onTwos, hash, strHash } from './util.js';
import { W, H, GROUND } from './env.js';

const NUMERIC = new Set(['x', 'y', 'scale', 'alpha', 'wind', 'crack', 'blush', 'gloom', 'speed', 'tears', 'z']);

class Track {
  constructor(kind, init) { this.kind = kind; this.init = init; this.keys = []; }
  add(t, v, d = 0, e = 'inOut') { this.keys.push({ t, v, d, e: getEase(e) }); this.keys.sort((a, b) => a.t - b.t); }
  at(t) {
    let v = this.init;
    const K = this.keys;
    for (let i = 0; i < K.length; i++) {
      const k = K[i];
      if (k.t > t) break;
      const nx = K[i + 1];
      const te = nx && nx.t <= t ? nx.t : t;
      if (k.d > 0 && this.kind !== 'discrete') {
        const q = k.e(clamp((te - k.t) / k.d));
        v = this.kind === 'pose' ? blendPose(v, k.v, q) : this.kind === 'vec' ? [lerp(v[0], k.v[0], q), lerp(v[1], k.v[1], q)] : lerp(v, k.v, q);
      } else v = k.v;
    }
    return v;
  }
}

function kindOf(prop) { return prop === 'pose' ? 'pose' : prop === 'look' ? 'vec' : NUMERIC.has(prop) ? 'num' : 'discrete'; }

export function lineDuration(text) { return clamp(1.15 + text.length * 0.062, 1.8, 8); }

// ------------------------------------------------------------------ shot
export class Shot {
  constructor(ep, t0, o) {
    this.ep = ep; this.t0 = t0; this.t1 = t0; this.o = o;
    this.bg = o.bg || 'plain'; this.bgVar = o.var || '';
    this.chars = {}; // id -> Map(prop -> Track)
    this.order = [];
    this.speak = {}; // id -> [{t0, t1, loud}]
    this.camT = new Track('cam', o.cam || { x: 960, y: 540, z: 1 });
    this.shakes = [];
    this.fx = [];
    this.grade = o.grade || null;
    for (const [id, st] of Object.entries(o.cast || {})) this.addChar(id, st);
    for (const f of o.fx || []) this.fx.push({ t0: t0, d: 1e9, persistent: true, ...f, type: f.type });
  }
  addChar(id, st) {
    const def = CAST[id.split('#')[0]];
    if (!def) throw new Error('unknown character ' + id);
    const m = new Map();
    const init = { x: 960, y: GROUND, facing: 1, scale: 1, alpha: 1, pose: 'stand', expr: def.defaultExpr || 'neutral', motion: 'idle', look: [0.15, 0], wind: 0, z: this.order.length, ...st };
    for (const [k, v] of Object.entries(init)) m.set(k, new Track(kindOf(k), k === 'pose' ? poseVec(v) : v));
    this.chars[id] = m; this.order.push(id); this.speak[id] = [];
  }
  track(id, prop) {
    const m = this.chars[id];
    if (!m) throw new Error(`character ${id} not in shot`);
    if (!m.has(prop)) m.set(prop, new Track(kindOf(prop), prop === 'pose' ? poseVec('stand') : prop === 'look' ? [0, 0] : NUMERIC.has(prop) ? 0 : null));
    return m.get(prop);
  }
  charState(id, t) {
    const m = this.chars[id];
    const def = CAST[id.split('#')[0]];
    const q = onTwos(t); // animate "on twos"
    const s = {};
    for (const [k, tr] of m) s[k] = tr.at(k === 'x' || k === 'y' || k === 'alpha' ? t : q);
    if (s.visible === false || s.alpha <= 0.001) return null;
    s.id = id;
    let p = s.pose;
    p = applyMotion(p, s.motion, q + hash(strHash(id)) * 10, s.speed || 1);
    if (s.motion === 'run') s.wind = Math.max(s.wind || 0, 1);
    s.pose = p;
    // blinking
    const seed = strHash(id);
    const per = 3.2 + hash(seed) * 2.2;
    const ph = (q + hash(seed + 1) * per) % per;
    s.blink = ph < 0.08 ? 0.45 : ph < 0.17 ? 0.05 : ph < 0.25 ? 0.5 : 1;
    // lip flap
    s.mouthShape = null;
    for (const sp of this.speak[id]) if (t >= sp.t0 && t < sp.t1) { s.mouthShape = flap(q, sp); break; }
    s.def = def;
    return buildState(def, s, t);
  }
}

function flap(q, sp) {
  const k = Math.floor((q - sp.t0) * 12);
  const v = hash(k * 7919 + Math.floor(sp.t0 * 100));
  if (sp.loud) return v < 0.3 ? 'mid' : 'wide';
  return v < 0.28 ? 'line' : v < 0.66 ? 'open' : 'mid';
}

// ------------------------------------------------------------------ builder handed to script code
class ShotBuilder {
  constructor(ep, shot) { this.ep = ep; this.s = shot; this.t = shot.t0; }
  get lt() { return this.t - this.s.t0; }
  wait(d) { this.t += d; return this; }
  at(off, fn) { const keep = this.t; this.t += off; fn(this); this.t = keep; return this; }
  par(fn) { const keep = this.t; fn(this); this.t = keep; return this; }
  add(id, st) { this.s.addChar(id, { ...st, visible: false }); this.s.track(id, 'visible').add(this.t, true); return this; }
  set(id, props) {
    for (const [k, v] of Object.entries(props)) this.s.track(id, k).add(this.t, k === 'pose' ? poseVec(v) : v, 0);
    return this;
  }
  to(id, props, d = 0.4, e = 'inOut') {
    for (const [k, v] of Object.entries(props)) this.s.track(id, k).add(this.t, k === 'pose' ? poseVec(v) : v, d, e);
    return this;
  }
  pose(id, p, d = 0.16, e = 'out') { this.s.track(id, 'pose').add(this.t, poseVec(p), d, e); return this; }
  expr(id, e) { this.s.track(id, 'expr').add(this.t, e); return this; }
  face(id, f) { this.s.track(id, 'facing').add(this.t, f); return this; }
  hide(id) { this.s.track(id, 'visible').add(this.t, false); return this; }
  show(id) { this.s.track(id, 'visible').add(this.t, true); return this; }
  move(id, x, d, o = {}) {
    const tr = this.s.track(id, 'x');
    const x0 = tr.at(this.t - 1e-4);
    if (o.face !== false) this.face(id, x >= x0 ? 1 : -1);
    this.s.track(id, 'motion').add(this.t, o.motion || 'walk');
    if (o.speed) this.s.track(id, 'speed').add(this.t, o.speed);
    tr.add(this.t, x, d, o.ease || 'linear');
    if (o.y != null) this.s.track(id, 'y').add(this.t, o.y, d, o.ease || 'linear');
    this.at(d, (b) => { b.s.track(id, 'motion').add(b.t, o.end || 'idle'); if (o.stop) b.pose(id, o.stop, 0.12); });
    return this;
  }
  say(id, text, o = {}) {
    const d = o.d ?? lineDuration(text) + (o.hold || 0);
    if (o.expr) this.expr(id, o.expr);
    if (o.pose) this.pose(id, o.pose, o.poseD ?? 0.16);
    if (o.look) this.set(id, { look: o.look });
    if (o.cam) this.cam(o.cam, o.camD ?? 0, o.camE);
    const speakDur = Math.min(d - 0.25, text.length * 0.052 + 0.25);
    if (this.s.speak[id] && !o.silent) this.s.speak[id].push({ t0: this.t + 0.05, t1: this.t + 0.05 + speakDur, loud: o.style === 'shout' || o.loud });
    this.ep.subs.push({ t0: this.t, t1: this.t + d - 0.05, who: id.split('#')[0], text, style: o.style || 'say', name: o.name });
    this.ep.script.push({ type: 'line', who: id.split('#')[0], name: o.name, text, style: o.style || 'say', t: this.t });
    if (o.sfx) this.sfx(o.sfx);
    if (!o.noAdvance) this.t += d;
    return this;
  }
  narr(text, o = {}) {
    const d = o.d ?? lineDuration(text) + 0.4;
    this.ep.subs.push({ t0: this.t, t1: this.t + d - 0.05, who: null, text, style: 'narr' });
    this.ep.script.push({ type: 'line', who: 'narrator', text, style: 'narr', t: this.t });
    if (!o.noAdvance) this.t += d;
    return this;
  }
  cam(spec, d = 0, e = 'inOut') { this.s.camT.add(this.t, spec, d, e); return this; }
  shake(amp = 20, d = 0.3) { this.s.shakes.push({ t0: this.t, d, amp }); return this; }
  fx(type, params = {}, d = 0.5, o = {}) { this.s.fx.push({ ...params, type, t0: this.t + (params.at ?? o.at ?? 0), d }); return this; }
  title(type, params = {}, d = 2) { this.s.fx.push({ ...params, type, title: true, t0: this.t + (params.at || 0), d }); return this; }
  sfx(name, o = {}) { this.ep.sfx.push({ t: this.t + (o.at || 0), name, vol: o.vol ?? 1, rate: o.rate ?? 1 }); return this; }
  music(cue, o = {}) { this.ep.musicAt(this.t, cue, o); return this; }
  note(text) { this.ep.script.push({ type: 'action', text, t: this.t }); return this; }
}

// ------------------------------------------------------------------ episode
export class Episode {
  constructor(meta = {}) {
    this.meta = meta; this.fps = 24;
    this.shots = []; this.subs = []; this.sfx = []; this.music = []; this.chapters = []; this.script = [];
    this.t = 0;
  }
  chapter(name) { this.chapters.push({ t: this.t, name }); this.script.push({ type: 'chapter', text: name, t: this.t }); }
  scene(heading) { this.script.push({ type: 'scene', text: heading, t: this.t }); }
  musicAt(t, cue, o = {}) { this.music.push({ t, cue, vol: o.vol ?? 0.8, fade: o.fade ?? 1.0 }); }
  musicNow(cue, o) { this.musicAt(this.t, cue, o); }
  shot(o, fn) {
    const s = new Shot(this, this.t, o);
    const b = new ShotBuilder(this, s);
    if (o.music !== undefined) this.musicAt(this.t, o.music, o.musicOpts || {});
    if (o.note) this.script.push({ type: 'action', text: o.note, t: this.t });
    if (fn) fn(b);
    const d = Math.max(o.d || 0, b.t - s.t0, o.min || 0.5);
    s.t1 = s.t0 + d;
    for (const f of s.fx) if (f.persistent) f.d = d;
    this.shots.push(s);
    this.t = s.t1;
    return s;
  }
  get duration() { return this.t; }
  shotAt(t) {
    let lo = 0, hi = this.shots.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (this.shots[mid].t0 <= t) lo = mid; else hi = mid - 1; }
    return this.shots[lo];
  }
}

// ------------------------------------------------------------------ camera resolution
export function resolveCam(spec, states) {
  if (!spec) return { x: 960, y: 540, z: 1, r: 0 };
  const r = spec.r || 0;
  if (spec.frame) {
    const [id, kind] = spec.frame;
    const st = states[id];
    if (!st) return { x: spec.x ?? 960, y: spec.y ?? 540, z: spec.z ?? 1, r };
    const a = anchors(st.def, st);
    const U = a.U;
    let z, x = a.head[0], y;
    switch (kind) {
      case 'full': z = (H * 0.8) / a.height; y = a.feet[1] - a.height * 0.5; x = (a.feet[0] + a.head[0]) / 2; break;
      case 'knee': z = H / (U * 4.6); y = a.head[1] + U * 1.6; break;
      case 'medium': z = H / (U * 3.3); y = a.head[1] + U * 0.8; break;
      case 'close': z = H / (U * 1.95); y = a.head[1] + U * 0.28; break;
      case 'xclose': z = H / (U * 1.1); y = a.head[1] + U * 0.06; break;
      case 'eyes': z = H / (U * 0.55); y = a.head[1] + U * 0.05; x = a.head[0] + U * 0.1 * (st.facing || 1); break;
      default: z = 1; y = 540;
    }
    z *= spec.zm || 1;
    if (spec.side) x += (spec.side === 'l' ? 1 : -1) * (W / 5.5) / z * (st.facing || 1) * (spec.flipSide ? -1 : 1);
    if (spec.dx) x += spec.dx * U; if (spec.dy) y += spec.dy * U;
    return { x, y, z, r };
  }
  if (spec.two) {
    const [a1, b1] = spec.two.map((id) => states[id] && anchors(states[id].def, states[id]));
    if (!a1 || !b1) return { x: 960, y: 540, z: 1, r };
    const U = Math.max(a1.U, b1.U);
    const x = (a1.head[0] + b1.head[0]) / 2;
    const span = Math.abs(a1.head[0] - b1.head[0]) + U * 3.2;
    const hiY = Math.min(a1.head[1], b1.head[1]), loY = Math.max(a1.head[1], b1.head[1]);
    const top = hiY - U * 0.75, bot = loY + U * (spec.tight ? 1.1 : 2.4);
    let z = Math.min((W * 0.92) / span, H / (bot - top), H / (U * (spec.tight ? 3.4 : 5.2)));
    z *= spec.zm || 1;
    const fh = H / z;
    let y = hiY - fh * 0.3 + fh / 2;               // higher head ~30% from the top
    y = Math.max(y, loY + U * 0.35 - fh * 0.88 + fh / 2); // keep the lower head in frame
    return { x: x + (spec.dx || 0), y: y + (spec.dy || 0), z, r };
  }
  return { x: spec.x ?? 960, y: spec.y ?? 540, z: spec.z ?? 1, r };
}

export function camAt(shot, t, states) {
  const K = shot.camT.keys;
  let cur = resolveCam(shot.camT.init, states);
  for (let i = 0; i < K.length; i++) {
    const k = K[i];
    if (k.t > t) break;
    const nx = K[i + 1];
    const te = nx && nx.t <= t ? nx.t : t;
    const target = resolveCam(k.v, states);
    if (k.d > 0) {
      const q = k.e(clamp((te - k.t) / k.d));
      cur = { x: lerp(cur.x, target.x, q), y: lerp(cur.y, target.y, q), z: Math.exp(lerp(Math.log(cur.z), Math.log(target.z), q)), r: lerp(cur.r, target.r, q) };
    } else cur = target;
  }
  // shake
  let sx = 0, sy = 0;
  for (const sh of shot.shakes) {
    if (t >= sh.t0 && t < sh.t0 + sh.d) {
      const k = 1 - (t - sh.t0) / sh.d;
      const f = Math.floor(t * 24);
      sx += (hash(f * 3 + 1) - 0.5) * 2 * sh.amp * k; sy += (hash(f * 7 + 2) - 0.5) * 2 * sh.amp * k;
    }
  }
  cur.sx = sx; cur.sy = sy;
  // keep the frame inside the painted background
  const hw = W / 2 / cur.z, hh = H / 2 / cur.z;
  cur.x = clamp(cur.x, -680 + hw, 2600 - hw);
  cur.y = clamp(cur.y, -380 + hh, 1380 - hh);
  return cur;
}
