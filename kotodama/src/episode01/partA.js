// PART A: village morning -> entrance exam -> riverbank at sunset
import { scene, write, scribble, posOf, G, WIDE } from './kit.js';
import { CAST } from '../engine/characters.js';

export const BIG = { kind: 'brush', len: 2.4, r: 0.075, tip: 0.5, color: '#7a5030', band: '#2a1a12', ink: '#120e18', back: 0.55 };
const hop = (s, id, h = 70, d = 0.42) => { s.to(id, { y: G - h }, d / 2, 'out'); s.at(d / 2, (b) => b.to(id, { y: G }, d / 2, 'in')); };

export function partA(E) {
  E.chapter('Part A');
  // ---------------------------------------------------------------- title card
  E.shot({ bg: 'paper', in: 'fade', cam: WIDE }, (s) => {
    s.sfx('chime');
    s.title('episodeCard', { num: '第1話', jp: '書けない少年', en: "The Boy Who Couldn't Write" }, 5.2);
    s.wait(5.2);
  });

  // ---------------------------------------------------------------- A1: Kakeru's room
  scene(E, { heading: "INT. KAKERU'S HOUSE - MORNING", bg: 'room', music: 'daily', musicOpts: { vol: 0.55 }, fx: [{ type: 'altar', x: 1560, y: 880, s: 0.8, layer: 'back' }],
    cast: { kakeru: { x: 860, facing: 1, pose: 'lying', expr: 'closed' }, nijimi: { x: 1180, facing: -1, expr: 'happy' } } }, [
    { wide: 3.6, title: { text: "Kakeru's House", jp: '墨染家' }, sfx: 'bird', note: 'Practice sheets cover the floor. Every one of them is a mess. Kakeru sleeps among them.',
      fn: (s) => { for (const [x, r] of [[600, 40], [700, 30], [1450, 46], [1620, 34]]) s.fx('inkPool', { x, y: 1000, r, seed: x, layer: 'back', speed: 100 }, 20); } },
    ['kakeru', 'Zzz... one more stroke... and it looks just like a dragon...', { expr: 'sleepy', cam: { frame: ['kakeru', 'medium'] } }],
    { shot: (s) => { s.move('nijimi', 1000, 0.5, { motion: 'idle' }); s.at(0.5, (b) => { hop(b, 'nijimi', 120, 0.5); b.sfx('boing'); }); s.at(1.1, (b) => { hop(b, 'nijimi', 80, 0.4); b.sfx('boing'); }); s.wait(1.6); }, cam: { two: ['kakeru', 'nijimi'] } },
    ['nijimi', 'Niji! Niji!', { cam: { two: ['kakeru', 'nijimi'], tight: true } }],
    ['kakeru', 'Five more minutes, Nijimi...', { expr: 'sleepy', frame: 'close' }],
    { shot: (s) => { s.to('nijimi', { scale: 1.6 }, 0.25, 'outBack'); s.shake(18, 0.6); s.fx('speedlines', { inner: 260 }, 1.6); s.say('nijimi', 'NIJIIIIII!!', { style: 'shout', d: 1.7, expr: 'angry' }); s.to('nijimi', { scale: 1 }, 0.3); }, cam: { frame: ['nijimi', 'medium'] } },
    { shot: (s) => { s.pose('kakeru', 'sitFloor', 0.2); s.expr('kakeru', 'dazed'); s.sfx('pop'); s.say('kakeru', "Okay, okay! I'm up! What's the big deal? It's just a normal day...", { d: 3.6 }); }, cam: { frame: ['kakeru', 'medium'] } },
    { shot: (s) => { s.title('card', { small: '今日は試験!', text: 'TODAY: ACADEMY EXAM!!', size: 80, brush: false }, 2.2); s.sfx('sting'); s.wait(2.2); }, bg: 'paper', noCast: true, cam: WIDE },
    ['kakeru', '...EXAM DAY?!', { style: 'shout', expr: 'shocked', pose: 'shock', shake: 20, fx: [['speedlines', {}, 1.6]], frame: 'close', d: 1.8 }],
    { shot: (s) => { s.pose('kakeru', 'stand', 0.15); s.move('kakeru', 1400, 0.6, { motion: 'run', stop: 'stand' }); s.at(0.7, (b) => { b.pose('kakeru', 'bow', 0.25); b.expr('kakeru', 'closed'); }); s.wait(1.1); s.say('kakeru', "Morning, Grandma! Today's the day. Watch me, okay?", { d: 3.6 }); s.at(-1.4, (b) => { b.pose('kakeru', 'stand', 0.2); b.expr('kakeru', 'grin'); }); }, cam: { x: 1480, y: 680, z: 1.55 }, note: 'He skids to a stop at the small family altar. A portrait of an old woman. He bows.' },
    { shot: (s) => { s.move('nijimi', 1290, 0.4); s.at(0.5, (b) => b.expr('nijimi', 'closed')); s.wait(0.5); s.say('nijimi', 'Niji.', { d: 1.5 }); }, cam: { x: 1420, y: 760, z: 1.7 } },
    { shot: (s) => { s.pose('kakeru', 'stand', 0.1); s.move('kakeru', 2300, 0.9, { motion: 'run', speed: 1.4 }); s.at(0.1, (b) => { b.fx('dust', { x: 900, y: G }, 0.7); b.sfx('whoosh'); }); s.at(0.35, (b) => b.move('nijimi', 2300, 0.9, { motion: 'run' })); s.wait(1.4); }, cam: WIDE },
  ]);

  // ---------------------------------------------------------------- A1b: village street
  scene(E, { heading: 'EXT. SUMIKAWA VILLAGE - MAIN STREET - MORNING', bg: 'village', var: 'day', music: 'comedy', musicOpts: { vol: 0.6, fade: 0.3 }, fx: [{ type: 'petals', n: 30 }],
    cast: { kakeru: { x: -200, facing: 1, expr: 'grin' }, nijimi: { x: -320, facing: 1 }, extra6: { x: 1250, facing: -1, expr: 'smile', pose: 'wave' }, extra4: { x: 1560, facing: -1, expr: 'annoyed', pose: 'armsCross' } } }, [
    { wide: 3.4, title: { text: 'Sumikawa Village', jp: '墨川村' }, fn: (s) => { s.move('kakeru', 1000, 2.4, { motion: 'run', stop: 'stand' }); s.move('nijimi', 860, 2.4, { motion: 'run' }); } },
    ['extra6', 'Kakeru-chan! Good luck at the exam today!', { name: 'Granny Ume', expr: 'happy' }],
    ['kakeru', "Thanks, Granny Ume! I'll come back a real Fudeshi!", { pose: 'wave', expr: 'grin', before: (s) => s.face('kakeru', 1) }],
    ['extra4', "And don't you DARE write my shop sign again!", { name: 'Tea Shop Owner', expr: 'angry', pose: 'point', style: 'shout' }],
    ['extra4', "Three years! It STILL says 'fish' instead of 'tea'!", { name: 'Tea Shop Owner' }],
    ['kakeru', "It's not wrong! It's... artistic!", { expr: 'embarrassed', pose: 'scratchHead' }],
    ['nijimi', 'Niji... (No. It is not.)', { cam: { two: ['kakeru', 'nijimi'], tight: true } }],
  ]);
  scene(E, { heading: 'EXT. VILLAGE STREET - CONTINUOUS', bg: 'village', var: 'day', fx: [{ type: 'petals', n: 24 }],
    cast: { kakeru: { x: 700, facing: 1, expr: 'grin' }, nijimi: { x: 560, facing: 1 }, kid: { x: 1250, facing: -1, scale: 0.74, expr: 'happy', pose: 'reach' } } }, [
    { shot: (s) => { s.fx('kite', { x0: 1200, x1: 1660, y0: 520, y1: 170, size: 30, travel: 1 }, 2.8); s.sfx('wind'); s.at(0.8, (b) => b.expr('kid', 'shocked')); s.say('kid', 'Ah! My kite! Come back!', { name: 'Little Girl', d: 2.8 }); }, cam: { x: 1320, y: 470, z: 1.1 }, note: 'A gust snatches a little girl\'s kite and carries it high over the rooftops.' },
    { react: 'kid', expr: 'cry', d: 1.3, fn: (s) => s.set('kid', { tears: 1 }) },
    ['kakeru', "Don't cry! I'll get it back for you!", { expr: 'determined', pose: 'fists', frame: 'medium', before: (s) => s.face('kakeru', 1) }],
    ['nijimi', 'Niji?! (With YOUR handwriting?!)', { cam: { two: ['kakeru', 'nijimi'], tight: true } }],
    ['kakeru', 'Wind! Nine strokes! 風!', { expr: 'focused', pose: 'brushHold', frame: 'close' }],
    { shot: (s) => {
      scribble(s, 'kakeru', { x: 900, y: 520, size: 220, d: 1, plain: true, seed: 77 });
      s.at(1.1, (b) => { b.fx('windSwirl', { x: 720, y: 700, size: 240 }, 2.4); b.sfx('wind'); b.pose('kakeru', 'shock', 0.1); b.expr('kakeru', 'dazed'); b.to('kakeru', { wind: 1 }, 0.3); b.shake(6, 2); b.move('nijimi', 380, 0.8, { motion: 'idle', face: false }); b.sfx('boing', { at: 0.4, vol: 0.5 }); });
      s.wait(3.6);
    }, cam: { x: 800, y: 600, z: 1.2 }, note: 'His messy 風 whips up a little whirlwind... that mostly spins Kakeru around.' },
    { shot: (s) => {
      s.fx('windSwirl', { x: 1600, y: 320, size: 280 }, 2.6); s.sfx('wind');
      s.fx('kite', { x0: 1660, x1: 1290, y0: 170, y1: 640, size: 30, travel: 0.9, wob: 10 }, 3.4);
      s.at(2.9, (b) => { b.pose('kid', 'cheer', 0.2); b.expr('kid', 'happy'); b.set('kid', { tears: 0 }); });
      s.wait(3.4);
    }, cam: { x: 1380, y: 470, z: 1.05 }, note: 'Then the whirlwind rises, catches the kite, and sets it gently into the girl\'s hands.' },
    ['kid', 'Wow! Thank you, big brother!', { name: 'Little Girl', expr: 'happy', pose: 'cheer', frame: 'medium' }],
    ['kid', 'Your writing looks really funny... but it works!', { name: 'Little Girl', expr: 'laugh' }],
    ['kakeru', 'Funny-looking... but it works...', { expr: 'dazed', frame: 'close', before: (s) => s.pose('kakeru', 'stand', 0.2) }],
    ['kakeru', "Heh. I'll take it!", { expr: 'grin', pose: 'fistPump' }],
  ]);
  scene(E, { heading: 'EXT. VILLAGE STREET - CONTINUOUS', bg: 'village', var: 'day',
    cast: { kakeru: { x: 760, facing: 1, expr: 'grin', pose: 'stand' }, nijimi: { x: 600, facing: 1 }, kanemaru: { x: 1180, facing: -1, pose: 'hips', expr: 'smug' }, extra9: { x: 1380, facing: -1, expr: 'smug', pose: 'armsCross' }, extra10: { x: 1520, facing: -1, expr: 'grin' } } }, [
    { wide: 2.4, note: 'Kanemaru and two lackeys block the road.', sfx: 'dun' },
    ['kanemaru', "Well, well. If it isn't Scribble-boy.", { frame: 'medium' }],
    ['extra9', 'Hehe! Scribble-boy!', { name: 'Lackey' }],
    ['kanemaru', 'Still planning to take the exam with handwriting like chicken footprints?', { pose: 'shrug' }],
    ['kakeru', 'Hey! Chickens have GREAT handwriting!', { expr: 'angry', pose: 'point', style: 'shout' }],
    { react: 'kakeru', expr: 'embarrassed', pose: 'scratchHead', d: 0.9 },
    ['kakeru', '...Wait. That came out wrong.'],
    ['kanemaru', 'My father paid for the new exam hall, you know.', { pose: 'armsCross', expr: 'smug' }],
    ['kanemaru', "They'll pass me before I even pick up a brush."],
    ['kakeru', "Then I'll pass with my own hand! No money, no help. Just me!", { expr: 'determined', pose: 'fistUp' }],
    ['kanemaru', 'Hah! See you at the bottom of the list, Scribble-boy.', { expr: 'smug', pose: 'hips', frame: 'medium',
      after: (s) => s.at(2.4, (b) => { b.move('kanemaru', 2300, 2.5, { motion: 'walk' }); b.move('extra9', 2400, 2.5); b.move('extra10', 2500, 2.5); }) }],
    { shot: (s) => { s.sfx('temple'); s.cam({ x: 960, y: 300, z: 1.1 }, 2.6); s.wait(2.6); }, cam: { x: 960, y: 500, z: 1 }, note: 'A temple bell rings out over the village.' },
    ['nijimi', 'Niji! Niji! Niji!', { cam: { two: ['kakeru', 'nijimi'], tight: true }, before: (s) => hop(s, 'nijimi', 60) }],
    ['kakeru', "The bell! The exam's starting!", { expr: 'panic', pose: 'shock', frame: 'close' }],
    ['kakeru', "I'm NOT missing this! Ink it in!", { style: 'shout', expr: 'shout', pose: 'fistPump', frame: 'medium', cut: true }],
    { shot: (s) => { s.move('kakeru', 2400, 1.1, { motion: 'run', speed: 1.5 }); s.move('nijimi', 2300, 1.2, { motion: 'run' }); s.fx('hlines', {}, 1.4); s.fx('dust', { x: 800, y: G }, 0.8); s.sfx('whoosh'); s.wait(1.4); }, cam: WIDE },
  ]);

  // ---------------------------------------------------------------- A2: the entrance exam
  const examCast = {
    gonda: { x: 330, facing: 1, pose: 'armsCross', expr: 'serious' },
    shiori: { x: 1480, facing: -1, pose: 'brushHold', expr: 'cold' },
    kanemaru: { x: 1660, facing: -1, pose: 'hips', expr: 'smug' },
    extra1: { x: 1830, facing: -1, expr: 'worried' },
    extra2: { x: 2000, facing: -1, expr: 'neutral' },
    kakeru: { x: -300, facing: 1, expr: 'grin', visible: false },
    nijimi: { x: -400, facing: 1, visible: false },
  };
  const st = scene(E, { heading: 'EXT. HITSUZAN ACADEMY - EXAM COURTYARD - DAY', bg: 'academy', music: 'exam', musicOpts: { vol: 0.65, fade: 0.8 }, cast: examCast }, [
    { wide: 4.2, cam: { x: 1100, y: 520, z: 0.92 }, title: { text: 'Hitsuzan Academy: Entrance Exam', jp: '筆山学院・入学試験' }, sfx: 'crowd', note: 'A giant sheet of paper lies on the courtyard stones. Candidates wait in line. Spectators crowd the edges.' },
    ['gonda', 'LISTEN UP, CANDIDATES!', { style: 'shout', frame: 'medium', shake: 8 }],
    ['gonda', 'I am Gonda Tetsuzo, your proctor!'],
    ['gonda', 'The test is simple. You will write ONE word in spirit ink.', { pose: 'pointUp', cut: true, frame: 'medium' }],
    ['gonda', 'If your word comes alive, you pass.'],
    { shot: (s) => {
      s.set('gonda', { item: BIG }); s.pose('gonda', 'brushHold', 0.2);
      write(s, 'gonda', '守', { x: 640, y: 520, size: 300, color: '#f4ffe8', glow: '#7fe05a', outline: '#10300a', d: 1.1, hold: 2.4 });
      s.at(1.2, (b) => { b.fx('shield', { x: 640, y: 640, w: 320, h: 560, color: '#8fe06a' }, 2.6); b.sfx('glow'); b.shake(6, 0.4); });
      s.wait(1.4);
      s.say('gonda', 'THIS is a living word.', { d: 2.4, expr: 'serious' });
    }, cam: { x: 560, y: 560, z: 1.15 }, note: 'Gonda writes 守, "protect". A glowing green wall rises behind him.' },
    ['gonda', 'If it just lies there on the paper like a dead fish...', { expr: 'evil', pose: 'armsCross', cut: true, frame: 'close', before: (s) => s.set('gonda', { item: null }) }],
    ['gonda', '...you go home and sell noodles for the rest of your life!', { style: 'shout', expr: 'shout', pose: 'point', cut: true, frame: 'medium' }],
    { react: 'extra1', expr: 'panic', d: 1.0, fn: (s) => s.set('extra1', { sweat: true }) },
    { set: { kakeru: { visible: true, x: -300 }, nijimi: { visible: true, x: -420 } } },
    { shot: (s) => {
      s.move('kakeru', 1250, 1.3, { motion: 'run', speed: 1.4 }); s.move('nijimi', 1110, 1.4, { motion: 'run' });
      s.at(1.3, (b) => { b.pose('kakeru', 'land', 0.08); b.fx('dust', { x: 1250, y: G }, 0.8); b.sfx('thud'); b.face('nijimi', 1); });
      s.sfx('whoosh'); s.wait(1.9);
    }, cam: { x: 1000, y: 540, z: 0.95 } },
    ['kakeru', "I'M HERE! Kakeru Sumizome, present and ready!", { style: 'shout', pose: 'cheer', expr: 'grin', frame: 'medium', before: (s) => s.face('kakeru', -1) }],
    ['gonda', "You're LATE, Sumizome!", { style: 'shout', expr: 'angry', pose: 'point', frame: 'close', before: (s) => s.set('gonda', { vein: true }) }],
    ['kakeru', "Technically, I'm really early for next year's exam!", { expr: 'grin', pose: 'shrug' }],
    ['gonda', 'And what is THAT?', { expr: 'annoyed', pose: 'point', frame: 'medium' }],
    { react: 'nijimi', expr: 'surprised', d: 0.9, cam: { two: ['kakeru', 'nijimi'], tight: true } },
    ['kakeru', "Uh... th-that's my... very ink-colored... cat?", { expr: 'panic', pose: 'scratchHead', frame: 'close', before: (s) => s.set('kakeru', { sweat: true }) }],
    ['nijimi', '...Meow.', { cam: { frame: ['nijimi', 'medium'] }, d: 1.8 }],
    ['gonda', '...', { expr: 'annoyed', frame: 'close', d: 1.4, before: (s) => s.set('kakeru', { sweat: false }) }],
    ['gonda', 'GET. IN. LINE.', { style: 'shout', expr: 'shout', frame: 'xclose', shake: 14 }],
    { shot: (s) => { s.move('kakeru', 1340, 0.6, { motion: 'walk' }); s.at(0.6, (b) => b.face('kakeru', 1)); s.move('nijimi', 1230, 0.6); s.wait(1); }, cam: { two: ['kakeru', 'shiori'] } },
    ['kakeru', "Hey! You're Shiori Kaisho, right? From the famous Kaisho clan?", { expr: 'happy', frame: 'close' }],
    { react: 'shiori', expr: 'cold', d: 1.5 },
    ['kakeru', "I'm Kakeru! Let's both pass, okay?", { pose: 'fistPump', expr: 'grin', cam: { two: ['kakeru', 'shiori'] } }],
    ['shiori', 'Your scarf is crooked.', { expr: 'cold', frame: 'close', pose: 'stand' }],
    ['shiori', 'Your brush is unwashed.'],
    ['shiori', 'And you are standing on my paper.', { look: [0.2, 0.6] }],
    { shot: (s) => { s.pose('kakeru', 'jump', 0.08); s.expr('kakeru', 'panic'); s.to('kakeru', { y: G - 90 }, 0.2, 'out'); s.at(0.2, (b) => { b.to('kakeru', { y: G, x: 1300 }, 0.25, 'in'); }); s.at(0.45, (b) => b.pose('kakeru', 'stand', 0.1)); s.sfx('boing'); s.say('kakeru', 'WHOA! Sorry, sorry!', { d: 1.8, style: 'shout' }); }, cam: { two: ['kakeru', 'shiori'], tight: true } },

    ['gonda', 'First candidate! Number seven!', { style: 'shout', frame: 'medium', pose: 'point', before: (s) => s.set('gonda', { vein: false }) }],
    { shot: (s) => {
      s.set('extra1', { x: 820, facing: 1, item: BIG, pose: 'brushFloor', sweat: true });
      write(s, 'extra1', '力', { x: 1060, y: 660, size: 240, color: '#16101e', d: 1.0, hold: 2.2, poses: ['brushFloor', 'brushDown', 'brushFloor'], end: 'brushFloor' });
      s.at(2.0, (b) => b.sfx('tick', { vol: 0.5 })); s.at(2.6, (b) => b.sfx('tick', { vol: 0.5 }));
      s.wait(3.4);
    }, cam: { x: 960, y: 660, z: 1.3 }, note: 'Candidate seven writes 力, "power". It just lies there.' },
    { react: 'extra1', expr: 'worried', d: 1.2 },
    ['gonda', '...Dead fish. FAIL!', { style: 'shout', frame: 'medium', pose: 'armsCross', expr: 'angry' }],
    { shot: (s) => { s.expr('extra1', 'cry'); s.set('extra1', { tears: 1, item: null }); s.move('extra1', -400, 1.6, { motion: 'run' }); s.sfx('crowd', { vol: 0.5 }); s.wait(1.8); }, cam: { x: 700, y: 560, z: 1 } },
    ['kakeru', "Whoa... he's actually serious about the noodles.", { expr: 'worried', frame: 'close', before: (s) => s.set('kakeru', { sweat: true }) }],
    ['gonda', 'Next! Kanemaru Toru!', { style: 'shout', frame: 'medium', pose: 'point', before: (s) => s.set('kakeru', { sweat: false }) }],
    ['kanemaru', 'Watch closely, peasants.', { pose: 'hips', expr: 'smug', frame: 'medium' }],
    { shot: (s) => {
      s.set('kanemaru', { x: 820, facing: 1, item: BIG, pose: 'brushHold' });
      const k = write(s, 'kanemaru', '光', { x: 1060, y: 640, size: 260, color: '#fff2b0', glow: '#ffb020', outline: '#3a2008', d: 1.4, hold: 1.6, poses: ['brushFloor', 'brushDown', 'brushFloor', 'brushDown'], end: 'brushFloor' });
      s.at(1.5, (b) => b.fx('glow', { x: 1060, y: 640, r: 160, color: '#ffe27a', a: 0.4, pulse: 30 }, 2));
      s.wait(3.4);
    }, cam: { x: 1000, y: 640, z: 1.35 } },
    { react: 'gonda', expr: 'annoyed', d: 1.2 },
    ['gonda', '...Weak. Barely alive.', { expr: 'annoyed', pose: 'armsCross' }],
    ['gonda', 'But alive. PASS.', { expr: 'serious' }],
    ['kanemaru', 'Naturally.', { expr: 'smug', pose: 'hips', frame: 'medium', after: (s) => { s.at(1.0, (b) => { b.sfx('pop'); b.set('kanemaru', { sweat: true }); }); } }],
    ['gonda', 'Next! Candidate number twelve!', { style: 'shout', frame: 'medium', pose: 'point', before: (s) => s.set('kanemaru', { x: 1660, facing: -1, pose: 'hips', item: null, sweat: false }) }],
    { shot: (s) => {
      s.set('extra2', { x: 820, facing: 1, item: BIG, pose: 'brushFloor' });
      write(s, 'extra2', '水', { x: 1060, y: 640, size: 260, color: '#c8f0ff', glow: '#2a8aff', outline: '#08203a', d: 1.2, hold: 0.6, poses: ['brushFloor', 'brushDown', 'brushFloor'], end: 'brushFloor' });
      s.at(1.5, (b) => { b.fx('water', { x: 700, y: 980, w: 900, h: 520 }, 1.4); b.sfx('water'); });
      s.wait(3);
    }, cam: { x: 800, y: 600, z: 1.0 } },
    { react: 'gonda', expr: 'annoyed', d: 1.3, fn: (s) => s.set('gonda', { sweat: true }), sfx: 'splash' },
    ['gonda', '...Pass. Somebody get me a towel.', { expr: 'annoyed', pose: 'armsCross' }],
    ['gonda', 'Next! Kaisho Shiori!', { style: 'shout', expr: 'serious', cut: true, frame: 'medium', before: (s) => s.set('gonda', { sweat: false }) }],
    { set: { extra2: { x: 2000, facing: -1, pose: 'stand', item: null } } },
    { shot: (s) => {
      s.sfx('crowd', { vol: 0.6 });
      s.move('shiori', 860, 2.6, { motion: 'walk', stop: 'stand' });
      s.say('extra7', "That's the Kaisho heiress!", { name: 'Spectator', d: 2.2 });
      s.say('extra8', 'They say she wrote her first living word when she was four years old!', { name: 'Spectator', d: 3.4 });
    }, cam: { frame: ['shiori', 'full'] } },
    { shot: (s) => { s.face('shiori', 1); s.pose('shiori', 'brushFloor', 0.4); s.expr('shiori', 'closed'); s.wait(0.6); s.say('shiori', 'Precision. Balance. Promise.', { style: 'think', d: 3, silent: true }); }, cam: { frame: ['shiori', 'medium'], side: 'l' } },
    { shot: (s) => {
      s.cam({ x: 960, y: 540, z: 1.12 }, 4.6);
      s.fx('kanji', { ch: '龍', x: 960, y: 540, size: 760, color: '#0e1a24', write: 0.62, fade: false }, 4.6);
      s.at(2.9, (b) => b.fx('glow', { x: 960, y: 540, r: 620, color: '#3fe0d0', a: 0.55, fadeIn: true }, 1.7));
      s.sfx('brush', { at: 0.1 }); s.sfx('brush', { at: 1.0 }); s.sfx('brush', { at: 1.9 }); s.sfx('kanji', { at: 2.8 });
      s.wait(4.6);
    }, bg: 'paper', noCast: true, cam: WIDE, note: 'Insert: her brush moves in perfect stroke order. 龍, "dragon". The ink begins to glow teal.' },
    { music: 'dragon', vol: 0.75, fade: 0.3 },
    { shot: (s) => {
      s.sfx('dragon'); s.sfx('crowd', { vol: 0.5, at: 1.5 });
      s.fx('glow', { x: 1060, y: 820, r: 500, color: '#3fe0d0', a: 0.5 }, 5.4);
      s.fx('dragon', { x0: 900, x1: 2700, y: 360, len: 1000, size: 62, amp: 110, travel: 1 }, 5.6);
      s.cam({ x: 1150, y: 480, z: 0.95 }, 5.6);
      s.wait(5.6);
    }, cam: { x: 960, y: 620, z: 1.1 }, note: 'An ink dragon rises from the paper and coils through the sky above the courtyard.' },
    { react: 'kakeru', expr: 'sparkle', d: 1.0 },
    ['kakeru', 'WHOA! SO COOL!!', { style: 'shout', expr: 'sparkle', pose: 'cheer', frame: 'medium' }],
    ['gonda', 'Perfect stroke order. Perfect balance.', { expr: 'surprised', frame: 'close', pose: 'armsCross' }],
    ['gonda', 'PASS. With honors.', { expr: 'serious' }],
    { react: 'shiori', expr: 'smile', d: 1.0, fn: (s) => s.set('shiori', { look: [-0.2, 0], pose: 'stand' }) },
    { react: 'shiori', expr: 'cold', d: 0.9 },
    { set: { shiori: { x: 1480, facing: -1, pose: 'brushHold', expr: 'cold' } } },
    { music: 'exam', vol: 0.6, fade: 0.8 },

    ['gonda', 'Last candidate! Sumizome Kakeru!', { style: 'shout', frame: 'medium', pose: 'point' }],
    ['kanemaru', 'Oh, this should be good. Here comes the chicken scratch.', { expr: 'smug', frame: 'close' }],
    { shot: (s) => {
      s.set('kakeru', { x: 820, facing: 1, item: BIG }); s.pose('kakeru', 'brushHold', 0.3); s.expr('kakeru', 'focused');
      s.set('nijimi', { x: 560, facing: 1 }); hop(s, 'nijimi', 60);
      s.say('nijimi', 'Niji! Niji!', { d: 1.6 });
    }, cam: { x: 760, y: 640, z: 1.25 } },
    ['kakeru', "Okay. Fire. Four strokes. I've practiced this a thousand times.", { expr: 'focused', frame: 'close' }],
    ['kakeru', 'Ink it in...!', { expr: 'determined', frame: 'xclose' }],
    { music: null, fade: 0.3 },
    { shot: (s) => {
      scribble(s, 'kakeru', { x: 1060, y: 700, size: 380, d: 1.5, plain: true, hold: 2 });
      for (const [i, x, y] of [[0.3, 1150, 760], [0.7, 900, 620], [1.0, 1250, 680], [1.3, 1000, 800]]) s.at(i, (b) => { b.fx('inkSplash', { x, y, size: 90, seed: x }, 1.2); b.sfx('swish'); });
      s.at(1.1, (b) => b.fx('inkSplash', { x: 360, y: 380, size: 70, seed: 3 }, 1.5));
      s.fx('hlines', { alpha: 0.4 }, 1.6);
      s.wait(2.4);
    }, cam: { x: 960, y: 640, z: 1.05 }, note: 'Kakeru attacks the paper. Ink flies everywhere, including onto Gonda.' },
    { shot: (s) => {
      s.fx('scribble', { x: 960, y: 540, size: 760, color: '#16101e', plain: true, write: 0.01, fadeAt: 2 }, 4);
      for (const [x, y, r] of [[700, 300, 50], [1300, 760, 70], [1500, 300, 40], [520, 820, 36]]) s.fx('inkPool', { x, y, r, seed: x, speed: 100 }, 4);
      s.cam({ x: 960, y: 540, z: 1.12 }, 3);
      s.wait(3);
    }, bg: 'paper', noCast: true, cam: WIDE, note: 'Insert: the result. Not a kanji. A scribble.' },
    { react: 'gonda', expr: 'annoyed', d: 1.6, fn: (s) => { s.set('gonda', { vein: true }); s.fx('inkPool', { x: 352, y: 345, r: 14, seed: 9, speed: 100 }, 1.6); } },
    { shot: (s) => {
      s.wait(0.6);
      s.sfx('pop');
      s.fx('frog', { x0: 1060, x1: 900, y: 880, hops: 1, size: 58, hop: 60 }, 0.9);
      s.at(0.9, (b) => { b.fx('frog', { x0: 900, x1: 330, y0: 880, y1: 345, hops: 3, size: 58, hop: 140 }, 1.6); b.sfx('boing'); b.sfx('boing', { at: 0.55 }); b.sfx('boing', { at: 1.1 }); });
      s.at(2.5, (b) => { b.fx('frog', { x0: 330, x1: 332, y: 345, hops: 6, size: 58, hop: 10 }, 3); b.fx('fire', { x: 330, y: 330, w: 80, h: 140, n: 22, size: 34 }, 3); b.sfx('fire'); });
      s.wait(3.6);
    }, cam: { x: 680, y: 600, z: 1.2 }, note: 'The scribble twitches. A tiny frog made of fire hops out, bounces across the courtyard, and lands on Gonda\'s head. His hair starts to smoke.' },
    { shot: (s) => { s.sfx('crowd', { vol: 0.9 }); s.sfx('fail', { at: 0.3 }); s.pose('kanemaru', 'point', 0.15); s.expr('kanemaru', 'laugh'); s.say('kanemaru', "A FROG! He wrote 'fire' and got a FROG!", { style: 'shout', d: 3 }); }, cam: { frame: ['kanemaru', 'medium'], side: 'l' } },
    ['kakeru', "It's a FIRE frog! That counts, right?!", { expr: 'panic', pose: 'shrug', frame: 'medium' }],
    ['gonda', 'Stroke order: wrong.', { expr: 'serious', frame: 'close', pose: 'armsCross', before: (s) => s.fx('fire', { x: 330, y: 330, w: 60, h: 90, n: 10, size: 20 }, 2.5) }],
    ['gonda', 'Balance: none.'],
    ['gonda', 'Shape: unreadable.'],
    { shot: (s) => { s.sfx('impact'); s.sfx('dun', { at: 0.1 }); s.shake(26, 0.7); s.fx('invert', { until: 0.5 }, 0.3); s.fx('speedlines', { color: '#000000', alpha: 0.7 }, 2.2); s.say('gonda', 'FAIL.', { style: 'shout', d: 2.2, expr: 'shout' }); }, cam: { frame: ['gonda', 'xclose'] } },
    { react: 'kakeru', expr: 'shocked', d: 1.8, fn: (s) => { s.set('kakeru', { gloom: 1 }); s.pose('kakeru', 'slump', 0.4); } },
    ['gonda', "Come back next year, Sumizome. Or don't.", { expr: 'cold', frame: 'medium' }],
    { shot: (s) => { s.sfx('crowd', { vol: 0.5 }); s.move('shiori', 1100, 1.8, { motion: 'walk', stop: 'stand' }); s.wait(2); }, cam: { two: ['kakeru', 'shiori'] } },
    ['shiori', 'Words are a promise, Sumizome.', { expr: 'cold', frame: 'close', before: (s) => s.face('shiori', -1) }],
    ['shiori', "If you can't keep the shape... you can't keep the promise."],
    ['kakeru', "...Then I'll make my own shape!", { expr: 'determined', pose: 'fists', frame: 'medium', before: (s) => s.set('kakeru', { gloom: 0 }) }],
    { react: 'shiori', expr: 'surprised', d: 1.1 },
    ['shiori', 'A shape no one can read is just noise.', { expr: 'cold', after: (s) => s.at(2.2, (b) => b.move('shiori', 2400, 3, { motion: 'walk' })) }],
    { music: 'sad', vol: 0.6, fade: 1.5 },
    { shot: (s) => {
      s.cam({ x: 900, y: 600, z: 0.95 }, 5);
      s.pose('kakeru', 'slump', 0.6); s.expr('kakeru', 'sad');
      s.move('gonda', -400, 4, { motion: 'walk' }); s.move('kanemaru', 2400, 3.5, { motion: 'walk' }); s.move('extra2', 2600, 3.2);
      s.at(1.5, (b) => { b.move('nijimi', 700, 1, { motion: 'idle' }); });
      s.wait(5);
    }, cam: { x: 960, y: 560, z: 1 }, note: 'The courtyard empties. Kakeru stands alone beside his scribble.' },
  ]);
  scene(E, { heading: 'EXT. EXAM COURTYARD - LATE AFTERNOON', bg: 'academy', grade: 'warm', cast: { gonda: { x: 700, facing: 1, pose: 'thinking', expr: 'serious' } } }, [
    { shot: (s) => { s.fx('scribble', { x: 1060, y: 900, size: 260, color: '#16101e', plain: true, write: 0.01, fadeAt: 2, layer: 'back' }, 4); s.move('gonda', 820, 1.6, { motion: 'walk', speed: 0.6, stop: 'thinking' }); s.wait(2.6); }, cam: { x: 900, y: 640, z: 1.2 }, note: 'Later. The courtyard is empty. Gonda returns alone and crouches by the scribble.' },
    ['gonda', '...Strange.', { frame: 'close', d: 1.8 }],
    ['gonda', "Hours have passed. That ink still hasn't dried.", { expr: 'surprised', look: [0.4, 0.6] }],
  ]);

  // ---------------------------------------------------------------- A3: riverbank at sunset
  scene(E, { heading: 'EXT. RIVERBANK - SUNSET', bg: 'riverbank', grade: 'sunset',
    cast: { kakeru: { x: 820, facing: 1, pose: 'sitHug', expr: 'sad', noBackBrush: false }, nijimi: { x: 640, facing: 1, expr: 'sad' }, bokusai: { x: 1520, facing: -1, pose: 'sit', expr: 'sleepy', hat: true, visible: false } } }, [
    { wide: 4.2, cam: { x: 960, y: 560, z: 1 }, camTo: { x: 900, y: 600, z: 1.1 }, sfx: 'water', note: 'The river glows orange. Kakeru sits on the bank, knees pulled up.' },
    { shot: (s) => { s.pose('kakeru', 'windup', 0.2); s.at(0.35, (b) => b.pose('kakeru', 'punch', 0.08)); s.at(1.2, (b) => { b.fx('splash', { x: 1300, y: 760 }, 0.6); b.fx('water', { x: 1300, y: 770, w: 60, h: 40 }, 0.8); b.sfx('splash', { vol: 0.4 }); }); s.at(1.4, (b) => b.pose('kakeru', 'sitHug', 0.4)); s.wait(2.2); }, cam: { frame: ['kakeru', 'full'] } },
    ['kakeru', 'Four strokes, Nijimi. Just four strokes...', { expr: 'sad', frame: 'medium' }],
    ['kakeru', "...and I still couldn't do it."],
    ['nijimi', 'Niji...', { cam: { two: ['kakeru', 'nijimi'], tight: true } }],
    ['kakeru', 'Everybody laughed. Even Shiori...', { expr: 'sad', frame: 'close' }],
    ['kakeru', "Well, she didn't laugh. She just looked at me like I was a spelling mistake.", { expr: 'annoyed' }],
    ['kakeru', "Hey. You remember? You're the only word I ever wrote that actually worked.", { expr: 'smile', cam: { two: ['kakeru', 'nijimi'] }, before: (s) => s.face('kakeru', -1) }],
  ]);
  // flashback
  scene(E, { heading: 'INT. KAKERU\'S HOUSE - FLASHBACK - TEN YEARS AGO', bg: 'room', grade: 'sepia', music: 'memory', musicOpts: { vol: 0.6, fade: 1.2 },
    cast: { youngKakeru: { x: 800, facing: 1, pose: 'kneel', expr: 'cry', tears: 1 }, chiyo: { x: 1120, facing: -1, pose: 'kneel', expr: 'calm' } } }, [
    { wide: 3.4, in: 'white', title: { text: 'Ten years ago', jp: '十年前' }, note: 'Sepia. Little Kakeru cries over his practice sheet. Grandma Chiyo kneels beside him.' },
    ['youngKakeru', 'The other kids say my writing looks like worms!', { expr: 'cry', frame: 'medium' }],
    ['chiyo', 'Hmm? Let Grandma see.', { expr: 'smile', frame: 'medium', look: [0.3, 0.5] }],
    ['chiyo', 'Oh my. These are very energetic worms.', { expr: 'happy', cut: true, frame: 'close' }],
    ['youngKakeru', 'Grandma!', { expr: 'pout', before: (s) => s.set('youngKakeru', { tears: 0 }) }],
    ['chiyo', 'Kakeru. Listen to me.', { expr: 'calm', frame: 'close', look: [0.2, 0] }],
    ['chiyo', 'A word is a wish you send to the world.'],
    ['chiyo', 'Neat or messy... the world hears it, if you truly mean it.', { expr: 'smile', cut: true, cam: { two: ['youngKakeru', 'chiyo'], tight: true } }],
    ['youngKakeru', '...Then I wish for a friend.', { expr: 'teary', frame: 'close' }],
    ['youngKakeru', 'A friend who never, ever leaves.', { expr: 'determined' }],
    { shot: (s) => {
      s.set('youngKakeru', { item: CAST.kakeru.item });
      write(s, 'youngKakeru', '友', { x: 960, y: 600, size: 300, color: '#16101e', d: 1.6, hold: 0.6, poses: ['brushFloor', 'brushDown', 'brushFloor', 'brushDown', 'brushFloor'], end: 'kneel' });
      s.wait(2.2);
    }, cam: { x: 920, y: 620, z: 1.3 } },
    { set: { nijimi: { x: 960, y: G - 150, facing: -1, expr: 'happy', alpha: 0, scale: 0.4 } } },
    { shot: (s) => {
      s.to('nijimi', { alpha: 1, scale: 1, y: G - 40 }, 0.5, 'outBack'); s.sfx('pop'); s.sfx('sparkle', { at: 0.2 });
      s.fx('inkSplash', { x: 960, y: 700, size: 120 }, 0.8);
      s.at(0.5, (b) => b.to('nijimi', { y: G }, 0.3, 'in'));
      s.wait(0.6); s.say('nijimi', 'Niji!', { d: 1.6 });
    }, cam: { x: 960, y: 700, z: 1.4 } },
    ['youngKakeru', 'Whoa!', { expr: 'surprised', pose: 'sitFloor', frame: 'close', d: 1.4 }],
    ['chiyo', 'See? The world was listening.', { expr: 'smile', cam: { two: ['youngKakeru', 'chiyo'] }, out: 'white', hold: 0.8 }],
  ]);
  // back to the present
  scene(E, { heading: 'EXT. RIVERBANK - SUNSET - PRESENT', bg: 'riverbank', grade: 'sunset', music: 'sad', musicOpts: { vol: 0.5, fade: 1 },
    cast: { kakeru: { x: 820, facing: 1, pose: 'sitHug', expr: 'sad' }, nijimi: { x: 640, facing: 1, expr: 'sad' }, bokusai: { x: 1560, facing: -1, pose: 'brushHold', expr: 'sleepy', hat: true, visible: false } } }, [
    ['kakeru', 'Grandma said the world hears it, if you mean it.', { expr: 'sad', frame: 'close', in: 'white' }],
    ['kakeru', 'I meant it today. I really did...'],
    { music: 'mystery', vol: 0.6, fade: 1 },
    { shot: (s) => { s.say('bokusai', 'Then maybe the world was a little hard of hearing today.', { d: 3.6 }); s.at(2.2, (b) => b.expr('kakeru', 'surprised')); }, cam: { frame: ['kakeru', 'close'], side: 'l' } },
    { set: { bokusai: { visible: true } } },
    { shot: (s) => { s.fx('fishline', { who: 'bokusai', y: 820, dx: -40 }, 4); s.cam({ frame: ['bokusai', 'full'], zm: 1.1 }, 3); s.wait(3); }, cam: { frame: ['bokusai', 'full'] }, note: 'An old man in a straw hat sits further down the bank, fishing with a giant brush.' },
    ['kakeru', 'Wh-who are you?! How long have you been sitting there?!', { expr: 'shocked', pose: 'shock', frame: 'medium', before: (s) => s.face('kakeru', 1) }],
    ['bokusai', 'Since before you started sulking.', { expr: 'sleepy', frame: 'medium', before: (s) => s.fx('fishline', { who: 'bokusai', y: 820, dx: -40 }, 9) }],
    ['bokusai', "The fish don't bite when you sigh that loud. Hic!"],
    ['bokusai', 'That frog at the exam today... that was yours, wasn\'t it?', { expr: 'calm', cut: true, frame: 'close' }],
    ['kakeru', 'You saw that? Great. Go ahead and laugh.', { expr: 'annoyed', pose: 'sitFloor', frame: 'close' }],
    ['bokusai', 'Laugh? Kid...', { expr: 'serious', frame: 'close', before: (s) => s.set('bokusai', { hat: false }) }],
    ['bokusai', '...your frog is still alive.', { pose: 'point' }],
    { shot: (s) => { s.fx('frog', { x0: 1300, x1: 960, y: G - 10, hops: 4, size: 36, hop: 60 }, 2.6); for (let i = 0; i < 4; i++) s.sfx('boing', { at: i * 0.65, vol: 0.5 }); s.wait(2.6); }, cam: { x: 1100, y: 800, z: 1.6 }, note: 'The little fire-frog hops along the bank, still burning.' },
    ['kakeru', "It's... still burning?", { expr: 'surprised', frame: 'close', before: (s) => s.fx('frog', { x0: 960, x1: 940, y: G - 10, hops: 6, size: 36, hop: 12 }, 3) }],
    ['bokusai', "Living words fade after a few minutes. Even the Kaisho girl's dragon is long gone.", { expr: 'calm', frame: 'medium', pose: 'brushHold' }],
    ['bokusai', 'But yours is still here. Hours later.', { expr: 'serious', cut: true, frame: 'close' }],
    ['bokusai', 'Tell me, kid. Why do you want to be a Fudeshi so badly?', { expr: 'calm', cut: true, frame: 'medium' }],
    ['kakeru', '...My grandma was one.', { expr: 'sad', pose: 'sitHug', frame: 'close', look: [0.3, 0.2] }],
    ['kakeru', "Just a small-town Fudeshi. She wrote 'heal' for sick kids, and 'warm' for cold winters."],
    ['kakeru', 'Nobody outside this village ever knew her name.', { cut: true, frame: 'medium' }],
    ['kakeru', 'But if I become the greatest Brush Master in history...', { expr: 'determined', cut: true, frame: 'close' }],
    ['kakeru', '...then everyone will know about the village Fudeshi who believed in a kid with terrible handwriting.', { expr: 'smile' }],
    { react: 'bokusai', expr: 'smile', d: 1.4 },
    ['bokusai', "...Hm. That's a better reason than most.", { expr: 'smile' }],
    ['bokusai', "I've seen strokes like yours before. A long, long time ago.", { expr: 'serious', cut: true, frame: 'xclose', pushK: 1.08 }],
    ['kakeru', 'Huh? Where? Who wrote them?', { expr: 'surprised', pose: 'stand', frame: 'medium' }],
    { shot: (s) => { s.pose('bokusai', 'stand', 0.5); s.at(0.6, (b) => { b.face('bokusai', 1); b.set('bokusai', { hat: true }); }); s.sfx('wind'); s.say('bokusai', 'Go home, Scribbles. Tonight is going to be loud.', { d: 3.8, expr: 'calm' }); }, cam: { frame: ['bokusai', 'medium'], side: 'l' } },
    ['kakeru', 'Hey, wait! Who ARE you?!', { style: 'shout', expr: 'shout', frame: 'medium' }],
    ['bokusai', 'Just an old drunk who likes fishing. Hic!', { pose: 'wave', frame: 'full', after: (s) => s.at(1.4, (b) => b.move('bokusai', 2500, 4, { motion: 'walk', speed: 0.7 })) }],
    { shot: (s) => { s.move('bokusai', 2600, 3, { motion: 'walk', speed: 0.7 }); s.wait(2.6); }, cam: { x: 1500, y: 560, z: 1 } },
    { shot: (s) => { s.pose('kakeru', 'reach', 0.3); s.fx('frog', { x0: 940, x1: 960, y: G - 10, hops: 1, size: 36, hop: 90 }, 0.6); s.at(0.6, (b) => b.fx('fire', { x: 1000, y: 700, w: 30, h: 40, n: 8, size: 18 }, 3)); s.wait(1.2); s.say('kakeru', '...Still burning, huh?', { expr: 'smile', d: 2.8 }); }, cam: { frame: ['kakeru', 'close'], side: 'l' }, out: 'fade', outD: 1 },
  ]);
  E.musicNow(null, { fade: 1 });
}
