import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY, STONE, filledCount, canPlaceAnywhere } from '../src/logic/board.js';
import { SHAPES, normalize } from '../src/logic/shapes.js';
import { createGame } from '../src/logic/game.js';
import { createObsGrid } from '../src/logic/obstacles.js';
import {
  createWallet, sanitizeWallet, buy, consume, canUse, addCoins, PRICES, POWERUPS,
  useBomb, useHammer, useRotate, useSwap, rotatePiece, levelReward, endlessReward, applyPowerup,
} from '../src/logic/powerups.js';
import { generateLevel } from '../src/logic/levels.js';
import { createLevelGame, levelPowerup } from '../src/logic/levelGame.js';

test('hamyon: sotib olish, ishlatish, avtomatik sotib olish', () => {
  const w = createWallet(0);
  w.inv = { bomb: 0, hammer: 1, rotate: 0, swap: 0 };
  assert.equal(buy(w, 'bomb'), false, 'tanga yetmaydi');
  assert.equal(canUse(w, 'bomb'), false);
  assert.ok(consume(w, 'hammer'));
  assert.equal(w.inv.hammer, 0);
  assert.equal(consume(w, 'hammer'), false);
  addCoins(w, PRICES.hammer);
  assert.ok(canUse(w, 'hammer'));
  assert.ok(consume(w, 'hammer'), 'tanga bilan avtomatik');
  assert.equal(w.coins, 0);
  assert.equal(w.inv.hammer, 0);
  addCoins(w, -50);
  assert.equal(w.coins, 0, 'manfiy bo\'lmaydi');
  assert.equal(buy(w, 'yoq'), false);
});

test('hamyon: buzilgan ma\'lumot tozalanadi', () => {
  const w = sanitizeWallet({ coins: -5, inv: { bomb: 3, hammer: 'x', rotate: -1 } });
  assert.equal(w.coins, 100);
  assert.equal(w.inv.bomb, 3);
  assert.equal(w.inv.hammer, 2);
  assert.equal(w.inv.rotate, 2);
  assert.deepEqual(Object.keys(sanitizeWallet(null).inv).sort(), [...POWERUPS].sort());
});

test('mukofotlar', () => {
  assert.equal(levelReward(0), 0);
  assert.equal(levelReward(3), 25);
  assert.equal(levelReward(1, true), 65);
  assert.equal(endlessReward(2450), 24);
});

test('bomba: 3x3 tozalaydi, chetda ham ishlaydi, to\'siqlarni sindiradi', () => {
  const g = createGame(1);
  g.obs = createObsGrid();
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) g.board[r][c] = 1;
  g.board[0][0] = EMPTY; g.board[7][7] = EMPTY; // ataylab
  g.board[3][3] = STONE; g.obs[3][3] = { t: 'stone' };
  g.obs[4][4] = { t: 'ice', hp: 2 };
  g.obs[2][4] = { t: 'gem' };
  const res = useBomb(g, 3, 4);
  assert.equal(res.events.stone, 1);
  assert.equal(res.events.ice, 1);
  assert.equal(res.events.gems, 1);
  for (let r = 2; r <= 4; r++) for (let c = 3; c <= 5; c++) assert.equal(g.board[r][c], EMPTY);
  assert.equal(res.cleared.length, 8);
  const g2 = createGame(1);
  g2.board[0][0] = 1; g2.board[1][1] = 1; g2.board[2][2] = 1;
  useBomb(g2, 0, 0);
  assert.equal(filledCount(g2.board), 1);
  assert.equal(useBomb(g2, 9, 9), null);
});

test('bolg\'a: bitta katak, bo\'sh katakka ishlamaydi', () => {
  const g = createGame(1);
  g.board[2][2] = 3; g.board[2][3] = 3;
  assert.equal(useHammer(g, 5, 5), null);
  const res = useHammer(g, 2, 2);
  assert.equal(res.cleared.length, 1);
  assert.equal(g.board[2][2], EMPTY);
  assert.equal(g.board[2][3], 3);
});

test('aylantirish: shakl 90° buriladi, olmos o\'z katagida qoladi', () => {
  const p = { id: 'l4a', cells: SHAPES.l4a, color: 2, gems: [3] }; // [2,1] katakda olmos
  const r = rotatePiece(p);
  assert.notEqual(r.id, 'l4a');
  assert.equal(r.cells.length, 4);
  // to'rt marta burilsa asliga qaytadi, olmos ham
  let q = p;
  for (let i = 0; i < 4; i++) q = rotatePiece(q);
  assert.deepEqual(normalize(q.cells), normalize(p.cells));
  assert.deepEqual(q.cells[q.gems[0]], p.cells[p.gems[0]]);
  const g = createGame(1);
  g.tray[0] = { id: 'h3', cells: SHAPES.h3, color: 0 };
  useRotate(g, 0);
  assert.equal(g.tray[0].id, 'v3');
  assert.equal(useRotate(g, 5), null);
});

test('almashtirish: boshqa va joylashadigan shakl beradi', () => {
  for (let s = 1; s < 30; s++) {
    const g = createGame(s);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) g.board[r][c] = (r + c) % 3 ? 1 : EMPTY;
    g.tray[1] = { id: 'sq3', cells: SHAPES.sq3, color: 0 };
    const res = useSwap(g, 1);
    assert.ok(res);
    assert.notEqual(g.tray[1].id, 'sq3');
    assert.ok(canPlaceAnywhere(g.board, g.tray[1].cells));
    assert.equal(g.over, false);
  }
});

test('kuchaytirgich o\'yin tugashini qutqaradi (over qayta hisoblanadi)', () => {
  const g = createGame(1);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) g.board[r][c] = (r + c) % 2 ? 1 : EMPTY;
  g.tray = [{ id: 'sq2', cells: SHAPES.sq2, color: 0 }, null, null];
  g.over = true;
  applyPowerup(g, 'bomb', { r: 4, c: 4 });
  assert.equal(g.over, false);
});

test('bosqichda kuchaytirgich: yurish sarflanmaydi, maqsad yangilanadi', () => {
  const lvl = { ...generateLevel(45), goals: [{ type: 'stone', target: 1 }] };
  const g = createLevelGame(lvl);
  const before = g.movesLeft;
  let sr = -1, sc = -1;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (g.board[r][c] === STONE) { sr = r; sc = c; }
  assert.ok(sr >= 0);
  const res = levelPowerup(g, (s) => useHammer(s, sr, sc));
  assert.equal(g.movesLeft, before);
  assert.equal(res.status, 'won');
});
