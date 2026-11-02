// Tiny deterministic synthesizer: instruments, drums, effects. All audio of the series is generated from code.
export const SR = 44100;
const TAU = Math.PI * 2;

export function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
const NN = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function nm(s) { // 'C#4' -> midi
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(s);
  if (!m) throw new Error('bad note ' + s);
  return 12 * (+m[3] + 1) + NN[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}

let seed = 12345;
export function srand(s) { seed = s >>> 0 || 1; }
export function rnd() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296); }
const noise = () => rnd() * 2 - 1;

export class Stereo {
  constructor(sec) { this.n = Math.ceil(sec * SR); this.L = new Float32Array(this.n); this.R = new Float32Array(this.n); }
  add(mono, t, gain = 1, pan = 0) {
    const s = Math.round(t * SR);
    const a = (pan + 1) * Math.PI / 4, gl = gain * Math.cos(a), gr = gain * Math.sin(a);
    const L = this.L, R = this.R, n = this.n;
    for (let j = 0, i = s; j < mono.length; j++, i++) { if (i < 0) continue; if (i >= n) break; L[i] += mono[j] * gl; R[i] += mono[j] * gr; }
  }
}

function adsr(n, a, d, s, r, hold) {
  const e = new Float32Array(n);
  const A = Math.max(1, Math.floor(a * SR)), D = Math.max(1, Math.floor(d * SR)), H = Math.floor(hold * SR), Rr = Math.max(1, Math.floor(r * SR));
  for (let i = 0; i < n; i++) {
    let v;
    if (i < A) v = i / A; else if (i < A + D) v = 1 - (1 - s) * ((i - A) / D); else if (i < H) v = s; else v = s * Math.max(0, 1 - (i - Math.max(H, A + D)) / Rr);
    e[i] = v;
  }
  return e;
}

function lp1(x, fc) { const a = 1 - Math.exp(-TAU * fc / SR); let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = y; } return x; }
function hp1(x, fc) { const a = 1 - Math.exp(-TAU * fc / SR); let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = x[i] - y; } return x; }
// state variable filter (lowpass/bandpass), cutoff may be a function of sample index
function svf(x, fc, q = 0.7, mode = 'lp') {
  // Chamberlin SVF, 2x oversampled, coefficient clamped to the stability region
  let low = 0, band = 0;
  const fcf = typeof fc === 'function';
  const damp = 1 / q;
  const fmax = Math.max(0.05, Math.min(1.4, (2 - damp) * 0.9));
  const coef = (c) => Math.min(Math.max(0.0005, fmax), 2 * Math.sin(Math.PI * Math.min(0.24, c / (2 * SR))));
  let f = coef(fcf ? fc(0) : fc);
  for (let i = 0; i < x.length; i++) {
    if (fcf && (i & 31) === 0) f = coef(fc(i));
    const inp = x[i];
    let out = 0;
    for (let k = 0; k < 2; k++) {
      low += f * band; const high = inp - low - damp * band; band += f * high;
      out = mode === 'lp' ? low : mode === 'bp' ? band : high;
    }
    x[i] = out;
  }
  return x;
}

// ------------------------------------------------------------------ instruments (return mono Float32Array)
const cache = new Map();
function cached(key, fn) { if (!cache.has(key)) cache.set(key, fn()); return cache.get(key); }

export function pluck(freq, dur, bright = 0.5, decay = 0.996) {
  // Karplus-Strong: koto / shamisen like
  const n = Math.floor((dur + 0.6) * SR);
  const out = new Float32Array(n);
  const N = Math.max(2, Math.round(SR / freq));
  const buf = new Float32Array(N);
  for (let i = 0; i < N; i++) buf[i] = noise();
  if (bright < 1) lp1(buf, 2000 + bright * 8000);
  let idx = 0;
  const g = decay;
  for (let i = 0; i < n; i++) {
    const a = buf[idx], b = buf[(idx + 1) % N];
    out[i] = a;
    buf[idx] = (a + b) * 0.5 * g;
    idx = (idx + 1) % N;
  }
  const rel = Math.floor(dur * SR);
  for (let i = rel; i < n; i++) out[i] *= Math.max(0, 1 - (i - rel) / (0.6 * SR));
  return out;
}

export function tone(freq, dur, o = {}) {
  const type = o.type || 'sine';
  const rel = o.r ?? 0.2;
  const n = Math.floor((dur + rel) * SR);
  const e = adsr(n, o.a ?? 0.01, o.d ?? 0.1, o.s ?? 0.7, rel, dur);
  const out = new Float32Array(n);
  const det = o.detune ? [1 - o.detune, 1, 1 + o.detune] : [1];
  const vib = o.vib || 0, vr = o.vibRate || 5.5;
  for (const dm of det) {
    let ph = rnd();
    for (let i = 0; i < n; i++) {
      const vf = vib ? 1 + vib * Math.sin(TAU * vr * i / SR) * Math.min(1, i / (0.3 * SR)) : 1;
      const slide = o.slide ? Math.pow(2, (o.slide * Math.min(1, i / (dur * SR))) / 12) : 1;
      ph += freq * dm * vf * slide / SR; ph -= Math.floor(ph);
      let v;
      switch (type) {
        case 'saw': v = 2 * ph - 1; break;
        case 'square': v = ph < 0.5 ? 1 : -1; break;
        case 'tri': v = 4 * Math.abs(ph - 0.5) - 1; break;
        default: v = Math.sin(TAU * ph);
      }
      out[i] += v * e[i] / det.length;
    }
  }
  if (o.lp) svf(out, o.lp, o.q || 0.8, 'lp');
  if (o.drive) for (let i = 0; i < n; i++) out[i] = Math.tanh(out[i] * o.drive) / Math.tanh(o.drive);
  return out;
}

export function piano(freq, dur, vel = 1) {
  const n = Math.floor((dur + 1.2) * SR);
  const out = new Float32Array(n);
  const parts = [[1, 1], [2, 0.45], [3, 0.22], [4, 0.12], [5, 0.06]];
  for (const [h, amp] of parts) {
    const f = freq * h * (1 + 0.0004 * h * h);
    const dk = 1.6 + h * 0.9;
    let ph = rnd();
    for (let i = 0; i < n; i++) { ph += f / SR; out[i] += Math.sin(TAU * ph) * amp * Math.exp(-dk * i / SR / Math.max(0.6, dur * 0.8)); }
  }
  const a = Math.floor(0.004 * SR);
  for (let i = 0; i < a; i++) out[i] *= i / a;
  const rs = Math.floor(dur * SR);
  for (let i = rs; i < n; i++) out[i] *= Math.max(0, 1 - (i - rs) / (0.5 * SR));
  return lp1(out, 2500 + vel * 3000);
}

export function bell(freq, dur, ratio = 3.5, index = 2.5) {
  const n = Math.floor((dur + 1.5) * SR);
  const out = new Float32Array(n);
  let pc = 0, pm = 0;
  for (let i = 0; i < n; i++) {
    const env = Math.exp(-2.2 * i / SR / Math.max(0.5, dur * 0.5));
    pm += freq * ratio / SR; pc += freq / SR;
    out[i] = Math.sin(TAU * pc + index * env * Math.sin(TAU * pm)) * env;
  }
  return out;
}

export function flute(freq, dur, vel = 1) {
  const n = Math.floor((dur + 0.25) * SR);
  const out = tone(freq, dur, { type: 'sine', a: 0.08, d: 0.1, s: 0.85, r: 0.25, vib: 0.006, vibRate: 5 });
  const br = new Float32Array(n);
  for (let i = 0; i < n; i++) br[i] = noise();
  svf(br, freq * 2, 2.5, 'bp');
  const e = adsr(n, 0.05, 0.15, 0.4, 0.2, dur);
  for (let i = 0; i < Math.min(n, out.length); i++) out[i] = out[i] * 0.8 + br[i] * e[i] * 0.25 + Math.sin(TAU * freq * 2 * i / SR) * 0.08 * e[i];
  return out;
}

export function pad(freqs, dur, o = {}) {
  const n = Math.floor((dur + (o.r ?? 1.2)) * SR);
  const out = new Float32Array(n);
  for (const f of freqs) {
    const v = tone(f, dur, { type: o.type || 'saw', a: o.a ?? 0.6, d: 0.3, s: 0.8, r: o.r ?? 1.2, detune: 0.006, vib: 0.002, vibRate: 4.5 });
    for (let i = 0; i < Math.min(n, v.length); i++) out[i] += v[i] / freqs.length;
  }
  return svf(out, o.lp || 1600, 0.7, 'lp');
}

// ------------------------------------------------------------------ drums
export const drum = {
  kick: () => cached('kick', () => { const n = Math.floor(0.45 * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR; const f = 45 + 120 * Math.exp(-t * 28); ph += f / SR; o[i] = Math.sin(TAU * ph) * Math.exp(-t * 7) + (i < 200 ? noise() * 0.3 * (1 - i / 200) : 0); } return o; }),
  snare: () => cached('snare', () => { const n = Math.floor(0.3 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = noise() * Math.exp(-t * 16) * 0.8 + Math.sin(TAU * 185 * t) * Math.exp(-t * 22) * 0.6; } return hp1(o, 400); }),
  hat: () => cached('hat', () => { const n = Math.floor(0.07 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = noise() * Math.exp(-i / SR * 60); return hp1(hp1(o, 7000), 7000); }),
  ohat: () => cached('ohat', () => { const n = Math.floor(0.3 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = noise() * Math.exp(-i / SR * 10); return hp1(hp1(o, 6500), 6500); }),
  crash: () => cached('crash', () => { const n = Math.floor(1.8 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = noise() * Math.exp(-i / SR * 2.4); return hp1(o, 3500); }),
  taiko: () => cached('taiko', () => { const n = Math.floor(0.9 * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR; ph += (62 + 50 * Math.exp(-t * 18)) / SR; o[i] = Math.sin(TAU * ph) * Math.exp(-t * 4.5) + noise() * Math.exp(-t * 40) * 0.35; } return lp1(o, 1800); }),
  ka: () => cached('ka', () => { const n = Math.floor(0.08 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = (Math.sin(TAU * 1400 * i / SR) * 0.6 + noise() * 0.4) * Math.exp(-i / SR * 70); return o; }),
  shaker: () => cached('shaker', () => { const n = Math.floor(0.09 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = noise() * Math.sin(Math.PI * i / n); return hp1(o, 5000); }),
  wood: () => cached('wood', () => { const n = Math.floor(0.12 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = Math.sin(TAU * 900 * i / SR) * Math.exp(-i / SR * 45); return o; }),
  clap: () => cached('clap', () => { const n = Math.floor(0.25 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; const b = t < 0.03 ? (Math.floor(t * 100) % 1 === 0 ? 1 : 0.6) : 1; o[i] = noise() * Math.exp(-t * 18) * b; } return svf(o, 1500, 1.2, 'bp'); }),
};

// ------------------------------------------------------------------ reverb (Schroeder/Freeverb-lite)
export function reverb(buf, mix = 0.25, size = 0.84, damp = 0.35) {
  const combs = [1557, 1617, 1491, 1422], aps = [556, 441];
  for (const [ch, off] of [[buf.L, 0], [buf.R, 23]]) {
    const dry = Float32Array.from(ch);
    const wet = new Float32Array(ch.length);
    for (const cd of combs) {
      const d = cd + off; const line = new Float32Array(d); let idx = 0, filt = 0;
      for (let i = 0; i < ch.length; i++) { const y = line[idx]; filt = y * (1 - damp) + filt * damp; line[idx] = dry[i] * 0.015 + filt * size; wet[i] += y; idx = (idx + 1) % d; }
    }
    for (const ad of aps) {
      const d = ad + off; const line = new Float32Array(d); let idx = 0;
      for (let i = 0; i < ch.length; i++) { const b = line[idx]; const x = wet[i]; line[idx] = x + b * 0.5; wet[i] = b - x; idx = (idx + 1) % d; }
    }
    for (let i = 0; i < ch.length; i++) ch[i] = dry[i] * (1 - mix * 0.5) + wet[i] * mix * 2.2;
  }
  return buf;
}

export { lp1, hp1, svf, noise, adsr };
