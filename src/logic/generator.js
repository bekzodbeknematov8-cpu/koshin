// Shakl generatori va adolatlilik qoidasi — DOM'siz mantiq.
// difficulty: 0 (eng oson) … 1 (qiyin). fairness:
//   'strict' — 3 ta shaklning HAMMASINI qaysidir tartibda joylash mumkinligi kafolatlanadi (o'rgatish/dastlabki bosqichlar);
//   'normal' — kamida 1 ta shakl joylashadi, maydon to'lib qolsa "rahm" shakli (qator yopuvchi) qo'shiladi;
//   'none'   — faqat kamida 1 ta joylashadigan shakl kafolati (har doim bor — "o'yin meni aldadi" bo'lmasin).
import { SHAPES, SHAPE_IDS, SHAPE_TIER } from './shapes.js';
import { canPlace, canPlaceAnywhere, placePiece, filledCount, EMPTY } from './board.js';
import { clearLines } from './score.js';

export const COLOR_COUNT = 5;

// Toifa og'irliklari qiyinlikka qarab: oson → kichik shakllar ko'p.
export function tierWeights(difficulty) {
  const d = Math.max(0, Math.min(1, difficulty));
  return [3 - 1.6 * d, 1.2 + 0.8 * d, 0.25 + 1.35 * d];
}

export function pickShapeId(rng, difficulty, pool = SHAPE_IDS) {
  const tw = tierWeights(difficulty);
  let total = 0;
  for (const id of pool) total += tw[SHAPE_TIER[id] ?? 1];
  let x = rng() * total;
  for (const id of pool) {
    x -= tw[SHAPE_TIER[id] ?? 1];
    if (x < 0) return id;
  }
  return pool[pool.length - 1];
}

export function makePiece(id, rng, colorCount = COLOR_COUNT) {
  return { id, cells: SHAPES[id], color: Math.floor(rng() * colorCount) };
}

// Barcha joylashuvlar ro'yxati.
export function placements(board, cells) {
  const out = [];
  for (let r = 0; r < board.length; r++)
    for (let c = 0; c < board[0].length; c++)
      if (canPlace(board, cells, r, c)) out.push([r, c]);
  return out;
}

// Shakllarni ketma-ket (tozalash bilan) joylash mumkinmi? Qidiruv byudjet bilan cheklangan.
// Natija: true / false / null (byudjet tugadi — noma'lum).
export function canPlaceAll(board, pieces, budget = 4000) {
  const ctx = { budget };
  const res = dfs(board, pieces.filter(Boolean).map((p) => p.cells), ctx);
  if (res) return true;
  return ctx.budget <= 0 ? null : false;
}

function dfs(board, list, ctx) {
  if (list.length === 0) return true;
  for (let i = 0; i < list.length; i++) {
    const cells = list[i];
    const rest = list.slice(0, i).concat(list.slice(i + 1));
    for (let r = 0; r < board.length; r++)
      for (let c = 0; c < board[0].length; c++) {
        if (!canPlace(board, cells, r, c)) continue;
        if (--ctx.budget <= 0) return false;
        const next = clearLines(placePiece(board, cells, r, c, 0)).board;
        if (dfs(next, rest, ctx)) return true;
      }
  }
  return false;
}

// Shakl qo'yilganda nechta qator tozalanadi (eng yaxshi joy).
export function bestClear(board, cells) {
  let best = 0;
  for (const [r, c] of placements(board, cells)) {
    const n = clearLines(placePiece(board, cells, r, c, 0)).lines;
    if (n > best) best = n;
  }
  return best;
}

// Hozirgi maydonda qator yopadigan shakl topish (rahm shakli).
export function findMercyShape(board, rng, pool = SHAPE_IDS) {
  const ids = pool.slice();
  // tasodifiy tartib, keyin eng ko'p tozalaganini olamiz
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  let bestId = null, bestN = 0;
  for (const id of ids) {
    const n = bestClear(board, SHAPES[id]);
    if (n > bestN) { bestN = n; bestId = id; }
  }
  return bestId;
}

// Asosiy generator: 3 ta shakl qaytaradi.
export function generateTray(board, rng, opts = {}) {
  const { difficulty = 0.3, fairness = 'normal', pool = SHAPE_IDS, size = 3, colorCount = COLOR_COUNT } = opts;
  const fill = filledCount(board) / (board.length * board[0].length);
  const draw = () => {
    const ids = [];
    for (let i = 0; i < size; i++) {
      let id = pickShapeId(rng, difficulty, pool);
      // uchta bir xil shakl bo'lmasin
      if (i === 2 && ids[0] === id && ids[1] === id) id = pickShapeId(rng, difficulty, pool.filter((x) => x !== id));
      ids.push(id);
    }
    return ids.map((id) => makePiece(id, rng, colorCount));
  };

  let tray = null;
  const attempts = fairness === 'strict' ? 12 : 6;
  for (let a = 0; a < attempts; a++) {
    const t = draw();
    const fitting = t.filter((p) => canPlaceAnywhere(board, p.cells)).length;
    if (fitting === 0) continue;
    if (fairness === 'strict' && canPlaceAll(board, t) === false) continue;
    tray = t;
    break;
  }
  if (!tray) tray = draw();

  // Rahm: maydon juda to'lgan bo'lsa (yoki strict rejimda yechim topilmagan bo'lsa) — qator yopuvchi shakl.
  const needMercy = fill >= 0.55 && fairness !== 'none' && !tray.some((p) => bestClear(board, p.cells) > 0);
  if (needMercy) {
    const id = findMercyShape(board, rng, pool);
    if (id) tray[Math.floor(rng() * size)] = makePiece(id, rng, colorCount);
  }

  // Kafolat: kamida bitta shakl joylashsin.
  if (!tray.some((p) => canPlaceAnywhere(board, p.cells))) {
    const fits = pool.filter((id) => canPlaceAnywhere(board, SHAPES[id]));
    const ids = fits.length ? fits : SHAPE_IDS.filter((id) => canPlaceAnywhere(board, SHAPES[id]));
    if (ids.length) tray[Math.floor(rng() * size)] = makePiece(ids[Math.floor(rng() * ids.length)], rng, colorCount);
  }

  // Strict: oxirgi chora — hammasi joylashmasa, kichik shakllar bilan almashtiramiz.
  if (fairness === 'strict' && canPlaceAll(board, tray) === false) {
    for (let i = 0; i < size && canPlaceAll(board, tray) === false; i++) {
      for (const id of ['dot', 'h2', 'v2']) {
        const trial = tray.slice();
        trial[i] = makePiece(id, rng, colorCount);
        if (canPlaceAll(board, trial) !== false) { tray = trial; break; }
      }
    }
  }
  return tray;
}

// Bo'sh katak bormi (yordamchi).
export function hasEmpty(board) {
  return board.some((l) => l.some((v) => v === EMPTY));
}
