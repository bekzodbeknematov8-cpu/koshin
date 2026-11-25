import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findFullLines } from '../src/logic/score.js';
import { EMPTY } from '../src/logic/board.js';
import {
  dayNumber, dailySeed, dailyPattern, dailySequence, createDailyGame, dailyPlace, shareText, DAILY_TRAYS,
  createDailyState, rollDay, canStart, startAttempt, grantAdAttempt, attemptsLeft, finishAttempt, sanitizeDailyState,
} from '../src/logic/daily.js';
import { bestMove } from '../src/logic/bot.js';
import { submitScore, topScores } from '../src/net/leaderboard.js';

test('kun raqami: 2026-01-01 = #1, mahalliy sana bo\'yicha', () => {
  assert.equal(dayNumber(new Date(2026, 0, 1, 0, 5)), 1);
  assert.equal(dayNumber(new Date(2026, 0, 1, 23, 55)), 1);
  assert.equal(dayNumber(new Date(2026, 4, 8, 12)), 128);
  assert.equal(dayNumber(new Date(2027, 0, 1)), 366);
});

test('hamma uchun bir xil: seed, naqsh, shakllar ketma-ketligi', () => {
  assert.equal(dailySeed(128), dailySeed(128));
  assert.notEqual(dailySeed(128), dailySeed(129));
  assert.deepEqual(dailyPattern(128), dailyPattern(128));
  assert.deepEqual(dailySequence(128).map((p) => p.id), dailySequence(128).map((p) => p.id));
  assert.notDeepEqual(dailySequence(128).map((p) => p.id), dailySequence(129).map((p) => p.id));
  assert.equal(dailySequence(5).length, DAILY_TRAYS * 3);
});

test('naqsh: simmetrik, to\'la qator yo\'q, juda to\'la emas', () => {
  for (let d = 1; d < 400; d++) {
    const b = dailyPattern(d);
    const f = findFullLines(b);
    assert.equal(f.rows.length + f.cols.length, 0, 'd=' + d);
    let n = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      if (b[r][c] !== EMPTY) n++;
      assert.equal(b[r][c] === EMPTY, b[7 - r][7 - c] === EMPTY);
    }
    assert.ok(n >= 8 && n <= 28, `d=${d} n=${n}`);
  }
});

test('kunlik o\'yin: ikki o\'yinchi bir xil yurishlar bilan bir xil natija oladi, ketma-ketlik tugasa tugaydi', () => {
  const play = () => {
    const g = createDailyGame(200);
    let guard = 0;
    while (!g.over && guard++ < 100) {
      const m = bestMove(g);
      if (!m) break;
      dailyPlace(g, m.index, m.row, m.col);
    }
    return g;
  };
  const a = play(), b = play();
  assert.equal(a.score, b.score);
  assert.deepEqual(a.trayLines, b.trayLines);
  assert.ok(a.over);
  assert.ok(a.moves <= DAILY_TRAYS * 3);
  assert.ok(a.trayLines.length <= DAILY_TRAYS);
});

test('ulashish matni', () => {
  assert.equal(shareText(128, 2450, [1, 2, 1, 0]), 'Koshin #128 🟦🟨🟦⬜ 2450');
});

test('urinishlar: kuniga 1 + reklama bilan 1', () => {
  const s = createDailyState();
  rollDay(s, 10);
  assert.ok(canStart(s));
  assert.ok(startAttempt(s));
  assert.equal(canStart(s), false);
  assert.equal(startAttempt(s), false);
  assert.ok(grantAdAttempt(s));
  assert.equal(grantAdAttempt(s), false, 'reklama faqat bir marta');
  assert.equal(attemptsLeft(s), 1);
  assert.ok(startAttempt(s));
  assert.equal(attemptsLeft(s), 0);
  rollDay(s, 11);
  assert.equal(attemptsLeft(s), 1, 'yangi kun');
});

test('seriya va 7-kun mukofoti; kun o\'tkazib yuborilsa uziladi', () => {
  const s = createDailyState();
  let rewards = 0;
  for (let d = 1; d <= 7; d++) {
    rollDay(s, d); startAttempt(s);
    const r = finishAttempt(s, d, 100 * d);
    if (r) { rewards++; assert.equal(d, 7); assert.equal(r.coins, 200); }
  }
  assert.equal(s.streak, 7);
  assert.equal(rewards, 1);
  // shu kuni ikkinchi urinish seriyani oshirmaydi
  grantAdAttempt(s); startAttempt(s);
  assert.equal(finishAttempt(s, 7, 50), null);
  assert.equal(s.streak, 7);
  assert.equal(s.best, 700);
  rollDay(s, 9);
  assert.equal(s.streak, 0, '8-kun o\'tkazib yuborildi');
  startAttempt(s); finishAttempt(s, 9, 10);
  assert.equal(s.streak, 1);
  // 14-kunda yana mukofot
  let r14 = null;
  for (let d = 10; d <= 21; d++) { rollDay(s, d); startAttempt(s); const r = finishAttempt(s, d, 1); if (r) r14 = d; }
  assert.equal(r14, 15, '9..15 — 7 kun');
});

test('kunlik holat: buzilgan ma\'lumot tozalanadi, tarix cheklanadi', () => {
  const s = sanitizeDailyState({ day: 5, attempts: -1, streak: 'x', adUsed: 1, history: { 3: 100, x: 5 } });
  assert.equal(s.day, 5);
  assert.equal(s.attempts, 0);
  assert.equal(s.streak, 0);
  assert.equal(s.adUsed, false);
  const t = createDailyState();
  for (let d = 1; d <= 100; d++) finishAttempt(t, d, d);
  assert.equal(Object.keys(t.history).length, 60);
});

test('reyting API joyi: server yo\'q bo\'lsa xatosiz', async () => {
  assert.deepEqual(await submitScore('endless', { score: 5 }), { ok: false, offline: true });
  assert.deepEqual(await topScores('endless'), []);
});
