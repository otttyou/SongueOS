/**
 * Kengo Works exhibition renderer — Fable wall strokes, Cool S graph paper,
 * portrait frames, and incident stripes. Inspired by kengoworks.com/fable and
 * related work pages; simplified for SoengOS gallery windows.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root && typeof root === 'object') {
    Object.assign(root, api);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const TAU = Math.PI * 2;
  const PALETTE = {
    cream: [246, 241, 228],
    blush: [237, 220, 208],
    sage: [104, 126, 86],
    ink: [42, 37, 31],
    clay: [172, 80, 54],
    peach: [232, 168, 120],
    ochre: [176, 132, 50],
    rose: [196, 130, 122],
    seal: [196, 92, 74],
    slate: [88, 112, 148],
    void: [24, 20, 16],
  };

  const KENGO_EXHIBITS = [
    {
      id: 'fable',
      title: 'Fable Wall',
      subtitle: 'A wandering ink wall on cream paper',
      url: 'https://www.kengoworks.com/fable',
      mode: 'wall',
      tint: 'peach',
    },
    {
      id: 'cools',
      title: 'Cool S',
      subtitle: 'Graph-paper doodles in the browser',
      url: 'https://www.kengoworks.com/work/cool-s',
      mode: 'cools',
      tint: 'slate',
    },
    {
      id: 'portraits',
      title: 'Self Portraits',
      subtitle: 'Ink ovals and blush fields',
      url: 'https://www.kengoworks.com/work/self-portraits',
      mode: 'portraits',
      tint: 'rose',
    },
    {
      id: 'incident',
      title: 'Hugging Face Incident',
      subtitle: 'Striped explainer frame',
      url: 'https://www.kengoworks.com/work/hugging-face-incident',
      mode: 'incident',
      tint: 'ink',
    },
  ];

  function mul32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function rgba(c, a) {
    return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')';
  }

  function rd(R, a, b) {
    return a + R() * (b - a);
  }

  function ri(R, a, b) {
    return Math.floor(rd(R, a, b + 1));
  }

  function ch_(R, p) {
    return R() < p;
  }

  function resample(pts, step) {
    if (pts.length < 2) return pts.slice();
    const out = [pts[0].slice()];
    let need = step;
    for (let i = 1; i < pts.length; i++) {
      let x0 = pts[i - 1][0];
      let y0 = pts[i - 1][1];
      let x1 = pts[i][0];
      let y1 = pts[i][1];
      let dx = x1 - x0;
      let dy = y1 - y0;
      let dist = Math.hypot(dx, dy);
      while (dist >= need) {
        const t = need / dist;
        out.push([x0 + dx * t, y0 + dy * t]);
        x0 += dx * t;
        y0 += dy * t;
        dx = x1 - x0;
        dy = y1 - y0;
        dist = Math.hypot(dx, dy);
        need = step;
      }
      need -= dist;
    }
    return out;
  }

  function wobble(R, pts, amp) {
    const n = pts.length;
    const q = [];
    const p1 = rd(R, 0, 7);
    const p2 = rd(R, 0, 7);
    const f1 = rd(R, 1.6, 3.2);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(n - 1, i + 1)];
      let nx = -(b[1] - a[1]);
      let ny = b[0] - a[0];
      const d = Math.hypot(nx, ny) || 1;
      nx /= d;
      ny /= d;
      const off = amp * (0.62 * Math.sin(t * f1 * 2 + p1) + 0.28 * Math.sin(t * 9 + p2));
      q.push([pts[i][0] + nx * off + rd(R, -0.4, 0.4), pts[i][1] + ny * off + rd(R, -0.4, 0.4)]);
    }
    return q;
  }

  function strokePath(ctx, pts, color, width, alpha) {
    if (pts.length < 2) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    ctx.restore();
  }

  function fillPaper(ctx, w, h, wash) {
    ctx.fillStyle = rgba(PALETTE.cream, 1);
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w * 0.25, h * 0.2, 0, w * 0.25, h * 0.2, w * 0.9);
    g.addColorStop(0, rgba(wash || PALETTE.blush, 0.45));
    g.addColorStop(1, 'rgba(246,241,228,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function drawGraphGrid(ctx, w, h, minor, major) {
    ctx.save();
    ctx.strokeStyle = 'rgba(24,20,16,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += minor) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += minor) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(24,20,16,0.11)';
    for (let x = 0; x <= w; x += major) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += major) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawStripeBand(ctx, x, y, w, h, R, vertical) {
    const n = ri(R, 6, 14);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const a = 0.04 + t * 0.12;
      ctx.fillStyle = rgba(PALETTE.ink, a);
      if (vertical) {
        const sx = x + (w / n) * i;
        ctx.fillRect(sx, y, w / n + 1, h);
      } else {
        const sy = y + (h / n) * i;
        ctx.fillRect(x, sy, w, h / n + 1);
      }
    }
  }

  function coolSPoints(cx, cy, scale) {
    const s = scale;
    return [
      [cx - 4 * s, cy - 5 * s],
      [cx + 4 * s, cy - 5 * s],
      [cx + 4 * s, cy - 1 * s],
      [cx - 2 * s, cy - 1 * s],
      [cx + 4 * s, cy + 3 * s],
      [cx - 4 * s, cy + 3 * s],
      [cx - 4 * s, cy + 7 * s],
      [cx + 2 * s, cy + 7 * s],
      [cx - 4 * s, cy + 1 * s],
      [cx + 4 * s, cy + 1 * s],
      [cx - 4 * s, cy - 3 * s],
      [cx + 4 * s, cy - 3 * s],
    ];
  }

  function drawInkCircle(ctx, cx, cy, r, R) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = rgba(PALETTE.ink, 0.75);
    ctx.lineWidth = 1.4;
    ctx.setLineDash([2, 7]);
    ctx.beginPath();
    ctx.arc(cx, cy, r, rd(R, 0, TAU), rd(R, 0, TAU) + TAU * rd(R, 0.82, 0.95));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = rgba(PALETTE.seal, 0.9);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.08 + 2, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawFableTile(ctx, w, h, seed) {
    const R = mul32(seed);
    fillPaper(ctx, w, h, PALETTE.blush);
    drawStripeBand(ctx, 0, h * 0.08, w, h * 0.06, R, false);
    drawGraphGrid(ctx, w, h, 16, 64);
    const marks = ri(R, 8, 16);
    for (let i = 0; i < marks; i++) {
      const cx = rd(R, 30, w - 30);
      const cy = rd(R, 50, h - 30);
      const kind = ri(R, 0, 3);
      if (kind === 0) {
        const turns = rd(R, 1.2, 3.5);
        const pts = [];
        for (let t = 0; t <= 48; t++) {
          const th = t / 48 * turns * TAU;
          const r = rd(R, 12, 48) * (1 - t / 48 * 0.35);
          pts.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r]);
        }
        strokePath(ctx, wobble(R, resample(pts, 3), rd(R, 0.8, 2.2)), PALETTE.ink, rd(R, 0.8, 1.6), rd(R, 0.35, 0.7));
      } else if (kind === 1) {
        const pts = [];
        for (let a = 0; a < TAU; a += TAU / 14) {
          const m = 1 + 0.14 * Math.sin(a * 3 + rd(R, 0, 5));
          pts.push([cx + Math.cos(a) * rd(R, 18, 42) * m, cy + Math.sin(a) * rd(R, 14, 36) * m]);
        }
        strokePath(ctx, wobble(R, pts, 1.2), ch_(R, 0.5) ? PALETTE.clay : PALETTE.sage, 1.1, 0.55);
      } else {
        const x0 = rd(R, 20, w - 80);
        const y0 = rd(R, 40, h - 40);
        strokePath(
          ctx,
          wobble(R, [[x0, y0], [x0 + rd(R, 40, 160), y0 + rd(R, -30, 30)]], 1.5),
          PALETTE.slate,
          rd(R, 0.6, 1.2),
          0.45
        );
      }
    }
    if (ch_(R, 0.55)) drawInkCircle(ctx, rd(R, 60, w - 60), rd(R, 80, h - 80), rd(R, 28, 46), R);
  }

  function drawCoolS(ctx, w, h) {
    fillPaper(ctx, w, h, PALETTE.cream);
    drawGraphGrid(ctx, w, h, 12, 48);
    const R = mul32(42);
    for (let i = 0; i < 6; i++) {
      const cx = rd(R, 40, w - 40);
      const cy = rd(R, 40, h - 40);
      const sc = rd(R, 2.2, 4.5);
      strokePath(ctx, wobble(R, coolSPoints(cx, cy, sc), 1.2), PALETTE.ink, rd(R, 1, 1.8), rd(R, 0.25, 0.55));
    }
    const main = coolSPoints(w / 2, h / 2, Math.min(w, h) / 14);
    strokePath(ctx, wobble(R, resample(main, 2.5), 0.6), PALETTE.void, 2.4, 0.85);
    drawInkCircle(ctx, w * 0.78, h * 0.22, 18, mul32(99));
  }

  function drawPortraits(ctx, w, h, seed) {
    const R = mul32(seed);
    fillPaper(ctx, w, h, PALETTE.rose);
    const cols = 2;
    const rows = 2;
    const pad = 24;
    const cw = (w - pad * (cols + 1)) / cols;
    const ch = (h - pad * (rows + 1)) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = pad + c * (cw + pad);
        const y = pad + r * (ch + pad);
        ctx.fillStyle = rgba(PALETTE.blush, 0.35);
        ctx.fillRect(x, y, cw, ch);
        ctx.strokeStyle = rgba(PALETTE.ink, 0.2);
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
        const cx = x + cw / 2;
        const cy = y + ch * 0.42;
        const rx = cw * rd(R, 0.22, 0.28);
        const ry = ch * rd(R, 0.28, 0.34);
        const face = [];
        for (let a = 0; a <= TAU; a += TAU / 24) {
          const wob = 1 + 0.08 * Math.sin(a * 4 + rd(R, 0, 3));
          face.push([cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob]);
        }
        strokePath(ctx, wobble(R, face, 1.5), PALETTE.ink, 1.2, 0.65);
        strokePath(
          ctx,
          wobble(R, [[cx - rx * 0.3, cy - ry * 0.1], [cx + rx * 0.3, cy - ry * 0.1]], 0.8),
          PALETTE.clay,
          0.9,
          0.5
        );
        drawStripeBand(ctx, x + 8, y + ch - 28, cw - 16, 14, mul32(seed + r * cols + c), true);
      }
    }
  }

  function drawIncident(ctx, w, h, seed) {
    const R = mul32(seed);
    fillPaper(ctx, w, h, PALETTE.cream);
    drawStripeBand(ctx, 0, 0, w, h * 0.14, R, true);
    ctx.fillStyle = rgba(PALETTE.void, 0.92);
    ctx.fillRect(0, h * 0.14, w, h * 0.52);
    const frameX = w * 0.08;
    const frameY = h * 0.2;
    const frameW = w * 0.84;
    const frameH = h * 0.38;
    ctx.fillStyle = rgba(PALETTE.cream, 0.08);
    ctx.fillRect(frameX, frameY, frameW, frameH);
    for (let i = 0; i < 10; i++) {
      const y = frameY + (frameH / 10) * i;
      ctx.fillStyle = rgba(PALETTE.cream, 0.03 + i * 0.02);
      ctx.fillRect(frameX, y, frameW, frameH / 10);
    }
    const cx = frameX + frameW / 2;
    const cy = frameY + frameH / 2;
    for (let i = 0; i < 8; i++) {
      strokePath(
        ctx,
        wobble(R, [[cx - frameW * 0.3, cy + rd(R, -40, 40)], [cx + frameW * 0.3, cy + rd(R, -40, 40)]], 1.2),
        PALETTE.rose,
        rd(R, 0.5, 1.2),
        0.35
      );
    }
    drawInkCircle(ctx, cx, cy, Math.min(frameW, frameH) * 0.18, R);
    ctx.fillStyle = rgba(PALETTE.cream, 0.95);
    ctx.fillRect(0, h * 0.66, w, h * 0.34);
    drawGraphGrid(ctx, w, h * 0.34, 16, 64);
    ctx.save();
    ctx.translate(0, h * 0.66);
    ctx.fillStyle = rgba(PALETTE.ink, 0.75);
    ctx.font = '400 13px Fraunces, Georgia, serif';
    ctx.fillText('explainer frame — ink on paper', 24, 36);
    ctx.font = '400 11px Helvetica Neue, Helvetica, sans-serif';
    ctx.fillStyle = rgba(PALETTE.ink, 0.5);
    ctx.fillText('stripes · grid · wandering line work', 24, 54);
    ctx.restore();
  }

  const activeExhibits = new Map();

  function paintExhibit(mode, canvas, w, h, seed) {
    const ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    if (mode === 'wall') drawFableTile(ctx, w, h, seed);
    else if (mode === 'cools') drawCoolS(ctx, w, h);
    else if (mode === 'portraits') drawPortraits(ctx, w, h, seed);
    else if (mode === 'incident') drawIncident(ctx, w, h, seed);
  }

  function repaintExhibit(root, meta, state) {
    if (meta.mode === 'wall') {
      const inner = root.querySelector('[data-exhibit-wall]');
      if (!inner) return;
      inner.querySelectorAll('canvas').forEach((cv, i) => {
        paintExhibit('wall', cv, cv.width, cv.height, state.seed + i * 97);
      });
      return;
    }
    const canvas = root.querySelector('[data-exhibit-canvas]');
    const stage = root.querySelector('[data-exhibit-stage]');
    if (!canvas || !stage) return;
    const rect = stage.getBoundingClientRect();
    paintExhibit(meta.mode, canvas, Math.max(320, Math.floor(rect.width)), Math.max(240, Math.floor(rect.height)), state.seed);
  }

  function mountExhibit(winId, root, exhibitId) {
    destroyExhibit(winId);
    const meta = KENGO_EXHIBITS.find((e) => e.id === exhibitId);
    if (!meta || !root) return null;
    const state = { id: winId, raf: 0, seed: Math.floor(Math.random() * 1e9) };
    activeExhibits.set(winId, state);

    if (meta.mode === 'wall') {
      const scroll = root.querySelector('[data-exhibit-scroll]');
      const inner = root.querySelector('[data-exhibit-wall]');
      const trail = root.querySelector('[data-exhibit-trail]');
      if (!scroll || !inner) return state;
      const tileW = 520;
      const tileH = 640;
      const tiles = 5;
      inner.style.height = tileH * tiles + 'px';
      inner.textContent = '';
      for (let i = 0; i < tiles; i++) {
        const cv = document.createElement('canvas');
        cv.width = tileW;
        cv.height = tileH;
        cv.style.display = 'block';
        cv.style.width = '100%';
        paintExhibit('wall', cv, tileW, tileH, state.seed + i * 97);
        inner.appendChild(cv);
      }
      if (trail) {
        const resizeTrail = () => {
          const rect = scroll.getBoundingClientRect();
          trail.width = rect.width;
          trail.height = rect.height;
        };
        resizeTrail();
        const tctx = trail.getContext('2d');
        let px = 0;
        let py = 0;
        const onMove = (e) => {
          const rect = scroll.getBoundingClientRect();
          px = e.clientX - rect.left;
          py = e.clientY - rect.top;
        };
        scroll.addEventListener('pointermove', onMove);
        const loop = () => {
          if (!activeExhibits.has(winId)) return;
          tctx.clearRect(0, 0, trail.width, trail.height);
          const g = tctx.createRadialGradient(px, py, 0, px, py, 48);
          g.addColorStop(0, rgba(PALETTE.peach || PALETTE.clay, 0.22));
          g.addColorStop(1, 'rgba(232,168,120,0)');
          tctx.fillStyle = g;
          tctx.fillRect(0, 0, trail.width, trail.height);
          state.raf = requestAnimationFrame(loop);
        };
        state.raf = requestAnimationFrame(loop);
        state.cleanup = () => {
          scroll.removeEventListener('pointermove', onMove);
        };
      }
    } else {
      const canvas = root.querySelector('[data-exhibit-canvas]');
      const stage = root.querySelector('[data-exhibit-stage]');
      if (!canvas || !stage) return state;
      const resize = () => {
        const rect = stage.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const h = Math.max(240, Math.floor(rect.height));
        paintExhibit(meta.mode, canvas, w, h, state.seed);
      };
      resize();
      state.resizeObserver = new ResizeObserver(() => resize());
      state.resizeObserver.observe(stage);
      state.cleanup = () => state.resizeObserver?.disconnect();
    }

    const regen = root.querySelector('[data-exhibit-action="regen"]');
    if (regen) {
      regen.addEventListener('click', () => {
        state.seed = Math.floor(Math.random() * 1e9);
        repaintExhibit(root, meta, state);
      });
    }
    const live = root.querySelector('[data-exhibit-action="open-live"]');
    if (live) {
      live.addEventListener('click', () => {
        window.open(meta.url, '_blank', 'noopener,noreferrer');
      });
    }
    return state;
  }

  function destroyExhibit(winId) {
    const state = activeExhibits.get(winId);
    if (!state) return;
    if (state.raf) cancelAnimationFrame(state.raf);
    if (state.cleanup) state.cleanup();
    if (state.resizeObserver) state.resizeObserver.disconnect();
    activeExhibits.delete(winId);
  }

  function getExhibitById(id) {
    return KENGO_EXHIBITS.find((e) => e.id === id);
  }

  return {
    KENGO_EXHIBITS,
    KENGO_PALETTE: PALETTE,
    mountExhibit,
    destroyExhibit,
    getExhibitById,
    paintExhibit,
  };
});
