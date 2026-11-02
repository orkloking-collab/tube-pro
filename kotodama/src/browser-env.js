// Browser bootstrap: HTML canvas + FontFace + kanji stroke data. Same engine code as Node.
import { setEnv } from './engine/env.js';

export async function initBrowserEnv(base = '..') {
  const fonts = [['Dela Gothic One', 'DelaGothicOne-Regular.ttf'], ['Yuji Boku', 'YujiBoku-Regular.ttf'], ['Bangers', 'Bangers-Regular.ttf'], ['Noto Sans', 'NotoSans-Bold.ttf']];
  await Promise.all(fonts.map(async ([family, file]) => {
    const f = new FontFace(family, `url(${base}/assets/fonts/${file})`);
    await f.load();
    document.fonts.add(f);
  }));
  const kanji = await (await fetch(`${base}/assets/kanji.json`)).json();
  setEnv({ createCanvas: (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h }), Path2D: window.Path2D, kanji });
}
