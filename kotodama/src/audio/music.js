// Score of KOTODAMA Episode 1. Every cue is composed here as code.
import { Stereo, SR, mtof, nm, pluck, tone, piano, bell, flute, pad, drum, reverb, srand, rnd, lp1, svf } from './synth.js';

// ------------------------------------------------------------------ helpers
const ROOT = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
function chord(sym, oct = 3) {
  const m = /^([A-G][#b]?)(.*)$/.exec(sym);
  const r = ROOT[m[1]] + 12 * (oct + 1);
  const q = m[2];
  const iv = q === 'm' ? [0, 3, 7] : q === '7' ? [0, 4, 7, 10] : q === 'm7' ? [0, 3, 7, 10] : q === 'sus4' ? [0, 5, 7] : q === 'dim' ? [0, 3, 6] : q === '5' ? [0, 7, 12] : q === 'add9' ? [0, 4, 7, 14] : [0, 4, 7];
  return iv.map((i) => r + i);
}
const rootOf = (sym, oct = 2) => chord(sym, oct)[0];
function mel(str, tr = 0) {
  return str.trim().split(/\s+/).filter((x) => x !== '|').map((tok) => { const [n, d] = tok.split(':'); return [n === 'r' ? null : nm(n) + tr, parseFloat(d)]; });
}
function playMel(buf, spb, beat, notes, inst, gain = 0.3, pan = 0) {
  let b = beat;
  for (const [m, d] of notes) { if (m != null) buf.add(inst(mtof(m), d * spb), b * spb, gain, pan); b += d; }
  return b;
}
const koto = (f, d) => pluck(f, Math.max(d, 0.4), 0.75, 0.9975);
const pizz = (f, d) => pluck(f, Math.min(d, 0.25), 0.4, 0.99);
const lead = (f, d) => tone(f, d * 0.95, { type: 'saw', detune: 0.004, a: 0.015, d: 0.2, s: 0.75, r: 0.12, vib: 0.005, vibRate: 5.8, lp: 2800, drive: 1.6 });
const brass = (f, d) => tone(f, d * 0.95, { type: 'saw', detune: 0.003, a: 0.06, d: 0.2, s: 0.8, r: 0.25, vib: 0.003, lp: 1700 });
const clar = (f, d) => tone(f, d * 0.7, { type: 'square', a: 0.01, d: 0.08, s: 0.6, r: 0.06, lp: 1500 });
const strg = (f, d) => tone(f, d * 0.9, { type: 'saw', detune: 0.005, a: 0.005, d: 0.08, s: 0.4, r: 0.08, lp: 1100 });
const shaku = (f, d) => flute(f, d, 1);
const mbox = (f, d) => bell(f, Math.max(0.6, d), 4, 1.2);
function power(buf, spb, beat, sym, dur, gain = 0.16, mute = false) {
  const r = rootOf(sym, 2) + 12;
  for (const m of [r, r + 7, r + 12]) buf.add(tone(mtof(m), dur * spb, { type: 'saw', detune: 0.004, a: 0.005, d: 0.1, s: 0.8, r: 0.06, drive: 4, lp: mute ? 900 : 2200 }), beat * spb, gain / 3 * 2, (m % 3 - 1) * 0.3);
}
function padChord(buf, spb, beat, sym, beats, gain = 0.12, o = {}) {
  buf.add(pad(chord(sym, o.oct ?? 3).map(mtof), beats * spb, o), beat * spb, gain, 0);
}
function hit(buf, spb, beat, name, gain = 0.5, pan = 0) { buf.add(drum[name](), beat * spb, gain, pan); }
function rock(buf, spb, bar0, nBars, o = {}) {
  for (let b = 0; b < nBars; b++) {
    const B = (bar0 + b) * 4;
    if (o.half) { hit(buf, spb, B, 'kick', 0.8); hit(buf, spb, B + 2, 'snare', 0.5); }
    else {
      hit(buf, spb, B, 'kick', 0.85); hit(buf, spb, B + 2, 'kick', 0.8); if (o.drive) { hit(buf, spb, B + 2.5, 'kick', 0.6); hit(buf, spb, B + 1.5, 'kick', 0.5); }
      hit(buf, spb, B + 1, 'snare', 0.55); hit(buf, spb, B + 3, 'snare', 0.55);
    }
    for (let e = 0; e < 8; e++) hit(buf, spb, B + e * 0.5, o.open && e % 2 ? 'ohat' : 'hat', e % 2 ? 0.14 : 0.2, 0.3);
    if (b === 0 && o.crash !== false) hit(buf, spb, B, 'crash', 0.35, -0.3);
  }
}
function fill(buf, spb, beat) { for (let i = 0; i < 8; i++) hit(buf, spb, beat + i * 0.25, i % 2 ? 'snare' : 'taiko', 0.3 + i * 0.05); }
function bassLine(buf, spb, bar0, chords, o = {}) {
  chords.forEach((c, i) => {
    const r = rootOf(c, 1) + 12;
    for (let e = 0; e < 8; e++) {
      const m = o.octave && e % 2 ? r + 12 : r;
      if (o.pattern === 'half' && e % 4) continue;
      buf.add(tone(mtof(m), (o.pattern === 'half' ? 1.9 : 0.45) * spb, { type: 'saw', a: 0.005, d: 0.1, s: 0.6, r: 0.05, lp: 500, drive: 1.5 }), ((bar0 + i) * 4 + e * 0.5) * spb, o.gain ?? 0.32, 0);
    }
  });
}
function arp(buf, spb, bar0, chords, inst, o = {}) {
  const pat = o.pat || [0, 1, 2, 3, 2, 1, 2, 3];
  chords.forEach((c, i) => {
    const n = chord(c, o.oct ?? 4); const ext = [n[0], n[1], n[2], n[0] + 12, n[1] + 12, n[2] + 12];
    pat.forEach((p, e) => { const step = 4 / pat.length; buf.add(inst(mtof(ext[p]), step * spb * 1.6), ((bar0 + i) * 4 + e * step) * spb, o.gain ?? 0.16, o.pan ?? 0.2); });
  });
}

// ------------------------------------------------------------------ the cues
const OP_HOOK = 'C5:1 D5:.5 E5:1.5 F5:.5 E5:.5 | D5:1 B4:.5 G4:1.5 A4:.5 B4:.5 | E5:1 D5:.5 B4:1.5 G4:.5 B4:.5 | C5:1.5 B4:.5 A4:2 | C5:1 D5:.5 E5:1.5 G5:.5 A5:.5 | G5:1 F5:.5 E5:1 D5:.5 D5:1 | E5:1 G5:1 E5:1 D5:1 | C5:1 B4:.5 C5:2.5';
const OP_CH = ['F', 'G', 'Em', 'Am', 'F', 'G', 'Em', 'Am'];

function genOP(buf, spb) {
  // "Kakeru Sora" — J-rock opening, royal-road progression, last chorus modulates up a whole step
  const intro = ['F', 'G', 'Em', 'Am'];
  arp(buf, spb, 0, intro, koto, { gain: 0.2, oct: 4 });
  intro.forEach((c, i) => power(buf, spb, i * 4, c, 0.5, 0.18));
  fill(buf, spb, 14);
  const verse = ['Am', 'F', 'G', 'Em', 'Am', 'F', 'G', 'Em'];
  rock(buf, spb, 4, 8, { half: false });
  bassLine(buf, spb, 4, verse, { gain: 0.28 });
  verse.forEach((c, i) => power(buf, spb, (4 + i) * 4, c, 3.8, 0.08));
  playMel(buf, spb, 16, mel('A4:.5 A4:.5 C5:1 A4:.5 G4:.5 E4:1 | F4:.5 A4:.5 C5:1 A4:1 r:1 | G4:.5 B4:.5 D5:1 B4:.5 A4:.5 G4:1 | E4:1 G4:1 B4:2 | A4:.5 C5:.5 E5:1 D5:.5 C5:.5 A4:1 | F4:.5 A4:.5 C5:1 D5:1 C5:1 | B4:1 D5:1 G5:1 F5:.5 E5:.5 | E5:2 D5:1 B4:1'), lead, 0.24, 0);
  const pre = ['Dm', 'Em', 'F', 'G'];
  rock(buf, spb, 12, 4, { half: true });
  bassLine(buf, spb, 12, pre, { pattern: 'half', gain: 0.3 });
  pre.forEach((c, i) => padChord(buf, spb, (12 + i) * 4, c, 4, 0.1));
  playMel(buf, spb, 48, mel('D5:1 E5:1 F5:1 E5:1 | E5:1 F5:1 G5:1 F5:1 | F5:1 G5:1 A5:1 G5:1 | G5:4'), lead, 0.24);
  fill(buf, spb, 62);
  const chorus = (bar, tr) => {
    const ch = OP_CH.map((c) => transposeSym(c, tr));
    rock(buf, spb, bar, 8, { drive: true, open: true });
    bassLine(buf, spb, bar, ch, { octave: true, gain: 0.3 });
    ch.forEach((c, i) => { for (let e = 0; e < 8; e++) power(buf, spb, (bar + i) * 4 + e * 0.5, c, 0.4, 0.09, true); padChord(buf, spb, (bar + i) * 4, c, 4, 0.07, { oct: 4 }); });
    playMel(buf, spb, bar * 4, mel(OP_HOOK, tr), lead, 0.27);
    playMel(buf, spb, bar * 4, mel(OP_HOOK, tr + 12), koto, 0.07, 0.4);
  };
  chorus(16, 0);
  const inter = ['Am', 'F', 'G', 'E'];
  rock(buf, spb, 24, 4, {});
  bassLine(buf, spb, 24, inter, {});
  playMel(buf, spb, 96, mel('A5:.5 E5:.5 A5:.5 B5:.5 C6:1 B5:.5 A5:.5 | F5:.5 A5:.5 C6:.5 A5:.5 F5:2 | G5:.5 B5:.5 D6:.5 B5:.5 G5:1 A5:.5 B5:.5 | G#5:2 E5:2'), koto, 0.22, -0.2);
  inter.forEach((c, i) => power(buf, spb, (24 + i) * 4, c, 3.8, 0.1));
  chorus(28, 0);
  const bridge = ['F', 'G', 'Em', 'Am'];
  bridge.forEach((c, i) => { padChord(buf, spb, (36 + i) * 4, c, 4, 0.14); });
  arp(buf, spb, 36, bridge, (f, d) => piano(f, d, 0.6), { gain: 0.22, oct: 4 });
  playMel(buf, spb, 144, mel('A5:2 G5:1 E5:1 | D5:2 E5:1 G5:1 | B4:2 D5:1 E5:1 | C5:4'), flute, 0.22);
  fill(buf, spb, 158);
  chorus(40, 2);
  // final hit
  power(buf, spb, 47 * 4 + 2, 'B', 2, 0.25);
  hit(buf, spb, 47 * 4 + 2, 'crash', 0.5); hit(buf, spb, 47 * 4 + 2, 'kick', 0.9); hit(buf, spb, 47 * 4 + 2, 'taiko', 0.8);
}
function transposeSym(sym, tr) {
  if (!tr) return sym;
  const m = /^([A-G][#b]?)(.*)$/.exec(sym);
  const names = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  return names[(ROOT[m[1]] + tr + 12) % 12] + m[2];
}

function genED(buf, spb) {
  // "Sumi to Hoshi" (Ink and Stars) — piano ballad
  const prog = ['F', 'G', 'Em', 'Am', 'Dm', 'G', 'C', 'C'];
  const all = [...prog, ...prog, ...prog, 'F', 'G', 'Am', 'F', 'G', 'C'];
  all.forEach((c, i) => {
    const r = rootOf(c, 2);
    buf.add(piano(mtof(r), 4 * spb, 0.5), i * 4 * spb, 0.26, -0.2);
    buf.add(piano(mtof(r + 12), 4 * spb, 0.5), i * 4 * spb, 0.12, -0.2);
    padChord(buf, spb, i * 4, c, 4, 0.06, { lp: 1200 });
  });
  arp(buf, spb, 0, all, (f, d) => piano(f, d, 0.5), { gain: 0.15, oct: 4, pat: [0, 1, 2, 3, 2, 1, 0, 1] });
  const verse = 'A5:1.5 G5:.5 F5:1 E5:1 | D5:1.5 E5:.5 G5:2 | G5:1 E5:1 D5:1 B4:1 | C5:2 A4:2 | A4:1 D5:1 F5:1 A5:1 | G5:1.5 F5:.5 E5:1 D5:1 | E5:4 | r:4';
  playMel(buf, spb, 32, mel(verse), flute, 0.22, 0.1);
  playMel(buf, spb, 64, mel(verse), flute, 0.22, 0.1);
  playMel(buf, spb, 64, mel(verse, -12), (f, d) => piano(f, d, 0.7), 0.14, 0.2);
  playMel(buf, spb, 96, mel('A5:2 G5:2 | G5:2 F5:1 D5:1 | E5:2 C5:2 | A4:2 B4:2 | C5:8'), flute, 0.2, 0.1);
  hit(buf, spb, 116, 'crash', 0.1);
}

function genDaily(buf, spb) {
  const ch = ['D', 'G', 'D', 'A', 'Bm', 'G', 'A', 'D'];
  arp(buf, spb, 0, ch, koto, { gain: 0.15, oct: 4, pat: [0, 2, 3, 2, 4, 2, 3, 2] });
  ch.forEach((c, i) => { buf.add(pizz(mtof(rootOf(c, 2)), 0.5), i * 4 * spb, 0.35); buf.add(pizz(mtof(rootOf(c, 2) + 7), 0.5), (i * 4 + 2) * spb, 0.3); });
  for (let b = 0; b < 32; b++) { hit(buf, spb, b, 'shaker', 0.1, 0.4); hit(buf, spb, b + 0.5, 'shaker', 0.16, 0.4); if (b % 4 === 3) hit(buf, spb, b + 0.5, 'wood', 0.12, -0.4); }
  playMel(buf, spb, 0, mel('A5:1 B5:.5 A5:.5 F#5:1 E5:1 | D5:1.5 E5:.5 B4:2 | F#5:1 A5:.5 B5:.5 A5:1 F#5:1 | E5:3 r:1 | F#5:1 D5:.5 B4:.5 D5:1 F#5:1 | B5:1.5 A5:.5 F#5:1 E5:1 | E5:1 F#5:.5 E5:.5 C#5:1 A4:1 | D5:3 r:1'), flute, 0.2, -0.1);
}

function genComedy(buf, spb) {
  const ch = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'];
  ch.forEach((c, i) => {
    const B = i * 4, r = rootOf(c, 2);
    buf.add(pizz(mtof(r), 0.3), B * spb, 0.4); buf.add(pizz(mtof(r + 7), 0.3), (B + 2) * spb, 0.35);
    for (const off of [1, 3]) chord(c, 4).forEach((m) => buf.add(pizz(mtof(m), 0.15), (B + off) * spb, 0.1, 0.3));
  });
  for (let b = 0; b < 32; b++) hit(buf, spb, b + 0.5, 'wood', 0.08, b % 2 ? 0.5 : -0.5);
  playMel(buf, spb, 0, mel('E5:.5 r:.5 G5:.5 r:.5 C6:.5 B5:.5 A5:.5 G5:.5 | D5:.5 r:.5 G5:.5 r:.5 B5:1 r:1 | C5:.5 E5:.5 A5:.5 E5:.5 C6:1 A5:1 | F5:.5 A5:.5 G5:.5 F5:.5 E5:1 r:1 | E5:.5 r:.5 G5:.5 r:.5 C6:.5 D6:.5 E6:.5 C6:.5 | B5:.5 G5:.5 D5:.5 G5:.5 B5:1 r:1 | A5:.5 G5:.5 F5:.5 E5:.5 D5:.5 E5:.5 F5:.5 A5:.5 | G5:1 r:.5 G4:.5 G4:2'), clar, 0.18, 0);
}

function genExam(buf, spb) {
  for (let b = 0; b < 8; b++) {
    const B = b * 4;
    hit(buf, spb, B, 'taiko', 0.7); hit(buf, spb, B + 1.5, 'taiko', 0.35); hit(buf, spb, B + 2, 'taiko', 0.6); hit(buf, spb, B + 3, 'ka', 0.3); hit(buf, spb, B + 3.5, 'ka', 0.25);
  }
  buf.add(pad([mtof(nm('E2')), mtof(nm('B2')), mtof(nm('E3'))], 32 * spb, { lp: 600, a: 2, r: 2 }), 0, 0.22);
  playMel(buf, spb, 0, mel('E5:2 F5:1 E5:1 | r:4 | A5:1.5 B5:.5 C6:2 | B5:4 | A5:1 B5:1 A5:1 F5:1 | E5:4 | F5:1 E5:1 C5:1 B4:1 | E5:4'), shaku, 0.22, 0.15);
  const inS = ['E4', 'F4', 'A4', 'B4', 'C5', 'E5'];
  srand(77);
  for (let b = 0; b < 32; b += 0.5) if (rnd() < 0.22) buf.add(koto(mtof(nm(inS[Math.floor(rnd() * inS.length)])), 0.8), b * spb, 0.12, -0.3);
}

function genDragon(buf, spb) {
  const ch = ['Dm', 'Dm', 'Bb', 'Bb', 'F', 'F', 'C', 'A'];
  ch.forEach((c, i) => { padChord(buf, spb, i * 4, c, 4, 0.16, { lp: 2200, a: 0.4 }); hit(buf, spb, i * 4, 'taiko', 0.6); hit(buf, spb, i * 4 + 2.5, 'taiko', 0.3); });
  arp(buf, spb, 0, ch, (f, d) => bell(f, d, 3.5, 1.4), { gain: 0.06, oct: 5, pat: [0, 1, 2, 3] });
  playMel(buf, spb, 0, mel('D4:2 F4:1 A4:1 | A4:3 G4:1 | F4:2 D5:2 | C5:3 Bb4:1 | A4:2 C5:1 F5:1 | F5:3 E5:1 | E5:2 G5:2 | E5:2 C#5:2'), brass, 0.22, 0);
  hit(buf, spb, 0, 'crash', 0.3);
}

function genSad(buf, spb) {
  const ch = ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'E'];
  ch.forEach((c, i) => { buf.add(piano(mtof(rootOf(c, 2)), 4 * spb, 0.4), i * 4 * spb, 0.25, -0.2); padChord(buf, spb, i * 4, c, 4, 0.07, { lp: 900, a: 1 }); });
  arp(buf, spb, 0, ch, (f, d) => piano(f, d, 0.4), { gain: 0.13, oct: 4, pat: [0, 1, 2, 1, 3, 1, 2, 1] });
  playMel(buf, spb, 16, mel('E5:2 D5:1 C5:1 | C5:2 A4:2 | B4:2 C5:1 D5:1 | B4:2 G#4:2'), (f, d) => piano(f, d, 0.7), 0.2, 0.2);
}

function genMemory(buf, spb) {
  const ch = ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'];
  ch.forEach((c, i) => padChord(buf, spb, i * 4, c, 4, 0.08, { lp: 1000, a: 1, type: 'tri' }));
  playMel(buf, spb, 0, mel('E6:1 G6:1 C7:1 G6:1 | A6:2 G6:2 | F6:1 E6:1 D6:1 C6:1 | D6:4 | E6:1 G6:1 C7:1 G6:1 | A6:2 C7:2 | B6:1 A6:1 G6:1 F6:1 | G6:4'), mbox, 0.16, 0.1);
  arp(buf, spb, 0, ch, mbox, { gain: 0.04, oct: 5, pat: [0, 2, 1, 2] });
}

function genMystery(buf, spb) {
  buf.add(pad([mtof(nm('E2')), mtof(nm('B2'))], 32 * spb, { lp: 500, a: 3, r: 3 }), 0, 0.25);
  const inS = ['E4', 'F4', 'A4', 'B4', 'C5', 'E5', 'F5'];
  srand(311);
  for (let b = 0; b < 32; b += 1) if (rnd() < 0.35) buf.add(koto(mtof(nm(inS[Math.floor(rnd() * inS.length)])), 1.2), b * spb, 0.16, rnd() - 0.5);
  playMel(buf, spb, 4, mel('B4:3 C5:1 | B4:2 A4:2 | E4:8 | r:4 | F5:2 E5:2 | C5:3 B4:1 | A4:6'), shaku, 0.2, 0.2);
  buf.add(bell(mtof(nm('E6')), 3, 3.5, 2), 0, 0.06); buf.add(bell(mtof(nm('B5')), 3, 3.5, 2), 16 * spb, 0.06);
}

function genDanger(buf, spb) {
  const ost = mel('D3:.5 D3:.5 D3:.5 F3:.5 D3:.5 D3:.5 E3:.5 C3:.5');
  for (let b = 0; b < 8; b++) {
    playMel(buf, spb, b * 4, ost.map(([m, d]) => [m + (b >= 4 && b < 6 ? 3 : 0), d]), strg, 0.22, -0.1);
    hit(buf, spb, b * 4, 'taiko', 0.65); hit(buf, spb, b * 4 + 1.5, 'taiko', 0.4); hit(buf, spb, b * 4 + 2, 'taiko', 0.55);
  }
  buf.add(pad([mtof(nm('D3')), mtof(nm('F3')), mtof(nm('G#3'))], 32 * spb, { lp: 900, a: 2, r: 2 }), 0, 0.12);
  for (let b = 0; b < 32; b += 0.125) buf.add(tone(mtof(nm('A5')), 0.1, { type: 'saw', a: 0.005, d: 0.05, s: 0.5, r: 0.03, lp: 3000 }), b * spb, 0.025, 0.4);
}

function genBattle(buf, spb) {
  const ch = ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'C', 'B', 'Em', 'Em', 'C', 'D', 'Am', 'C', 'D', 'B'];
  rock(buf, spb, 0, 16, { drive: true });
  for (let b = 0; b < 16; b += 4) { hit(buf, spb, b * 4, 'taiko', 0.7); hit(buf, spb, b * 4 + 0.5, 'taiko', 0.5); }
  ch.forEach((c, i) => {
    const r = rootOf(c, 1) + 12;
    const bassPat = [0, 0, 12, 0, 7, 0, 10, 12];
    bassPat.forEach((iv, e) => buf.add(tone(mtof(r + iv), 0.42 * spb, { type: 'saw', a: 0.003, d: 0.08, s: 0.6, r: 0.04, lp: 650, drive: 2 }), (i * 4 + e * 0.5) * spb, 0.3));
    for (let e = 0; e < 8; e++) if (e !== 3 && e !== 7) power(buf, spb, i * 4 + e * 0.5, c, 0.35, 0.08, true);
    padChord(buf, spb, i * 4, c, 4, 0.05, { oct: 4, lp: 2400 });
  });
  const riff = 'E5:.5 G5:.5 A5:.5 B5:1 A5:.5 G5:.5 E5:.5 | D5:1 E5:3 | C5:.5 E5:.5 G5:.5 C6:1 B5:.5 A5:.5 G5:.5 | F#5:2 D5:2 | E5:.5 G5:.5 A5:.5 B5:1 D6:.5 B5:.5 A5:.5 | G5:1 A5:1 B5:2 | C6:1 B5:.5 A5:.5 G5:1 E5:1 | D#5:4';
  playMel(buf, spb, 0, mel(riff), lead, 0.22, 0.1);
  playMel(buf, spb, 32, mel(riff, 12).map(([m, d]) => [m, d]), koto, 0.12, -0.2);
  playMel(buf, spb, 32, mel(riff), lead, 0.2, 0.1);
}

function genDespair(buf, spb) {
  const ch = ['Cm', 'Ab', 'Fm', 'G', 'Cm', 'Ab', 'Fm', 'G'];
  ch.forEach((c, i) => { padChord(buf, spb, i * 4, c, 4, 0.16, { lp: 800, a: 1.2 }); buf.add(tone(mtof(rootOf(c, 1) + 12), 4 * spb, { type: 'saw', a: 0.8, s: 0.8, r: 1, lp: 300 }), i * 4 * spb, 0.2); });
  for (let b = 0; b < 32; b += 2) { hit(buf, spb, b, 'kick', 0.3); hit(buf, spb, b + 0.35, 'kick', 0.2); }
  playMel(buf, spb, 8, mel('G5:3 F5:1 | Eb5:4 | r:4 | C6:3 B5:1 | B5:4 | r:8'), (f, d) => piano(f, d, 0.5), 0.17, 0.2);
}

function genAwaken(buf, spb) {
  // hero theme: the OP hook returns over a choir
  const ch = ['Am', 'F', 'G', 'E', 'Am', 'F', 'G', 'G'];
  ch.forEach((c, i) => { padChord(buf, spb, i * 4, c, 4, 0.14, { lp: 1400, type: 'tri', a: 0.8 }); hit(buf, spb, i * 4, 'taiko', 0.7); hit(buf, spb, i * 4 + 2, 'taiko', 0.5); });
  for (let i = 0; i < 16; i++) hit(buf, spb, 28 + i * 0.25, i % 2 ? 'snare' : 'taiko', 0.15 + i * 0.03);
  playMel(buf, spb, 0, mel('A4:4 | C5:4 | B4:4 | G#4:4 | A4:2 C5:2 | F5:4 | D5:2 E5:2 | G5:4'), brass, 0.2);
  rock(buf, spb, 8, 8, { drive: true, open: true });
  bassLine(buf, spb, 8, OP_CH, { octave: true, gain: 0.3 });
  OP_CH.forEach((c, i) => { padChord(buf, spb, (8 + i) * 4, c, 4, 0.12, { oct: 4, type: 'tri', lp: 2000 }); power(buf, spb, (8 + i) * 4, c, 3.8, 0.1); });
  playMel(buf, spb, 32, mel(OP_HOOK), lead, 0.28);
  playMel(buf, spb, 32, mel(OP_HOOK, -12), brass, 0.14);
}

function genVillain(buf, spb) {
  buf.add(pad([mtof(nm('C2')), mtof(nm('F#2'))], 32 * spb, { lp: 400, a: 3, r: 3 }), 0, 0.3);
  srand(666);
  for (let b = 0; b < 32; b += 2) if (rnd() < 0.6) buf.add(bell(mtof(60 + Math.floor(rnd() * 24)), 4, 1.41, 3), b * spb, 0.07, rnd() * 2 - 1);
  for (const b of [0, 8, 16, 24]) buf.add(pad([mtof(nm('C4')), mtof(nm('C#4')), mtof(nm('G4'))], 4 * spb, { a: 3.5 * spb, r: 0.05, lp: 1800 }), b * spb, 0.09);
  for (const b of [0, 16]) hit(buf, spb, b, 'taiko', 0.5);
}

function genLegend(buf, spb) {
  buf.add(pad([mtof(nm('D2')), mtof(nm('A2')), mtof(nm('D3'))], 32 * spb, { lp: 700, a: 3, r: 3 }), 0, 0.2);
  const inS = ['D4', 'Eb4', 'G4', 'A4', 'Bb4', 'D5'];
  [0, 1, 2, 3, 4, 3, 2, 1].forEach((k, i) => buf.add(koto(mtof(nm(inS[k])), 1), i * 4 * spb, 0.2, -0.2));
  [5, 4, 3, 2].forEach((k, i) => buf.add(koto(mtof(nm(inS[k])), 1), (i * 8 + 2) * spb, 0.14, 0.2));
  for (const b of [0, 8, 16, 24]) hit(buf, spb, b, 'taiko', 0.4);
  playMel(buf, spb, 8, mel('A4:3 Bb4:1 | A4:2 G4:2 | D4:4 | r:4 | G4:2 A4:2 | Bb4:2 D5:2 | A4:8'), shaku, 0.2, 0.2);
  // wind
  const n = 32 * spb * SR | 0; const w = new Float32Array(n); for (let i = 0; i < n; i++) w[i] = (rnd() * 2 - 1) * (0.5 + 0.5 * Math.sin(i / SR * 0.4)); svf(w, (i) => 500 + 400 * Math.sin(i / SR * 0.3), 3, 'bp');
  buf.add(w, 0, 0.12, 0);
}

function genHope(buf, spb) {
  const ch = ['C', 'D', 'Bm', 'Em', 'C', 'D', 'G', 'G'];
  ch.forEach((c, i) => { buf.add(piano(mtof(rootOf(c, 2)), 4 * spb, 0.5), i * 4 * spb, 0.24, -0.2); padChord(buf, spb, i * 4, c, 4, 0.08, { lp: 1300 }); });
  arp(buf, spb, 0, ch, (f, d) => piano(f, d, 0.5), { gain: 0.13, oct: 4, pat: [0, 1, 2, 3, 2, 1, 2, 3] });
  playMel(buf, spb, 0, mel('E5:2 G5:1 A5:1 | F#5:2 D5:2 | D5:1 F#5:1 B5:2 | G5:4 | E5:2 G5:1 C6:1 | A5:2 F#5:1 A5:1 | B5:4 | G5:4'), flute, 0.2, 0.15);
}

function genEyecatch(buf, spb) {
  const yo = ['D5', 'E5', 'G5', 'A5', 'B5', 'D6', 'E6', 'G6'];
  yo.forEach((n, i) => buf.add(koto(mtof(nm(n)), 1), i * 0.07, 0.18, -0.5 + i * 0.12));
  buf.add(bell(mtof(nm('D6')), 3, 3.5, 1.5), 0.7, 0.12);
  hit(buf, spb, 4, 'taiko', 0.8);
  buf.add(koto(mtof(nm('D4')), 2), 4 * spb, 0.25);
}

function genPreview(buf, spb) {
  rock(buf, spb, 0, 12, { drive: true });
  const ch = [...OP_CH, 'F', 'G', 'Am', 'Am'];
  bassLine(buf, spb, 0, ch, { octave: true });
  ch.forEach((c, i) => power(buf, spb, i * 4, c, 3.8, 0.1));
  playMel(buf, spb, 0, mel(OP_HOOK), lead, 0.24);
  power(buf, spb, 44, 'Am', 4, 0.2); hit(buf, spb, 44, 'crash', 0.4);
}

export const CUES = {
  op: { bpm: 128, bars: 48, loop: false, gen: genOP, rev: 0.18, tail: 3 },
  ed: { bpm: 80, bars: 30, loop: false, gen: genED, rev: 0.3, tail: 4 },
  daily: { bpm: 112, bars: 8, loop: true, gen: genDaily, rev: 0.2 },
  comedy: { bpm: 132, bars: 8, loop: true, gen: genComedy, rev: 0.12 },
  exam: { bpm: 92, bars: 8, loop: true, gen: genExam, rev: 0.3 },
  dragon: { bpm: 84, bars: 8, loop: true, gen: genDragon, rev: 0.35 },
  sad: { bpm: 66, bars: 8, loop: true, gen: genSad, rev: 0.35 },
  memory: { bpm: 70, bars: 8, loop: true, gen: genMemory, rev: 0.4 },
  mystery: { bpm: 72, bars: 8, loop: true, gen: genMystery, rev: 0.4 },
  danger: { bpm: 104, bars: 8, loop: true, gen: genDanger, rev: 0.25 },
  battle: { bpm: 160, bars: 16, loop: true, gen: genBattle, rev: 0.15 },
  despair: { bpm: 60, bars: 8, loop: true, gen: genDespair, rev: 0.4 },
  awaken: { bpm: 140, bars: 16, loop: true, gen: genAwaken, rev: 0.25 },
  villain: { bpm: 60, bars: 8, loop: true, gen: genVillain, rev: 0.5 },
  legend: { bpm: 66, bars: 8, loop: true, gen: genLegend, rev: 0.4 },
  hope: { bpm: 76, bars: 8, loop: true, gen: genHope, rev: 0.3 },
  eyecatch: { bpm: 120, bars: 2, loop: false, gen: genEyecatch, rev: 0.3, tail: 2 },
  preview: { bpm: 150, bars: 12, loop: false, gen: genPreview, rev: 0.2, tail: 2 },
};

// Render a cue to a Stereo buffer. Loops are rendered twice and the second pass kept, so note/reverb tails wrap seamlessly.
export function renderCue(name) {
  const c = CUES[name];
  if (!c) throw new Error('unknown cue ' + name);
  srand(name.length * 7919 + name.charCodeAt(0));
  const spb = 60 / c.bpm, len = c.bars * 4 * spb;
  if (c.loop) {
    const big = new Stereo(len * 2);
    c.gen(big, spb);
    const second = new Stereo(len * 2);
    second.L.set(big.L.subarray(0, big.n)); second.R.set(big.R.subarray(0, big.n));
    // add a shifted copy to emulate the previous loop's tails
    const off = Math.round(len * SR);
    for (let i = off; i < big.n; i++) { second.L[i] += big.L[i - off]; second.R[i] += big.R[i - off]; }
    reverb(second, c.rev ?? 0.25);
    const out = new Stereo(len);
    out.L.set(second.L.subarray(off, off + out.n)); out.R.set(second.R.subarray(off, off + out.n));
    out.loop = true;
    return out;
  }
  const buf = new Stereo(len + (c.tail || 2));
  c.gen(buf, spb);
  reverb(buf, c.rev ?? 0.25);
  buf.loop = false;
  return buf;
}
