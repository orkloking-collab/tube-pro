// Two-pass size-targeted encode of the master into a compact release file (<100 MB, GitHub/Drive friendly).
//   node tools/deliver.mjs [--mb 92] [--in build/ep01_master.mp4] [--out release/KOTODAMA_EP01_720p.mp4]
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const inp = path.resolve(ROOT, args.in || 'build/ep01_master.mp4');
const out = path.resolve(ROOT, args.out || 'release/KOTODAMA_EP01_720p.mp4');
const probe = spawnSync(ffmpeg.path, ['-hide_banner', '-i', inp], { encoding: 'utf8' }).stderr;
const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(probe);
if (!m) { console.error('cannot read', inp); process.exit(1); }
const dur = +m[1] * 3600 + +m[2] * 60 + +m[3];
const audioK = 112, targetMB = +(args.mb || 92);
const videoK = Math.floor((targetMB * 8 * 1024 * 1024 / 1000) / dur - audioK - 8);
console.log(`duration ${dur.toFixed(1)} s -> video ${videoK} kbps + audio ${audioK} kbps (~${targetMB} MB)`);
fs.mkdirSync(path.dirname(out), { recursive: true });
const passlog = path.join(ROOT, 'build/x264pass');
const common = ['-y', '-hide_banner', '-loglevel', 'error', '-i', inp, '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-b:v', `${videoK}k`, '-maxrate', `${videoK * 3}k`, '-bufsize', `${videoK * 6}k`, '-pix_fmt', 'yuv420p', '-passlogfile', passlog];
let r = spawnSync(ffmpeg.path, [...common, '-pass', '1', '-an', '-f', 'mp4', '/dev/null'], { stdio: 'inherit' });
if (r.status) process.exit(r.status);
r = spawnSync(ffmpeg.path, [...common, '-pass', '2', '-c:a', 'aac', '-b:a', `${audioK}k`, '-movflags', '+faststart', out], { stdio: 'inherit' });
if (r.status) process.exit(r.status);
console.log(`DONE ${path.relative(ROOT, out)} ${(fs.statSync(out).size / 1048576).toFixed(1)} MB`);
