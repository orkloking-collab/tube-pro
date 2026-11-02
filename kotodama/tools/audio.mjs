// Mixes the episode soundtrack: music cues (crossfaded) + SFX -> build/ep01.wav (44.1 kHz, 16-bit stereo)
//   node tools/audio.mjs              full episode
//   node tools/audio.mjs cue <name|all>  render cues to build/audio/<name>.wav (QA)
import fs from 'fs';
import path from 'path';
import { ROOT } from '../src/node-env.js';
import { SR } from '../src/audio/synth.js';
import { CUES, renderCue } from '../src/audio/music.js';
import { getSfx } from '../src/audio/sfx.js';

function wavHeader(nFrames) {
  const b = Buffer.alloc(44);
  b.write('RIFF', 0); b.writeUInt32LE(36 + nFrames * 4, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(nFrames * 4, 40);
  return b;
}
function rms(buf) { let s = 0, n = 0; for (let i = 0; i < buf.n; i += 7) { s += buf.L[i] * buf.L[i] + buf.R[i] * buf.R[i]; n += 2; } return Math.sqrt(s / n); }

const cueCache = new Map();
function cue(name) {
  if (!cueCache.has(name)) {
    const t0 = Date.now();
    const b = renderCue(name);
    const r = rms(b) || 1;
    const g = 0.11 / r;
    for (let i = 0; i < b.n; i++) { b.L[i] *= g; b.R[i] *= g; }
    cueCache.set(name, b);
    console.log(`  cue ${name.padEnd(9)} ${(b.n / SR).toFixed(1)}s  rms ${r.toFixed(3)}  (${Date.now() - t0} ms)`);
  }
  return cueCache.get(name);
}

export function mix(ep, outFile) {
  const dur = ep.duration + 1;
  const total = Math.ceil(dur * SR);
  // build music segments
  const evs = [...ep.music].sort((a, b) => a.t - b.t);
  const segs = [];
  let cur = null;
  for (const e of evs) {
    if (cur && cur.cue === e.cue && !e.restart) { cur.vol = e.vol; continue; }
    if (cur) { cur.tOut = e.t; cur.fadeOut = Math.max(0.05, e.fade); }
    cur = e.cue ? { cue: e.cue, t0: e.t, fadeIn: e.fade, vol: e.vol, tOut: dur, fadeOut: 1 } : null;
    if (cur) segs.push(cur);
  }
  for (const s of segs) s.buf = cue(s.cue);
  const sfx = ep.sfx.map((e) => ({ ...e, buf: getSfx(e.name) })).sort((a, b) => a.t - b.t);
  const fd = fs.openSync(outFile, 'w');
  fs.writeSync(fd, wavHeader(total));
  const CH = SR * 5;
  const L = new Float32Array(CH), R = new Float32Array(CH);
  let peak = 0;
  for (let c0 = 0; c0 < total; c0 += CH) {
    const n = Math.min(CH, total - c0);
    L.fill(0); R.fill(0);
    for (const s of segs) {
      const a = Math.round(s.t0 * SR), b = Math.round((s.tOut + s.fadeOut) * SR);
      if (b <= c0 || a >= c0 + n) continue;
      const B = s.buf, len = B.n;
      const fi = Math.max(1, s.fadeIn * SR), fo = Math.max(1, s.fadeOut * SR), outS = s.tOut * SR;
      for (let i = Math.max(0, a - c0); i < Math.min(n, b - c0); i++) {
        const g = i + c0, p = g - a;
        let idx = p;
        if (B.loop) idx = p % len; else if (p >= len) continue;
        let gain = s.vol * Math.min(1, p / fi);
        if (g > outS) gain *= Math.max(0, 1 - (g - outS) / fo);
        L[i] += B.L[idx] * gain; R[i] += B.R[idx] * gain;
      }
    }
    for (const e of sfx) {
      const a = Math.round(e.t * SR), len = Math.floor(e.buf.length / e.rate);
      if (a + len <= c0 || a >= c0 + n) continue;
      const g = 0.55 * e.vol, pan = e.pan || 0;
      const gl = g * Math.cos((pan + 1) * Math.PI / 4) * 1.41, gr = g * Math.sin((pan + 1) * Math.PI / 4) * 1.41;
      for (let i = Math.max(0, a - c0); i < Math.min(n, a + len - c0); i++) {
        const pos = (i + c0 - a) * e.rate, i0 = pos | 0, f = pos - i0;
        const v = e.buf[i0] * (1 - f) + (e.buf[i0 + 1] || 0) * f;
        L[i] += v * gl; R[i] += v * gr;
      }
    }
    const out = Buffer.alloc(n * 4);
    for (let i = 0; i < n; i++) {
      const l = Math.tanh(L[i] * 1.75) * 0.95, r = Math.tanh(R[i] * 1.75) * 0.95;
      peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
      out.writeInt16LE(Math.round(l * 32767), i * 4); out.writeInt16LE(Math.round(r * 32767), i * 4 + 2);
    }
    fs.writeSync(fd, out);
  }
  fs.closeSync(fd);
  return { seconds: total / SR, peak, segments: segs.length, sfx: sfx.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [mode, name] = process.argv.slice(2);
  if (mode === 'cue') {
    const dir = path.join(ROOT, 'build/audio'); fs.mkdirSync(dir, { recursive: true });
    const names = name === 'all' ? Object.keys(CUES) : [name];
    for (const nmx of names) {
      const fake = { duration: (renderCue(nmx).n / SR), music: [{ t: 0, cue: nmx, vol: 0.8, fade: 0.01 }], sfx: [] };
      console.log(nmx, mix(fake, path.join(dir, nmx + '.wav')));
    }
  } else {
    const { buildEpisode } = await import('../src/episode01/script.js');
    const ep = buildEpisode();
    const out = path.join(ROOT, 'build/ep01.wav');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    console.log('mixing', ep.duration.toFixed(1), 's of audio...');
    const t0 = Date.now();
    console.log(mix(ep, out), `${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
}
