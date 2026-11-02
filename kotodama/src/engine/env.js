// Environment bridge so the exact same engine code runs in Node (Skia via @napi-rs/canvas)
// and in the browser (HTML canvas). The bootstrap of each side calls setEnv().
export const env = {
  createCanvas: null, // (w, h) => canvas
  Path2D: null,
  kanji: {}, // char -> { strokes: [svgPath], medians: [[x,y]...] }
};
export function setEnv(e) { Object.assign(env, e); }

export const W = 1920; // virtual frame (world units at zoom 1)
export const H = 1080;
export const GROUND = 950; // y of the floor line in world units

export const FONTS = {
  title: '"Dela Gothic One", "Noto Sans", sans-serif',
  brush: '"Yuji Boku", "Dela Gothic One", serif',
  comic: '"Bangers", "Dela Gothic One", sans-serif',
  sub: '"Noto Sans", sans-serif',
};
