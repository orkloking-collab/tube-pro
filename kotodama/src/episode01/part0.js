// COLD OPEN + OPENING TITLES
import { scene, write, G, WIDE } from './kit.js';

export function coldOpen(E) {
  E.chapter('Cold Open');
  E.scene('COLD OPEN. THE BLANK PAGE.');
  E.musicNow('legend', { vol: 0.8, fade: 2 });

  E.shot({ bg: 'paper', in: 'fade', inD: 1.5, cam: { x: 960, y: 540, z: 1 } }, (s) => {
    s.note('A white page fills the frame. A single drop of ink falls.');
    s.cam({ x: 960, y: 560, z: 1.15 }, 6.5);
    s.fx('drop', { x: 960, y: 560, y0: -60 }, 1.6, { at: 1.2 });
    s.at(2.15, (b) => { b.fx('inkSplash', { x: 960, y: 560, size: 130, seed: 4 }, 1.6); b.fx('inkPool', { x: 960, y: 560, r: 46, seed: 4 }, 5); b.sfx('splash'); });
    s.wait(0.6);
    s.narr('In the beginning, there was only the blank page.', { d: 5.6 });
  });
  E.shot({ bg: 'paper', cam: { x: 960, y: 540, z: 1.05 } }, (s) => {
    s.cam({ x: 960, y: 540, z: 1.15 }, 5);
    s.fx('kanji', { ch: '一', x: 960, y: 560, size: 900, color: '#16101e', write: 0.45, fadeAt: 2 }, 4.6);
    s.sfx('brush', { at: 0.2 });
    s.narr('Then someone wrote the first word.', { d: 4.6 });
  });
  const element = (ch, color, glow, fxType, fxP, line, sfx) => E.shot({ bg: 'ink', cam: { x: 960, y: 520, z: 1 } }, (s) => {
    s.cam({ x: 960, y: 520, z: 1.12 }, 3.2);
    s.fx('kanji', { ch, x: 960, y: 470, size: 560, color, glow, write: 0.35, fadeAt: 0.9 }, 3.2);
    s.sfx('brush'); s.sfx('kanji', { at: 1.0 });
    s.at(1.1, (b) => { b.fx(fxType, fxP, 2.1); b.sfx(sfx); });
    s.narr(line, { d: 3.2 });
  });
  element('火', '#ffdf9a', '#ff5a1f', 'fire', { x: 960, y: 900, w: 1300, h: 600, n: 60, size: 90 }, 'Fire.', 'fire');
  element('水', '#d8f6ff', '#2a9aff', 'water', { x: 960, y: 1000, w: 1900, h: 420 }, 'Water.', 'water');
  element('風', '#e8fff4', '#3fe0a0', 'windSwirl', { x: 960, y: 560, size: 520 }, 'Wind.', 'wind');

  scene(E, { bg: 'village', var: 'day', cast: { extra3: { x: 760, facing: 1, pose: 'brushHold', item: { kind: 'brush', len: 1.3, r: 0.05, tip: 0.3, color: '#7a5a3a', band: '#2a1a1a', ink: '#111' } }, extra5: { x: 1250, facing: -1, expr: 'happy' }, extra8: { x: 1450, facing: -1, expr: 'smile' } } }, [
    { shot: (s) => {
      s.cam({ x: 1000, y: 560, z: 1.1 }, 6.4);
      write(s, 'extra3', '守', { x: 1080, y: 380, size: 300, color: '#ffe9a0', glow: '#ff9a1a', outline: '#3a1a08', d: 1.4, hold: 3.2 });
      s.at(1.5, (b) => b.fx('glow', { x: 1080, y: 420, r: 520, color: '#ffcf4a', a: 0.5 }, 4.5));
      s.narr('In the land of Hinomoto, words have power.', { d: 6.4 });
    }, cam: { x: 960, y: 540, z: 1 } },
  ]);
  scene(E, { bg: 'academy', cast: { extra1: { x: 640, facing: 1, pose: 'brushHold', item: { kind: 'brush', len: 1.3, r: 0.05, tip: 0.3, color: '#7a5a3a', band: '#2a1a1a', ink: '#111' } }, extra2: { x: 1280, facing: -1, pose: 'brushHold', item: { kind: 'brush', len: 1.3, r: 0.05, tip: 0.3, color: '#7a5a3a', band: '#2a1a1a', ink: '#111' } } } }, [
    { shot: (s) => {
      s.cam({ x: 960, y: 520, z: 1.12 }, 7.2);
      write(s, 'extra1', '光', { x: 800, y: 300, size: 230, color: '#fff2b0', glow: '#ffb020', outline: '#3a2008', hold: 4 });
      s.at(0.6, (b) => write(b, 'extra2', '心', { x: 1130, y: 300, size: 230, color: '#ffd0e0', glow: '#ff4a8a', outline: '#3a0818', hold: 3.4 }));
      s.narr('Those who write with spirit ink are called Fudeshi... Brush Masters.', { d: 7.2 });
    }, cam: WIDE },
  ]);
  E.musicNow('villain', { vol: 0.85, fade: 1.5 });
  E.shot({ bg: 'nightcity', cam: { x: 960, y: 520, z: 1 } }, (s) => {
    s.cam({ x: 960, y: 560, z: 1.08 }, 7);
    s.sfx('rumble');
    s.fx('blankWave', { x: 1500, y: 300, r: 900 }, 7.6, { at: 2 });
    s.at(2, (b) => b.sfx('erase'));
    s.at(4.5, (b) => b.sfx('erase'));
    s.narr('But twelve years ago, something came from beyond the margins of the world.', { d: 7.6 });
  });
  E.shot({ bg: 'void', cam: { x: 960, y: 540, z: 1.1 }, fx: [{ type: 'sheets', n: 22 }] }, (s) => {
    s.cam({ x: 960, y: 540, z: 1.0 }, 7);
    s.fx('erase', { x: 960, y: 540, w: 1900, h: 1000, n: 160, float: true, cell: 34 }, 7);
    s.sfx('erase');
    s.narr('The Blank. A hunger that erases everything it touches. Names. Homes. Memories.', { d: 7.4 });
  });
  E.shot({ bg: 'nightcity', cam: { x: 960, y: 480, z: 1.15 } }, (s) => {
    s.cam({ x: 960, y: 500, z: 1 }, 7.5);
    s.fx('rays', { x: 960, y: 360, color: '#ffe8a0', a: 0.45 }, 7.5);
    s.fx('kanji', { ch: '封', x: 960, y: 360, size: 560, color: '#fff4c8', glow: '#ffc83a', write: 0.55, fade: false }, 7.5);
    s.sfx('brush', { at: 0.3 }); s.sfx('brush', { at: 1.6 }); s.sfx('brush', { at: 2.9 });
    s.at(4.1, (b) => { b.sfx('gong'); b.fx('flash', {}, 0.6); b.shake(14, 0.6); });
    s.narr('One master stood against it... and with a single word, sealed it away.', { d: 7.5 });
  });
  E.shot({ bg: 'nightcity', cam: { x: 960, y: 500, z: 1 } }, (s) => {
    s.cam({ x: 960, y: 420, z: 0.92 }, 5.5);
    s.fx('kanji', { ch: '封', x: 960, y: 360, size: 560, color: '#fff4c8', glow: '#ffc83a', write: 0.01, fadeAt: 0.6 }, 5.5);
    s.narr('Then he vanished, and left behind only that word.', { d: 5.5 });
  });
  E.shot({ bg: 'ink', cam: { x: 960, y: 540, z: 1.3 }, out: 'fade', outD: 0.8 }, (s) => {
    s.cam({ x: 960, y: 540, z: 1.6 }, 5);
    s.fx('kanji', { ch: '封', x: 960, y: 540, size: 700, color: '#fff4c8', glow: '#ffc83a', write: 0.01, fade: false }, 5);
    s.fx('erase', { x: 960, y: 540, w: 760, h: 760, n: 70, float: true, cell: 30, seed: 12 }, 6, { at: 1.5 });
    s.at(1.8, (b) => b.sfx('crack'));
    s.narr('Now... that word is beginning to fade.', { d: 5 });
  });
  E.musicNow(null, { fade: 1.2 });
  E.shot({ bg: 'plain', var: '#000000', d: 0.8 });

  // Kakeru's declaration
  scene(E, { bg: 'hill', var: '', cast: { kakeru: { x: 900, facing: 1, expr: 'grin', wind: 1 }, nijimi: { x: 700, facing: 1, visible: false } }, music: 'daily', musicOpts: { vol: 0.6, fade: 0.5 } }, [
    { wide: 2.2, cam: { x: 960, y: 640, z: 1.0 }, camTo: { x: 920, y: 600, z: 1.15 }, sfx: 'wind', note: 'Morning. A hilltop above Sumikawa Village. A boy with a crimson scarf faces the sky.' },
    ['kakeru', 'HEY, WORLD! ARE YOU LISTENING?!', { style: 'shout', pose: 'fistUp', expr: 'shout', cam: { frame: ['kakeru', 'full'] }, hold: 0.3 }],
    ['kakeru', 'My name is Kakeru Sumizome!', { pose: 'handOnChest', expr: 'grin', frame: 'medium' }],
    ['kakeru', 'My handwriting is the worst in the whole village...', { pose: 'scratchHead', expr: 'embarrassed', frame: 'close', cut: true }],
    { set: { nijimi: { visible: true, x: 1090, facing: -1 } } },
    { shot: (s) => { s.sfx('pop'); s.to('nijimi', { y: G - 60 }, 0.15, 'out'); s.at(0.15, (b) => b.to('nijimi', { y: G }, 0.2, 'in')); s.say('nijimi', 'Niji! Niji!', { d: 1.6, expr: 'happy' }); }, cam: { two: ['kakeru', 'nijimi'], tight: true } },
    ['kakeru', "Hey! You didn't have to agree so fast!", { expr: 'annoyed', pose: 'point', cam: { two: ['kakeru', 'nijimi'], tight: true } }],
    ['kakeru', "But someday... everybody's gonna read my name!", { pose: 'fistUp', expr: 'determined', frame: 'medium', cut: true }],
    { shot: (s) => {
      s.fx('speedlines', { inner: 360 }, 3.4);
      s.shake(16, 0.8);
      s.sfx('impact');
      s.say('kakeru', "I'M GONNA BE THE GREATEST BRUSH MASTER IN HISTORY!", { style: 'shout', expr: 'shout', pose: 'fistUp', d: 3.6 });
    }, cam: { frame: ['kakeru', 'xclose'] } },
  ]);
  E.musicNow(null, { fade: 0.05 });
  E.shot({ bg: 'paper', cam: WIDE }, (s) => {
    s.sfx('bighit');
    s.fx('flash', {}, 0.4);
    s.title('logo', { x: 960, y: 430, size: 1 }, 5);
    s.wait(5);
  });
}

// ------------------------------------------------------------------ OPENING (music "op", 128 BPM -> bar = 1.875 s)
const BAR = 60 / 128 * 4;
export function opening(E) {
  E.chapter('Opening');
  E.scene('OPENING TITLES: "KAKERU SORA"');
  const t0 = E.t;
  E.musicNow('op', { vol: 0.9, fade: 0.05 });
  const until = (bar) => t0 + bar * BAR - E.t; // seconds from now to that bar
  const credit = (s, small, text, at, d = 3) => s.title('card', { small, text, size: 44, y: 120, x: 1500, at }, d);

  E.shot({ bg: 'ink', var: 'red', cam: { x: 960, y: 540, z: 1.25 } }, (s) => {
    s.cam({ x: 960, y: 540, z: 1 }, until(2));
    s.fx('kanji', { ch: '言', x: 960, y: 520, size: 700, color: '#fff0e0', glow: '#ff3a4a', write: 0.5, fadeAt: 0.9 }, until(2));
    s.fx('speedlines', { color: '#ff8a8a', alpha: 0.5 }, until(2));
    s.wait(until(2));
  });
  E.shot({ bg: 'ink', cam: { x: 960, y: 540, z: 1 } }, (s) => {
    s.fx('rays', { x: 960, y: 520, color: '#ffd23a', a: 0.4 }, until(4));
    s.fx('kanji', { ch: '翔', x: 960, y: 520, size: 700, color: '#fff8d8', glow: '#ffb02a', write: 0.5, fadeAt: 0.95 }, until(4));
    s.at(until(4) - 0.25, (b) => b.fx('flash', {}, 0.5));
    s.wait(until(4));
  });
  E.shot({ bg: 'village', var: 'day', cast: { kakeru: { x: -100, facing: 1, motion: 'run', expr: 'grin' } }, fx: [{ type: 'petals', n: 50 }], cam: { frame: ['kakeru', 'full'] } }, (s) => {
    s.move('kakeru', 2100, until(7), { motion: 'run', ease: 'linear' });
    s.title('nameCard', { name: 'KAKERU SUMIZOME', jp: '墨染 翔', role: 'Worst handwriting in the village', color: '#ff5a4f', side: 'right' }, until(7) - 0.2);
    credit(s, 'ORIGINAL STORY & DIRECTION', 'Kotodama Project', 0.5, 4.5);
    s.wait(until(7));
  });
  E.shot({ bg: 'hill', cast: { nijimi: { x: 960, facing: 1, expr: 'happy' } }, cam: { frame: ['nijimi', 'medium'] } }, (s) => {
    for (let i = 0; i < 3; i++) s.at(i * 0.6, (b) => { b.to('nijimi', { y: G - 90 }, 0.25, 'out'); b.at(0.25, (c) => c.to('nijimi', { y: G }, 0.25, 'in')); b.sfx('boing', { vol: 0.5, at: 0.05 }); });
    s.title('nameCard', { name: 'NIJIMI', jp: '滲み', role: 'A friend made of ink', color: '#9aa6ff', side: 'left' }, until(8));
    s.wait(until(8));
  });
  E.shot({ bg: 'academy', cast: { gonda: { x: 1000, facing: -1, pose: 'armsCross', expr: 'serious' } }, cam: { frame: ['gonda', 'medium'], side: 'l' } }, (s) => {
    s.cam({ frame: ['gonda', 'close'], side: 'l' }, until(10));
    s.title('nameCard', { name: 'GONDA TETSUZO', jp: '権田 鉄蔵', role: 'Entrance exam proctor', color: '#8fd16a', side: 'left' }, until(10));
    credit(s, 'CHARACTER DESIGN', 'Parametric model sheets', 0.3, 3.2);
    s.wait(until(10));
  });
  E.shot({ bg: 'village', var: 'day', cast: { kanemaru: { x: 900, facing: 1, pose: 'hips', expr: 'smug' } }, cam: { frame: ['kanemaru', 'medium'], side: 'l' } }, (s) => {
    s.title('nameCard', { name: 'TORU KANEMARU', jp: '金丸 透', role: 'Rich. Smug. Rival.', color: '#f2d04a', side: 'right' }, until(12));
    s.wait(until(12));
  });
  E.shot({ bg: 'academy', cast: { shiori: { x: 1000, facing: -1, pose: 'brushHold', expr: 'cold', wind: 0.8 } }, fx: [{ type: 'petals', n: 40 }], cam: { frame: ['shiori', 'full'] } }, (s) => {
    s.cam({ frame: ['shiori', 'medium'], side: 'l' }, until(14));
    s.title('nameCard', { name: 'SHIORI KAISHO', jp: '楷書 栞', role: 'Prodigy of the Kaisho clan', color: '#6fd6e8', side: 'left' }, until(14));
    credit(s, 'ANIMATION', 'Written entirely in code', 0.4, 3.2);
    s.wait(until(14));
  });
  E.shot({ bg: 'riverbank', grade: 'sunset', cast: { bokusai: { x: 900, facing: 1, pose: 'sitFloor', expr: 'sleepy', hat: true } }, cam: { frame: ['bokusai', 'full'] } }, (s) => {
    s.title('nameCard', { name: 'BOKUSAI', jp: '墨斎', role: '???', color: '#e8b45a', side: 'right' }, until(16));
    s.wait(until(16));
  });
  // chorus 1
  E.shot({ bg: 'ink', var: 'red', cast: { kakeru: { x: 960, facing: 1, pose: 'jump', expr: 'shout', wind: 1 } }, cam: { frame: ['kakeru', 'full'] } }, (s) => {
    s.fx('aura', { who: 'kakeru' }, until(18)); s.fx('speedlines', { color: '#ffd0a0' }, until(18));
    s.to('kakeru', { y: G - 120 }, until(18), 'out');
    s.at(0.4, (b) => b.pose('kakeru', 'brushUp', 0.1));
    s.at(0.8, (b) => b.fx('scribble', { x: 1330, y: 360, size: 260, color: '#ff3a4a', glow: '#ffcf4a', write: 0.4 }, until(18) - 0.8));
    s.wait(until(18));
  });
  E.shot({ bg: 'academy', cast: { shiori: { x: 600, facing: 1, pose: 'brushSide', expr: 'focused' } }, cam: WIDE }, (s) => {
    s.fx('dragon', { x0: 500, x1: 2300, y: 330, len: 900, size: 60, travel: 1 }, until(20));
    credit(s, 'MUSIC', 'Sumi Synth Ensemble', 0.2, 3.2);
    s.wait(until(20));
  });
  E.shot({ bg: 'hill', var: 'dawn', cast: { kakeru: { x: 860, facing: -1, pose: 'armsCross', expr: 'grin', wind: 0.8 }, shiori: { x: 1060, facing: 1, pose: 'brushHold', expr: 'cold', wind: 0.8 } }, cam: { two: ['kakeru', 'shiori'] } }, (s) => {
    s.cam({ two: ['kakeru', 'shiori'], zm: 1.12 }, until(22));
    s.wait(until(22));
  });
  E.shot({ bg: 'paper', cam: WIDE }, (s) => { s.title('logo', { x: 960, y: 430, size: 0.9, fadeOut: false }, until(24) + 0.3); s.wait(until(24)); });
  // interlude: villains
  E.shot({ bg: 'void', cast: { nashi: { x: 960, facing: -1, pose: 'bladeReady', expr: 'neutral', alpha: 0 } }, cam: { frame: ['nashi', 'full'] } }, (s) => {
    s.to('nashi', { alpha: 1 }, 1);
    s.fx('erase', { x: 960, y: 600, w: 1400, h: 900, n: 90, float: true }, until(26));
    s.title('nameCard', { name: 'NASHI', jp: '無し', role: 'Seventh Margin of Hakushi', color: '#c8c8e8', side: 'left' }, until(26));
    credit(s, 'KANJI STROKE DATA', 'Make Me a Hanzi (Arphic PL)', 0.3, 3.4);
    s.wait(until(26));
  });
  E.shot({ bg: 'void', var: 'throne', grade: 'cold', cast: { hakuo: { x: 960, y: 640, facing: 1, pose: 'sit', expr: 'neutral' } }, cam: { x: 960, y: 520, z: 1.2 } }, (s) => {
    s.cam({ x: 960, y: 420, z: 1.6 }, until(28));
    s.title('nameCard', { name: '???', jp: '白王', role: 'The White King', color: '#ffffff', side: 'right' }, until(28));
    s.wait(until(28));
  });
  // chorus 2: action montage, one cut per bar
  const cut = (bar, o, fn) => E.shot({ ...o }, (s) => { fn(s); s.wait(until(bar)); });
  cut(29, { bg: 'village', var: 'night', grade: 'night', cast: { kakeru: { x: 820, facing: 1, pose: 'punch', expr: 'shout' }, nashi: { x: 1120, facing: -1, pose: 'block', expr: 'neutral' } }, cam: { two: ['kakeru', 'nashi'], tight: true } }, (s) => { s.fx('impact', { x: 980, y: 560, size: 220 }, 0.5); s.shake(20, 0.4); s.fx('invert', {}, 0.15); });
  cut(30, { bg: 'ink', cast: { shiori: { x: 700, facing: 1, pose: 'slash', expr: 'focused' } }, cam: WIDE }, (s) => { s.fx('slashArc', { x: 1100, y: 500, size: 420, ang: 0.2 }, 0.6); s.fx('hlines', {}, 1.8); });
  cut(31, { bg: 'riverbank', grade: 'sunset', cast: { bokusai: { x: 900, facing: 1, pose: 'brushUp', expr: 'focused' } }, cam: { frame: ['bokusai', 'full'] } }, (s) => { s.at(0.3, (b) => b.pose('bokusai', 'brushDown', 0.12)); s.fx('kanji', { ch: '破', x: 1250, y: 450, size: 380, color: '#fff4d8', glow: '#ffb03a', write: 0.4 }, until(31)); });
  cut(32, { bg: 'ink', var: 'red', cam: WIDE }, (s) => { s.fx('beast', { x0: 100, x1: 1900, y0: 560, y1: 520, size: 300, travel: 0.9 }, until(32)); s.fx('speedlines', { cx: 960, cy: 540 }, until(32)); });
  cut(33, { bg: 'hill', cast: { kakeru: { x: 800, facing: 1, pose: 'cheer', expr: 'laugh' }, nijimi: { x: 1000, facing: -1, expr: 'happy' } }, cam: { two: ['kakeru', 'nijimi'] } }, (s) => { s.to('nijimi', { y: G - 100 }, 0.3, 'out'); s.at(0.3, (b) => b.to('nijimi', { y: G }, 0.3, 'in')); });
  cut(34, { bg: 'academy', cast: { kanemaru: { x: 760, facing: 1, pose: 'shock', expr: 'shocked' }, gonda: { x: 1160, facing: -1, pose: 'point', expr: 'angry' } }, cam: { two: ['kanemaru', 'gonda'] } }, (s) => { s.fx('sfxText', { text: 'FAIL?!', x: 960, y: 260 }, 1.5); });
  cut(36, { bg: 'village', var: 'night', grade: 'night', cast: { kakeru: { x: 760, facing: 1, pose: 'brushUp', expr: 'shout' }, nashi: { x: 1300, facing: -1, pose: 'bladeSwing', expr: 'neutral' } }, cam: WIDE }, (s) => {
    s.fx('aura', { who: 'kakeru', fadeIn: true }, until(36)); s.at(0.4, (b) => b.pose('kakeru', 'brushDown', 0.1));
    s.at(0.5, (b) => b.fx('scribble', { x: 1000, y: 520, size: 360, color: '#ff3a4a', glow: '#ffcf4a', write: 0.4 }, until(36) - 0.5));
    s.at(1.9, (b) => { b.fx('impact', { x: 1100, y: 560, size: 260 }, 0.5); b.fx('flash', {}, 0.3); b.shake(22, 0.5); });
  });
  // bridge
  cut(38, { bg: 'room', grade: 'sepia', cast: { chiyo: { x: 1100, facing: -1, pose: 'kneel', expr: 'smile' }, youngKakeru: { x: 820, facing: 1, pose: 'kneel', expr: 'happy' } }, cam: { two: ['youngKakeru', 'chiyo'] } }, (s) => { s.cam({ two: ['youngKakeru', 'chiyo'], zm: 1.1 }, until(38)); });
  cut(40, { bg: 'hill', var: 'dawn', cast: { kakeru: { x: 960, facing: 1, pose: 'stand', expr: 'calm', wind: 0.7 } }, cam: { frame: ['kakeru', 'full'] } }, (s) => { s.cam({ frame: ['kakeru', 'medium'], side: 'l' }, until(40)); s.at(1.5, (b) => b.set('kakeru', { look: [0.3, -0.4] })); });
  // final chorus
  cut(42, { bg: 'village', var: 'day', cast: { kakeru: { x: 200, facing: 1, motion: 'run', expr: 'grin' }, nijimi: { x: 60, facing: 1, motion: 'run' } }, fx: [{ type: 'petals', n: 60 }], cam: { frame: ['kakeru', 'full'] } }, (s) => { s.move('kakeru', 1900, until(42), { motion: 'run' }); s.move('nijimi', 1700, until(42), { motion: 'run' }); });
  cut(44, { bg: 'hill', var: 'dawn', cast: { bokusai: { x: 560, facing: 1, pose: 'armsCross', expr: 'smug', hat: true }, kakeru: { x: 860, facing: 1, pose: 'fistUp', expr: 'grin', wind: 1 }, shiori: { x: 1160, facing: -1, pose: 'brushHold', expr: 'smile', wind: 1 }, nijimi: { x: 1380, facing: -1, expr: 'happy' } }, cam: { x: 960, y: 640, z: 1.05 } }, (s) => { s.cam({ x: 960, y: 600, z: 1.15 }, until(44)); });
  cut(46, { bg: 'ink', var: 'red', cast: { kakeru: { x: 960, facing: 1, pose: 'ready', expr: 'determined', wind: 1 } }, cam: { frame: ['kakeru', 'close'] } }, (s) => { s.fx('kanji', { ch: '翔', x: 1100, y: 420, size: 600, color: '#fff4d0', glow: '#ff9a2a', write: 0.3, layer: 'back' }, until(46)); s.fx('aura', { who: 'kakeru' }, until(46)); s.cam({ frame: ['kakeru', 'xclose'] }, until(46)); });
  E.shot({ bg: 'paper', cam: WIDE }, (s) => {
    s.title('logo', { x: 960, y: 430, size: 1, fadeOut: false }, until(48) + 0.6);
    s.at(until(47.5), (b) => b.fx('flash', {}, 0.5));
    s.wait(until(48) + 0.6);
  });
  E.musicNow(null, { fade: 0.4 });
}
