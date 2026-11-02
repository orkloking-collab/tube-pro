// KOTODAMA (言霊) - Episode 1 "The Boy Who Couldn't Write" (書けない少年)
import { Episode } from '../engine/timeline.js';
import { coldOpen, opening } from './part0.js';
import { partA } from './partA.js';
import { partB, eyecatch } from './partB.js';
import { ending, preview } from './part9.js';

export const META = {
  series: 'KOTODAMA: The Living Script', seriesJp: '言霊',
  episode: 1, title: "The Boy Who Couldn't Write", titleJp: '書けない少年',
};

export function buildEpisode() {
  const E = new Episode(META);
  coldOpen(E);
  opening(E);
  partA(E);
  eyecatch(E, 'A');
  eyecatch(E, 'B');
  partB(E);
  ending(E);
  preview(E);
  return E;
}
