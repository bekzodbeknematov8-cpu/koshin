import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBoard, EMPTY, STONE, canPlace } from '../src/logic/board.js';
import { SHAPES, createRng } from '../src/logic/shapes.js';
import { findFullLines } from '../src/logic/score.js';
import { createObsGrid, clearWithObstacles, placeObstacles, setTarget, builtCount, applyPlacement, countObstacles } from '../src/logic/obstacles.js';
import { createGame, tryPlace } from '../src/logic/game.js';
import { generateLevel, ADVENTURE_LEVELS, CITIES, LEVELS_PER_CITY } from '../src/logic/levels.js';
import { createLevelGame, levelPlace } from '../src/logic/levelGame.js';
import { buildingCells } from '../src/logic/buildings.js';

const piece = (id) => ({ id, cells: SHAPES[id], color: 1 });
function stateWithRow(fillTo = 7) {
  const g = createGame(1);
  g.obs = createObsGrid();
  for (let c = 0; c < fillTo; c++) g.board[0][c] = 0;
  g.board[6][6] = 0; // maydon bo'sh qolmasin
  return g;
}

test('muz: 1-tozalashda yoriladi, 2-sida eriydi', () => {
  const g = stateWithRow();
  g.obs[0][2] = { t: 'ice', hp: 2 };
  g.tray = [piece('dot'), piece('dot'), piece('dot')];
  let res = tryPlace(g, 0, 0, 7);
  assert.equal(res.lines, 1);
  assert.equal(g.board[0][2], 0, 'muzli koshin qoldi');
  assert.equal(g.obs[0][2].hp, 1);
  assert.equal(res.events.ice, 0);
  assert.equal(res.cracked.length, 1);
  // yana qatorni to'ldiramiz
  for (let c = 0; c < 7; c++) if (c !== 2) g.board[0][c] = 0;
  res = tryPlace(g, 1, 0, 7);
  assert.equal(res.events.ice, 1);
  assert.equal(g.board[0][2], EMPTY);
  assert.equal(g.obs[0][2], null);
});

test('zanjir: tozalashda uziladi, koshin joyida qoladi', () => {
  const g = stateWithRow();
  g.obs[0][3] = { t: 'chain' };
  g.tray = [piece('dot'), piece('dot'), piece('dot')];
  const res = tryPlace(g, 0, 0, 7);
  assert.equal(res.events.chain, 1);
  assert.equal(g.board[0][3], 0);
  assert.equal(g.obs[0][3], null);
  assert.equal(g.board[0][0], EMPTY);
});

test('tosh: qatorni to\'ldirmaydi, joy band, yonidagi tozalansa sinadi', () => {
  const b = createBoard();
  for (let c = 0; c < 8; c++) b[2][c] = 0;
  b[2][4] = STONE;
  assert.deepEqual(findFullLines(b).rows, [], 'toshli qator to\'la hisoblanmaydi');
  assert.equal(canPlace(b, SHAPES.dot, 2, 4), false);
  const g = stateWithRow();
  g.board[1][5] = STONE; g.obs[1][5] = { t: 'stone' };   // 0-qatorga qo'shni
  g.board[3][5] = STONE; g.obs[3][5] = { t: 'stone' };   // qo'shni emas
  g.tray = [piece('dot'), piece('dot'), piece('dot')];
  const res = tryPlace(g, 0, 0, 7);
  assert.equal(res.events.stone, 1);
  assert.equal(g.board[1][5], EMPTY);
  assert.equal(g.board[3][5], STONE);
});

test('tosh: qator chetidagi qo\'shnilar noto\'g\'ri hisoblanmaydi', () => {
  const g = createGame(1);
  g.obs = createObsGrid();
  // 1-qator (7-ustun) tozalanadi, tosh 2-qator 0-ustunda — qo'shni EMAS
  for (let c = 0; c < 7; c++) g.board[1][c] = 0;
  g.board[2][0] = STONE; g.obs[2][0] = { t: 'stone' };
  g.board[5][5] = 0;
  g.tray = [piece('dot'), piece('dot'), piece('dot')];
  tryPlace(g, 0, 1, 7);
  assert.equal(g.board[2][0], EMPTY, '2-qator 0-ustun 1-qator 0-ustunga qo\'shni');
  const g2 = createGame(1);
  g2.obs = createObsGrid();
  for (let r = 0; r < 7; r++) g2.board[r][7] = 0; // 7-ustun to'ladi
  g2.board[3][0] = STONE; g2.obs[3][0] = { t: 'stone' }; // [2][7] bilan "indeks to'qnashuvi" bo'lmasin
  g2.board[5][3] = 0;
  g2.tray = [piece('dot'), piece('dot'), piece('dot')];
  tryPlace(g2, 0, 7, 7);
  assert.equal(g2.board[3][0], STONE);
});

test('olmos: qatori tozalansa yig\'iladi; shakldagi olmos maydonga tushadi', () => {
  const g = stateWithRow();
  g.obs[0][1] = { t: 'gem' };
  g.tray = [{ ...piece('h2'), gems: [1] }, piece('dot'), piece('dot')];
  const res = tryPlace(g, 0, 4, 0);
  assert.equal(g.obs[4][1].t, 'gem');
  assert.equal(res.events.gems, 0);
  const res2 = tryPlace(g, 1, 0, 7);
  assert.equal(res2.events.gems, 1);
});

test('qurilish: nishon kataklariga qo\'yilgan koshinlar sanaladi (bir marta)', () => {
  const g = createGame(1);
  g.obs = createObsGrid();
  const mask = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => r === 7 && c < 4));
  setTarget(g, mask);
  g.tray = [piece('h2'), piece('h2'), piece('dot')];
  let res = tryPlace(g, 0, 7, 0);
  assert.equal(res.events.build, 2);
  res = tryPlace(g, 1, 7, 1 + 1);
  assert.equal(res.events.build, 2);
  assert.equal(builtCount(g), 4);
  const ev = applyPlacement(g, [[7, 0]], null);
  assert.equal(ev.build, 0, 'qurilgan katak qayta sanalmaydi');
});

test('to\'siqlar joylashuvi: deterministik, qator/ustun to\'la emas, nishonga tushmaydi', () => {
  for (let s = 1; s < 60; s++) {
    const g = createGame(s);
    const mask = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => r > 5 && c < 3));
    setTarget(g, mask);
    const got = placeObstacles(g, { ice: 4, chain: 3, stone: 3, gem: 2 }, createRng(s));
    assert.equal(got.ice + got.chain + got.stone + got.gem, 12);
    assert.equal(countObstacles(g, 'stone'), 3);
    const full = findFullLines(g.board);
    assert.equal(full.rows.length + full.cols.length, 0);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (mask[r][c]) assert.equal(g.obs[r][c], null);
    for (let r = 0; r < 8; r++) assert.ok(g.board[r].filter((v) => v === EMPTY).length >= 2);
  }
});

test('shaharlar mexanikasi: Buxoroda muz, Samarqandda tosh, Shahrisabzda zanjir, Toshkentda olmos', () => {
  const has = (cityIdx, type) => {
    for (let n = 2; n < 19; n++) if (generateLevel(cityIdx * 20 + n).goals.some((g) => g.type === type)) return true;
    return false;
  };
  assert.ok(has(1, 'ice'));
  assert.ok(has(2, 'stone'));
  assert.ok(has(3, 'chain'));
  assert.ok(has(4, 'gems'));
  for (let i = 0; i < 20; i++) { const o = generateLevel(i).obstacles; assert.equal(o.ice + o.stone + o.chain + o.gem, 0, 'Xivada to\'siq yo\'q'); }
});

test('boss: binoni qurish maqsadi, nishon kataklari = bino kataklari', () => {
  for (let c = 0; c < CITIES.length; c++) {
    const lvl = generateLevel(c * LEVELS_PER_CITY + 19);
    assert.ok(lvl.boss);
    assert.equal(lvl.build, CITIES[c].building);
    const g = createLevelGame(lvl);
    assert.equal(g.goals[0].target, buildingCells(lvl.build).length);
    assert.ok(g.target);
  }
});

test('to\'siqli bosqichlar: maqsad soni joylashgan to\'siqlardan oshmaydi, boshida yurish bor', () => {
  for (let i = 20; i < ADVENTURE_LEVELS + 60; i += 2) {
    const g = createLevelGame(generateLevel(i));
    for (const x of g.goals) {
      if (['ice', 'chain', 'stone'].includes(x.type)) assert.ok(x.target <= countObstacles(g, x.type) && x.target > 0, `i=${i} ${x.type}`);
    }
    assert.equal(g.status, 'playing');
    assert.ok(g.tray.some(Boolean));
    const full = findFullLines(g.board);
    assert.equal(full.rows.length + full.cols.length, 0, 'i=' + i);
  }
});

test('bosqich maqsadi to\'siq hodisalari bilan yangilanadi', () => {
  const lvl = { ...generateLevel(25), goals: [{ type: 'chain', target: 1 }], obstacles: { ice: 0, chain: 0, stone: 0, gem: 0 }, moves: 10 };
  const g = createLevelGame(lvl);
  g.obs = createObsGrid();
  g.board = createBoard();
  for (let c = 0; c < 7; c++) g.board[0][c] = 0;
  g.obs[0][0] = { t: 'chain' };
  g.board[5][5] = 0;
  g.tray = [piece('dot'), piece('dot'), piece('dot')];
  const res = levelPlace(g, 0, 0, 7);
  assert.equal(g.goals[0].done, 1);
  assert.equal(res.status, 'won');
});
