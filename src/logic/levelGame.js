// Sarguzasht bosqichi o'yini: cheklangan yurishlar, maqsadlar, natija (g'alaba/mag'lubiyat), yulduzlar.
import { createGame, tryPlace, hasAnyMove, refillTray } from './game.js';
import { starsFor } from './levels.js';
import { createRng } from './shapes.js';
import { buildingMask, buildingCells } from './buildings.js';
import { placeObstacles, setTarget, createObsGrid, EVENT_KEYS } from './obstacles.js';

// Olmosli bosqichlarda ba'zi shakllarda olmos paydo bo'ladi.
function gemDecorator(chance) {
  return (state) => {
    const rng = state.gemRng || (state.gemRng = createRng((state.level ? state.level.seed : 1) ^ 0xa11ce));
    for (const p of state.tray) {
      if (!p) continue;
      if (rng() < chance) p.gems = [Math.floor(rng() * p.cells.length)];
    }
  };
}

export function createLevelGame(level) {
  const opts = { difficulty: level.shapeDifficulty ?? level.difficulty, fairness: level.fairness, pool: level.pool };
  if (level.gemChance) opts.decorateTray = gemDecorator(level.gemChance);
  const g = createGame(level.seed, opts);
  g.level = level;
  g.movesLeft = level.moves;
  const ob = level.obstacles || {};
  const hasObs = (ob.ice || 0) + (ob.chain || 0) + (ob.stone || 0) + (ob.gem || 0) > 0 || level.gemChance > 0;
  if (level.build) setTarget(g, buildingMask(level.build));
  if (hasObs || level.build) g.obs = createObsGrid(g.board.length);
  if (hasObs) placeObstacles(g, ob, createRng(level.seed ^ 0x5eed));
  g.goals = level.goals.map((x) => ({ ...x, done: 0, target: x.type === 'build' ? buildingCells(level.build).length : x.target }));
  // to'siq maqsadi joylashganidan ko'p bo'lmasin
  for (const x of g.goals) if (['ice', 'chain', 'stone'].includes(x.type)) x.target = Math.min(x.target, countType(g, x.type));
  // shakllar to'siqlar qo'yilgandan keyin qayta tanlanadi (adolat generatori hozirgi maydonni ko'rsin)
  if (hasObs || level.build) refillTray(g);
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
  if (res.events) for (const x of g.goals) if (EVENT_KEYS.includes(x.type)) x.done += res.events[x.type] || 0;
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

function countType(g, type) {
  let k = 0;
  if (g.obs) for (const row of g.obs) for (const o of row) if (o && o.t === type) k++;
  return k;
}

// Kuchaytirgich bosqichda: yurish sarflanmaydi, maqsadlar hodisalar bilan yangilanadi.
export function levelPowerup(g, apply) {
  if (g.status !== 'playing') return null;
  const res = apply(g);
  if (!res) return null;
  for (const x of g.goals) if (EVENT_KEYS.includes(x.type)) x.done += res.events[x.type] || 0;
  updateStatus(g);
  return { ...res, status: g.status, stars: g.stars, over: g.over };
}
