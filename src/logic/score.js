// Qator/ustun tozalash va ochko hisoblash — DOM'siz mantiq.
import { EMPTY } from './board.js';

// To'lgan qatorlar va ustunlar indekslari.
export function findFullLines(board) {
  const n = board.length, m = board[0].length;
  const rows = [], cols = [];
  for (let r = 0; r < n; r++) if (board[r].every((v) => v >= 0)) rows.push(r);
  for (let c = 0; c < m; c++) {
    let full = true;
    for (let r = 0; r < n; r++) if (board[r][c] < 0) { full = false; break; }
    if (full) cols.push(c);
  }
  return { rows, cols };
}

// Tozalanadigan kataklar ro'yxati (kesishmalar bir marta).
export function lineCells(board, { rows, cols }) {
  const set = new Set();
  const out = [];
  const add = (r, c) => { const k = r * 64 + c; if (!set.has(k)) { set.add(k); out.push([r, c]); } };
  for (const r of rows) for (let c = 0; c < board[0].length; c++) add(r, c);
  for (const c of cols) for (let r = 0; r < board.length; r++) add(r, c);
  return out;
}

// Yangi maydon + tozalangan kataklar (rangi bilan, animatsiya uchun).
export function clearLines(board, lines = findFullLines(board)) {
  const cells = lineCells(board, lines);
  if (cells.length === 0) return { board, cleared: [], lines: 0 };
  const next = board.map((l) => l.slice());
  const cleared = cells.map(([r, c]) => ({ r, c, color: board[r][c] }));
  for (const [r, c] of cells) next[r][c] = EMPTY;
  return { board: next, cleared, lines: lines.rows.length + lines.cols.length };
}

export const LINE_POINTS = 80;   // bitta qator uchun asosiy ochko
export const STREAK_GRACE = 3;   // shuncha yurish tozalashsiz o'tsa streak uziladi

// COMBO: bir yurishda n qator → n * n * LINE_POINTS (1→80, 2→320, 3→720 ...).
export function comboPoints(lines) {
  return lines * lines * LINE_POINTS;
}

// STREAK ko'paytiruvchisi: 1-tozalash ×1, keyin har biri +0.5, ×5 gacha.
export function streakMultiplier(streak) {
  if (streak <= 1) return 1;
  return Math.min(5, 1 + 0.5 * (streak - 1));
}

// Maydon to'liq bo'shasa — bonus.
export const PERFECT_BONUS = 300;

export function isBoardEmpty(board) {
  return board.every((l) => l.every((v) => v < 0));
}

// Bitta yurish natijasi bo'yicha ochko va streak holatini hisoblaydi.
// sc = { score, streak, idle } — o'zgartiriladi. Natija obyekt qaytaradi.
export function applyMoveScore(sc, placedCells, lines, boardEmpty) {
  let gained = placedCells;
  let mult = 1, combo = 0, perfect = false;
  if (lines > 0) {
    sc.streak += 1;
    sc.idle = 0;
    mult = streakMultiplier(sc.streak);
    combo = comboPoints(lines);
    gained += Math.round(combo * mult);
    if (boardEmpty) { gained += PERFECT_BONUS; perfect = true; }
  } else {
    sc.idle += 1;
    if (sc.idle >= STREAK_GRACE) sc.streak = 0;
  }
  sc.score += gained;
  return { gained, lines, mult, combo, streak: sc.streak, perfect };
}
