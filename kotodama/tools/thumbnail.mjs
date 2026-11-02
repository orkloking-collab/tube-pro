// Renders the episode thumbnail (1280x720) with the same engine: release/thumbnail.png
import fs from 'fs';
import path from 'path';
import { createCanvas, ROOT } from '../src/node-env.js';
import { Episode } from '../src/engine/timeline.js';
import { renderFrame } from '../src/engine/renderer.js';
import { FONTS } from '../src/engine/env.js';
const E = new Episode();
E.shot({ bg: 'ink', var: 'red', vignette: 0.5, cam: { x: 960, y: 540, z: 1 },
  cast: { nashi: { x: 1480, facing: -1, pose: 'bladeReady', expr: 'neutral', crack: 0.85, scale: 1.25, wind: 1 }, kakeru: { x: 560, facing: 1, pose: 'brushUp', expr: 'shout', scale: 1.55, wind: 1 } } }, (s) => {
  s.fx('rays', { x: 760, y: 420, color: '#ffcf4a', a: 0.35, layer: 'back' }, 10);
  s.fx('scribble', { x: 1040, y: 360, size: 520, color: '#ff3a4a', glow: '#ffcf4a', seed: 7, write: 0.01, fadeAt: 2 }, 10);
  s.fx('aura', { who: 'kakeru', size: 1.1 }, 10);
  s.fx('speedlines', { cx: 700, cy: 420, inner: 420, alpha: 0.45, fade: false }, 10);
  s.wait(10);
});
const W = 1280, H = 720, c = createCanvas(W, H), ctx = c.getContext('2d');
renderFrame(ctx, E, 3.3, W);
ctx.setTransform(W / 1920, 0, 0, W / 1920, 0, 0);
const outlined = (t, x, y, font, fill, stroke, lw, align = 'left') => { ctx.font = font; ctx.textAlign = align; ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.strokeText(t, x, y); ctx.fillStyle = fill; ctx.fillText(t, x, y); };
outlined('KOTODAMA', 1880, 150, `150px ${FONTS.title}`, '#ffffff', '#16101e', 26, 'right');
outlined('言霊', 1880, 290, `120px ${FONTS.brush}`, '#ff4a5a', '#16101e', 18, 'right');
ctx.save(); ctx.translate(60, 1010); ctx.rotate(-0.04);
ctx.fillStyle = '#ffd23a'; ctx.fillRect(-10, -120, 300, 140); ctx.strokeStyle = '#16101e'; ctx.lineWidth = 10; ctx.strokeRect(-10, -120, 300, 140);
outlined('EP. 1', 140, -10, `110px ${FONTS.title}`, '#16101e', '#ffd23a', 4, 'center');
ctx.restore();
outlined('書けない少年', 1880, 1000, `110px ${FONTS.brush}`, '#ffffff', '#16101e', 16, 'right');
outlined("THE BOY WHO COULDN'T WRITE", 1880, 1060, `46px ${FONTS.title}`, '#ffd23a', '#16101e', 10, 'right');
fs.mkdirSync(path.join(ROOT, 'release'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'release/thumbnail.png'), c.toBuffer('image/png'));
console.log('release/thumbnail.png');
