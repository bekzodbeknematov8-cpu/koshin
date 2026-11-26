// Cheksiz rejim: "ikkinchi imkoniyat" (reklama evaziga) — eng to'la qatorlarni tozalab,
// o'yinni davom ettirish. DOM'siz mantiq.
import { EMPTY, STONE } from './board.js';
import { hasAnyMove, refillTray } from './game.js';

// Eng ko'p to'lgan qatorlardan boshlab tozalaydi, toki biror shakl joylashguncha (kamida 2, ko'pi bilan 4 qator).
export function reviveGame(g, { minRows = 2, maxRows = 4 } = {}) {
  if (!g.over || g.revived) return null;
  const order = g.board.map((row, r) => ({ r, n: row.filter((v) => v !== EMPTY).length }))
    .sort((a, b) => b.n - a.n || Math.abs(a.r - 3.5) - Math.abs(b.r - 3.5));
  const cleared = [];
  let rows = 0;
  for (const { r } of order) {
    if (rows >= maxRows) break;
    if (rows >= minRows && hasAnyMove(g)) break;
    for (let c = 0; c < g.board[r].length; c++) {
      const v = g.board[r][c];
      if (v !== EMPTY) { cleared.push({ r, c, color: v === STONE ? 0 : v }); g.board[r][c] = EMPTY; }
    }
    rows++;
  }
  if (!hasAnyMove(g)) refillTray(g);
  g.revived = true;
  g.over = !hasAnyMove(g);
  return { cleared, rows };
}
