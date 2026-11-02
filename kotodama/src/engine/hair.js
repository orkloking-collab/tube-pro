// Hair styles, drawn in head space (head height = 1, facing +x).
// back(): drawn behind the whole body. front(): drawn over the face.
import { spline, fillStroke, line, ellipse, circle, taper } from './draw.js';
import { shade, rgba, TAU } from './util.js';
import { headPath } from './face.js';

// sharp concave spikes: pts alternate base/tip; c = concavity
function spikePath(ctx, pts, c = 0.18, cx = 0, cy = -0.1) {
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    // push the control point toward the head centre -> concave flame-like edges
    const qx = mx + (cx - mx) * c, qy = my + (cy - my) * c;
    ctx.quadraticCurveTo(qx, qy, b[0], b[1]);
  }
  ctx.closePath();
}

const sway = (t, i, amp, spd = 1.6) => Math.sin(t * spd + i * 1.7) * amp;

function shine(ctx, h, pts, alpha = 0.55) {
  ctx.beginPath(); spline(ctx, pts, true, 0.5);
  ctx.fillStyle = rgba(h.shine || shade(h.color, 0.35), alpha); ctx.fill();
}

function bangShadow(ctx, f, h, build, dx = -0.015, dy = 0.05) {
  ctx.save();
  headPath(ctx, f); ctx.clip();
  ctx.translate(dx, dy);
  ctx.beginPath(); build(); ctx.fillStyle = rgba(shade(f.skin, -0.3), 0.55); ctx.fill();
  ctx.restore();
}

export const HAIR = {
  // ---------------- Kakeru: wild ink-black spikes with crimson tips ----------------
  kakeru: {
    back(ctx, h, t, w) {
      const s = (i, a = 0.025) => sway(t, i, a * (1 + w));
      const pts = [
        [0.36, -0.2], [0.56 + s(1), -0.5 + s(2)], [0.24, -0.47], [0.34 + s(3), -0.84], [0.06, -0.56], [-0.02 + s(4), -0.94],
        [-0.15, -0.53], [-0.46 + s(5), -0.8], [-0.36, -0.37], [-0.78 + s(6), -0.5], [-0.45, -0.17], [-0.76 + s(7), -0.1],
        [-0.42, 0.03], [-0.58 + s(8), 0.25], [-0.3, 0.13], [-0.1, 0.0],
      ];
      ctx.beginPath(); spikePath(ctx, pts, 0.16);
      const g = ctx.createRadialGradient(-0.05, -0.15, 0.1, -0.05, -0.15, 0.95);
      g.addColorStop(0, h.color); g.addColorStop(0.58, h.color); g.addColorStop(0.9, h.tip); g.addColorStop(1, shade(h.tip, 0.15));
      fillStroke(ctx, g, h.line, h.lw);
      shine(ctx, h, [[-0.25, -0.52], [0.0, -0.62], [0.2, -0.56], [0.05, -0.53], [-0.15, -0.47]], 0.6);
    },
    front(ctx, h, t, w, f) {
      const s = (i, a = 0.015) => sway(t, i + 10, a * (1 + w));
      const build = () => spikePath(ctx, [
        [-0.42, -0.26], [-0.21 + s(1), 0.14], [-0.15, -0.2], [-0.06 + s(2), 0.0], [0.03, -0.22], [0.13 + s(3), -0.03],
        [0.19, -0.22], [0.31 + s(4), -0.05], [0.33, -0.22], [0.5 + s(5), -0.1], [0.43, -0.36], [0.22, -0.52], [-0.12, -0.55], [-0.38, -0.45],
      ], 0.12, 0.05, -0.4);
      bangShadow(ctx, f, h, build);
      ctx.beginPath(); build();
      const g = ctx.createLinearGradient(0, -0.5, 0, 0.14);
      g.addColorStop(0, h.color); g.addColorStop(0.84, h.color); g.addColorStop(1, shade(h.tip, -0.35));
      fillStroke(ctx, g, h.line, h.lw);
      shine(ctx, h, [[-0.1, -0.42], [0.12, -0.46], [0.28, -0.4], [0.12, -0.39], [-0.05, -0.37]], 0.5);
    },
  },

  // ---------------- Shiori: long straight hime-cut, white ribbon ----------------
  shiori: {
    back(ctx, h, t, w, f, st) {
      const s = (i, a = 0.04) => sway(t, i, a * (1 + w * 2), 1.2);
      ctx.save();
      // counter-rotate the long hanging part so it follows gravity
      ctx.translate(-0.1, 0.0); ctx.rotate(-(st.headWorldAng || 0) * 0.85); ctx.translate(0.1, 0.0);
      const pts = [
        [0.38, -0.25], [0.22, -0.55], [-0.12, -0.58], [-0.44, -0.32], [-0.52, 0.2], [-0.62 + s(1), 1.1], [-0.7 + s(2), 2.0],
        [-0.6 + s(3), 2.55], [-0.48 + s(4), 2.35], [-0.38 + s(5), 2.6], [-0.22 + s(6), 2.3], [-0.05 + s(7), 2.45], [0.05, 1.6], [0.15, 0.6], [0.2, 0.2],
      ];
      ctx.beginPath(); spline(ctx, pts, true, 0.35);
      const g = ctx.createLinearGradient(-0.6, 0, 0.2, 0);
      g.addColorStop(0, shade(h.color, -0.25)); g.addColorStop(1, h.color);
      fillStroke(ctx, g, h.line, h.lw);
      for (let i = 0; i < 3; i++) line(ctx, [[-0.35 - i * 0.08, 0.3], [-0.45 - i * 0.07 + s(i + 3) * 0.5, 1.4], [-0.5 - i * 0.04 + s(i + 4), 2.2]], rgba(h.line, 0.5), h.lw * 0.6, true);
      ctx.restore();
      // ribbon
      ctx.save(); ctx.translate(-0.42, -0.28); ctx.rotate(0.3 + sway(t, 2, 0.05));
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-0.2, -0.22, -0.26, -0.05); ctx.quadraticCurveTo(-0.2, 0.08, 0, 0); ctx.closePath(); fillStroke(ctx, h.ribbon, h.line, h.lw * 0.8);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(0.12, -0.24, 0.22, -0.1); ctx.quadraticCurveTo(0.16, 0.04, 0, 0); ctx.closePath(); fillStroke(ctx, h.ribbon, h.line, h.lw * 0.8);
      ctx.beginPath(); ctx.moveTo(-0.02, 0.02); ctx.lineTo(-0.1 + sway(t, 3, 0.03), 0.35); ctx.lineTo(-0.02 + sway(t, 3, 0.03), 0.3); ctx.lineTo(0.03, 0.36 + sway(t, 4, 0.02)); ctx.lineTo(0.03, 0.02); ctx.closePath(); fillStroke(ctx, h.ribbon, h.line, h.lw * 0.8);
      circle(ctx, 0, 0, 0.045, shade(h.ribbon, -0.1), h.line, h.lw * 0.8);
      ctx.restore();
    },
    front(ctx, h, t, w, f) {
      const s = (i, a = 0.012) => sway(t, i + 20, a * (1 + w));
      const bangs = () => {
        ctx.moveTo(-0.44, -0.2);
        ctx.quadraticCurveTo(-0.42, -0.55, 0.0, -0.57);
        ctx.quadraticCurveTo(0.38, -0.55, 0.46, -0.15);
        // straight cut fringe with small notches
        const xs = [0.46, 0.38, 0.33, 0.24, 0.18, 0.08, 0.02, -0.08, -0.13, -0.22];
        for (let i = 0; i < xs.length; i++) ctx.lineTo(xs[i] + s(i) * 0.3, i % 2 ? -0.11 : -0.04);
        ctx.lineTo(-0.26, -0.18);
        ctx.closePath();
      };
      bangShadow(ctx, f, h, bangs, -0.01, 0.045);
      ctx.beginPath(); bangs(); fillStroke(ctx, h.color, h.line, h.lw);
      // sidelocks (hime cut)
      ctx.beginPath(); ctx.moveTo(-0.3, -0.25); ctx.quadraticCurveTo(-0.24 + s(3), 0.2, -0.22 + s(4), 0.58); ctx.lineTo(-0.1 + s(4), 0.58); ctx.quadraticCurveTo(-0.14, 0.15, -0.17, -0.18); ctx.closePath();
      fillStroke(ctx, shade(h.color, -0.08), h.line, h.lw);
      ctx.beginPath(); ctx.moveTo(0.4, -0.2); ctx.quadraticCurveTo(0.46 + s(5), 0.15, 0.42 + s(6), 0.5); ctx.lineTo(0.35 + s(6), 0.5); ctx.quadraticCurveTo(0.38, 0.1, 0.33, -0.12); ctx.closePath();
      fillStroke(ctx, shade(h.color, -0.08), h.line, h.lw);
      shine(ctx, h, [[-0.2, -0.43], [0.05, -0.5], [0.3, -0.43], [0.08, -0.4], [-0.1, -0.38]], 0.55);
    },
  },

  // ---------------- Bokusai: bald dome, white topknot and fringe ----------------
  bokusai: {
    back(ctx, h, t, w) {
      ctx.beginPath(); ctx.moveTo(-0.15, -0.3); ctx.quadraticCurveTo(-0.5, -0.2, -0.5, 0.1); ctx.quadraticCurveTo(-0.45, 0.3, -0.25, 0.3); ctx.closePath();
      fillStroke(ctx, h.color, h.line, h.lw);
    },
    front(ctx, h, t, w, f) {
      // head shine
      ellipse(ctx, 0.05, -0.36, 0.12, 0.05, -0.2, rgba('#ffffff', 0.45));
      // topknot
      ctx.save(); ctx.translate(-0.05, -0.5); ctx.rotate(-0.3 + sway(t, 1, 0.04));
      ellipse(ctx, 0, -0.06, 0.07, 0.09, 0, h.color, h.line, h.lw);
      ctx.beginPath(); ctx.rect(-0.05, 0.0, 0.1, 0.04); fillStroke(ctx, '#7a2a2a', h.line, h.lw * 0.7);
      ctx.restore();
      // side fringe over the ear
      ctx.beginPath(); ctx.moveTo(-0.18, -0.18); ctx.quadraticCurveTo(-0.45, -0.15, -0.42, 0.16); ctx.quadraticCurveTo(-0.32, 0.26, -0.2, 0.2); ctx.quadraticCurveTo(-0.3, 0.0, -0.16, -0.08); ctx.closePath();
      fillStroke(ctx, h.color, h.line, h.lw);
    },
  },

  // ---------------- Nashi: long white hair, masked ----------------
  nashi: {
    back(ctx, h, t, w, f, st) {
      const s = (i, a = 0.04) => sway(t, i, a * (1 + w * 2), 1.0);
      ctx.save(); ctx.rotate(-(st.headWorldAng || 0) * 0.7);
      const pts = [[0.38, -0.25], [0.2, -0.58], [-0.18, -0.58], [-0.48, -0.3], [-0.58, 0.3], [-0.66 + s(1), 1.0], [-0.52 + s(2), 0.92], [-0.48 + s(3), 1.15], [-0.32 + s(4), 0.95], [-0.2 + s(5), 1.1], [-0.05, 0.7], [0.1, 0.3]];
      ctx.beginPath(); spikePath(ctx, pts, 0.05, -0.2, 0.2);
      fillStroke(ctx, shade(h.color, -0.12), h.line, h.lw);
      ctx.restore();
    },
    front(ctx, h, t, w, f) {
      const s = (i, a = 0.02) => sway(t, i + 30, a * (1 + w));
      ctx.beginPath(); spikePath(ctx, [[-0.44, -0.22], [-0.3 + s(1), 0.25], [-0.2, -0.15], [-0.05 + s(2), 0.05], [0.05, -0.2], [0.2 + s(3), -0.02], [0.26, -0.24], [0.46 + s(4), 0.05], [0.42, -0.34], [0.15, -0.56], [-0.2, -0.56], [-0.42, -0.42]], 0.08, 0.0, -0.4);
      fillStroke(ctx, h.color, h.line, h.lw);
      shine(ctx, h, [[-0.15, -0.45], [0.1, -0.5], [0.3, -0.42], [0.1, -0.41]], 0.7);
    },
  },

  // ---------------- Gonda: flat-top buzz cut ----------------
  gonda: {
    back(ctx, h) {
      ctx.beginPath(); ctx.moveTo(-0.38, 0.05); ctx.lineTo(-0.46, -0.3); ctx.lineTo(-0.3, -0.55); ctx.lineTo(0.3, -0.56); ctx.lineTo(0.42, -0.3); ctx.lineTo(0.1, -0.2); ctx.closePath();
      fillStroke(ctx, h.color, h.line, h.lw);
    },
    front(ctx, h, t, w, f) {
      const b = () => { ctx.moveTo(-0.4, -0.12); ctx.lineTo(-0.44, -0.32); ctx.lineTo(-0.32, -0.56); ctx.lineTo(0.32, -0.57); ctx.lineTo(0.43, -0.32); ctx.lineTo(0.42, -0.2); ctx.lineTo(0.1, -0.24); ctx.lineTo(-0.2, -0.22); ctx.lineTo(-0.28, -0.06); ctx.closePath(); };
      ctx.beginPath(); b(); fillStroke(ctx, h.color, h.line, h.lw);
      for (let i = 0; i < 6; i++) line(ctx, [[-0.28 + i * 0.1, -0.54], [-0.26 + i * 0.1, -0.44]], rgba(h.shine || '#556', 0.6), h.lw * 0.6);
    },
  },

  // ---------------- Chiyo: grey bun ----------------
  chiyo: {
    back(ctx, h, t) {
      circle(ctx, -0.36, -0.42, 0.17, h.color, h.line, h.lw);
      ctx.save(); ctx.translate(-0.36, -0.42); ctx.rotate(-0.6);
      ctx.beginPath(); ctx.rect(-0.3, -0.015, 0.6, 0.03); fillStroke(ctx, '#b0303a', h.line, h.lw * 0.6);
      circle(ctx, 0.3, 0, 0.035, '#e8c050', h.line, h.lw * 0.6);
      ctx.restore();
    },
    front(ctx, h, t, w, f) {
      const b = () => { ctx.moveTo(-0.4, 0.05); ctx.quadraticCurveTo(-0.5, -0.5, 0.02, -0.56); ctx.quadraticCurveTo(0.42, -0.52, 0.44, -0.16); ctx.quadraticCurveTo(0.2, -0.3, -0.05, -0.27); ctx.quadraticCurveTo(-0.22, -0.2, -0.28, 0.02); ctx.closePath(); };
      ctx.beginPath(); b(); fillStroke(ctx, h.color, h.line, h.lw);
      for (let i = 0; i < 4; i++) line(ctx, [[-0.3 + i * 0.12, -0.3], [-0.2 + i * 0.12, -0.5]], rgba(shade(h.color, -0.3), 0.6), h.lw * 0.5);
    },
  },

  // ---------------- Kanemaru: blond side swoop ----------------
  kanemaru: {
    back(ctx, h) {
      ctx.beginPath(); spline(ctx, [[0.3, -0.4], [-0.1, -0.6], [-0.46, -0.35], [-0.48, 0.05], [-0.3, 0.15], [0, -0.1]], true);
      fillStroke(ctx, shade(h.color, -0.1), h.line, h.lw);
    },
    front(ctx, h, t, w, f) {
      const b = () => { ctx.moveTo(-0.42, -0.1); ctx.quadraticCurveTo(-0.45, -0.58, 0.05, -0.6); ctx.quadraticCurveTo(0.5, -0.58, 0.56, -0.25); ctx.quadraticCurveTo(0.45, -0.1, 0.4, 0.0); ctx.quadraticCurveTo(0.3, -0.2, 0.0, -0.18); ctx.quadraticCurveTo(-0.2, -0.2, -0.3, 0.05); ctx.closePath(); };
      bangShadow(ctx, f, h, b);
      ctx.beginPath(); b(); fillStroke(ctx, h.color, h.line, h.lw);
      shine(ctx, h, [[-0.15, -0.45], [0.15, -0.52], [0.4, -0.38], [0.15, -0.42]], 0.6);
    },
  },

  // ---------------- generic styles for extras ----------------
  short: {
    back(ctx, h) { ctx.beginPath(); spline(ctx, [[0.35, -0.3], [0.0, -0.6], [-0.45, -0.4], [-0.47, 0.05], [-0.3, 0.2], [0, 0]], true); fillStroke(ctx, h.color, h.line, h.lw); },
    front(ctx, h, t, w, f) {
      const b = () => spikePath(ctx, [[-0.42, -0.15], [-0.25, 0.06], [-0.12, -0.18], [0.0, -0.06], [0.12, -0.2], [0.26, -0.08], [0.33, -0.22], [0.45, -0.12], [0.4, -0.4], [0.0, -0.58], [-0.4, -0.42]], 0.1, 0, -0.4);
      bangShadow(ctx, f, h, b);
      ctx.beginPath(); b(); fillStroke(ctx, h.color, h.line, h.lw);
    },
  },
  bob: {
    back(ctx, h) { ctx.beginPath(); spline(ctx, [[0.42, -0.2], [0.1, -0.6], [-0.45, -0.42], [-0.52, 0.2], [-0.4, 0.5], [0.0, 0.4]], true); fillStroke(ctx, h.color, h.line, h.lw); },
    front(ctx, h, t, w, f) {
      const b = () => { ctx.moveTo(-0.44, 0.3); ctx.quadraticCurveTo(-0.5, -0.55, 0.02, -0.58); ctx.quadraticCurveTo(0.45, -0.55, 0.47, -0.05); ctx.lineTo(0.38, -0.08); ctx.lineTo(0.34, -0.14); ctx.lineTo(0.1, -0.1); ctx.lineTo(-0.15, -0.12); ctx.quadraticCurveTo(-0.3, 0.0, -0.3, 0.32); ctx.closePath(); };
      bangShadow(ctx, f, h, b);
      ctx.beginPath(); b(); fillStroke(ctx, h.color, h.line, h.lw);
    },
  },
  spiky2: {
    back(ctx, h, t) { ctx.beginPath(); spikePath(ctx, [[0.3, -0.3], [0.4, -0.7], [0.0, -0.55], [-0.2, -0.85], [-0.3, -0.45], [-0.65, -0.45], [-0.45, -0.1], [-0.6, 0.15], [-0.3, 0.1], [0, 0]], 0.12); fillStroke(ctx, h.color, h.line, h.lw); },
    front(ctx, h, t, w, f) {
      const b = () => spikePath(ctx, [[-0.42, -0.2], [-0.22, 0.05], [-0.1, -0.2], [0.08, -0.02], [0.15, -0.22], [0.42, -0.06], [0.42, -0.38], [0.0, -0.56], [-0.4, -0.42]], 0.1, 0, -0.4);
      bangShadow(ctx, f, h, b);
      ctx.beginPath(); b(); fillStroke(ctx, h.color, h.line, h.lw);
    },
  },
  ponytail: {
    back(ctx, h, t) {
      ctx.save(); ctx.translate(-0.4, -0.3); ctx.rotate(sway(t, 1, 0.08, 2));
      ctx.beginPath(); ctx.moveTo(0, -0.08); ctx.quadraticCurveTo(-0.4, 0.1, -0.3, 0.8); ctx.quadraticCurveTo(-0.15, 0.5, 0.08, 0.06); ctx.closePath(); fillStroke(ctx, h.color, h.line, h.lw);
      ctx.restore();
      HAIR.short.back(ctx, h, t);
    },
    front(ctx, h, t, w, f) { HAIR.bob.front(ctx, h, t, w, f); },
  },
  none: { back() {}, front() {} },
};
