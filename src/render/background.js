// Kechki Samarqand osmoni: gumbaz va minora siluetlari. Bir marta chiziladi (keshlanadi).
import { UI } from './palette.js';
import { createRng } from '../logic/shapes.js';

let cached = null, cachedKey = '';

function dome(ctx, cx, base, w, h, ribs = true) {
  // piyozsimon qovurg'ali gumbaz + baraban
  const drumH = h * 0.35;
  ctx.fillRect(cx - w * 0.42, base - drumH, w * 0.84, drumH);
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, base - drumH);
  ctx.bezierCurveTo(cx - w * 0.62, base - drumH - h * 0.55, cx - w * 0.12, base - h * 0.95, cx, base - h);
  ctx.bezierCurveTo(cx + w * 0.12, base - h * 0.95, cx + w * 0.62, base - drumH - h * 0.55, cx + w / 2, base - drumH);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(cx - 1, base - h - h * 0.12, 2, h * 0.12);
  if (ribs) return { top: base - h };
  return null;
}

function minaret(ctx, cx, base, w, h) {
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.6, base);
  ctx.lineTo(cx - w * 0.4, base - h);
  ctx.lineTo(cx + w * 0.4, base - h);
  ctx.lineTo(cx + w * 0.6, base);
  ctx.closePath();
  ctx.fill();
  // fonus (ayvon)
  ctx.fillRect(cx - w * 0.62, base - h - w * 0.5, w * 1.24, w * 0.5);
  ctx.beginPath();
  ctx.arc(cx, base - h - w * 0.5, w * 0.5, Math.PI, 0);
  ctx.fill();
}

function portal(ctx, x, base, w, h, archColor) {
  // peshtoq: to'rtburchak + o'tkir ravoq
  ctx.fillRect(x, base - h, w, h);
  ctx.save();
  ctx.fillStyle = archColor;
  const aw = w * 0.5, ah = h * 0.62, ax = x + (w - aw) / 2;
  ctx.beginPath();
  ctx.moveTo(ax, base);
  ctx.lineTo(ax, base - ah * 0.6);
  ctx.quadraticCurveTo(ax, base - ah, ax + aw / 2, base - ah);
  ctx.quadraticCurveTo(ax + aw, base - ah, ax + aw, base - ah * 0.6);
  ctx.lineTo(ax + aw, base);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawSkyline(ctx, w, h, color, archColor, scale, offset) {
  const base = h;
  ctx.fillStyle = color;
  const u = scale;
  // markaziy ansambl (Registonga ishora, lekin erkin talqin)
  portal(ctx, offset + w * 0.36, base, w * 0.28, u * 1.15, archColor);
  ctx.fillStyle = color;
  minaret(ctx, offset + w * 0.33, base, u * 0.16, u * 1.6);
  minaret(ctx, offset + w * 0.67, base, u * 0.16, u * 1.6);
  dome(ctx, offset + w * 0.5, base - u * 1.1, u * 0.5, u * 0.55);
  portal(ctx, offset + w * 0.02, base, w * 0.2, u * 0.8, archColor);
  ctx.fillStyle = color;
  dome(ctx, offset + w * 0.12, base - u * 0.78, u * 0.38, u * 0.42);
  portal(ctx, offset + w * 0.78, base, w * 0.2, u * 0.8, archColor);
  ctx.fillStyle = color;
  dome(ctx, offset + w * 0.88, base - u * 0.78, u * 0.38, u * 0.42);
  ctx.fillRect(offset, base - u * 0.35, w, u * 0.35);
}

export function backgroundCanvas(w, h, dpr = 1) {
  const key = `${w}x${h}@${dpr}`;
  if (cached && cachedKey === key) return cached;
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(w * dpr); cv.height = Math.ceil(h * dpr);
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, UI.bgTop);
  g.addColorStop(0.55, UI.bgMid);
  g.addColorStop(0.85, UI.bgLow);
  g.addColorStop(1, UI.horizon);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // yulduzlar
  const rng = createRng(1405);
  for (let i = 0; i < 90; i++) {
    const x = rng() * w, y = rng() * h * 0.6, r = rng() * 1.2 + 0.2;
    ctx.globalAlpha = 0.25 + rng() * 0.5;
    ctx.fillStyle = '#fff6dc';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // oy (o'roq)
  const mx = w * 0.82, my = h * 0.09, mr = Math.min(w, h) * 0.045;
  ctx.fillStyle = '#f7e7b5';
  ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = UI.bgTop;
  ctx.beginPath(); ctx.arc(mx + mr * 0.45, my - mr * 0.15, mr * 0.92, 0, Math.PI * 2); ctx.fill();
  // uzoq va yaqin siluetlar
  const sc = Math.min(w, h) * 0.22;
  ctx.globalAlpha = 0.55;
  drawSkyline(ctx, w * 1.3, h, UI.silhouette2, UI.bgLow, sc * 0.7, -w * 0.15);
  ctx.globalAlpha = 1;
  drawSkyline(ctx, w, h, UI.silhouette, '#2a1f3f', sc, 0);
  // sokin qilish uchun xiralik — maydonni bosib ketmasin
  ctx.fillStyle = 'rgba(8,14,40,0.25)';
  ctx.fillRect(0, 0, w, h);
  cached = cv; cachedKey = key;
  return cv;
}
