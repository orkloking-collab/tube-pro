// Renders model sheets (turnaround of poses / expressions) for visual QA.
import fs from 'fs';
import path from 'path';
import { createCanvas, ROOT } from '../src/node-env.js';
import { CAST } from '../src/engine/characters.js';
import { drawCharacter, poseVec, buildState, anchors } from '../src/engine/body.js';
import { FONTS } from '../src/engine/env.js';

const out = path.join(ROOT, 'build/sheets');
fs.mkdirSync(out, { recursive: true });
const which = process.argv[2] || 'lineup';

function stateFor(id, o = {}) {
  const def = CAST[id];
  const s = { x: 0, y: 0, facing: 1, scale: 1, pose: poseVec(o.pose || 'stand'), expr: o.expr || def.defaultExpr, look: o.look || [0, 0], blink: 1, ...o };
  s.pose = poseVec(o.pose || 'stand');
  return buildState(def, s, 0);
}

function label(ctx, txt, x, y, size = 26, col = '#222') {
  ctx.font = `${size}px ${FONTS.title}`; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(txt, x, y);
}

if (which === 'lineup') {
  const ids = ['kakeru', 'shiori', 'bokusai', 'nashi', 'gonda', 'chiyo', 'kanemaru', 'nijimi'];
  const c = createCanvas(2400, 1000), ctx = c.getContext('2d');
  ctx.fillStyle = '#f3efe6'; ctx.fillRect(0, 0, 2400, 1000);
  ids.forEach((id, i) => {
    const x = 160 + i * 295;
    const st = stateFor(id, { x, y: 900 });
    drawCharacter(ctx, CAST[id], st, 0.5);
    label(ctx, CAST[id].name, x, 960);
  });
  fs.writeFileSync(path.join(out, 'lineup.png'), c.toBuffer('image/png'));
}

if (which === 'faces') {
  const id = process.argv[3] || 'kakeru';
  const exprs = ['neutral', 'grin', 'happy', 'angry', 'shout', 'determined', 'surprised', 'shocked', 'sad', 'cry', 'smug', 'annoyed', 'embarrassed', 'worried', 'pain', 'cold'];
  const cw = 250, ch = 300;
  const c = createCanvas(cw * 8, ch * 2), ctx = c.getContext('2d');
  ctx.fillStyle = '#e9eef5'; ctx.fillRect(0, 0, c.width, c.height);
  exprs.forEach((e, i) => {
    const cx = (i % 8) * cw, cy = Math.floor(i / 8) * ch;
    const st = stateFor(id, { x: 0, y: 0, expr: e });
    const a = anchors(CAST[id], st);
    ctx.save(); ctx.beginPath(); ctx.rect(cx, cy, cw, ch); ctx.clip();
    ctx.translate(cx + cw / 2, cy + ch * 0.45); ctx.scale(2.0, 2.0); ctx.translate(-a.head[0], -a.head[1]);
    drawCharacter(ctx, CAST[id], st, 0.3);
    ctx.restore();
    label(ctx, e, cx + cw / 2, cy + ch - 12, 22);
  });
  fs.writeFileSync(path.join(out, `faces-${id}.png`), c.toBuffer('image/png'));
}

if (which === 'poses') {
  const id = process.argv[3] || 'kakeru';
  const poses = (process.argv[4] || 'stand,guard,punch,kick,point,fistUp,armsCross,hips,thinking,bow,slump,crouch,kneel,jump,brushUp,brushDown,slash,hurt,sit,lying,cheer,block,wave,downKnee').split(',');
  const cols = 8, rows = Math.ceil(poses.length / cols);
  const c = createCanvas(2400, 820 * rows), ctx = c.getContext('2d');
  ctx.fillStyle = '#f3efe6'; ctx.fillRect(0, 0, c.width, c.height);
  poses.forEach((p, i) => {
    const x = 150 + (i % cols) * 300, y = 720 + Math.floor(i / cols) * 820;
    ctx.strokeStyle = '#ccc'; ctx.beginPath(); ctx.moveTo(x - 140, y); ctx.lineTo(x + 140, y); ctx.stroke();
    const st = stateFor(id, { x, y, pose: p, expr: 'determined' });
    drawCharacter(ctx, CAST[id], st, 0.5);
    label(ctx, p, x, y + 60, 24);
  });
  fs.writeFileSync(path.join(out, `poses-${id}.png`), c.toBuffer('image/png'));
}
console.log('ok', which);
