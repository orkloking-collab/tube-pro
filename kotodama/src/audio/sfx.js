// Procedural sound effects (mono). Each returns a Float32Array at SR.
import { SR, tone, bell, drum, pluck, mtof, nm, lp1, hp1, svf, srand, rnd, noise } from './synth.js';
const TAU = Math.PI * 2;
const N = (sec) => new Float32Array(Math.floor(sec * SR));
const env = (i, n, a, k) => Math.min(1, i / (a * SR)) * Math.exp(-k * i / SR);

function noiseSweep(sec, f0, f1, q = 2, shape = (u) => Math.sin(Math.PI * u)) {
  const o = N(sec), n = o.length;
  for (let i = 0; i < n; i++) o[i] = noise() * shape(i / n);
  return svf(o, (i) => f0 * Math.pow(f1 / f0, i / n), q, 'bp');
}
function mixInto(a, b, g = 1, off = 0) { const s = Math.floor(off * SR); for (let i = 0; i < b.length && i + s < a.length; i++) a[i + s] += b[i] * g; return a; }
function boom(sec, f0 = 80, f1 = 30, k = 3) { const o = N(sec); let ph = 0; for (let i = 0; i < o.length; i++) { const u = i / o.length; ph += (f1 + (f0 - f1) * Math.exp(-u * 8)) / SR; o[i] = Math.sin(TAU * ph) * Math.exp(-k * i / SR); } return o; }

export const SFX = {
  whoosh: () => noiseSweep(0.45, 300, 2400, 1.5),
  swish: () => noiseSweep(0.22, 1200, 5000, 1.2),
  brush: () => { const o = noiseSweep(0.5, 2500, 1800, 0.8, (u) => Math.sin(Math.PI * u) ** 0.5); return lp1(o, 5000); },
  hit: () => { const o = mixInto(boom(0.35, 160, 50, 12), drum.snare(), 0.6); return o; },
  punch: () => { const o = mixInto(boom(0.3, 200, 60, 14), noiseSweep(0.12, 800, 300, 1), 0.8); return o; },
  bighit: () => { const o = boom(1.4, 120, 28, 3); mixInto(o, drum.crash(), 0.25); mixInto(o, noiseSweep(0.4, 600, 150, 0.8), 0.8); return o; },
  impact: () => { const o = boom(2.2, 90, 22, 1.8); mixInto(o, noiseSweep(1.2, 2000, 80, 0.7, (u) => Math.exp(-u * 4)), 0.7); return o; },
  slash: () => { const o = noiseSweep(0.35, 6000, 1500, 2); mixInto(o, bell(2200, 0.4, 1.41, 2), 0.25); return o; },
  shing: () => { const o = bell(1800, 1.4, 2.76, 3); mixInto(o, noiseSweep(0.3, 4000, 9000, 2), 0.4); return o; },
  sparkle: () => { const o = N(1.4); ['E6', 'G#6', 'B6', 'E7', 'G#7'].forEach((n, i) => mixInto(o, bell(mtof(nm(n)), 0.6, 3.5, 1), 0.25, i * 0.06)); return o; },
  chime: () => { const o = N(2.5); mixInto(o, bell(mtof(nm('A5')), 2, 3.5, 1.5), 0.5); mixInto(o, bell(mtof(nm('E6')), 2, 3.5, 1.5), 0.3, 0.12); return o; },
  erase: () => { srand(9); const o = N(1.4); for (let i = 0; i < o.length; i++) { const u = i / o.length; o[i] = (rnd() < 0.02 + 0.08 * (1 - u) ? noise() : 0) * Math.sin(Math.PI * u); } mixInto(o, noiseSweep(1.3, 4000, 9000, 0.7), 0.3); return hp1(o, 900); },
  vanish: () => { const o = noiseSweep(0.9, 800, 8000, 1.2, (u) => u * u); mixInto(o, bell(mtof(nm('B6')), 0.6, 3.5, 2), 0.2, 0.7); return o; },
  splash: () => { const o = noiseSweep(0.5, 1800, 400, 0.9, (u) => Math.exp(-u * 5)); return mixInto(o, boom(0.2, 300, 100, 20), 0.4); },
  step: () => lp1(boom(0.12, 120, 60, 30), 800),
  boing: () => tone(220, 0.5, { type: 'sine', a: 0.005, s: 0.9, r: 0.1, vib: 0.08, vibRate: 14, slide: 12 }),
  pop: () => tone(900, 0.08, { type: 'sine', a: 0.002, d: 0.05, s: 0.2, r: 0.04, slide: 7 }),
  fire: () => { srand(3); const o = N(1.8); for (let i = 0; i < o.length; i++) { const u = i / o.length; o[i] = (noise() * 0.3 + (rnd() < 0.004 ? noise() * 3 : 0)) * Math.sin(Math.PI * u); } svf(o, 1200, 0.6, 'lp'); return mixInto(o, boom(1.6, 60, 40, 1.5), 0.4); },
  water: () => noiseSweep(1.2, 600, 2500, 0.6, (u) => Math.sin(Math.PI * u) * (0.6 + 0.4 * Math.sin(u * 40))),
  wind: () => noiseSweep(2.2, 300, 900, 3, (u) => Math.sin(Math.PI * u)),
  thunder: () => { const o = boom(3, 70, 25, 1.2); mixInto(o, lp1(noiseSweep(2.8, 400, 60, 0.5, (u) => Math.exp(-u * 2)), 600), 1.2); return o; },
  explosion: () => { const o = boom(2.5, 70, 20, 1.5); mixInto(o, lp1(noiseSweep(2.4, 3000, 100, 0.5, (u) => Math.exp(-u * 3)), 3000), 1.0); return o; },
  roar: () => { const o = N(2); let ph = 0; for (let i = 0; i < o.length; i++) { const u = i / o.length; ph += (70 + 30 * Math.sin(u * 3) + 8 * Math.sin(i / SR * 60)) / SR; o[i] = ((ph % 1) * 2 - 1) * Math.sin(Math.PI * Math.min(1, u * 4)) * (1 - u); } svf(o, 900, 1.5, 'lp'); return mixInto(o, noiseSweep(2, 400, 200, 1), 0.6); },
  dragon: () => { const o = N(2.2); let ph = 0; for (let i = 0; i < o.length; i++) { const u = i / o.length; ph += (180 + 120 * Math.sin(u * Math.PI) + 15 * Math.sin(i / SR * 40)) / SR; o[i] = ((ph % 1) * 2 - 1) * Math.sin(Math.PI * u); } svf(o, 1600, 2, 'bp'); return mixInto(o, noiseSweep(2.2, 600, 2400, 1), 0.5); },
  gong: () => { const o = bell(110, 4, 1.4, 4); mixInto(o, bell(165, 4, 2.1, 3), 0.4); return o; },
  temple: () => { const o = bell(98, 5, 2.0, 2.2); mixInto(o, bell(196.5, 5, 2.0, 1), 0.3); return o; },
  kanji: () => { const o = noiseSweep(0.8, 1500, 3000, 1, (u) => Math.sin(Math.PI * u)); mixInto(o, bell(mtof(nm('D6')), 1.5, 3.5, 1.2), 0.3, 0.5); return o; },
  glow: () => { const o = N(2); for (const n of ['D5', 'A5', 'D6']) mixInto(o, tone(mtof(nm(n)), 1.5, { type: 'sine', a: 0.4, s: 0.8, r: 0.5, vib: 0.004 }), 0.25); return o; },
  heartbeat: () => { const o = N(1); mixInto(o, lp1(boom(0.25, 70, 40, 14), 300), 1); mixInto(o, lp1(boom(0.25, 60, 35, 14), 300), 0.7, 0.28); return o; },
  riser: () => { const o = noiseSweep(2.2, 200, 6000, 1.2, (u) => u * u); mixInto(o, tone(110, 2, { type: 'saw', a: 2, s: 1, r: 0.05, slide: 24, lp: 2500 }), 0.25); return o; },
  drop: () => boom(1.8, 110, 25, 1.6),
  crack: () => { const o = N(0.6); for (let i = 0; i < o.length; i++) o[i] = (i < 300 ? noise() : 0) + (i % 2000 < 40 && i < 9000 ? noise() * 0.6 : 0); mixInto(o, bell(3100, 0.4, 2.3, 2), 0.3); return hp1(o, 1200); },
  shatter: () => { srand(5); const o = N(1.2); for (let k = 0; k < 30; k++) mixInto(o, bell(2000 + rnd() * 5000, 0.15, 1 + rnd() * 3, 2), 0.1, rnd() * 0.8); return mixInto(o, noiseSweep(0.5, 5000, 2000, 0.8), 0.5); },
  sting: () => { const o = N(2.2); for (const n of ['C3', 'F#3', 'C4', 'Db4']) mixInto(o, tone(mtof(nm(n)), 1.4, { type: 'saw', a: 0.005, d: 0.3, s: 0.6, r: 0.6, lp: 1600, detune: 0.005 }), 0.22); mixInto(o, boom(1.5, 80, 30, 2), 0.6); return o; },
  dun: () => { const o = N(3); [['D3', 0], ['D3', 0.45], ['F3', 0.9]].forEach(([n, t], i) => mixInto(o, tone(mtof(nm(n)), i === 2 ? 1.6 : 0.3, { type: 'saw', a: 0.005, d: 0.2, s: 0.7, r: 0.4, lp: 1400, detune: 0.004 }), 0.35, t)); return o; },
  fail: () => { const o = N(2.6); [['G3', 0, 0.4], ['F#3', 0.45, 0.4], ['F3', 0.9, 0.4], ['E3', 1.35, 1.1]].forEach(([n, t, d], i) => mixInto(o, tone(mtof(nm(n)), d, { type: 'saw', a: 0.02, s: 0.8, r: 0.1, lp: 1100, vib: i === 3 ? 0.03 : 0.004, vibRate: 7, slide: i === 3 ? -2 : 0 }), 0.4, t)); return o; },
  tada: () => { const o = N(1.6); for (const [n, t] of [['C5', 0], ['E5', 0.08], ['G5', 0.16], ['C6', 0.24]]) mixInto(o, tone(mtof(nm(n)), 0.9, { type: 'square', a: 0.005, s: 0.5, r: 0.3, lp: 3000 }), 0.12, t); return o; },
  zoom: () => noiseSweep(0.4, 400, 7000, 2, (u) => u),
  thud: () => lp1(mixInto(boom(0.5, 100, 40, 8), noiseSweep(0.2, 500, 200, 0.6), 0.5), 1200),
  bonk: () => { const o = tone(520, 0.12, { type: 'sine', a: 0.001, d: 0.1, s: 0.1, r: 0.05 }); return mixInto(o, drum.wood(), 0.8); },
  bird: () => { const o = N(1); for (let k = 0; k < 3; k++) mixInto(o, tone(3200, 0.08, { type: 'sine', a: 0.005, s: 0.5, r: 0.03, slide: 5 }), 0.15, k * 0.14); return o; },
  crowd: () => { srand(42); const o = N(3); for (let i = 0; i < o.length; i++) o[i] = noise() * (0.6 + 0.4 * Math.sin(i / SR * 6 + Math.sin(i / SR * 1.7) * 3)); return svf(o, 700, 0.8, 'bp'); },
  gasp: () => noiseSweep(0.5, 900, 1800, 2, (u) => Math.sin(Math.PI * u)),
  bubble: () => { const o = N(0.5); for (let k = 0; k < 4; k++) mixInto(o, tone(400 + k * 150, 0.06, { type: 'sine', a: 0.002, s: 0.4, r: 0.02, slide: 10 }), 0.25, k * 0.09); return o; },
  scribble: () => { const o = N(1.2); srand(17); for (let i = 0; i < o.length; i++) { const u = i / o.length; o[i] = noise() * (0.5 + 0.5 * Math.sin(i / SR * 50 + Math.sin(i / SR * 13) * 4)) * Math.sin(Math.PI * u); } return svf(o, 2200, 1.3, 'bp'); },
  power: () => { const o = noiseSweep(2.5, 100, 3000, 0.8, (u) => u); mixInto(o, tone(55, 2.5, { type: 'saw', a: 1.5, s: 1, r: 0.3, lp: 400, drive: 2 }), 0.5); return o; },
  tick: () => drum.wood(),
  rumble: () => lp1(noiseSweep(3, 60, 120, 0.4), 300),
};

const cache = new Map();
export function getSfx(name) {
  if (!SFX[name]) throw new Error('unknown sfx ' + name);
  if (!cache.has(name)) {
    srand(name.length * 131 + name.charCodeAt(0));
    const b = SFX[name]();
    let pk = 0; for (let i = 0; i < b.length; i++) pk = Math.max(pk, Math.abs(b[i]));
    if (pk > 0) for (let i = 0; i < b.length; i++) b[i] *= 0.9 / pk;
    cache.set(name, b);
  }
  return cache.get(name);
}
