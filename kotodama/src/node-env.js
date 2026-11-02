// Node bootstrap: Skia canvas + fonts + kanji stroke data.
import { createCanvas, Path2D, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setEnv } from './engine/env.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const F = (f) => path.join(ROOT, 'assets/fonts', f);
GlobalFonts.registerFromPath(F('DelaGothicOne-Regular.ttf'), 'Dela Gothic One');
GlobalFonts.registerFromPath(F('YujiBoku-Regular.ttf'), 'Yuji Boku');
GlobalFonts.registerFromPath(F('Bangers-Regular.ttf'), 'Bangers');
GlobalFonts.registerFromPath(F('NotoSans-Bold.ttf'), 'Noto Sans');

const kanji = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/kanji.json'), 'utf8'));
setEnv({ createCanvas, Path2D, kanji });
export { createCanvas };
