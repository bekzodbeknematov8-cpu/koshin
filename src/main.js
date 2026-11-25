// 1-bosqich: chizish va sudrab qo'yish (sensor ekran + sichqoncha, Pointer Events).
// Koshin dizayni 4-bosqichda qo'shiladi; hozir vaqtinchalik oddiy ranglar.
import { createGame, tryPlace } from './logic/game.js';
import { canPlace, EMPTY } from './logic/board.js';
import { shapeSize } from './logic/shapes.js';

const COLORS = ['#1e6fd9', '#18b7b0', '#e0a526', '#f2f0e6', '#3a4fb0'];
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let game = createGame();
let layout = {};
let drag = null; // { index, x, y, row, col, valid }
let fx = []; // tozalangan kataklar animatsiyasi
let popup = null; // combo yozuvi
let best = 0;
try { best = Number(localStorage.getItem('koshin.best') || 0); } catch {}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth, h = window.innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const boardPx = Math.min(w - 24, h * 0.58, 520);
  const cell = boardPx / 8;
  const bx = (w - boardPx) / 2;
  const by = Math.max(16, (h - boardPx - cell * 4) / 2);
  const trayY = by + boardPx + cell * 0.8;
  const slotW = w / 3;
  layout = { w, h, cell, bx, by, boardPx, trayY, slotW, trayCell: cell * 0.55 };
}

function roundRect(x, y, s, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, s, s, r);
  ctx.fill();
}

function drawTile(x, y, s, colorIdx, alpha = 1) {
  ctx.globalAlpha = alpha;
  roundRect(x + 1.5, y + 1.5, s - 3, s * 0.18, COLORS[colorIdx % COLORS.length]);
  ctx.globalAlpha = alpha * 0.25;
  roundRect(x + s * 0.22, y + s * 0.22, s * 0.56, s * 0.12, '#ffffff');
  ctx.globalAlpha = 1;
}

function slotOrigin(i, piece, cellSize) {
  const { rows, cols } = shapeSize(piece.cells);
  const cx = layout.slotW * i + layout.slotW / 2;
  const cy = layout.trayY + layout.cell * 1.4;
  return { x: cx - (cols * cellSize) / 2, y: cy - (rows * cellSize) / 2 };
}

// Barmoq shaklni yopmasligi uchun shakl barmoqdan yuqorida ko'rsatiladi.
function dragOrigin(piece) {
  const { rows, cols } = shapeSize(piece.cells);
  const s = layout.cell;
  return { x: drag.x - (cols * s) / 2, y: drag.y - rows * s - s * 0.9 };
}

function draw() {
  const { w, h, cell, bx, by, boardPx } = layout;
  ctx.fillStyle = '#0d1b3d';
  ctx.fillRect(0, 0, w, h);
  roundRect(bx - 6, by - 6, boardPx + 12, 14, '#172a57');
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const v = game.board[r][c];
      if (v === EMPTY) roundRect(bx + c * cell + 1.5, by + r * cell + 1.5, cell - 3, cell * 0.15, '#20376e');
      else drawTile(bx + c * cell, by + r * cell, cell, v);
    }

  if (drag && drag.valid) {
    const p = game.tray[drag.index];
    for (const [dr, dc] of p.cells) drawTile(bx + (drag.col + dc) * cell, by + (drag.row + dr) * cell, cell, p.color, 0.35);
  }

  game.tray.forEach((p, i) => {
    if (!p || (drag && drag.index === i)) return;
    const s = layout.trayCell;
    const o = slotOrigin(i, p, s);
    for (const [dr, dc] of p.cells) drawTile(o.x + dc * s, o.y + dr * s, s, p.color);
  });

  if (drag) {
    const p = game.tray[drag.index];
    const o = dragOrigin(p);
    for (const [dr, dc] of p.cells) drawTile(o.x + dc * cell, o.y + dr * cell, cell, p.color, 0.95);
  }

  // ochko va streak
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f2f0e6';
  ctx.font = 'bold 26px system-ui';
  ctx.fillText(String(game.score), w / 2, Math.max(28, by - 14));
  ctx.font = '14px system-ui';
  ctx.fillStyle = '#e0a526';
  ctx.textAlign = 'left';
  ctx.fillText('★ ' + best, 12, 22);
  if (game.streak > 1) { ctx.textAlign = 'right'; ctx.fillText('🔥×' + game.streak, w - 12, 22); }

  const now = performance.now();
  fx = fx.filter((f) => now - f.t < 450);
  for (const f of fx) {
    const k = (now - f.t) / 450;
    const s = cell * (1 - k * 0.6);
    const x = bx + f.c * cell + (cell - s) / 2, y = by + f.r * cell + (cell - s) / 2;
    ctx.globalAlpha = 1 - k;
    roundRect(x, y, s, s * 0.18, '#f5c542');
    ctx.globalAlpha = 1;
  }
  if (popup && now - popup.t < 900) {
    const k = (now - popup.t) / 900;
    ctx.globalAlpha = 1 - k;
    ctx.fillStyle = '#f5c542';
    ctx.font = 'bold 30px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(popup.text, w / 2, by + boardPx / 2 - k * 40);
    ctx.globalAlpha = 1;
  }
  if (fx.length || (popup && now - popup.t < 900)) requestDraw();

  if (game.over) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e0a526';
    ctx.textAlign = 'center';
    ctx.font = 'bold 40px system-ui';
    ctx.fillText(String(game.score), w / 2, h / 2 - 20);
    ctx.font = 'bold 48px system-ui';
    ctx.fillText('↻', w / 2, h / 2 + 50);
  }
}

function pickTray(x, y) {
  if (y < layout.trayY - layout.cell * 0.3) return -1;
  const i = Math.floor(x / layout.slotW);
  return i >= 0 && i < 3 && game.tray[i] ? i : -1;
}

function updateSnap() {
  const p = game.tray[drag.index];
  const o = dragOrigin(p);
  const col = Math.round((o.x - layout.bx) / layout.cell);
  const row = Math.round((o.y - layout.by) / layout.cell);
  drag.row = row; drag.col = col;
  drag.valid = canPlace(game.board, p.cells, row, col);
}

canvas.addEventListener('pointerdown', (e) => {
  if (game.over) { game = createGame(); requestDraw(); return; }
  const i = pickTray(e.clientX, e.clientY);
  if (i < 0) return;
  canvas.setPointerCapture(e.pointerId);
  drag = { index: i, x: e.clientX, y: e.clientY };
  updateSnap();
  requestDraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  drag.x = e.clientX; drag.y = e.clientY;
  updateSnap();
  requestDraw();
});
function endDrag() {
  if (!drag) return;
  if (drag.valid) {
    const res = tryPlace(game, drag.index, drag.row, drag.col);
    if (res) {
      const t = performance.now();
      for (const c of res.cleared) fx.push({ ...c, t });
      if (res.lines > 1) popup = { text: 'COMBO ×' + res.lines, t };
      else if (res.lines === 1 && res.streak > 1) popup = { text: '🔥 ' + res.streak, t };
      if (res.perfect) popup = { text: '✦ PERFECT ✦', t };
      if (res.lines && navigator.vibrate) navigator.vibrate(res.lines > 1 ? [20, 30, 20] : 15);
      if (game.score > best) { best = game.score; try { localStorage.setItem('koshin.best', String(best)); } catch {} }
    }
  }
  drag = null;
  requestDraw();
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', () => { drag = null; requestDraw(); });

let pending = false;
function requestDraw() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => { pending = false; draw(); });
}

window.addEventListener('resize', () => { resize(); requestDraw(); });
resize();
requestDraw();
window.__koshin = () => ({ score: game.score, moves: game.moves, over: game.over });
