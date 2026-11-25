// Kuchaytirgichlar va tanga tizimi — DOM'siz mantiq.
//  bomb   — 3x3 maydonni tozalaydi
//  hammer — 1 katakni sindiradi (tosh ham)
//  rotate — tanlangan shaklni 90° buradi
//  swap   — tanlangan shaklni boshqasiga almashtiradi (joylashadigan)
import { EMPTY, STONE, canPlaceAnywhere } from './board.js';
import { rotateCells, shapeIdOf, SHAPES, SHAPE_IDS, shapeSize } from './shapes.js';
import { pickShapeId, makePiece } from './generator.js';
import { hasAnyMove } from './game.js';

export const POWERUPS = ['bomb', 'hammer', 'rotate', 'swap'];
export const PRICES = { bomb: 120, hammer: 60, rotate: 40, swap: 50 };
export const BOARD_TARGET = { bomb: true, hammer: true, rotate: false, swap: false };

export function createWallet(coins = 100) {
  return { coins, inv: { bomb: 1, hammer: 2, rotate: 2, swap: 2 } };
}

export function sanitizeWallet(raw) {
  const w = createWallet();
  if (!raw || typeof raw !== 'object') return w;
  if (Number.isFinite(raw.coins) && raw.coins >= 0) w.coins = Math.floor(raw.coins);
  if (raw.inv && typeof raw.inv === 'object')
    for (const id of POWERUPS) if (Number.isInteger(raw.inv[id]) && raw.inv[id] >= 0) w.inv[id] = raw.inv[id];
  return w;
}

export function addCoins(w, n) {
  w.coins = Math.max(0, w.coins + Math.floor(n));
  return w.coins;
}

export function buy(w, id, qty = 1) {
  const cost = PRICES[id] * qty;
  if (!PRICES[id] || w.coins < cost) return false;
  w.coins -= cost;
  w.inv[id] = (w.inv[id] || 0) + qty;
  return true;
}

// Ishlatish mumkinmi: zaxirada bor yoki sotib olishga tanga yetadi.
export function canUse(w, id) {
  return (w.inv[id] || 0) > 0 || w.coins >= PRICES[id];
}

// Zaxiradan bittasini oladi (yo'q bo'lsa avtomatik sotib oladi). true/false.
export function consume(w, id) {
  if ((w.inv[id] || 0) <= 0 && !buy(w, id)) return false;
  w.inv[id] -= 1;
  return true;
}

// Tanga mukofotlari
export function levelReward(stars, boss = false) {
  return stars > 0 ? 10 + stars * 5 + (boss ? 50 : 0) : 0;
}
export function endlessReward(score) {
  return Math.floor(score / 100);
}

const emptyEvents = () => ({ ice: 0, chain: 0, stone: 0, gems: 0, build: 0 });

// Bitta katakni sindirish (bomba/bolg'a uchun). Natijalarni ro'yxatlarga yozadi.
function smashCell(state, r, c, out) {
  const v = state.board[r][c];
  const o = state.obs && state.obs[r][c];
  if (v === EMPTY) return;
  if (v === STONE) {
    state.board[r][c] = EMPTY;
    if (state.obs) state.obs[r][c] = null;
    out.events.stone++;
    out.broken.push({ r, c, stone: true });
    return;
  }
  if (o) {
    if (o.t === 'ice') out.events.ice++;
    else if (o.t === 'chain') { out.events.chain++; out.broken.push({ r, c }); }
    else if (o.t === 'gem') out.events.gems++;
    state.obs[r][c] = null;
  }
  out.cleared.push({ r, c, color: v });
  state.board[r][c] = EMPTY;
}

function finish(state, out) {
  state.over = !hasAnyMove(state);
  return out;
}

export function useBomb(state, r, c) {
  const out = { cleared: [], broken: [], events: emptyEvents() };
  const n = state.board.length;
  if (r < 0 || c < 0 || r >= n || c >= n) return null;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && cc >= 0 && rr < n && cc < n) smashCell(state, rr, cc, out);
    }
  return finish(state, out);
}

export function useHammer(state, r, c) {
  const n = state.board.length;
  if (r < 0 || c < 0 || r >= n || c >= n) return null;
  if (state.board[r][c] === EMPTY) return null; // bo'sh katakka bolg'a behuda
  const out = { cleared: [], broken: [], events: emptyEvents() };
  smashCell(state, r, c, out);
  return finish(state, out);
}

export function rotatePiece(piece) {
  const rot = rotateCells(piece.cells);
  const id = shapeIdOf(rot) || piece.id;
  const next = { ...piece, id, cells: SHAPES[id] || rot };
  if (piece.gems && piece.gems.length) {
    // olmosning yangi o'rnini topamiz
    const { rows } = shapeSize(piece.cells);
    next.gems = piece.gems.map((k) => {
      const [r, c] = piece.cells[k];
      const nr = c, nc = rows - 1 - r;
      // normallashtirish siljishi
      let mr = Infinity, mc = Infinity;
      for (const [a, b] of piece.cells) { const x = b, y = rows - 1 - a; if (x < mr) mr = x; if (y < mc) mc = y; }
      const idx = next.cells.findIndex(([a, b]) => a === nr - mr && b === nc - mc);
      return idx < 0 ? 0 : idx;
    });
  }
  return next;
}

export function useRotate(state, trayIndex) {
  const p = state.tray[trayIndex];
  if (!p) return null;
  state.tray[trayIndex] = rotatePiece(p);
  return finish(state, { cleared: [], broken: [], events: emptyEvents() });
}

export function useSwap(state, trayIndex) {
  const p = state.tray[trayIndex];
  if (!p) return null;
  const rng = state.rng;
  // joylashadigan, boshqa shakl tanlaymiz (avval kichikroqlarga moyil)
  for (let a = 0; a < 30; a++) {
    const id = pickShapeId(rng, a < 15 ? 0.2 : 0);
    if (id === p.id) continue;
    if (canPlaceAnywhere(state.board, SHAPES[id])) { state.tray[trayIndex] = makePiece(id, rng); return finish(state, { cleared: [], broken: [], events: emptyEvents() }); }
  }
  const fits = SHAPE_IDS.filter((id) => id !== p.id && canPlaceAnywhere(state.board, SHAPES[id]));
  if (!fits.length) return null;
  state.tray[trayIndex] = makePiece(fits[Math.floor(rng() * fits.length)], rng);
  return finish(state, { cleared: [], broken: [], events: emptyEvents() });
}

export function applyPowerup(state, id, target) {
  switch (id) {
    case 'bomb': return useBomb(state, target.r, target.c);
    case 'hammer': return useHammer(state, target.r, target.c);
    case 'rotate': return useRotate(state, target.index);
    case 'swap': return useSwap(state, target.index);
    default: return null;
  }
}
