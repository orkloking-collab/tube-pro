// Core math / color / randomness helpers shared by every module.
// Everything in the engine is deterministic: the same time `t` always renders the same frame.

export const TAU = Math.PI * 2;
export const D2R = Math.PI / 180;

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => clamp((v - a) / (b - a || 1e-9));
export const smoothstep = (a, b, v) => { const t = invLerp(a, b, v); return t * t * (3 - 2 * t); };
export const fract = (x) => x - Math.floor(x);

export const ease = {
  linear: (t) => t,
  in: (t) => t * t,
  out: (t) => 1 - (1 - t) * (1 - t),
  inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  in3: (t) => t * t * t,
  out3: (t) => 1 - Math.pow(1 - t, 3),
  inOut3: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
  step: (t) => (t < 1 ? 0 : 1),
  snap: (t) => (t < 0.35 ? 0 : 1),
};
export const getEase = (e) => (typeof e === 'function' ? e : ease[e] || ease.inOut);

// ---------- deterministic randomness ----------
export function hash(n) {
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
export const hash2 = (a, b) => hash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663));
export function strHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

export function rng(seed = 1) {
  let a = (typeof seed === 'string' ? strHash(seed) : seed) >>> 0;
  const f = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  f.range = (lo, hi) => lo + (hi - lo) * f();
  f.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * f());
  f.pick = (arr) => arr[Math.floor(f() * arr.length)];
  f.sign = () => (f() < 0.5 ? -1 : 1);
  return f;
}

// smooth 1D value noise in [-1, 1]
export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash2(i, seed) * 2 - 1, hash2(i + 1, seed) * 2 - 1, u);
}

// ---------- colors ----------
const _rgbCache = new Map();
export function hexToRgb(hex) {
  let c = _rgbCache.get(hex);
  if (c) return c;
  if (hex.startsWith('rgb')) { const m = hex.match(/[\d.]+/g).map(Number); c = [m[0], m[1], m[2]]; _rgbCache.set(hex, c); return c; }
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  c = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  _rgbCache.set(hex, c);
  return c;
}
const toHex = (v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
export const rgbToHex = (r, g, b) => '#' + toHex(r) + toHex(g) + toHex(b);
const _mixCache = new Map();
export function mix(a, b, t) {
  const k = a + b + t.toFixed(3);
  let v = _mixCache.get(k);
  if (v) return v;
  const A = hexToRgb(a), B = hexToRgb(b);
  v = rgbToHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t));
  if (_mixCache.size > 20000) _mixCache.clear();
  _mixCache.set(k, v);
  return v;
}
export const shade = (hex, amt) => (amt < 0 ? mix(hex, '#0b0612', -amt) : mix(hex, '#ffffff', amt));
export function rgba(hex, a) { const c = hexToRgb(hex); return `rgba(${c[0]},${c[1]},${c[2]},${clamp(a)})`; }

// time quantisation: anime is usually animated "on twos" (12 drawings / second)
export const onTwos = (t, fps = 12) => Math.floor(t * fps) / fps;

export function wrapText(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}
