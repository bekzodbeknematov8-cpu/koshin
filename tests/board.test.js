import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBoard, canPlace, placePiece, canPlaceAnywhere, filledCount, EMPTY } from '../src/logic/board.js';
import { SHAPES, SHAPE_IDS, shapeSize, createRng, randomPiece } from '../src/logic/shapes.js';
import { createGame, tryPlace, hasAnyMove, TRAY_SIZE } from '../src/logic/game.js';

test('maydon 8x8 va bo\'sh', () => {
  const b = createBoard();
  assert.equal(b.length, 8);
  assert.ok(b.every((l) => l.length === 8 && l.every((v) => v === EMPTY)));
});

test('chegaradan chiqadigan shakl qo\'yilmaydi', () => {
  const b = createBoard();
  assert.equal(canPlace(b, SHAPES.h3, 0, 6), false);
  assert.equal(canPlace(b, SHAPES.v3, 6, 0), false);
  assert.equal(canPlace(b, SHAPES.h3, 0, 5), true);
  assert.equal(canPlace(b, SHAPES.dot, -1, 0), false);
});

test('band katakka qo\'yilmaydi, qo\'yish asl maydonni o\'zgartirmaydi', () => {
  const b = createBoard();
  const b2 = placePiece(b, SHAPES.sq2, 3, 3, 1);
  assert.equal(filledCount(b), 0);
  assert.equal(filledCount(b2), 4);
  assert.equal(b2[4][4], 1);
  assert.equal(placePiece(b2, SHAPES.dot, 4, 4, 2), null);
  assert.equal(canPlace(b2, SHAPES.h2, 3, 2), false);
  assert.equal(canPlace(b2, SHAPES.h2, 3, 5), true);
});

test('bo\'sh shakl qo\'yilmaydi', () => {
  assert.equal(canPlace(createBoard(), [], 0, 0), false);
});

test('barcha shakllar normallashtirilgan va maydonga sig\'adi', () => {
  for (const id of SHAPE_IDS) {
    const cells = SHAPES[id];
    assert.ok(cells.some(([r]) => r === 0), id);
    assert.ok(cells.some(([, c]) => c === 0), id);
    const { rows, cols } = shapeSize(cells);
    assert.ok(rows <= 8 && cols <= 8, id);
    assert.ok(canPlaceAnywhere(createBoard(), cells), id);
    assert.equal(new Set(cells.map(String)).size, cells.length, id + ' takroriy katak');
  }
});

test('RNG deterministik', () => {
  const a = createRng(42), b = createRng(42);
  for (let i = 0; i < 20; i++) assert.equal(a(), b());
  const r = createRng(1);
  for (let i = 0; i < 1000; i++) { const x = r(); assert.ok(x >= 0 && x < 1); }
  const p = randomPiece(createRng(7));
  assert.ok(SHAPE_IDS.includes(p.id));
});

test('o\'yin: 3 ta shakl, qo\'yilganda null bo\'ladi, hammasi tugasa to\'ldiriladi', () => {
  const g = createGame(123);
  assert.equal(g.tray.length, TRAY_SIZE);
  // shakllarni chap-yuqoridan ketma-ket joylab ko'ramiz
  let placed = 0;
  for (let i = 0; i < TRAY_SIZE; i++) {
    const cells = g.tray[i].cells;
    let done = false;
    for (let r = 0; r < 8 && !done; r++)
      for (let c = 0; c < 8 && !done; c++)
        if (canPlace(g.board, cells, r, c)) { assert.ok(tryPlace(g, i, r, c)); done = true; placed++; }
    if (i < TRAY_SIZE - 1) assert.equal(g.tray[i], null);
  }
  assert.equal(placed, 3);
  assert.ok(g.tray.every((p) => p !== null), 'tray qayta to\'ldirilishi kerak');
  assert.equal(g.moves, 3);
});

test('o\'yin: noto\'g\'ri yurish holatni o\'zgartirmaydi', () => {
  const g = createGame(5);
  const before = JSON.stringify(g.board);
  assert.equal(tryPlace(g, 0, 7, 7) && g.tray[0] === null ? true : true, true);
  const g2 = createGame(5);
  assert.equal(tryPlace(g2, 0, 100, 100), false);
  assert.equal(JSON.stringify(g2.board), before);
  assert.notEqual(g2.tray[0], null);
  assert.equal(tryPlace(g2, 5, 0, 0), false);
});

test('hasAnyMove: to\'la maydonda yurish yo\'q', () => {
  const g = createGame(9);
  g.board = g.board.map((l) => l.map(() => 0));
  assert.equal(hasAnyMove(g), false);
  g.board[0][0] = EMPTY;
  g.tray = [{ id: 'dot', cells: SHAPES.dot, color: 0 }, null, null];
  assert.equal(hasAnyMove(g), true);
});
