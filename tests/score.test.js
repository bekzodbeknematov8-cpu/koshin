import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBoard, EMPTY, filledCount } from '../src/logic/board.js';
import { SHAPES } from '../src/logic/shapes.js';
import {
  findFullLines, clearLines, comboPoints, streakMultiplier, applyMoveScore,
  LINE_POINTS, STREAK_GRACE, PERFECT_BONUS,
} from '../src/logic/score.js';
import { createGame, tryPlace } from '../src/logic/game.js';

const piece = (id, color = 0) => ({ id, cells: SHAPES[id], color });

test('to\'lgan qator va ustun topiladi', () => {
  const b = createBoard();
  for (let c = 0; c < 8; c++) b[2][c] = 1;
  for (let r = 0; r < 8; r++) b[r][5] = 1;
  assert.deepEqual(findFullLines(b), { rows: [2], cols: [5] });
  assert.deepEqual(findFullLines(createBoard()), { rows: [], cols: [] });
});

test('qator+ustun kesishmasi bir marta tozalanadi', () => {
  const b = createBoard();
  for (let c = 0; c < 8; c++) b[2][c] = 1;
  for (let r = 0; r < 8; r++) b[r][5] = 2;
  b[7][7] = 3;
  const res = clearLines(b);
  assert.equal(res.lines, 2);
  assert.equal(res.cleared.length, 15);
  assert.equal(filledCount(res.board), 1);
  assert.equal(res.board[7][7], 3);
  assert.equal(filledCount(b), 16, 'asl maydon o\'zgarmaydi');
});

test('tozalash yo\'q bo\'lsa o\'sha maydon qaytadi', () => {
  const b = createBoard();
  b[0][0] = 1;
  const res = clearLines(b);
  assert.equal(res.lines, 0);
  assert.equal(res.board, b);
});

test('combo va streak formulalari', () => {
  assert.equal(comboPoints(1), LINE_POINTS);
  assert.equal(comboPoints(2), 4 * LINE_POINTS);
  assert.equal(comboPoints(3), 9 * LINE_POINTS);
  assert.equal(streakMultiplier(0), 1);
  assert.equal(streakMultiplier(1), 1);
  assert.equal(streakMultiplier(2), 1.5);
  assert.equal(streakMultiplier(3), 2);
  assert.equal(streakMultiplier(100), 5);
});

test('streak tozalashsiz STREAK_GRACE yurishdan keyin uziladi', () => {
  const sc = { score: 0, streak: 0, idle: 0 };
  applyMoveScore(sc, 3, 1, false);
  applyMoveScore(sc, 3, 1, false);
  assert.equal(sc.streak, 2);
  for (let i = 0; i < STREAK_GRACE - 1; i++) applyMoveScore(sc, 1, 0, false);
  assert.equal(sc.streak, 2, 'hali uzilmagan');
  const r = applyMoveScore(sc, 1, 1, false);
  assert.equal(r.streak, 3);
  assert.equal(r.mult, 2);
  for (let i = 0; i < STREAK_GRACE; i++) applyMoveScore(sc, 1, 0, false);
  assert.equal(sc.streak, 0);
});

test('ochko: kataklar + combo×streak + perfect bonus', () => {
  const sc = { score: 0, streak: 0, idle: 0 };
  const r1 = applyMoveScore(sc, 4, 0, false);
  assert.equal(r1.gained, 4);
  const r2 = applyMoveScore(sc, 4, 2, false);
  assert.equal(r2.gained, 4 + 320);
  const r3 = applyMoveScore(sc, 1, 1, true);
  assert.equal(r3.gained, 1 + Math.round(80 * 1.5) + PERFECT_BONUS);
  assert.ok(r3.perfect);
  assert.equal(sc.score, r1.gained + r2.gained + r3.gained);
});

test('o\'yin: shakl qo\'yilganda qator tozalanadi va ochko qo\'shiladi', () => {
  const g = createGame(1);
  for (let c = 0; c < 7; c++) g.board[0][c] = 0;
  g.board[5][5] = 0; // maydon bo'sh qolmasin
  g.tray = [piece('dot'), piece('sq3'), piece('h2')];
  const res = tryPlace(g, 0, 0, 7);
  assert.ok(res);
  assert.equal(res.lines, 1);
  assert.equal(res.cleared.length, 8);
  assert.equal(g.board[0][7], EMPTY);
  assert.equal(g.score, 1 + 80);
  assert.equal(g.streak, 1);
  assert.equal(g.linesCleared, 1);
  assert.equal(res.perfect, false);
});

test('o\'yin: perfect clear bonus', () => {
  const g = createGame(1);
  for (let c = 0; c < 7; c++) g.board[3][c] = 0;
  g.tray = [piece('dot'), piece('sq3'), piece('h2')];
  const res = tryPlace(g, 0, 3, 7);
  assert.ok(res.perfect);
  assert.equal(g.score, 1 + 80 + PERFECT_BONUS);
});

test('o\'yin: 2 qator birdan — combo', () => {
  const g = createGame(1);
  for (let c = 0; c < 6; c++) { g.board[0][c] = 0; g.board[1][c] = 0; }
  g.board[4][4] = 0;
  g.tray = [piece('sq2'), piece('dot'), piece('dot')];
  const res = tryPlace(g, 0, 0, 6);
  assert.equal(res.lines, 2);
  assert.equal(g.score, 4 + 320);
  assert.equal(g.bestCombo, 2);
});

test('o\'yin tugashi: qolgan shakllar sig\'masa over=true, keyin yurish yo\'q', () => {
  const g = createGame(1);
  // shaxmat taxtasi ko'rinishida to'ldiramiz: faqat yakka kataklar bo'sh
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) g.board[r][c] = (r + c) % 2 ? 0 : EMPTY;
  g.tray = [piece('dot'), piece('h2'), null];
  const res = tryPlace(g, 0, 0, 0);
  assert.ok(res);
  assert.equal(res.over, true);
  assert.equal(g.over, true);
  assert.equal(tryPlace(g, 1, 0, 2), false);
});

test('o\'yin tugamaydi, agar kamida bitta shakl sig\'sa', () => {
  const g = createGame(1);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) g.board[r][c] = (r + c) % 2 ? 0 : EMPTY;
  g.tray = [piece('dot'), piece('dot'), piece('h2')];
  const res = tryPlace(g, 0, 0, 0);
  assert.equal(res.over, false);
});
