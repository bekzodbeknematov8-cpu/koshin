// Oddiy avtomatik o'yinchi — bosqichlar balansini tekshirish uchun (testlarda).
import { canPlace, placePiece, canPlaceAnywhere, EMPTY } from './board.js';
import { SHAPES } from './shapes.js';
import { clearLines } from './score.js';
import { clearWithObstacles, applyPlacement } from './obstacles.js';

function holes(board) {
  // yolg'iz bo'sh kataklar (atrofi band) — yomon holat
  let h = 0;
  const n = board.length;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      if (board[r][c] !== EMPTY) continue;
      let blocked = 0;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= n || cc >= n || board[rr][cc] !== EMPTY) blocked++;
      }
      if (blocked >= 3) h++;
    }
  return h;
}

// Notekislik: qo'shni kataklar holati farqi soni.
function rough(board) {
  let t = 0;
  const n = board.length;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const e = board[r][c] === EMPTY;
      if (c + 1 < n && e !== (board[r][c + 1] === EMPTY)) t++;
      if (r + 1 < n && e !== (board[r + 1][c] === EMPTY)) t++;
    }
  return t;
}

// Eng yaxshi yurish: { index, row, col } yoki null.
export function bestMove(state, canPlaceFn = canPlace) {
  let best = null, bestScore = -Infinity;
  state.tray.forEach((p, i) => {
    if (!p) return;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        if (!canPlaceFn(state.board, p.cells, r, c)) continue;
        const placed = placePiece(state.board, p.cells, r, c, 0);
        let board, lines, bonus = 0;
        if (state.obs || state.target) {
          const sim = { board: state.board, obs: state.obs && state.obs.map((l) => l.map((o) => o && { ...o })), target: state.target && state.target.map((l) => l.slice()) };
          const ev = applyPlacement(sim, p.cells.map(([dr, dc]) => [r + dr, c + dc]), p);
          const cl = sim.obs ? clearWithObstacles(sim, placed) : clearLines(placed);
          board = cl.board; lines = cl.lines;
          const e = cl.events || {};
          bonus = (ev.build || 0) * 30 + ((e.ice || 0) + (e.chain || 0) + (e.stone || 0) + (e.gems || 0)) * 60 + (cl.cracked ? cl.cracked.length * 30 : 0);
        } else ({ board, lines } = clearLines(placed));
        let filled = 0;
        for (const l of board) for (const v of l) if (v >= 0) filled++;
        const room = (canPlaceAnywhere(board, SHAPES.sq3) ? 25 : 0) + (canPlaceAnywhere(board, SHAPES.h5) ? 10 : 0) + (canPlaceAnywhere(board, SHAPES.v5) ? 10 : 0);
        const s = bonus + lines * 100 - holes(board) * 15 - filled * 1.2 - rough(board) * 1.5 + room + p.cells.length * 0.5;
        if (s > bestScore) { bestScore = s; best = { index: i, row: r, col: c }; }
      }
  });
  return best;
}
