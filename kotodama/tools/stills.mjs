// Visual QA: render stills. 
//   node tools/stills.mjs shots <from> <to> [cols]   midpoint of every shot index in [from,to) -> contact sheet
//   node tools/stills.mjs at t1,t2,...                frames at times (seconds)
import fs from 'fs';
import path from 'path';
import { createCanvas, ROOT } from '../src/node-env.js';
import { buildEpisode } from '../src/episode01/script.js';
import { renderFrame } from '../src/engine/renderer.js';
const E = buildEpisode();
const [mode, a, b, cols = '4'] = process.argv.slice(2);
const dir = path.join(ROOT, 'build/stills'); fs.mkdirSync(dir, { recursive: true });
const W = +(process.env.TW || 640), H = Math.round(W * 9 / 16);
const c = createCanvas(W, H), ctx = c.getContext('2d');
let times = [];
if (mode === 'shots') { for (let i = +a; i < Math.min(+b, E.shots.length); i++) { const s = E.shots[i]; times.push([(s.t0 + s.t1) / 2, i]); } }
else times = a.split(',').map((t) => [+t, -1]);
const C = +cols, rows = Math.ceil(times.length / C);
const sheet = createCanvas(W * C, H * rows), sctx = sheet.getContext('2d');
const t0 = performance.now();
times.forEach(([t, i], k) => {
  renderFrame(ctx, E, t, W);
  sctx.drawImage(c, (k % C) * W, Math.floor(k / C) * H);
  sctx.fillStyle = 'rgba(0,0,0,0.6)'; sctx.fillRect((k % C) * W, Math.floor(k / C) * H, 150, 24);
  sctx.fillStyle = '#ff0'; sctx.font = '16px sans-serif'; sctx.fillText(`${i >= 0 ? '#' + i + ' ' : ''}${t.toFixed(1)}s`, (k % C) * W + 6, Math.floor(k / C) * H + 17);
});
const out = path.join(dir, mode === 'shots' ? `shots-${a}-${b}.png` : 'at.png');
fs.writeFileSync(out, sheet.toBuffer('image/png'));
console.log(out, times.length, 'frames', ((performance.now() - t0) / times.length).toFixed(0), 'ms/frame');
