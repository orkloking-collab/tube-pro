# KOTODAMA (言霊): The Living Script
**An original shōnen anime episode, generated entirely from code.**

*Episode 1: "The Boy Who Couldn't Write" (第1話「書けない少年」)*, runtime **23:26**, 1280×720 @ 24 fps, English dialogue (burned-in subtitles), Japanese characters and setting.

In Hinomoto, words written in spirit ink come alive. Kakeru Sumizome has the worst handwriting in his village. His "fire" kanji turns into a frog. But his unreadable scribbles turn out to be **Kami-moji**, the First Script: the only writing the Blank and its cult **Hakushi** cannot erase.

- 🎬 Video: `release/KOTODAMA_EP01_720p.mp4` (23:26, 720p, 91 MB) + `release/thumbnail.png`, `release/ep01.srt`, `release/chapters.txt`
- 📜 Screenplay (generated from the code, timestamps match the video): [`story/EP01_SCRIPT.md`](story/EP01_SCRIPT.md)
- 📖 Series bible (world, magic rules, characters, 12-episode Season 1): [`story/SERIES_BIBLE.md`](story/SERIES_BIBLE.md)

---

## Why ~23½ minutes? (length research)
A standard TV anime episode fills a **30-minute broadcast slot** and runs about **23–24 minutes**. The remaining time is commercials. The common internal structure, used by *Naruto*, *One Piece*, *Bleach* and *My Hero Academia*, is:

| Segment | Typical | **Kotodama Ep. 1** |
|---|---|---|
| Cold open / prologue | 1–3 min | 1:38 |
| Opening theme (OP) | ~1:30 | 1:30 |
| Part A | ~9–11 min | 9:22 |
| Eyecatch ×2 (mid-episode bumpers) | 5–20 s each | 0:05 + 0:05 |
| Part B | ~9–11 min | 8:58 |
| Ending theme (ED) | ~1:30 | 1:30 |
| Next-episode preview | 15–30 s | 0:17 |
| **Total** | **22–24 min** (about 20–21 min of story) | **23:26** |

Sources consulted: anime screenwriting guides (A-part/B-part split around the eyecatch, 90-second OP/ED), and episode breakdowns of *One Piece* and *Bleach* (about 24 minutes with OP, eyecatches and ED, and about 18–22 minutes of narrative). Fan analyses report the same 22–24 minute range with roughly 21 minutes of actual content. **Decision:** a full standard-length premiere, so the pilot feels like a real broadcast episode.

---

## Why code? Consistency.
Every character is a **parametric model sheet** (`src/engine/characters.js`): proportions, colors, hair, outfit, face. The renderer draws them from those numbers every frame, so Kakeru looks *exactly* the same in shot 1 and shot 366, and in Episode 12. Animation is deterministic: any frame is a pure function of `(episode, time)`. Poses, expressions, effects and fights are defined once and reused.

```
src/engine/
  util.js  env.js  draw.js      math, color, RNG; Node/browser bridge; drawing primitives
  face.js  hair.js  body.js     29 expressions, lip-flap; hair styles; 50+ poses, walk/run cycles, skeleton
  characters.js                 the cast (model sheets) + generated extras
  backgrounds.js                painted parallax sets (village day/sunset/night, academy, river, room, void, ink, hill...)
  fx.js                         kanji stroke-order writing, ink dragon, scribble beast, erasure, impacts, speedlines...
  text.js                       subtitles with name tags, title cards, technique cards, credits
  timeline.js                   screenplay DSL -> keyed tracks, auto camera framing (full/medium/close/xclose/two-shot)
  renderer.js                   composites BG -> FX -> characters -> grade -> titles -> subtitles
src/audio/
  synth.js  music.js  sfx.js    Karplus-Strong koto, flute, piano, FM bells, taiko and drums; 18 composed cues; 48 SFX
src/episode01/
  kit.js                        scene() helper: automatic anime coverage + state carried across cuts
  part0.js partA.js partB.js part9.js script.js   the episode itself
tools/                          render, audio mix, stills/contact sheets, model sheets, screenplay export, player server
player/                         web player (MP4 + chapters + transcript, or live in-browser rendering)
```

The episode is written like a screenplay:
```js
scene(E, { bg: 'academy', music: 'exam', cast: { gonda: { x: 330, pose: 'armsCross' }, kakeru: { x: 1250 } } }, [
  ['gonda', 'LISTEN UP, CANDIDATES!', { style: 'shout', frame: 'medium' }],
  { shot: (s) => write(s, 'shiori', '龍', { glow: '#3fe0d0' }) },          // stroke-order kanji, brush poses
  ['kakeru', "It's a FIRE frog! That counts, right?!", { expr: 'panic', pose: 'shrug' }],
]);
```

## Build it yourself
Requires Node 18+ (tested on 22). Everything else (Skia canvas, ffmpeg, fonts, kanji stroke data) comes from npm.
```bash
cd kotodama
npm install
npm run timing     # structure + runtime
npm run script     # story/EP01_SCRIPT.md, release/ep01.srt, release/chapters.txt
npm run audio      # build/ep01.wav  (~45 s, all music/SFX synthesized)
npm run render     # build/ep01_master.mp4  (~20 min on 2 cores)
npm run deliver    # release/KOTODAMA_EP01_720p.mp4  (two-pass, <100 MB)
npm run serve      # web player at http://localhost:8080/player/
```
QA helpers: `node tools/stills.mjs shots 0 40` (contact sheet of shot midpoints), `node tools/sheet.mjs lineup|faces <id>|poses <id>` (model sheets).

## Voice acting (next step)
v1 uses burned-in English subtitles. The timeline already drives lip-flap from each line's timing. Per-line voice clips can be dropped in later, and the shots re-time around them automatically.

## Credits & licenses
- Fonts (SIL Open Font License; subsets included in `assets/fonts`): Dela Gothic One, Yuji Boku, Bangers, Noto Sans.
- Kanji stroke-order data: Make Me a Hanzi via `hanzi-writer-data` (Arphic Public License, see `assets/KANJI-DATA-LICENSE-ARPHIC.txt`).
- Story, characters, music and code: original to this project.
