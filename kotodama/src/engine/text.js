// Subtitles, title cards, logo, technique names, captions, credits (screen space 1920x1080).
import { W, H, FONTS } from './env.js';
import { rgba, clamp, smoothstep, ease, wrapText, lerp, TAU } from './util.js';
import { drawKanji } from './fx.js';
import { CAST } from './characters.js';

function outlined(ctx, txt, x, y, fill, stroke, lw) {
  ctx.lineJoin = 'round'; ctx.miterLimit = 2;
  ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
}

export function drawSubtitle(ctx, sub, t) {
  const k = clamp((t - sub.t0) / 0.12);
  const style = sub.style || 'say';
  const size = style === 'shout' ? 54 : style === 'narr' ? 44 : 46;
  ctx.save();
  ctx.globalAlpha = k * (1 - smoothstep(sub.t1 - 0.1, sub.t1, t));
  ctx.font = `${size}px ${FONTS.sub}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  let text = sub.text;
  if (style === 'think') text = '(' + text + ')';
  const lines = wrapText(ctx, text, 1500);
  const lh = size * 1.25;
  let y = H - 70 - (lines.length - 1) * lh;
  const shake = style === 'shout' ? Math.sin(t * 70) * 2.5 : 0;
  // speaker tag
  const who = sub.who && CAST[sub.who];
  if (who && style !== 'narr') {
    const name = (sub.name || who.name).toUpperCase();
    ctx.font = `30px ${FONTS.title}`;
    const tw = ctx.measureText(name).width;
    const firstW = (() => { ctx.font = `${size}px ${FONTS.sub}`; return ctx.measureText(lines[0]).width; })();
    const x0 = W / 2 - firstW / 2;
    ctx.font = `30px ${FONTS.title}`;
    ctx.fillStyle = 'rgba(10,8,16,0.82)';
    ctx.beginPath(); ctx.roundRect(x0 - 6, y - size - 44, tw + 30, 40, 6); ctx.fill();
    ctx.fillStyle = who.color; ctx.fillRect(x0 - 6, y - size - 44, 7, 40);
    ctx.textAlign = 'left'; ctx.fillStyle = who.color; ctx.fillText(name, x0 + 12, y - size - 13);
    ctx.textAlign = 'center';
  }
  ctx.font = `${size}px ${FONTS.sub}`;
  const fill = style === 'narr' ? '#ffe9b0' : style === 'think' ? '#d8e4ff' : '#ffffff';
  for (const ln of lines) { outlined(ctx, ln, W / 2 + shake, y, fill, 'rgba(8,6,14,0.95)', 9); y += lh; }
  ctx.restore();
}

// ------------------------------------------------------------------ title elements
export const TITLES = {
  logo(ctx, e, k, lt) {
    // KOTODAMA logo: brush kanji written stroke by stroke + English wordmark slams in
    const cx = e.x ?? 960, cy = e.y ?? 470, s = e.size || 1;
    ctx.save();
    const wr = clamp(k / 0.45);
    ctx.globalAlpha = 1 - smoothstep(0.92, 1, k) * (e.fadeOut === false ? 0 : 1);
    // red ink circle (ensō)
    ctx.beginPath(); ctx.arc(cx, cy - 20 * s, 300 * s, -1.9, -1.9 + TAU * 0.92 * ease.out(clamp(k / 0.3))); ctx.strokeStyle = rgba('#c8203a', 0.9); ctx.lineWidth = 34 * s; ctx.lineCap = 'round'; ctx.stroke();
    drawKanji(ctx, '言', cx - 150 * s, cy - 30 * s, 300 * s, clamp(wr * 2), '#16101e', { glow: wr >= 0.5 ? '#ff4a5a' : null });
    // 霊 isn't in the stroke DB -> brush font reveal
    ctx.save(); ctx.font = `${300 * s}px ${FONTS.brush}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= clamp(wr * 2 - 1);
    ctx.fillStyle = '#16101e'; ctx.fillText('霊', cx + 150 * s, cy - 20 * s); ctx.restore();
    const wk = ease.outBack(clamp((k - 0.4) / 0.12));
    if (wk > 0) {
      ctx.save(); ctx.translate(cx, cy + 230 * s); ctx.scale(wk, wk);
      ctx.font = `${150 * s}px ${FONTS.title}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      outlined(ctx, 'KOTODAMA', 0, 0, '#ffffff', '#16101e', 26 * s);
      ctx.fillStyle = '#c8203a'; ctx.fillRect(-470 * s, 80 * s, 940 * s, 10 * s);
      ctx.font = `${40 * s}px ${FONTS.title}`; outlined(ctx, 'THE LIVING SCRIPT', 0, 130 * s, '#16101e', '#ffffff', 10 * s);
      ctx.restore();
    }
    ctx.restore();
  },
  episodeCard(ctx, e, k, lt) {
    ctx.save();
    ctx.globalAlpha = smoothstep(0, 0.12, k) * (1 - smoothstep(0.9, 1, k));
    ctx.fillStyle = 'rgba(8,6,14,0.55)'; ctx.fillRect(0, 300, W, 480);
    ctx.textAlign = 'center';
    ctx.font = `56px ${FONTS.title}`; outlined(ctx, e.num || '第1話', W / 2, 400, '#ffd23a', '#16101e', 10);
    const jp = e.jp || '書けない少年';
    ctx.font = `150px ${FONTS.brush}`;
    const reveal = clamp((k - 0.08) / 0.3);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * reveal, H); ctx.clip();
    outlined(ctx, jp, W / 2, 590, '#ffffff', '#16101e', 14); ctx.restore();
    ctx.font = `54px ${FONTS.title}`; ctx.globalAlpha *= smoothstep(0.3, 0.45, k);
    outlined(ctx, e.en || 'The Boy Who Couldn\'t Write', W / 2, 710, '#ffffff', '#16101e', 10);
    ctx.restore();
  },
  technique(ctx, e, k, lt) {
    const a = smoothstep(0, 0.08, k) * (1 - smoothstep(0.85, 1, k));
    const sc = 1.25 - 0.25 * ease.out(clamp(k / 0.15));
    ctx.save(); ctx.globalAlpha = a;
    ctx.translate(e.x ?? W / 2, e.y ?? 300); ctx.scale(sc, sc); ctx.rotate(e.rot ?? -0.04);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${e.size || 150}px ${FONTS.brush}`;
    ctx.shadowColor = e.glow || '#ff3a4a'; ctx.shadowBlur = 40;
    outlined(ctx, e.jp, 0, 0, e.color || '#ffffff', '#16101e', 16);
    ctx.shadowBlur = 0;
    ctx.font = `52px ${FONTS.title}`; outlined(ctx, e.en, 0, (e.size || 150) * 0.72, '#ffd23a', '#16101e', 10);
    ctx.restore();
  },
  caption(ctx, e, k) {
    // location caption bottom-left
    const a = smoothstep(0, 0.1, k) * (1 - smoothstep(0.85, 1, k));
    const slide = (1 - ease.out(clamp(k / 0.15))) * -60;
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = `40px ${FONTS.title}`;
    const tw = ctx.measureText(e.text).width;
    ctx.font = `30px ${FONTS.brush}`;
    const tj = e.jp ? ctx.measureText(e.jp).width : 0;
    const x = 70 + slide, y = e.top ? 90 : 820;
    ctx.fillStyle = 'rgba(10,8,16,0.78)'; ctx.fillRect(x, y, Math.max(tw, tj) + 60, e.jp ? 112 : 70);
    ctx.fillStyle = '#c8203a'; ctx.fillRect(x, y, 10, e.jp ? 112 : 70);
    ctx.textAlign = 'left';
    if (e.jp) { ctx.font = `32px ${FONTS.brush}`; ctx.fillStyle = '#ffd9a0'; ctx.fillText(e.jp, x + 32, y + 42); }
    ctx.font = `40px ${FONTS.title}`; ctx.fillStyle = '#ffffff'; ctx.fillText(e.text, x + 32, y + (e.jp ? 94 : 50));
    ctx.restore();
  },
  credits(ctx, e, k) {
    // scrolling credit block (ED) on one side of the frame
    const lines = e.lines || [];
    const total = lines.length * 70 + H;
    const kk = e.total ? clamp((e.off + k * e.d) / e.total) : k; // continuous scroll across several shots
    const y0 = H + 40 - kk * total;
    ctx.save(); ctx.textAlign = e.align || 'center';
    const x = e.x ?? 1450;
    lines.forEach((ln, i) => {
      const y = y0 + i * 70;
      if (y < -60 || y > H + 60) return;
      const head = ln.startsWith('#');
      ctx.font = head ? `30px ${FONTS.title}` : `40px ${FONTS.sub}`;
      outlined(ctx, head ? ln.slice(1) : ln, x, y, head ? '#ffd9a0' : '#ffffff', 'rgba(8,6,14,0.9)', 8);
    });
    ctx.restore();
  },
  card(ctx, e, k) {
    // centred big text card (OP credits / statements)
    const a = smoothstep(0, 0.12, k) * (1 - smoothstep(0.85, 1, k));
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const y = e.y ?? H / 2;
    if (e.small) { ctx.font = `36px ${FONTS.title}`; outlined(ctx, e.small, e.x ?? W / 2, y - 70, e.smallColor || '#ffd9a0', '#16101e', 8); }
    ctx.font = `${e.size || 76}px ${e.brush ? FONTS.brush : FONTS.title}`; outlined(ctx, e.text, e.x ?? W / 2, y, e.color || '#ffffff', '#16101e', 14);
    if (e.sub) { ctx.font = `34px ${FONTS.sub}`; outlined(ctx, e.sub, e.x ?? W / 2, y + 74, '#ffffff', '#16101e', 8); }
    ctx.restore();
  },
  nameCard(ctx, e, k) {
    // OP character introduction: big name + kanji, slashes in from the side
    const a = smoothstep(0, 0.08, k) * (1 - smoothstep(0.88, 1, k));
    const sl = (1 - ease.outExpo(clamp(k / 0.18))) * 500 * (e.side === 'left' ? -1 : 1);
    ctx.save(); ctx.globalAlpha = a;
    const x = (e.side === 'left' ? 120 : 1800) + sl, al = e.side === 'left' ? 'left' : 'right';
    ctx.textAlign = al;
    ctx.font = `200px ${FONTS.brush}`; ctx.fillStyle = rgba(e.color || '#ffffff', 0.25); ctx.fillText(e.jp, x, 760);
    ctx.font = `96px ${FONTS.title}`; outlined(ctx, e.name, x, 880, '#ffffff', '#16101e', 14);
    ctx.font = `38px ${FONTS.title}`; outlined(ctx, e.role || '', x, 950, e.color || '#ffd23a', '#16101e', 8);
    ctx.restore();
  },
  nextTime(ctx, e, k) {
    const a = smoothstep(0, 0.1, k) * (1 - smoothstep(0.9, 1, k));
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
    ctx.font = `44px ${FONTS.title}`; outlined(ctx, 'NEXT EPISODE', W / 2, 330, '#ffd23a', '#16101e', 10);
    ctx.font = `120px ${FONTS.brush}`; outlined(ctx, e.jp, W / 2, 520, '#ffffff', '#16101e', 14);
    ctx.font = `52px ${FONTS.title}`; outlined(ctx, e.en, W / 2, 630, '#ffffff', '#16101e', 10);
    ctx.restore();
  },
  eyecatch(ctx, e, k, lt) {
    ctx.save();
    const a = smoothstep(0, 0.1, k) * (1 - smoothstep(0.9, 1, k));
    ctx.globalAlpha = a;
    TITLES.logo(ctx, { x: e.x ?? 1300, y: e.y ?? 400, size: 0.62, fadeOut: false }, clamp(0.5 + k * 0.5), lt);
    ctx.restore();
  },
};
