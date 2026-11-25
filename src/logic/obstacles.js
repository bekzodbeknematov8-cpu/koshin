// To'siqlar va maxsus kataklar — DOM'siz mantiq.
//  ice   (muz)    — koshin ustidagi muz, hp=2: 1-tozalashda yoriladi, 2-sida eriydi (katak bo'shaydi).
//  chain (zanjir) — zanjirlangan koshin: qator tozalanganda zanjir uziladi, koshin esa joyida qoladi.
//  stone (tosh)   — joyni band qiladi, lekin qatorni to'ldirmaydi; faqat YONIDAGI katak tozalansa sinadi.
//  gem   (olmos)  — koshindagi olmos: qatori tozalansa yig'iladi.
//  target (qurilish) — boss bosqichida binoning kataklari: ustiga koshin qo'yilsa "qurilgan" bo'ladi.
import { EMPTY, STONE } from './board.js';
import { findFullLines, lineCells } from './score.js';

export function createObsGrid(n = 8) {
  return Array.from({ length: n }, () => Array(n).fill(null));
}

export const EVENT_KEYS = ['ice', 'chain', 'stone', 'gems', 'build'];
const emptyEvents = () => ({ ice: 0, chain: 0, stone: 0, gems: 0, build: 0 });

// Qo'yilgan shakl kataklari: qurilish nishonlari va shakldagi olmoslar.
export function applyPlacement(state, cellsAbs, piece) {
  const ev = emptyEvents();
  if (state.target) {
    for (const [r, c] of cellsAbs) {
      if (state.target[r][c] === 1) { state.target[r][c] = 2; ev.build++; }
    }
  }
  if (piece && piece.gems && state.obs) {
    for (const k of piece.gems) {
      const [r, c] = cellsAbs[k];
      if (!state.obs[r][c]) state.obs[r][c] = { t: 'gem' };
    }
  }
  return ev;
}

// To'siqlarni hisobga olgan tozalash. placed — shakl qo'yilgan maydon.
// Natija: { board, cleared, lines, events, cracked, broken }
export function clearWithObstacles(state, placed) {
  const lines = findFullLines(placed);
  const cells = lineCells(placed, lines);
  const n = lines.rows.length + lines.cols.length;
  const ev = emptyEvents();
  if (cells.length === 0) return { board: placed, cleared: [], lines: 0, events: ev, cracked: [], broken: [] };
  const obs = state.obs;
  const next = placed.map((l) => l.slice());
  const cleared = [], cracked = [], broken = [];
  const touched = new Set();
  for (const [r, c] of cells) {
    touched.add(r * 8 + c);
    const o = obs && obs[r][c];
    if (o && o.t === 'ice') {
      o.hp -= 1;
      if (o.hp > 0) { cracked.push({ r, c }); continue; }
      obs[r][c] = null; ev.ice++;
    } else if (o && o.t === 'chain') {
      obs[r][c] = null; ev.chain++; broken.push({ r, c });
      continue; // koshin joyida qoladi
    } else if (o && o.t === 'gem') {
      obs[r][c] = null; ev.gems++;
    }
    cleared.push({ r, c, color: placed[r][c] });
    next[r][c] = EMPTY;
  }
  // toshlar: tozalangan katakka qo'shni bo'lsa sinadi
  if (obs) {
    for (let r = 0; r < next.length; r++)
      for (let c = 0; c < next.length; c++) {
        if (next[r][c] !== STONE) continue;
        const adj = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(([a, b]) => a >= 0 && b >= 0 && a < 8 && b < 8 && touched.has(a * 8 + b));
        if (adj) { next[r][c] = EMPTY; obs[r][c] = null; ev.stone++; broken.push({ r, c, stone: true }); }
      }
  }
  return { board: next, cleared, lines: n, events: ev, cracked, broken };
}

export function countObstacles(state, type) {
  let k = 0;
  if (!state.obs) return 0;
  for (const row of state.obs) for (const o of row) if (o && o.t === type) k++;
  return k;
}

// Boshlang'ich to'siqlarni joylashtirish (deterministik). spec: { ice, chain, stone, gem } soni.
// Qoidalar: hech bir qator/ustun boshidan to'la bo'lmasin (har birida kamida 2 bo'sh katak),
// target kataklariga to'siq qo'yilmaydi.
export function placeObstacles(state, spec, rng) {
  const n = state.board.length;
  state.obs = state.obs || createObsGrid(n);
  const free = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (state.board[r][c] === EMPTY && !(state.target && state.target[r][c])) free.push([r, c]);
  for (let i = free.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [free[i], free[j]] = [free[j], free[i]]; }
  const rowUsed = Array(n).fill(0), colUsed = Array(n).fill(0);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (state.board[r][c] !== EMPTY) { rowUsed[r]++; colUsed[c]++; }
  const order = [];
  for (const t of ['stone', 'ice', 'chain', 'gem']) for (let k = 0; k < (spec[t] || 0); k++) order.push(t);
  let fi = 0;
  const placed = { ice: 0, chain: 0, stone: 0, gem: 0 };
  const used = new Set();
  const iceRows = [];
  for (const t of order) {
    // muz qatorlarda guruhlanadi (bitta tozalash bir nechta muzni yoradi — adolatliroq)
    if (t === 'ice') {
      let done = false;
      for (const row of iceRows) {
        const cand = free.find(([r, c]) => r === row && !used.has(r * n + c) && rowUsed[r] < n - 3 && colUsed[c] < n - 2);
        if (cand && iceRows.filter((x) => x === row).length < 4) {
          const [r, c] = cand; used.add(r * n + c); rowUsed[r]++; colUsed[c]++;
          state.board[r][c] = Math.floor(rng() * 5); state.obs[r][c] = { t: 'ice', hp: 2 };
          iceRows.push(row); placed.ice++; done = true; break;
        }
      }
      if (done) continue;
    }
    while (fi < free.length) {
      const [r, c] = free[fi++];
      if (used.has(r * n + c)) continue;
      if (rowUsed[r] >= n - 2 || colUsed[c] >= n - 2) continue;
      used.add(r * n + c);
      if (t === 'ice') iceRows.push(r);
      rowUsed[r]++; colUsed[c]++;
      if (t === 'stone') { state.board[r][c] = STONE; state.obs[r][c] = { t: 'stone' }; }
      else {
        state.board[r][c] = Math.floor(rng() * 5);
        state.obs[r][c] = t === 'ice' ? { t: 'ice', hp: 2 } : { t };
      }
      placed[t]++;
      break;
    }
  }
  return placed;
}

// Qurilish nishoni (boss): target[r][c] = 1 (qurilmagan) / 2 (qurilgan) / 0.
export function setTarget(state, mask) {
  state.target = mask.map((row) => row.map((v) => (v ? 1 : 0)));
}

export function builtCount(state) {
  if (!state.target) return 0;
  let k = 0;
  for (const row of state.target) for (const v of row) if (v === 2) k++;
  return k;
}
