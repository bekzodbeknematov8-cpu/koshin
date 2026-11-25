import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBoard, canPlaceAnywhere, EMPTY } from '../src/logic/board.js';
import { SHAPES, SHAPE_IDS, SHAPE_TIER, createRng, rotateCells, normalize, shapeIdOf } from '../src/logic/shapes.js';
import { generateTray, canPlaceAll, tierWeights, pickShapeId, findMercyShape, bestClear } from '../src/logic/generator.js';
import { createGame, tryPlace, hasAnyMove } from '../src/logic/game.js';

test('har bir shaklning toifasi bor', () => {
  for (const id of SHAPE_IDS) assert.ok(SHAPE_TIER[id] !== undefined, id);
});

test('burish: 4 marta burilsa asl holiga qaytadi, natija ma\'lum shakl', () => {
  for (const id of SHAPE_IDS) {
    let c = SHAPES[id];
    for (let i = 0; i < 4; i++) {
      c = rotateCells(c);
      assert.ok(shapeIdOf(c), `${id} burilgani ro'yxatda yo'q`);
    }
    assert.deepEqual(c, normalize(SHAPES[id]));
  }
  assert.equal(shapeIdOf(rotateCells(SHAPES.h3)), 'v3');
});

test('qiyinlik oshsa katta shakllar ulushi oshadi', () => {
  const count = (d) => { const r = createRng(3); let big = 0; for (let i = 0; i < 3000; i++) if (SHAPE_TIER[pickShapeId(r, d)] === 2) big++; return big; };
  assert.ok(count(1) > count(0) * 2);
  const [e0] = tierWeights(0), [e1] = tierWeights(1);
  assert.ok(e0 > e1);
});

test('canPlaceAll: bo\'sh maydonda true, imkonsizda false', () => {
  const b = createBoard();
  const P = (id) => ({ cells: SHAPES[id] });
  assert.equal(canPlaceAll(b, [P('sq3'), P('sq3'), P('h5')]), true);
  // faqat 2 ta bo'sh katak (qator yopilmaydigan joylarda)
  const f = b.map((l) => l.map(() => 0));
  f[0][0] = EMPTY; f[2][2] = EMPTY; f[0][1] = EMPTY; f[1][0] = EMPTY; f[1][1] = 0;
  // 0-qator: 0,1 bo'sh. 
  assert.equal(canPlaceAll(f, [P('sq3')]), false);
  assert.equal(canPlaceAll(f, [P('dot'), P('dot')]), true);
});

test('adolat: har qanday tasodifiy maydonda kamida 1 shakl joylashadi', () => {
  const rng = createRng(77);
  for (let k = 0; k < 300; k++) {
    const b = createBoard();
    const dens = rng() * 0.9;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (rng() < dens) b[r][c] = 0;
    if (!b.some((l) => l.some((v) => v === EMPTY))) continue;
    for (const fairness of ['none', 'normal', 'strict']) {
      const t = generateTray(b, rng, { difficulty: rng(), fairness });
      assert.equal(t.length, 3);
      assert.ok(t.some((p) => canPlaceAnywhere(b, p.cells)), `fairness=${fairness} k=${k}`);
    }
  }
});

test('strict: dastlabki o\'yinda uchala shakl ham joylashadi', () => {
  const rng = createRng(11);
  for (let k = 0; k < 150; k++) {
    const b = createBoard();
    const dens = rng() * 0.6;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (rng() < dens) b[r][c] = 0;
    const t = generateTray(b, rng, { difficulty: 0.1, fairness: 'strict' });
    assert.notEqual(canPlaceAll(b, t, 50000), false, 'k=' + k);
  }
});

test('uchta bir xil shakl chiqmaydi', () => {
  const rng = createRng(5);
  for (let k = 0; k < 500; k++) {
    const t = generateTray(createBoard(), rng, { difficulty: 0, pool: ['dot', 'h2'] });
    assert.ok(!(t[0].id === t[1].id && t[1].id === t[2].id));
  }
});

test('rahm shakli qatorni yopadi', () => {
  const b = createBoard();
  for (let c = 0; c < 5; c++) b[4][c] = 0;
  const id = findMercyShape(b, createRng(1));
  assert.ok(id);
  assert.ok(bestClear(b, SHAPES[id]) >= 1);
});

test('generator deterministik (bir xil seed — bir xil shakllar)', () => {
  const a = createGame(2024), b = createGame(2024);
  assert.deepEqual(a.tray.map((p) => p.id), b.tray.map((p) => p.id));
});

test('simulyatsiya: avtomatik o\'yinchi bilan o\'yinlar xatosiz tugaydi', () => {
  for (let seed = 1; seed <= 15; seed++) {
    const g = createGame(seed, { fairness: seed % 2 ? 'strict' : 'normal' });
    let steps = 0;
    while (!g.over && steps < 400) {
      let moved = false;
      for (let i = 0; i < 3 && !moved; i++) {
        const p = g.tray[i];
        if (!p) continue;
        for (let r = 0; r < 8 && !moved; r++)
          for (let c = 0; c < 8 && !moved; c++) if (tryPlace(g, i, r, c)) moved = true;
      }
      assert.ok(moved || g.over || !hasAnyMove(g), 'yurish bor, lekin topilmadi');
      if (!moved) break;
      steps++;
    }
    assert.ok(g.score > 0);
    assert.ok(g.moves > 3);
  }
});
