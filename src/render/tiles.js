// Sirlangan koshin plitkalari — kod bilan chiziladi va keshlanadi (tezlik uchun).
import { TILE_COLORS, UI } from './palette.js';

const cache = new Map();

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function star(ctx, cx, cy, n, r1, r2, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const a = rot + (i * Math.PI) / n;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.closePath();
}

function drawMotif(ctx, pattern, s, col) {
  const c = s / 2;
  ctx.save();
  ctx.fillStyle = col.motif;
  ctx.strokeStyle = col.motif;
  ctx.lineWidth = Math.max(1, s * 0.045);
  ctx.globalAlpha = 0.9;
  switch (pattern) {
    case 'star8': {
      // girih: 8 qirrali yulduz (ikki kvadrat)
      star(ctx, c, c, 8, s * 0.3, s * 0.17, Math.PI / 8);
      ctx.fill();
      ctx.fillStyle = col.base;
      star(ctx, c, c, 8, s * 0.13, s * 0.08, Math.PI / 8);
      ctx.fill();
      break;
    }
    case 'rosette': {
      // islimiy gul: 6 barg
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.ellipse(c + Math.cos(a) * s * 0.14, c + Math.sin(a) * s * 0.14, s * 0.12, s * 0.055, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#e8c25a';
      ctx.beginPath(); ctx.arc(c, c, s * 0.06, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'lattice': {
      // romb to'r
      ctx.beginPath();
      ctx.moveTo(c, s * 0.2); ctx.lineTo(s * 0.8, c); ctx.lineTo(c, s * 0.8); ctx.lineTo(s * 0.2, c); ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c, s * 0.34); ctx.lineTo(s * 0.66, c); ctx.lineTo(c, s * 0.66); ctx.lineTo(s * 0.34, c); ctx.closePath();
      ctx.fill();
      break;
    }
    case 'flower4': {
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        ctx.beginPath();
        ctx.ellipse(c + Math.cos(a) * s * 0.15, c + Math.sin(a) * s * 0.15, s * 0.14, s * 0.07, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#17a8a5';
      ctx.beginPath(); ctx.arc(c, c, s * 0.065, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'cross': {
      star(ctx, c, c, 4, s * 0.3, s * 0.1, 0);
      ctx.fill();
      ctx.globalAlpha = 0.6;
      star(ctx, c, c, 4, s * 0.2, s * 0.07, Math.PI / 4);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// Bitta plitka sprayti (s — piksel o'lchami).
export function tileSprite(colorIdx, s) {
  const size = Math.round(s);
  const key = colorIdx + ':' + size;
  let cv = cache.get(key);
  if (cv) return cv;
  const col = TILE_COLORS[((colorIdx % TILE_COLORS.length) + TILE_COLORS.length) % TILE_COLORS.length];
  cv = makeCanvas(size, size);
  const ctx = cv.getContext('2d');
  const pad = Math.max(1, size * 0.04), r = size * 0.16;
  // soya/qirra
  ctx.fillStyle = col.dark;
  rr(ctx, pad, pad + size * 0.04, size - pad * 2, size - pad * 2, r);
  ctx.fill();
  // asosiy sir
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, col.light);
  g.addColorStop(0.45, col.base);
  g.addColorStop(1, col.dark);
  ctx.fillStyle = g;
  rr(ctx, pad, pad, size - pad * 2, size - pad * 2 - size * 0.04, r);
  ctx.fill();
  // ichki hoshiya
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = Math.max(1, size * 0.03);
  rr(ctx, size * 0.13, size * 0.12, size * 0.74, size * 0.7, r * 0.6);
  ctx.stroke();
  ctx.save();
  ctx.translate(0, -size * 0.02);
  drawMotif(ctx, col.pattern, size, col);
  ctx.restore();
  // sir yaltirashi
  ctx.save();
  rr(ctx, pad, pad, size - pad * 2, size - pad * 2 - size * 0.04, r);
  ctx.clip();
  const sh = ctx.createLinearGradient(0, 0, 0, size * 0.5);
  sh.addColorStop(0, 'rgba(255,255,255,0.45)');
  sh.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.ellipse(size * 0.35, size * 0.1, size * 0.55, size * 0.28, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  cache.set(key, cv);
  return cv;
}

// Bo'sh katak sprayti (chuqurcha, xira girih chizig'i bilan).
export function emptyCellSprite(s) {
  const size = Math.round(s);
  const key = 'empty:' + size;
  let cv = cache.get(key);
  if (cv) return cv;
  cv = makeCanvas(size, size);
  const ctx = cv.getContext('2d');
  const pad = Math.max(1, size * 0.04);
  ctx.fillStyle = UI.cellEmpty;
  rr(ctx, pad, pad, size - pad * 2, size - pad * 2, size * 0.14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = Math.max(1, size * 0.04);
  ctx.beginPath(); ctx.moveTo(pad * 2, pad * 2.2); ctx.lineTo(size - pad * 2, pad * 2.2); ctx.stroke();
  ctx.strokeStyle = UI.cellEmptyLine;
  ctx.lineWidth = Math.max(1, size * 0.025);
  star(ctx, size / 2, size / 2, 8, size * 0.22, size * 0.14, Math.PI / 8);
  ctx.stroke();
  cache.set(key, cv);
  return cv;
}

export function clearTileCache() { cache.clear(); }
export { rr, star };
