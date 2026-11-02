// ENDING CREDITS ("Sumi to Hoshi") + NEXT EPISODE PREVIEW
import { scene, G, WIDE } from './kit.js';
import { CAST } from '../engine/characters.js';

export const CREDITS = [
  '#KOTODAMA: THE LIVING SCRIPT', 'Episode 1', '"The Boy Who Couldn\'t Write"', '',
  '#CHARACTERS', 'Kakeru Sumizome', 'Shiori Kaisho', 'Nijimi', 'Master Bokusai', 'Gonda Tetsuzo', 'Toru Kanemaru', 'Grandma Chiyo', 'Nashi, the Seventh Margin', 'The White King', '',
  '#ORIGINAL STORY & SCREENPLAY', 'Kotodama Project', '',
  '#DIRECTION / ANIMATION / MUSIC', 'Written entirely in code', '',
  '#ENGINE', 'Node.js + Skia canvas + FFmpeg', '',
  '#OPENING THEME', '"Kakeru Sora"', '#ENDING THEME', '"Sumi to Hoshi (Ink and Stars)"', '',
  '#FONTS (SIL OPEN FONT LICENSE)', 'Dela Gothic One / Yuji Boku', 'Bangers / Noto Sans', '',
  '#KANJI STROKE DATA', 'Make Me a Hanzi / hanzi-writer-data', '(Arphic Public License)', '',
  '#SPECIAL THANKS', 'Everyone with messy handwriting', '', '', '#INK IT IN!',
];

export function ending(E) {
  E.chapter('Ending');
  E.scene('ENDING CREDITS: "SUMI TO HOSHI (INK AND STARS)"');
  const t0 = E.t, TOTAL = 90;
  E.musicNow('ed', { vol: 0.85, fade: 0.05 });
  const shots = [
    [15, { bg: 'hill', var: 'dawn', cast: { kakeru: { x: 760, facing: 1, pose: 'sitHug', expr: 'calm', look: [0.3, -0.5], wind: 0.5 }, nijimi: { x: 600, facing: 1, expr: 'happy' } }, cam: { x: 700, y: 640, z: 1.25 }, to: { x: 800, y: 600, z: 1.35 } }],
    [15, { bg: 'riverbank', grade: 'sunset', cast: { shiori: { x: 760, facing: 1, pose: 'brushHold', expr: 'calm', wind: 0.6 } }, cam: { x: 800, y: 560, z: 1.3 }, to: { x: 700, y: 540, z: 1.4 } }],
    [15, { bg: 'riverbank', grade: 'sunset', cast: { bokusai: { x: 700, facing: 1, pose: 'brushHold', expr: 'sleepy', hat: true } }, cam: { x: 700, y: 600, z: 1.2 }, to: { x: 760, y: 600, z: 1.3 }, fish: true }],
    [15, { bg: 'room', grade: 'sepia', cast: { chiyo: { x: 820, facing: 1, pose: 'kneel', expr: 'smile' }, youngKakeru: { x: 1060, facing: -1, pose: 'kneel', expr: 'happy' } }, cam: { x: 900, y: 640, z: 1.3 }, to: { x: 860, y: 620, z: 1.4 } }],
    [15, { bg: 'village', var: 'sunset', grade: 'sunset', cast: { gonda: { x: 640, facing: 1, pose: 'armsCross', expr: 'smile' }, kanemaru: { x: 900, facing: -1, pose: 'hips', expr: 'smug' } }, cam: { x: 760, y: 560, z: 1.25 }, to: { x: 820, y: 560, z: 1.3 } }],
    [15, { bg: 'hill', var: 'dawn', cast: { bokusai: { x: 380, facing: 1, pose: 'armsCross', expr: 'smug', hat: true }, kakeru: { x: 620, facing: 1, pose: 'fistUp', expr: 'grin', wind: 1 }, nijimi: { x: 800, facing: 1, expr: 'happy' }, shiori: { x: 960, facing: -1, pose: 'brushHold', expr: 'smile', wind: 1 } }, cam: { x: 700, y: 600, z: 1.05 }, to: { x: 700, y: 580, z: 1.1 } }],
  ];
  let off = 0;
  shots.forEach(([d, o], i) => {
    E.shot({ bg: o.bg, var: o.var, grade: o.grade, cast: o.cast, cam: o.cam, in: i === 0 ? 'fade' : undefined, out: i === shots.length - 1 ? 'fade' : undefined, outD: 1.5 }, (s) => {
      s.cam(o.to, d, 'inOut');
      if (o.fish) s.fx('fishline', { who: 'bokusai', y: 820, dx: -40 }, d);
      s.title('credits', { lines: CREDITS, x: 1480, off, total: TOTAL, d }, d);
      s.wait(d);
    });
    off += d;
  });
  E.musicNow(null, { fade: 0.5 });
}

export function preview(E) {
  E.chapter('Next Episode Preview');
  E.scene('NEXT EPISODE PREVIEW');
  E.musicNow('preview', { vol: 0.8, fade: 0.05 });
  scene(E, { bg: 'hill', cast: { kakeru: { x: 900, facing: 1, pose: 'kick', expr: 'panic', item: CAST.kakeru.item } } }, [
    ['kakeru', "Kakeru here! Old man Bokusai's training is totally nuts!", { frame: 'full', expr: 'grin', pose: 'cheer' }],
    ['kakeru', 'He wants me to write with my FEET?!', { frame: 'medium', expr: 'shocked', pose: 'kick', style: 'shout' }],
  ]);
  scene(E, { bg: 'academy', cast: { shiori: { x: 1000, facing: -1, pose: 'brushHold', expr: 'determined', wind: 0.6 } } }, [
    ['kakeru', 'And Shiori wants a rematch?!', { cam: { frame: ['shiori', 'medium'], side: 'l' } }],
  ]);
  E.shot({ bg: 'ink', var: 'red', cam: WIDE }, (s) => {
    s.title('nextTime', { jp: '書かない筆', en: "The Brush That Doesn't Write" }, 6.5);
    s.say('kakeru', "Next time on Kotodama: The Brush That Doesn't Write! Ink it in!", { style: 'shout', d: 6.5 });
  });
  E.musicNow(null, { fade: 0.5 });
}
