// contact sheet: node tools/grid.mjs out.png cols w in1.png in2.png ...
import fs from 'fs';
import { createCanvas, loadImage } from '@napi-rs/canvas';
const [out, cols, w, ...ins] = process.argv.slice(2);
const imgs = await Promise.all(ins.map((f) => loadImage(fs.readFileSync(f))));
const C = +cols, cw = +w, ch = Math.round(cw * imgs[0].height / imgs[0].width);
const c = createCanvas(cw * C, ch * Math.ceil(imgs.length / C)), ctx = c.getContext('2d');
imgs.forEach((im, i) => ctx.drawImage(im, (i % C) * cw, Math.floor(i / C) * ch, cw, ch));
fs.writeFileSync(out, c.toBuffer('image/png'));
