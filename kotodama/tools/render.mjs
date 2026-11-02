// Renders the episode to MP4: frames (Skia canvas) -> raw RGBA pipe -> ffmpeg (libx264) + soundtrack WAV.
//   node tools/render.mjs [--w 1280] [--from 0] [--to <sec>] [--out build/ep01_master.mp4] [--crf 20] [--preset medium]
// (run tools/audio.mjs first so build/ep01.wav exists; then tools/deliver.mjs makes the compact release file)
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { once } from 'events';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { createCanvas, ROOT } from '../src/node-env.js';
import { buildEpisode } from '../src/episode01/script.js';
import { renderFrame } from '../src/engine/renderer.js';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const E = buildEpisode();
const W = +(args.w || 1280), H = Math.round(W * 9 / 16), FPS = 24;
const from = +(args.from || 0), to = Math.min(+(args.to || E.duration), E.duration);
const out = path.resolve(ROOT, args.out || 'build/ep01_master.mp4');
const wav = path.join(ROOT, 'build/ep01.wav');
fs.mkdirSync(path.dirname(out), { recursive: true });
const hasAudio = fs.existsSync(wav);
const ffArgs = ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-'];
if (hasAudio) ffArgs.push('-ss', String(from), '-t', String(to - from), '-i', wav);
ffArgs.push('-map', '0:v');
if (hasAudio) ffArgs.push('-map', '1:a', '-c:a', 'aac', '-b:a', '192k');
ffArgs.push('-c:v', 'libx264', '-preset', args.preset || 'medium', '-tune', 'animation', '-crf', String(args.crf || 20), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out);
const ff = spawn(ffmpeg.path, ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
const c = createCanvas(W, H), ctx = c.getContext('2d');
const f0 = Math.round(from * FPS), f1 = Math.round(to * FPS);
console.log(`rendering ${f1 - f0} frames (${(to - from).toFixed(1)} s) at ${W}x${H} -> ${path.relative(ROOT, out)}${hasAudio ? ' + audio' : ' (no audio: run tools/audio.mjs first)'}`);
const t0 = Date.now();
let lastLog = 0;
for (let f = f0; f < f1; f++) {
  renderFrame(ctx, E, f / FPS, W);
  const ok = ff.stdin.write(Buffer.from(c.data()));
  if (!ok) await once(ff.stdin, 'drain');
  const now = Date.now();
  if (now - lastLog > 15000 || f === f1 - 1) {
    lastLog = now;
    const done = f - f0 + 1, el = (now - t0) / 1000, fps = done / el, eta = (f1 - f0 - done) / fps;
    console.log(`  ${(done / (f1 - f0) * 100).toFixed(1).padStart(5)}%  frame ${done}/${f1 - f0}  ${fps.toFixed(1)} fps  elapsed ${(el / 60).toFixed(1)} min  ETA ${(eta / 60).toFixed(1)} min`);
  }
}
ff.stdin.end();
const [code] = await once(ff, 'close');
console.log(code === 0 ? `DONE ${path.relative(ROOT, out)} in ${((Date.now() - t0) / 60000).toFixed(1)} min` : `ffmpeg exited with ${code}`);
