// PART B: night attack -> Shiori vs Nashi -> Kakeru's awakening -> dawn -> the White King
import { scene, write, scribble, posOf, G, WIDE } from './kit.js';
import { CAST } from '../engine/characters.js';
import { BIG } from './partA.js';

const BROKEN = { ...CAST.shiori.item, len: 1.0, tassel: null };
const GOLD = { color: '#ff3a4a', glow: '#ffcf4a' };

export function eyecatch(E, side) {
  E.chapter(side === 'A' ? 'Eyecatch' : 'Eyecatch (B)');
  E.musicNow('eyecatch', { vol: 0.8, fade: 0.05 });
  E.shot({ bg: side === 'A' ? 'paper' : 'ink', var: side === 'A' ? '' : 'red', cast: { kakeru: { x: 560, facing: 1, pose: side === 'A' ? 'fistUp' : 'brushUp', expr: 'grin', wind: 1 }, nijimi: { x: 330, facing: 1, expr: 'happy' } }, cam: WIDE, in: 'white', out: 'white', inD: 0.3, outD: 0.4 }, (s) => {
    s.title('eyecatch', { x: 1300, y: 400 }, 5);
    s.wait(5);
  });
  E.musicNow(null, { fade: 0.05 });
}

export function partB(E) {
  E.chapter('Part B');
  // ---------------------------------------------------------------- B1: that night
  scene(E, { heading: 'EXT. SUMIKAWA VILLAGE - NIGHT', bg: 'village', var: 'night', grade: 'night', music: 'mystery', musicOpts: { vol: 0.45, fade: 1 }, cast: {} }, [
    { wide: 4, in: 'fade', cam: { x: 960, y: 500, z: 1.05 }, camTo: { x: 960, y: 560, z: 1 }, title: { text: 'That night', jp: 'その夜' }, sfx: 'wind', note: 'Lanterns glow along the sleeping street.' },
  ]);
  scene(E, { heading: 'EXT. ACADEMY COURTYARD - NIGHT', bg: 'academy', grade: 'night', music: 'sad', musicOpts: { vol: 0.45, fade: 1.5 },
    cast: { shiori: { x: 820, facing: 1, pose: 'brushFloor', expr: 'focused', wind: 0.3 } } }, [
    { shot: (s) => {
      s.fx('tint', { color: '#000018', a: 0.35 }, 4.4);
      write(s, 'shiori', '龍', { x: 1060, y: 700, size: 230, color: '#0e1a24', glow: '#3fe0d0', d: 1.6, hold: 1.4, poses: ['brushFloor', 'brushDown', 'brushFloor', 'brushDown', 'brushFloor'], end: 'brushFloor' });
      s.wait(4.4);
    }, cam: { x: 960, y: 640, z: 1.15 }, note: 'Alone in the dark courtyard, Shiori writes 龍 again. And again.' },
    ['father', 'Shiori. A Kaisho does not make mistakes.', { cam: { frame: ['shiori', 'medium'], side: 'l' }, d: 3.2 }],
    ['father', 'Pass with honors. Anything less, and do not bother coming home.', { d: 4.2 }],
    ['shiori', 'I passed with honors, Father...', { expr: 'sad', frame: 'close', pose: 'kneel' }],
    ['shiori', 'So why does it feel like I lost?'],
    { react: 'shiori', expr: 'serious', d: 1.2 },
    ['shiori', "That idiot's frog... it was still moving when I left.", { style: 'think', silent: true, frame: 'close' }],
    ['shiori', "Living words don't last that long. Not even mine.", { style: 'think', silent: true }],
    ['shiori', '...One more time.', { expr: 'determined', pose: 'brushFloor', frame: 'medium' }],
  ]);
  let stage = scene(E, { heading: 'EXT. HITSUZAN ACADEMY - GATE - NIGHT', bg: 'academy', grade: 'night', cam: WIDE,
    cast: { extra11: { x: 760, facing: 1, expr: 'sleepy', pose: 'stand' }, extra12: { x: 980, facing: -1, expr: 'neutral', pose: 'armsCross', item: { kind: 'brush', len: 1.2, r: 0.05, tip: 0.3, color: '#6a4a2a', band: '#2a1a1a', ink: '#111' } }, nashi: { x: 1520, facing: -1, pose: 'stand', expr: 'neutral', alpha: 0 } } }, [
    { wide: 2.6, fx: [], fn: (s) => s.fx('tint', { color: '#000018', a: 0.35 }, 2.6) },
    ['extra11', 'Quiet night.', { name: 'Gate Guard', frame: 'medium' }],
    ['extra12', 'Too quiet. Even the crickets stopped singing.', { name: 'Gate Guard', frame: 'medium' }],
    { music: 'villain', vol: 0.8, fade: 0.2 },
    { shot: (s) => {
      s.sfx('crack');
      s.fx('erase', { x: 1520, y: 640, w: 30, h: 520, n: 40, cell: 16 }, 2.6);
      s.fx('glow', { x: 1520, y: 640, r: 340, color: '#ffffff', a: 0.5, fadeIn: true }, 2.6);
      s.at(1.0, (b) => { b.to('nashi', { alpha: 1 }, 1.2); b.move('nashi', 1420, 1.4, { motion: 'walk', speed: 0.6 }); b.sfx('vanish'); });
      s.wait(2.8);
    }, cam: { x: 1250, y: 560, z: 1.2 }, note: 'A white crack splits the air itself. A tall figure steps out: white coat, white hair, a cracked porcelain mask.' },
    ['extra11', 'Who goes there?! Identify yourself!', { name: 'Gate Guard', style: 'shout', pose: 'guard', expr: 'angry', frame: 'medium' }],
    ['nashi', 'Identify...?', { frame: 'close', d: 2 }],
    ['nashi', 'I have no name to give you. Hakushi erased it long ago.'],
    { shot: (s) => {
      s.pose('extra12', 'brushHold', 0.15);
      const k = write(s, 'extra12', '縛', { x: 1240, y: 520, size: 240, color: '#fff0d0', glow: '#ffb03a', d: 1.1, hold: 0.8 });
      s.at(1.2, (b) => { b.pose('nashi', 'palmOut', 0.15); });
      s.at(1.6, (b) => { b.fx('erase', { x: 1240, y: 520, w: 260, h: 260, n: 60, cell: 22, float: true }, 1.4); b.sfx('erase'); });
      s.wait(3);
    }, cam: { x: 1150, y: 560, z: 1.15 } },
    ['extra12', "M-my word... it's gone!", { name: 'Gate Guard', expr: 'shocked', pose: 'shock', frame: 'close' }],
    ['nashi', 'Words are only stains on a clean page.', { frame: 'close', pose: 'bladeReady' }],
    { shot: (s) => {
      s.pose('nashi', 'bladeRaise', 0.2);
      s.at(0.4, (b) => { b.pose('nashi', 'bladeSwing', 0.08); b.fx('slashArc', { x: 1200, y: 560, size: 520, ang: 0.4, flip: true, color: '#ffffff', glow: '#c8c8ff' }, 0.5); b.sfx('slash'); });
      s.at(0.6, (b) => {
        b.sfx('erase'); b.sfx('rumble');
        for (const [x, y, r, i] of [[900, 360, 200, 0], [600, 470, 170, 1], [1250, 330, 190, 2], [1500, 450, 150, 3]]) b.at(i * 0.15, (c) => { c.fx('whiteBlot', { x, y, r, grow: true, seed: x, layer: 'back' }, 9); c.fx('erase', { x, y, w: r * 2.4, h: r * 2.4, n: 50, float: true, seed: x }, 1.5); });
      });
      s.at(1.2, (b) => { b.move('extra11', -300, 1.2, { motion: 'run', speed: 1.3 }); b.move('extra12', -200, 1.3, { motion: 'run', speed: 1.3 }); b.expr('extra11', 'panic'); b.expr('extra12', 'panic'); });
      s.wait(2.8);
    }, cam: WIDE, note: 'One sweep of his blade, and whole sections of the academy simply cease to exist. The guards run.' },
  ]);
  scene(E, { heading: 'EXT. VILLAGE STREET - NIGHT', bg: 'village', var: 'night', grade: 'night', cam: WIDE,
    cast: { extra3: { x: 600, facing: -1, motion: 'run', expr: 'panic' }, extra5: { x: 1500, facing: -1, motion: 'run', expr: 'panic' }, extra8: { x: 1800, facing: -1, motion: 'run', expr: 'panic' } } }, [
    { shot: (s) => {
      s.sfx('crowd', { vol: 0.8 });
      s.move('extra3', -300, 2.2, { motion: 'run' }); s.move('extra5', -200, 3, { motion: 'run' }); s.move('extra8', 0, 3.4, { motion: 'run' });
      for (const [i, x] of [[0, 1700], [1, 1350], [2, 980], [3, 620]]) s.at(0.4 + i * 0.6, (b) => { b.fx('erase', { x, y: 560, w: 120, h: 160, n: 30, float: true, cell: 18, seed: x }, 1.2); b.fx('whiteBlot', { x, y: 560, r: 60, grow: true, seed: x, layer: 'back' }, 6); b.sfx('erase', { vol: 0.6 }); });
      s.wait(3.6);
    }, note: 'Villagers flee. One by one, the lanterns are erased.' },
  ]);
  scene(E, { heading: "INT. KAKERU'S ROOM - NIGHT", bg: 'room', grade: 'night', music: 'danger', musicOpts: { vol: 0.6, fade: 1 },
    cast: { kakeru: { x: 860, facing: 1, pose: 'lying', expr: 'closed' }, nijimi: { x: 1150, facing: -1, expr: 'worried', motion: 'shiver' } } }, [
    { wide: 2, fn: (s) => s.fx('tint', { color: '#000018', a: 0.4 }, 2) },
    ['nijimi', 'Niji... niji niji...!', { cam: { frame: ['nijimi', 'medium'] } }],
    ['kakeru', "Mm... Nijimi? What's wrong?", { expr: 'sleepy', pose: 'sitFloor', frame: 'medium' }],
    { shot: (s) => { s.sfx('rumble'); s.fx('flash', { color: '#e8e8ff', a: 0.6 }, 0.8); s.at(0.9, (b) => b.fx('flash', { color: '#e8e8ff', a: 0.4 }, 0.6)); s.shake(10, 1.2); s.expr('kakeru', 'surprised'); s.wait(1.8); }, cam: { frame: ['kakeru', 'medium'] } },
    ['kakeru', "That light... it's coming from the academy!", { expr: 'shocked', pose: 'stand', frame: 'close' }],
    { shot: (s) => { s.pose('kakeru', 'brushHold', 0.15); s.expr('kakeru', 'determined'); s.sfx('swish'); s.at(0.5, (b) => { b.move('kakeru', 2400, 1, { motion: 'run', speed: 1.4 }); b.move('nijimi', 2300, 1.1, { motion: 'run' }); b.sfx('whoosh'); }); s.wait(1.6); }, cam: { frame: ['kakeru', 'full'] } },
  ]);

  // ---------------------------------------------------------------- Kanemaru flees / Gonda vs Nashi
  scene(E, { heading: 'EXT. VILLAGE STREET - NIGHT', bg: 'village', var: 'night', grade: 'night',
    cast: { kakeru: { x: 200, facing: 1, motion: 'run', expr: 'determined' }, nijimi: { x: 60, facing: 1, motion: 'run' }, kanemaru: { x: 1700, facing: -1, motion: 'run', expr: 'panic' } } }, [
    { shot: (s) => { s.move('kakeru', 820, 0.9, { motion: 'run', stop: 'shock' }); s.move('nijimi', 680, 0.9, { motion: 'run' }); s.move('kanemaru', 1000, 0.9, { motion: 'run', stop: 'shock' }); s.at(0.9, (b) => { b.sfx('bonk'); b.fx('impact', { x: 910, y: 470, size: 90 }, 0.3); b.shake(10, 0.3); }); s.wait(1.4); }, cam: WIDE },
    ['kanemaru', "S-Scribble-boy?! Don't go that way! A monster is erasing the academy!", { expr: 'panic', style: 'shout', frame: 'medium' }],
    ['kakeru', 'The academy?! Is anyone still in there?!', { expr: 'shocked', frame: 'close', pose: 'stand' }],
    ['kanemaru', "The Kaisho girl was training late... b-but that's not my problem!", { expr: 'panic', pose: 'shrug', frame: 'close' }],
    ['kanemaru', "I'm going to get help! Definitely getting help! Bye!", { frame: 'medium', after: (s) => s.at(2.2, (b) => b.move('kanemaru', -500, 1, { motion: 'run', speed: 1.6 })) }],
    ['kakeru', 'Shiori...!', { expr: 'determined', frame: 'close', d: 1.8 }],
    { shot: (s) => { s.move('kakeru', 2400, 1, { motion: 'run', speed: 1.5 }); s.move('nijimi', 2300, 1.1, { motion: 'run' }); s.fx('hlines', {}, 1.2); s.sfx('whoosh'); s.wait(1.2); }, cam: WIDE },
  ]);
  scene(E, { heading: 'EXT. ACADEMY COURTYARD - NIGHT', bg: 'academy', grade: 'night', music: 'battle', musicOpts: { vol: 0.7, fade: 0.5 },
    cast: { gonda: { x: 640, facing: 1, pose: 'guard', expr: 'angry', item: BIG }, nashi: { x: 1320, facing: -1, pose: 'bladeReady', expr: 'neutral' } } }, [
    { wide: 1.8, fn: (s) => { s.fx('whiteBlot', { x: 900, y: 360, r: 200, seed: 900, layer: 'back' }, 2); s.fx('whiteBlot', { x: 1250, y: 330, r: 190, seed: 1250, layer: 'back' }, 2); } },
    ['gonda', 'Hakushi?! In MY academy?!', { style: 'shout', frame: 'medium' }],
    ['nashi', 'Instructor Gonda. You fail children for messy strokes, do you not?', { frame: 'close' }],
    ['nashi', 'Then we are not so different, you and I.'],
    ['gonda', "Don't you DARE compare us!", { style: 'shout', expr: 'shout', pose: 'brushHold', frame: 'medium', shake: 10 }],
    { shot: (s) => {
      write(s, 'gonda', '爆', { x: 1000, y: 480, size: 250, color: '#fff0c0', glow: '#ff6a1a', d: 1.0, hold: 0.3 });
      s.at(1.2, (b) => { b.fx('fire', { x: 1320, y: 900, w: 400, h: 500, n: 50, size: 80 }, 1.6); b.fx('impact', { x: 1320, y: 600, size: 360, color: '#ffb040' }, 0.6); b.fx('flash', { color: '#ffd0a0' }, 0.4); b.sfx('explosion'); b.shake(26, 0.8); });
      s.wait(2.8);
    }, cam: WIDE, note: 'Gonda writes 爆, "explode". The courtyard erupts in fire.' },
    { shot: (s) => { s.fx('dust', { x: 1320, y: 900 }, 1.6); s.fx('erase', { x: 1320, y: 600, w: 420, h: 640, n: 80, float: true }, 2); s.sfx('erase'); s.wait(2.2); }, cam: { frame: ['nashi', 'full'] }, note: 'The smoke dissolves into white flakes. Nashi stands untouched.' },
    ['nashi', 'Your words are loud, Instructor. But loud is not the same as true.', { frame: 'close' }],
    { shot: (s) => {
      s.to('nashi', { alpha: 0 }, 0.15); s.fx('erase', { x: 1320, y: 600, w: 240, h: 600, n: 40, float: true }, 0.6); s.sfx('vanish');
      s.at(0.35, (b) => { b.set('nashi', { x: 860, facing: -1, pose: 'palmOut' }); b.to('nashi', { alpha: 1 }, 0.1); });
      s.at(0.55, (b) => { b.fx('impact', { x: 760, y: 520, size: 240 }, 0.5); b.sfx('bighit'); b.shake(20, 0.5); b.pose('gonda', 'knock', 0.05); b.expr('gonda', 'pain'); b.to('gonda', { x: 340 }, 0.5, 'out'); b.set('gonda', { item: null }); });
      s.at(1.2, (b) => { b.pose('gonda', 'lying', 0.2); b.fx('dust', { x: 300, y: G }, 1); b.sfx('thud'); });
      s.wait(2.2);
    }, cam: WIDE },
    ['gonda', 'Ngh... somebody... run...', { expr: 'pain', frame: 'medium', d: 2.6 }],
  ]);
  // ---------------------------------------------------------------- B2: Shiori vs Nashi
  stage = scene(E, { heading: 'EXT. ACADEMY COURTYARD - NIGHT', bg: 'academy', grade: 'night', music: 'danger', musicOpts: { vol: 0.75 },
    cast: { gonda: { x: 340, facing: 1, pose: 'lying', expr: 'closed' }, shiori: { x: 700, facing: 1, pose: 'brushHold', expr: 'serious', wind: 0.4 }, nashi: { x: 1320, facing: -1, pose: 'bladeReady', expr: 'neutral', wind: 0.4 } } }, [
    { wide: 2.8, fn: (s) => { s.fx('whiteBlot', { x: 900, y: 360, r: 200, seed: 900, layer: 'back' }, 3); s.fx('whiteBlot', { x: 600, y: 470, r: 170, seed: 600, layer: 'back' }, 3); s.fx('whiteBlot', { x: 1250, y: 330, r: 190, seed: 1250, layer: 'back' }, 3); }, note: 'Shiori, still in training clothes, stands between the intruder and the academy.' },
    ['shiori', 'Stop right there.', { frame: 'medium' }],
    ['shiori', 'This is Hitsuzan Academy. You are trespassing.'],
    ['nashi', 'Ah. The Kaisho girl. The one with the beautiful dragon.', { frame: 'close' }],
    ['shiori', "White coat. Porcelain mask. You're from Hakushi... the cult of the Blank.", { frame: 'close', expr: 'serious' }],
    ['nashi', 'A cult? No, no. We are editors.', { frame: 'medium', pose: 'palmOut' }],
    ['nashi', 'The world is so crowded with words. We are simply... tidying up.'],
    ['shiori', 'Then allow me to correct you.', { expr: 'determined', frame: 'close', pose: 'brushHold' }],
    { music: 'battle', vol: 0.75, fade: 0.2 },
    { shot: (s) => {
      write(s, 'shiori', '斬', { x: 960, y: 520, size: 260, color: '#e8fdff', glow: '#3fe0d0', d: 1.0, hold: 0.2, poses: ['brushSide', 'brushUp', 'brushDown', 'brushSide'] });
      s.at(1.25, (b) => { b.pose('shiori', 'slash', 0.08); b.fx('slashArc', { x: 1100, y: 560, size: 380, ang: 0.3, color: '#e8fdff', glow: '#3fe0d0' }, 0.5); b.sfx('slash'); b.fx('hlines', { color: '#bff' }, 0.8); });
      s.wait(1.9);
    }, cam: { x: 960, y: 560, z: 1.1 } },
    { shot: (s) => {
      s.pose('nashi', 'block', 0.08);
      s.fx('erase', { x: 1220, y: 560, w: 300, h: 360, n: 70, float: true, cell: 22 }, 1.5); s.sfx('erase');
      s.wait(1.6);
    }, cam: { frame: ['nashi', 'medium'] }, note: 'The slash dissolves into white flakes before it can touch him.' },
    ['nashi', 'Lovely stroke order.', { frame: 'close', pose: 'bladeReady' }],
    { shot: (s) => {
      write(s, 'shiori', '雷', { x: 980, y: 400, size: 240, color: '#f4ecff', glow: '#a080ff', d: 0.9, hold: 0.2 });
      s.at(1.1, (b) => { b.fx('lightning', { x: 1320, y0: -100, y1: 900, seed: 3 }, 0.6); b.fx('flash', { color: '#e8e0ff', a: 0.7 }, 0.3); b.sfx('thunder'); b.shake(16, 0.5); });
      s.at(1.15, (b) => { b.move('nashi', 1500, 0.15, { motion: 'idle', face: false }); });
      s.at(1.5, (b) => { b.fx('erase', { x: 1320, y: 500, w: 160, h: 700, n: 50, float: true }, 1); b.sfx('erase', { vol: 0.6 }); });
      s.wait(2.6);
    }, cam: WIDE },
    ['shiori', 'Then how about THIS?!', { expr: 'angry', frame: 'close', style: 'shout' }],
    { shot: (s) => {
      write(s, 'shiori', '刃', { x: 960, y: 500, size: 220, color: '#e8fdff', glow: '#3fe0d0', d: 0.7, hold: 0.1, poses: ['brushSide', 'brushDown', 'brushUp'] });
      [[0.9, 0.2, 1100, 480], [1.1, -0.5, 1150, 600], [1.3, 0.9, 1120, 420], [1.5, -0.1, 1180, 540], [1.7, 0.5, 1140, 640]].forEach(([t, ang, x, y], i) => s.at(t, (b) => {
        b.fx('slashArc', { x, y, size: 300, ang, color: '#e8fdff', glow: '#3fe0d0', flip: i % 2 === 1 }, 0.4); b.sfx('slash', { vol: 0.7 });
        b.pose('nashi', i % 2 ? 'bladeSwing' : 'block', 0.05);
        b.at(0.15, (c) => c.fx('erase', { x: x + 120, y, w: 200, h: 200, n: 30, float: true, seed: i + 3 }, 0.7));
      }));
      s.fx('hlines', { color: '#bff', alpha: 0.5 }, 2.2);
      s.wait(2.5);
    }, cam: WIDE, note: 'She writes 刃, "blade". Five flying blades. He erases every one.' },
    ['nashi', 'Ah. You are getting faster. How diligent.', { frame: 'medium', pose: 'bladeReady' }],
    ['shiori', "Why won't it land?!", { expr: 'angry', frame: 'close' }],
    ['nashi', 'Because your words are perfect, Kaisho Shiori.', { frame: 'medium' }],
    ['nashi', 'Every line exactly where the dictionary says it should be.'],
    ['nashi', 'Neat words are easy to read...', { cut: true, frame: 'close' }],
    { shot: (s) => {
      s.fx('erase', { x: 1500, y: 600, w: 260, h: 600, n: 60, float: true }, 1); s.to('nashi', { alpha: 0 }, 0.2); s.sfx('vanish');
      s.at(0.5, (b) => { b.set('nashi', { x: 520, facing: 1 }); b.to('nashi', { alpha: 1 }, 0.15); b.fx('erase', { x: 520, y: 600, w: 240, h: 600, n: 50, float: true, reverse: true }, 0.6); });
      s.wait(0.9);
    }, cam: WIDE },
    ['nashi', '...and easy to erase.', { cam: { two: ['nashi', 'shiori'], tight: true }, d: 2.4 }],
    { react: 'shiori', expr: 'shocked', d: 0.8, sfx: 'gasp' },
    { shot: (s) => {
      s.face('shiori', -1);
      s.pose('shiori', 'brushUp', 0.06); s.at(0.2, (b) => b.pose('shiori', 'brushDown', 0.06));
      s.fx('shield', { x: 610, y: 600, w: 200, h: 460, color: '#6fe6ff', crackAt: 0.45 }, 2);
      s.sfx('kanji');
      s.at(0.6, (b) => b.pose('nashi', 'palmOut', 0.1));
      s.at(0.9, (b) => { b.sfx('shatter'); b.fx('erase', { x: 610, y: 600, w: 240, h: 480, n: 80, float: true }, 1.2); });
      s.at(1.0, (b) => { b.sfx('bighit'); b.fx('impact', { x: 640, y: 560, size: 260 }, 0.5); b.fx('flash', {}, 0.3); b.shake(24, 0.6); b.pose('shiori', 'knock', 0.06); b.expr('shiori', 'pain'); b.to('shiori', { x: 1150 }, 0.5, 'out'); });
      s.at(1.5, (b) => { b.pose('shiori', 'downKnee', 0.1); b.fx('dust', { x: 1150, y: G }, 0.8); b.sfx('thud'); });
      s.wait(2.3);
    }, cam: WIDE, note: 'Shiori throws up a shield: 盾. Nashi taps it with one finger. It shatters, and the blast throws her across the courtyard.' },
    { shot: (s) => { s.set('shiori', { item: BROKEN, pose: 'downKnee' }); s.sfx('crack'); s.fx('inkSplash', { x: 1240, y: 900, size: 60 }, 1); s.wait(1.4); }, cam: { x: 1200, y: 860, z: 2.2 }, note: 'Her brush lies snapped in two.' },
    ['shiori', 'My... brush...', { expr: 'pain', frame: 'close' }],
    { music: 'despair', vol: 0.7, fade: 0.8 },
    { shot: (s) => { s.move('nashi', 900, 2, { motion: 'walk', speed: 0.6, stop: 'bladeRaise' }); s.say('nashi', "Don't worry. Soon you won't even remember you had one.", { d: 3.8 }); }, cam: { two: ['nashi', 'shiori'] } },
    ['shiori', "Mother... Father... I'm sorry.", { style: 'think', expr: 'teary', frame: 'xclose', silent: true, before: (s) => s.set('shiori', { tears: 1 }) }],
    ['shiori', "I couldn't keep the shape...", { style: 'think', silent: true }],
  ]);

  // ---------------------------------------------------------------- B3: Kakeru arrives
  stage.cast.kakeru = { x: -250, facing: 1, pose: 'stand', expr: 'angry', visible: false, wind: 0.5 };
  stage.cast.nijimi = { x: -350, facing: 1, expr: 'angry', visible: false };
  stage = scene(E, { heading: 'EXT. ACADEMY COURTYARD - CONTINUOUS', bg: 'academy', grade: 'night', cast: stage.cast }, [
    { shot: (s) => {
      s.say('kakeru', 'HEY, CHALK-FACE!', { style: 'shout', d: 1.6 });
      s.at(0.6, (b) => { b.fx('frog', { x0: 100, x1: 980, y0: 700, y1: 380, hops: 1, size: 40, hop: 160 }, 0.7); b.sfx('boing'); });
      s.at(1.3, (b) => { b.fx('fire', { x: 990, y: 380, w: 70, h: 90, n: 14, size: 26 }, 1); b.fx('impact', { x: 990, y: 380, size: 90 }, 0.4); b.sfx('pop'); b.pose('nashi', 'stand', 0.1); });
      s.wait(0.9);
    }, cam: { frame: ['nashi', 'medium'] }, note: 'A burning frog smacks into Nashi\'s mask.' },
    { react: 'nashi', d: 1.3, sfx: 'fire' },
    { set: { kakeru: { visible: true, x: 260 }, nijimi: { visible: true, x: 120 } } },
    { shot: (s) => { s.music('battle', { vol: 0.8, fade: 0.2 }); s.pose('kakeru', 'point', 0.15); s.say('kakeru', 'Get away from her!', { style: 'shout', d: 2.2, expr: 'shout' }); }, cam: { frame: ['kakeru', 'full'] } },
    ['shiori', "Sumizome?! You idiot, run! You can't even write 'fire'!", { expr: 'shocked', frame: 'close', before: (s) => s.set('shiori', { tears: 0 }) }],
    ['kakeru', 'Yeah. I know.', { expr: 'grin', frame: 'close', pose: 'stand' }],
    ['kakeru', "But I'm not gonna stand here and watch you get erased!", { expr: 'determined', pose: 'fists', cut: true, frame: 'medium' }],
    ['nashi', 'Ah... the boy with the frog. The one who failed.', { frame: 'close', before: (s) => s.face('nashi', -1) }],
    ['kakeru', "I failed the exam. I'm NOT failing this!", { style: 'shout', expr: 'shout', frame: 'medium', pose: 'brushHold' }],
    { shot: (s) => {
      s.move('kakeru', 520, 0.4, { motion: 'run', speed: 1.5 }); s.sfx('whoosh');
      s.at(0.4, (b) => { scribble(b, 'kakeru', { x: 700, y: 520, size: 240, d: 0.7, plain: true, color: '#ff8a3a', glow: '#ff5a1f', seed: 31 }); });
      s.at(1.2, (b) => { b.pose('nashi', 'palmOut', 0.08); b.fx('erase', { x: 700, y: 520, w: 280, h: 280, n: 60, float: true }, 1); b.sfx('erase'); });
      s.at(1.4, (b) => { b.fx('impact', { x: 560, y: 560, size: 200 }, 0.4); b.sfx('hit'); b.pose('kakeru', 'knock', 0.06); b.expr('kakeru', 'pain'); b.to('kakeru', { x: 200 }, 0.45, 'out'); b.shake(16, 0.4); });
      s.at(1.9, (b) => { b.pose('kakeru', 'downKnee', 0.1); b.fx('dust', { x: 200, y: G }, 0.8); b.sfx('thud'); });
      s.wait(2.5);
    }, cam: WIDE },
    ['nashi', 'Messy words are still words. And all words end.', { frame: 'medium' }],
    { shot: (s) => {
      s.pose('kakeru', 'brushHold', 0.15); s.expr('kakeru', 'angry'); s.set('kakeru', { sweat: true });
      s.at(0.3, (b) => scribble(b, 'kakeru', { x: 430, y: 500, size: 220, d: 0.6, plain: true, color: '#ff8a3a', seed: 47 }));
      s.at(1.0, (b) => { b.fx('erase', { x: 430, y: 500, w: 260, h: 260, n: 50, float: true }, 0.8); b.sfx('erase', { vol: 0.7 }); b.fx('impact', { x: 260, y: 520, size: 180 }, 0.35); b.sfx('punch'); b.pose('kakeru', 'hurt', 0.05); b.fx('invert', {}, 0.12); b.shake(14, 0.3); });
      s.at(1.5, (b) => { b.pose('kakeru', 'brushHold', 0.12); });
      s.at(1.8, (b) => scribble(b, 'kakeru', { x: 430, y: 520, size: 220, d: 0.5, plain: true, color: '#ff8a3a', seed: 59 }));
      s.at(2.4, (b) => { b.fx('erase', { x: 430, y: 520, w: 260, h: 260, n: 50, float: true }, 0.8); b.fx('impact', { x: 240, y: 560, size: 220 }, 0.4); b.sfx('bighit'); b.pose('kakeru', 'knock', 0.05); b.to('kakeru', { x: 140 }, 0.3, 'out'); b.shake(20, 0.4); });
      s.at(2.9, (b) => { b.pose('kakeru', 'downKnee', 0.1); b.expr('kakeru', 'pain'); b.sfx('thud'); });
      s.wait(3.5);
    }, cam: { x: 600, y: 560, z: 1.15 }, note: 'Again and again Kakeru writes. Again and again it is erased, and he is thrown back.' },
    ['shiori', 'Stop it! Just run!', { style: 'shout', expr: 'teary', frame: 'close' }],
    ['kakeru', 'Nope!', { expr: 'grin', frame: 'close', d: 1.6 }],
    ['kakeru', "Grandma said a Fudeshi's brush exists to protect people.", { expr: 'serious', cut: true, frame: 'close' }],
    ['kakeru', "If I run away now... I'll never get to call myself one.", { expr: 'determined' }],
  ]);

  // ---------------------------------------------------------------- B4: awakening
  stage = scene(E, { heading: 'EXT. ACADEMY COURTYARD - CONTINUOUS', bg: 'academy', grade: 'night', cast: stage.cast }, [
    { music: 'despair', vol: 0.5, fade: 1 },
    ['nashi', 'Why do you keep writing? You cannot win.', { frame: 'close' }],
    ['kakeru', 'Because... my grandma told me something once.', { expr: 'serious', frame: 'close' }],
  ]);
  scene(E, { bg: 'room', grade: 'sepia', cast: { chiyo: { x: 960, facing: -1, pose: 'kneel', expr: 'smile' } } }, [
    ['chiyo', 'A word is a wish you send to the world.', { frame: 'close', in: 'white', inD: 0.3 }],
  ]);
  stage = scene(E, { bg: 'academy', grade: 'night', cast: stage.cast }, [
    ['kakeru', 'A word... is a wish.', { expr: 'determined', frame: 'xclose' }],
  ]);
  scene(E, { heading: 'INNER SPACE', bg: 'ink', fx: [{ type: 'glow', x: 1080, y: 900, r: 190, color: '#9aa6ff', a: 0.55, layer: 'back', pulse: 2 }, { type: 'glow', x: 860, y: 640, r: 420, color: '#ffcf4a', a: 0.28, layer: 'back', pulse: 1.5 }], cast: { kakeru: { x: 860, facing: 1, pose: 'stand', expr: 'calm', wind: 0.4 }, nijimi: { x: 1080, facing: -1, expr: 'happy' } } }, [
    { wide: 2.4, in: 'white', inD: 0.4, cam: { x: 960, y: 640, z: 1.2 }, note: 'A space of floating ink. Just Kakeru and Nijimi.', fn: (s) => s.fx('embers', { n: 40, color: '#ffcf4a' }, 2.4) },
    ['nijimi', 'Niji...', { cam: { two: ['kakeru', 'nijimi'], tight: true }, fx: [['embers', { n: 40, color: '#ffcf4a' }, 3]] }],
    ['kakeru', 'Nijimi... you were my wish. My very first word.', { expr: 'smile', frame: 'close', fx: [['embers', { n: 30, color: '#ffcf4a' }, 4]] }],
    ['kakeru', 'And you never left. Not even once.'],
    ['kakeru', "So this time... I'm gonna wish for something BIG.", { expr: 'determined', frame: 'medium', fx: [['embers', { n: 50, color: '#ffcf4a' }, 4]], out: 'white', outD: 0.3 }],
  ]);
  stage = scene(E, { bg: 'academy', grade: 'night', cast: stage.cast }, [
    { music: 'awaken', vol: 0.85, fade: 0.5 },
    { shot: (s) => {
      s.pose('kakeru', 'stand', 0.5); s.at(0.5, (b) => b.pose('kakeru', 'brushHold', 0.3));
      s.to('kakeru', { wind: 1 }, 1); s.set('kakeru', { sweat: false });
      s.fx('aura', { who: 'kakeru', fadeIn: true }, 4); s.sfx('power');
      s.fx('embers', { n: 60 }, 4);
      s.cam({ frame: ['kakeru', 'medium'] }, 3.6);
      s.wait(3.6);
    }, cam: { frame: ['kakeru', 'full'] }, note: 'Kakeru rises. The wind turns. A crimson-gold glow gathers around him.' },
    ['kakeru', 'You said neat words are easy to read... and easy to erase?', { expr: 'serious', frame: 'medium', before: (s) => s.fx('aura', { who: 'kakeru' }, 4) }],
    { react: 'nashi', d: 1.0 },
    { shot: (s) => { s.fx('aura', { who: 'kakeru' }, 3.4); s.fx('speedlines', { color: '#ffcf4a', alpha: 0.6 }, 3.4); s.shake(10, 0.6); s.say('kakeru', "Then I'll write something NOBODY can read!", { style: 'shout', expr: 'shout', d: 3.4 }); }, cam: { frame: ['kakeru', 'close'] } },
    { shot: (s) => {
      s.fx('aura', { who: 'kakeru', size: 1.2 }, 3.6);
      s.fx('rays', { x: 640, y: 480, color: '#ffcf4a', a: 0.35 }, 3.6, { layer: 'back' });
      scribble(s, 'kakeru', { x: 650, y: 480, size: 420, d: 1.6, ...GOLD, seed: 7, hold: 2.5 });
      s.fx('hlines', { color: '#ffcf4a', alpha: 0.5 }, 1.6);
      s.wait(2.2);
    }, cam: { x: 520, y: 560, z: 1.2 }, note: 'He writes. The stroke is crimson and gold. It isn\'t any kanji that exists.' },
    { shot: (s) => {
      s.fx('scribble', { x: 650, y: 480, size: 420, ...GOLD, seed: 7, write: 0.01, fadeAt: 2 }, 2.6);
      s.fx('aura', { who: 'kakeru' }, 2.6);
      s.move('nashi', 820, 0.3, { motion: 'run', speed: 2, stop: 'bladeRaise' }); s.sfx('whoosh');
      s.at(0.45, (b) => { b.pose('nashi', 'bladeSwing', 0.06); b.sfx('shing'); b.fx('impact', { x: 760, y: 480, size: 240, color: '#fff4c8' }, 0.5); b.fx('flash', { a: 0.6 }, 0.3); b.shake(18, 0.5); });
      s.wait(2.4);
    }, cam: WIDE, note: 'Nashi\'s eraser blade strikes the stroke and simply stops. The stroke remains.' },
    ['nashi', "It won't erase...? Why won't it ERASE?!", { style: 'shout', frame: 'close', before: (s) => s.fx('scribble', { x: 650, y: 480, size: 420, ...GOLD, seed: 7, write: 0.01, fadeAt: 2 }, 4) }],
    ['nashi', "What is this word?! It's not in any dictionary!", { cam: { x: 760, y: 540, z: 1.2 }, before: (s) => s.fx('scribble', { x: 650, y: 480, size: 420, ...GOLD, seed: 7, write: 0.01, fadeAt: 2 }, 4) }],
    ['kakeru', "I don't know what it says...", { expr: 'determined', frame: 'xclose', before: (s) => s.fx('aura', { who: 'kakeru' }, 4) }],
    { shot: (s) => { s.fx('aura', { who: 'kakeru', size: 1.4 }, 2.4); s.fx('speedlines', { color: '#ff3a4a' }, 2.4); s.shake(14, 2.2); s.say('kakeru', '...but I MEAN IT!', { style: 'shout', expr: 'shout', d: 2.4 }); }, cam: { frame: ['kakeru', 'eyes'] } },
    { shot: (s) => {
      s.title('technique', { jp: '落書き流・咆哮', en: 'DOODLE STYLE: ROARING SCRIBBLE!' }, 3.6);
      s.fx('aura', { who: 'kakeru', size: 1.3 }, 3.6); s.fx('speedlines', { color: '#ffcf4a' }, 3.6);
      s.pose('kakeru', 'brushUp', 0.1); s.at(1.6, (b) => b.pose('kakeru', 'brushDown', 0.08));
      s.sfx('riser');
      s.say('kakeru', 'Doodle Style... ROARING SCRIBBLE!!!', { style: 'shout', expr: 'shout', d: 3.6 });
    }, bg: 'ink', var: 'red', grade: null, only: ['kakeru'], cam: { frame: ['kakeru', 'full'] } },
    { shot: (s) => {
      s.fx('beast', { x0: 300, x1: 1500, y0: 520, y1: 520, size: 300, travel: 0.75 }, 2.4); s.sfx('roar');
      s.fx('hlines', { color: '#ff3a4a' }, 2.2); s.shake(12, 2);
      s.at(1.4, (b) => { b.pose('nashi', 'block', 0.06); });
      s.wait(1.8);
    }, cam: WIDE, note: 'The scribble tears free of the air and becomes a roaring ink beast.' },
    { shot: (s) => {
      s.sfx('explosion'); s.sfx('impact');
      s.fx('invert', { until: 0.4 }, 0.5); s.fx('impact', { x: 1250, y: 520, size: 420, color: '#ffcf4a' }, 0.8); s.fx('shockwave', { x: 1250, y: 560, size: 900, color: '#ffcf4a' }, 1); s.shake(34, 1.2);
      s.at(0.2, (b) => { b.pose('nashi', 'knock', 0.05); b.to('nashi', { x: 2300, y: G - 150 }, 0.7, 'out'); });
      s.at(0.5, (b) => { b.fx('whiteBlot', { x: 1700, y: 600, r: 140, grow: true, seed: 17, layer: 'back' }, 3); b.fx('dust', { x: 1800, y: G }, 1.2); b.sfx('bighit'); });
      s.wait(2);
    }, cam: { x: 1250, y: 560, z: 1.05 } },
    { music: null, fade: 0.6 },
    { shot: (s) => {
      s.set('nashi', { x: 1650, y: G, pose: 'hurt', crack: 0.35 });
      s.fx('dust', { x: 1650, y: G - 100 }, 1.6);
      s.at(0.8, (b) => b.pose('nashi', 'stand', 0.6));
      s.at(1.4, (b) => { b.to('nashi', { crack: 0.85 }, 0.3); b.sfx('crack'); });
      s.wait(2.6);
    }, cam: { frame: ['nashi', 'medium'] }, note: 'Nashi rises from the rubble. With a sharp crack, half his mask splits apart.' },
    { music: 'villain', vol: 0.6, fade: 0.5 },
    ['nashi', 'Kami-moji... The First Script.', { frame: 'close' }],
    ['nashi', "So it wasn't sealed away with him after all..."],
    ['nashi', 'Sumizome Kakeru. The Master will want to know about you.', { frame: 'xclose', cut: true }],
    { shot: (s) => { s.to('nashi', { alpha: 0 }, 1.2); s.fx('erase', { x: 1650, y: 600, w: 320, h: 640, n: 90, float: true }, 1.8); s.sfx('vanish'); s.wait(2); }, cam: { frame: ['nashi', 'full'] }, note: 'He dissolves into white flakes and is gone.' },
    { music: 'hope', vol: 0.5, fade: 2 },
    { shot: (s) => { s.pose('kakeru', 'kneel', 0.3); s.expr('kakeru', 'dazed'); s.sfx('thud'); s.wait(1.4); }, cam: { frame: ['kakeru', 'full'] } },
    ['kakeru', 'Heh... Did you see that, Nijimi? It worked...', { expr: 'dazed', frame: 'close' }],
    ['shiori', '...What did you write just now?', { expr: 'surprised', frame: 'close' }],
    ['kakeru', 'No idea.', { expr: 'grin', frame: 'close', d: 1.8 }],
    { shot: (s) => { s.pose('kakeru', 'lying', 0.4); s.expr('kakeru', 'closed'); s.sfx('thud', { at: 0.3 }); s.wait(1.6); }, cam: { frame: ['kakeru', 'full'] } },
    ['shiori', '...Idiot.', { expr: 'smile', frame: 'close', d: 2.2, before: (s) => s.set('shiori', { blush: 1 }) }],
    { shot: (s) => {
      s.set('gonda', { x: 300, pose: 'stand', expr: 'pain', visible: true });
      s.fx('scribble', { x: 650, y: 480, size: 420, ...GOLD, seed: 7, write: 0.01, fadeAt: 2 }, 3.4);
      s.fx('glow', { x: 650, y: 480, r: 380, color: '#ffcf4a', a: 0.4 }, 3.4);
      s.move('gonda', 420, 1.5, { motion: 'walk', speed: 0.5, stop: 'stand' });
      s.say('gonda', 'That stroke... it is still burning...', { d: 3.4, expr: 'surprised' });
    }, cam: { x: 560, y: 560, z: 1.15 }, note: 'Gonda staggers up. Kakeru\'s stroke still hangs in the air, glowing.' },
    ['shiori', 'Sumizome wrote it.', { expr: 'serious', frame: 'close', before: (s) => s.set('shiori', { blush: 0 }) }],
    ['gonda', '...Impossible.', { expr: 'shocked', frame: 'close', hold: 0.6, out: 'fade' }],
  ]);

  // ---------------------------------------------------------------- B5: dawn
  scene(E, { heading: 'EXT. HILL ABOVE THE VILLAGE - DAWN', bg: 'hill', var: 'dawn', music: 'hope', musicOpts: { vol: 0.6 },
    cast: { kakeru: { x: 860, facing: 1, pose: 'lying', expr: 'closed' }, nijimi: { x: 700, facing: 1, expr: 'happy' }, bokusai: { x: 1160, facing: -1, pose: 'sitFloor', expr: 'calm', hat: true } } }, [
    { wide: 4, in: 'fade', title: { text: 'The next morning', jp: '翌朝' }, sfx: 'bird' },
    ['kakeru', 'Mm... huh? Where am I...?', { expr: 'sleepy', pose: 'sitFloor', frame: 'medium' }],
    ['kakeru', 'AH! The old drunk!', { style: 'shout', expr: 'shocked', pose: 'shock', frame: 'close', before: (s) => s.face('kakeru', 1) }],
    ['bokusai', 'Morning, Scribbles. You slept like a log. A very loud log.', { expr: 'smug', frame: 'medium' }],
    ['bokusai', 'That stroke you wrote last night. Do you know what it was?', { expr: 'calm', cut: true, frame: 'close' }],
    ['kakeru', 'Uh... a really cool doodle?', { expr: 'grin', pose: 'scratchHead', frame: 'close' }],
    ['bokusai', 'Kami-moji. The First Script.', { expr: 'serious', frame: 'close', before: (s) => s.set('bokusai', { hat: false }) }],
    ['bokusai', 'Words that existed before dictionaries. Before rules. Before stroke order.'],
    ['bokusai', 'Only one man in history could write it...', { cut: true, frame: 'xclose' }],
    ['bokusai', '...the master who sealed the Blank, twelve years ago.'],
    ['kakeru', 'The legendary master...?', { expr: 'surprised', frame: 'close' }],
    ['kakeru', 'Wait. How do YOU know all this? Who are you, really?', { expr: 'serious', cut: true, frame: 'medium' }],
    { react: 'bokusai', expr: 'calm', d: 1.2 },
    ['bokusai', "Me? I'm just the old man who taught him how to hold a brush.", { expr: 'smile', frame: 'close' }],
    { shot: (s) => { s.fx('speedlines', {}, 1.8); s.shake(14, 0.5); s.sfx('sting'); s.say('kakeru', 'EHHHHH?!', { style: 'shout', expr: 'shocked', pose: 'shock', d: 1.8 }); }, cam: { frame: ['kakeru', 'xclose'] } },
    ['bokusai', 'Hakushi will come for you now. They erase whatever they fear.', { pose: 'stand', expr: 'serious', frame: 'medium' }],
    ['bokusai', 'So. Do you want to keep failing exams...', { cut: true, frame: 'close' }],
    ['bokusai', '...or do you want to learn how to write?', { expr: 'smug' }],
    ['kakeru', 'Write properly? You mean... neat?', { expr: 'surprised', pose: 'stand', frame: 'medium' }],
    ['bokusai', 'Neat? Ha! No. I mean LOUD.', { expr: 'grin', frame: 'close' }],
    ['kakeru', 'Loud...?', { expr: 'surprised', frame: 'close' }],
    ['bokusai', 'Watch.', { pose: 'brushHold', expr: 'focused', frame: 'medium', d: 1.6 }],
    { shot: (s) => {
      s.pose('bokusai', 'brushUp', 0.15); s.at(0.5, (b) => b.pose('bokusai', 'brushSide', 0.08));
      s.fx('kanji', { ch: '一', x: 960, y: 200, size: 1200, color: '#fff4d0', glow: '#ffb03a', write: 0.18, fadeAt: 0.8 }, 3.6);
      s.at(0.6, (b) => { b.sfx('slash'); b.sfx('wind', { at: 0.1 }); b.fx('slashArc', { x: 960, y: 1400, size: 1400, ang: -0.1, color: '#fff4d0', glow: '#ffb03a' }, 0.7); });
      s.at(0.9, (b) => { b.fx('erase', { x: 960, y: 220, w: 1900, h: 120, n: 120, float: true, cell: 30 }, 2.4); b.sfx('impact', { vol: 0.6 }); b.shake(10, 0.6); });
      s.wait(3.6);
    }, cam: { x: 960, y: 420, z: 1 }, note: 'One horizontal stroke. 一, "one". The clouds above the valley split cleanly in two.' },
    { react: 'kakeru', expr: 'sparkle', d: 1.1 },
    ['kakeru', 'WHOA! He split the CLOUDS in half!', { style: 'shout', expr: 'sparkle', pose: 'cheer', frame: 'medium' }],
    ['bokusai', "One stroke. One meaning. Meant with everything you've got.", { expr: 'calm', frame: 'close', pose: 'stand' }],
    ['bokusai', "That's all writing ever was."],
    ['kakeru', "Then teach me! I'll be the greatest Brush Master in history! Ink it in!", { style: 'shout', pose: 'fistUp', expr: 'shout', frame: 'medium', fx: [['speedlines', {}, 3]] }],
    ['bokusai', 'Hmph. First lesson: wash your brush.', { expr: 'calm', frame: 'medium', pose: 'armsCross' }],
    ['kakeru', 'EH?!', { style: 'shout', expr: 'shocked', pose: 'shock', frame: 'close', shake: 10, d: 1.5 }],
    { shot: (s) => { s.to('nijimi', { y: G - 60 }, 0.2, 'out'); s.at(0.2, (b) => b.to('nijimi', { y: G }, 0.2, 'in')); s.say('nijimi', 'Niji! Niji! Niji!', { d: 2 }); }, cam: { two: ['kakeru', 'nijimi'] } },
  ]);
  scene(E, { bg: 'hill', var: 'dawn', cast: { kakeru: { x: 760, facing: 1, pose: 'stand', expr: 'grin', wind: 0.6 }, nijimi: { x: 620, facing: 1, expr: 'happy' }, shiori: { x: 1500, facing: -1, pose: 'brushHold', item: BROKEN, expr: 'serious', wind: 0.8 } } }, [
    { shot: (s) => { s.move('shiori', 1160, 2.2, { motion: 'walk', stop: 'brushHold' }); s.wait(2.4); }, cam: { two: ['kakeru', 'shiori'] }, note: 'Shiori climbs the hill toward them, her broken brush in hand.' },
    ['shiori', 'Sumizome.', { frame: 'close', d: 1.6 }],
    ['kakeru', 'Shiori! Are you okay? Your brush...', { expr: 'worried', frame: 'close' }],
    ['shiori', "...Thank you. For last night.", { expr: 'embarrassed', frame: 'close', look: [0.1, 0.5], before: (s) => s.set('shiori', { blush: 1 }) }],
    ['shiori', "But don't misunderstand. This doesn't make us friends.", { expr: 'cold', cut: true, frame: 'close', look: [0.2, 0], before: (s) => s.set('shiori', { blush: 0 }) }],
    ['kakeru', "So we're rivals? Cool! Rivals are even better!", { expr: 'grin', pose: 'fistPump', frame: 'medium' }],
    { shot: (s) => { s.expr('shiori', 'embarrassed'); s.set('shiori', { blush: 1 }); s.say('shiori', 'Hmph.', { d: 1.4 }); s.face('shiori', 1); s.move('shiori', 1700, 2, { motion: 'walk' }); s.wait(1.2); }, cam: { frame: ['shiori', 'medium'], side: 'l' } },
    { shot: (s) => { s.set('shiori', { x: 1500, facing: -1, blush: 0, expr: 'serious', pose: 'brushHold' }); s.wait(2.2); }, only: ['shiori'], cam: { x: 1400, y: 600, z: 1.1 }, note: 'At the edge of the hill she stops and looks back at him.' },
    ['shiori', 'Kami-moji... Sumizome Kakeru.', { style: 'think', frame: 'close', silent: true }],
    ['shiori', "Next time, I'll be the one doing the protecting.", { expr: 'determined', frame: 'medium' }],
  ]);
  scene(E, { heading: 'INT. THE WHITE VOID - THRONE OF BLANK PAGES', bg: 'void', var: 'throne', grade: 'cold', music: 'villain', musicOpts: { vol: 0.8, fade: 0.5 },
    cast: { hakuo: { x: 960, y: 650, facing: 1, pose: 'sit', expr: 'neutral' }, nashi: { x: 1450, facing: -1, pose: 'kneel', expr: 'neutral', crack: 0.85 } } }, [
    { wide: 3.6, in: 'fade', cam: { x: 960, y: 540, z: 0.95 }, camTo: { x: 1100, y: 560, z: 1.05 }, fn: (s) => s.fx('sheets', { n: 16 }, 3.6) },
    ['nashi', "Forgive me, my King. The seal-breaker's script... a boy wrote it.", { frame: 'medium' }],
    ['hakuo', 'The First Script has awakened...', { name: 'The White King', cam: { x: 960, y: 420, z: 2.2 } }],
    ['nashi', 'His stroke would not erase, my King. It burned through my mask.', { frame: 'close' }],
    ['hakuo', 'Of course. The First Script cannot be erased. Only forgotten.', { name: 'The White King', cam: { x: 960, y: 410, z: 2.6 } }],
    ['hakuo', 'How delightful.', { name: 'The White King', cam: { x: 960, y: 400, z: 3 } }],
    ['hakuo', 'Find the boy. And bring me his name.', { name: 'The White King', cam: { frame: ['hakuo', 'xclose'] }, hold: 0.8, out: 'fade' }],
  ]);
  E.shot({ bg: 'plain', var: '#000000', cam: WIDE }, (s) => { s.title('card', { text: 'TO BE CONTINUED', size: 70, sub: '' }, 3); s.wait(3); });
  E.musicNow(null, { fade: 0.8 });
}
