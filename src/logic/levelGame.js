// Sarguzasht bosqichi o'yini: cheklangan yurishlar, maqsadlar, natija (g'alaba/mag'lubiyat), yulduzlar.
import { createGame, tryPlace, hasAnyMove, refillTray } from './game.js';
import { starsFor } from './levels.js';

export function createLevelGame(level) {
  const g = createGame(level.seed, { difficulty: level.difficulty, fairness: level.fairness, pool: level.pool });
  g.level = level;
  g.movesLeft = level.moves;
  g.goals = level.goals.map((x) => ({ ...x, done: 0 }));
  g.status = 'playing';
  g.stars = 0;
  if (level.setup) level.setup(g);
  return g;
}

export function goalValue(g, goal) {
  switch (goal.type) {
    case 'score': return g.score;
    case 'lines': return g.linesCleared;
    default: return goal.done || 0; // to'siq maqsadlari (6-bosqich) o'zlari hisoblaydi
  }
}

export function goalsMet(g) {
  return g.goals.every((x) => goalValue(g, x) >= x.target);
}

// Bosqichdagi yurish: tryPlace + yurishlar soni + holat.
export function levelPlace(g, trayIndex, row, col) {
  if (g.status !== 'playing') return false;
  const res = tryPlace(g, trayIndex, row, col);
  if (!res) return false;
  g.movesLeft--;
  if (g.onGoalProgress) g.onGoalProgress(g, res);
  updateStatus(g);
  return { ...res, over: g.over, status: g.status, stars: g.stars };
}

export function updateStatus(g) {
  if (goalsMet(g)) {
    g.status = 'won';
    g.stars = starsFor(g.level, true, g.movesLeft);
    g.over = true;
  } else if (g.movesLeft <= 0) {
    g.status = 'lost'; g.lostReason = 'moves'; g.over = true;
  } else if (!hasAnyMove(g)) {
    g.status = 'lost'; g.lostReason = 'stuck'; g.over = true;
  }
  return g.status;
}

// "Reklama ko'r — qo'shimcha yurish ol" (joy tayyor): mag'lubiyatdan keyin davom ettirish.
export function continueLevel(g, extraMoves = 5) {
  if (g.status !== 'lost' || g.continued) return false;
  g.continued = true;
  g.movesLeft += extraMoves;
  g.status = 'playing';
  g.over = false;
  if (!hasAnyMove(g)) {
    // tiqilib qolgan bo'lsa — shakllar yangilanadi (adolat generatori bilan)
    refillTray(g);
  }
  return true;
}
