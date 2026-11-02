// prints the episode structure and timing
import { buildEpisode } from '../src/episode01/script.js';
const E = buildEpisode();
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const ch = E.chapters;
ch.forEach((c, i) => { const end = i + 1 < ch.length ? ch[i + 1].t : E.duration; console.log(`${fmt(c.t).padStart(6)}  ${c.name.padEnd(24)} ${(end - c.t).toFixed(1).padStart(6)} s`); });
console.log(`TOTAL ${fmt(E.duration)} (${E.duration.toFixed(1)} s)  shots=${E.shots.length} lines=${E.subs.length} sfx=${E.sfx.length} music=${E.music.length}`);
