import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateLevel, levelDifficulty, CITIES, LEVELS_PER_CITY, ADVENTURE_LEVELS, starsFor, cityOf } from '../src/logic/levels.js';
import { createLevelGame, levelPlace, goalsMet, continueLevel } from '../src/logic/levelGame.js';
import { createProgress, recordResult, isUnlocked, totalStars, cityStars, cityCompleted, sanitizeProgress, eternalUnlocked } from '../src/logic/progress.js';
import { bestMove } from '../src/logic/bot.js';

test('7 shahar, har biri 20 bosqich, tartib to\'g\'ri', () => {
  assert.deepEqual(CITIES.map((c) => c.id), ['khiva', 'bukhara', 'samarkand', 'shahrisabz', 'tashkent', 'kokand', 'termez']);
  assert.equal(ADVENTURE_LEVELS, 140);
  assert.equal(cityOf(0).id, 'khiva');
  assert.equal(cityOf(19).id, 'khiva');
  assert.equal(cityOf(20).id, 'bukhara');
  assert.equal(cityOf(139).id, 'termez');
  assert.equal(cityOf(140), null);
});

test('bosqich generatori deterministik va to\'g\'ri tuzilgan', () => {
  for (let i = 0; i < ADVENTURE_LEVELS + 50; i++) {
    const a = generateLevel(i), b = generateLevel(i);
    assert.deepEqual(JSON.stringify(a), JSON.stringify(b));
    assert.ok(a.goals.length >= 1, 'maqsad bor ' + i);
    assert.ok(a.moves >= 8, 'yurishlar ' + i);
    for (const g of a.goals) assert.ok(g.target > 0);
    assert.equal(a.boss, i < ADVENTURE_LEVELS && (i % LEVELS_PER_CITY) === LEVELS_PER_CITY - 1);
  }
});

test('qiyinlik asta o\'sadi (shaharlar bo\'yicha o\'rtacha) va chegarada', () => {
  let prev = -1;
  for (let c = 0; c < CITIES.length; c++) {
    let s = 0;
    for (let i = 0; i < LEVELS_PER_CITY; i++) s += levelDifficulty(c * 20 + i);
    assert.ok(s / 20 > prev);
    prev = s / 20;
  }
  for (let i = 0; i < 5000; i += 7) { const d = levelDifficulty(i); assert.ok(d >= 0 && d <= 0.92); }
  assert.ok(levelDifficulty(4999) > levelDifficulty(ADVENTURE_LEVELS));
});

test('o\'rgatish bosqichlari oddiy', () => {
  const l = generateLevel(0);
  assert.equal(l.fairness, 'strict');
  assert.ok(l.pool && l.pool.length <= 10);
  assert.deepEqual(l.goals, [{ type: 'lines', target: 2 }]);
});

test('yulduzlar: qolgan yurishlarga qarab', () => {
  const l = { moves: 20 };
  assert.equal(starsFor(l, false, 10), 0);
  assert.equal(starsFor(l, true, 10), 3);
  assert.equal(starsFor(l, true, 3), 2);
  assert.equal(starsFor(l, true, 0), 1);
});

test('bosqich o\'yini: yurishlar kamayadi, maqsad bajarilsa g\'alaba', () => {
  const g = createLevelGame({ ...generateLevel(5), goals: [{ type: 'lines', target: 1 }], moves: 10 });
  for (let c = 0; c < 7; c++) g.board[0][c] = 0;
  g.tray[0] = { id: 'dot', cells: [[0, 0]], color: 1 };
  const res = levelPlace(g, 0, 0, 7);
  assert.equal(g.movesLeft, 9);
  assert.equal(res.status, 'won');
  assert.equal(res.stars, 3);
  assert.equal(levelPlace(g, 1, 4, 4), false, 'g\'alabadan keyin yurish yo\'q');
});

test('bosqich o\'yini: yurishlar tugasa mag\'lubiyat, davom ettirish bir marta', () => {
  const g = createLevelGame({ ...generateLevel(5), goals: [{ type: 'score', target: 99999 }], moves: 1 });
  const m = bestMove(g);
  const res = levelPlace(g, m.index, m.row, m.col);
  assert.equal(res.status, 'lost');
  assert.equal(g.lostReason, 'moves');
  assert.ok(continueLevel(g, 5));
  assert.equal(g.movesLeft, 5);
  assert.equal(g.status, 'playing');
  assert.ok(g.tray.some(Boolean));
  assert.equal(continueLevel(g, 5), false, 'faqat bir marta (hali o\'ynayapti)');
});

test('balans: bot sarguzasht bosqichlarining ko\'pchiligini yuta oladi', () => {
  let won = 0, total = 0;
  const failed = [];
  for (let i = 0; i < ADVENTURE_LEVELS; i += 3) {
    const g = createLevelGame(generateLevel(i));
    let guard = 0;
    while (g.status === 'playing' && guard++ < 300) {
      const m = bestMove(g);
      if (!m) break;
      levelPlace(g, m.index, m.row, m.col);
    }
    total++;
    if (g.status === 'won') won++; else failed.push(i);
  }
  const rate = won / total;
  assert.ok(rate >= 0.7, `bot faqat ${won}/${total} yutdi; yutolmaganlar: ${failed.join(',')}`);
  // o'rgatish bosqichlari albatta yutiladi
  for (let i = 0; i < 3; i++) assert.ok(!failed.includes(i));
});

test('progress: ochilish, yulduzlar, tozalash', () => {
  const p = createProgress();
  assert.ok(isUnlocked(p, 0));
  assert.ok(!isUnlocked(p, 1));
  recordResult(p, 0, 2);
  assert.ok(isUnlocked(p, 1));
  recordResult(p, 0, 1);
  assert.equal(p.stars[0], 2, 'yomonroq natija yulduzni kamaytirmaydi');
  recordResult(p, 1, 3);
  recordResult(p, 2, 0);
  assert.ok(!isUnlocked(p, 3));
  assert.equal(totalStars(p), 5);
  assert.equal(cityStars(p, 0), 5);
  assert.equal(cityCompleted(p, 0), 2);
  assert.ok(!eternalUnlocked(p));
  const s = sanitizeProgress({ unlocked: 3, stars: { 0: 3, 1: 7, x: 2, 2: 1 } });
  assert.deepEqual(s.stars, { 0: 3, 2: 1 });
  assert.equal(sanitizeProgress(null).unlocked, 0);
  assert.equal(sanitizeProgress({ unlocked: -5 }).unlocked, 0);
});
