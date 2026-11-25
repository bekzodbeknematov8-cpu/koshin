import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createStore, serializeGame, deserializeGame, encode, decode, SAVE_VERSION } from '../src/logic/storage.js';
import { createGame, tryPlace } from '../src/logic/game.js';
import { bestMove } from '../src/logic/bot.js';
import { listAppFiles } from '../tools/build-sw.mjs';

function fakeBackend(limit = Infinity) {
  const m = new Map();
  return {
    m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { if (v.length > limit) throw new Error('QuotaExceeded'); m.set(k, String(v)); },
    removeItem: (k) => m.delete(k),
  };
}

test('saqlash: yozish/o\'qish, buzilgan JSON, backend yo\'q', () => {
  const b = fakeBackend();
  const s = createStore(b);
  s.set('wallet', { coins: 5 });
  assert.equal(b.m.get('koshin.wallet'), '{"coins":5}');
  assert.deepEqual(createStore(b).get('wallet'), { coins: 5 });
  b.m.set('koshin.stats', '{buzilgan');
  assert.deepEqual(createStore(b).get('stats', { ok: 1 }), { ok: 1 });
  const none = createStore(null);
  none.set('x', 1);
  assert.equal(none.get('x'), 1, 'xotirada ishlaydi');
});

test('saqlash: joy tugasa o\'yin to\'xtamaydi', () => {
  const s = createStore(fakeBackend(5));
  assert.equal(s.set('progress', { a: 'uzun matn' }), false);
  assert.ok(s.broken);
  assert.deepEqual(s.get('progress'), { a: 'uzun matn' });
});

test('saqlash: versiya ko\'chirish (eski "best" matn edi)', () => {
  const b = fakeBackend();
  b.m.set('koshin.best', '"1250"');
  const s = createStore(b);
  assert.ok(s.migrate());
  assert.equal(s.get('best'), 1250);
  assert.equal(s.get('version'), SAVE_VERSION);
  assert.equal(createStore(b).migrate(), false, 'ikkinchi marta kerak emas');
});

test('zaxira nusxa: eksport → import (o\'zbek/rus harflari bilan)', () => {
  const a = createStore(fakeBackend());
  a.set('progress', { unlocked: 12, stars: { 0: 3 } });
  a.set('settings', { lang: 'uz', note: "Qo'qon — Коканд" });
  const code = a.exportAll();
  const b = createStore(fakeBackend());
  assert.ok(b.importAll(code));
  assert.deepEqual(b.get('progress'), { unlocked: 12, stars: { 0: 3 } });
  assert.equal(b.get('settings').note, "Qo'qon — Коканд");
  assert.equal(b.importAll('!!!'), false);
  assert.equal(b.importAll(encode('{"v":99}')), false);
  assert.equal(decode(encode('Türkçe ✦')), 'Türkçe ✦');
});

test('Cheksiz o\'yin: saqlab, keyin aynan shu joydan davom ettiriladi', () => {
  const g = createGame(77);
  for (let i = 0; i < 7; i++) { const m = bestMove(g); tryPlace(g, m.index, m.row, m.col); }
  const data = JSON.parse(JSON.stringify(serializeGame(g)));
  const h = deserializeGame(data);
  assert.deepEqual(h.board, g.board);
  assert.equal(h.score, g.score);
  assert.deepEqual(h.tray.map((p) => p && p.id), g.tray.map((p) => p && p.id));
  // keyingi yurishlar ham bir xil (RNG holati tiklangan)
  for (let i = 0; i < 6; i++) {
    const m1 = bestMove(g), m2 = bestMove(h);
    assert.deepEqual(m1, m2);
    tryPlace(g, m1.index, m1.row, m1.col); tryPlace(h, m2.index, m2.row, m2.col);
  }
  assert.deepEqual(h.tray.map((p) => p && p.id), g.tray.map((p) => p && p.id));
  assert.equal(h.score, g.score);
});

test('Cheksiz o\'yin: buzilgan yoki tugagan saqlash rad etiladi', () => {
  assert.equal(deserializeGame(null), null);
  assert.equal(deserializeGame({ board: [[1]], tray: [] }), null);
  const g = createGame(3);
  const d = serializeGame(g);
  assert.equal(deserializeGame({ ...d, over: true }), null);
  assert.equal(deserializeGame({ ...d, board: d.board.map((r, i) => (i ? r : r.map(() => 99))) }), null);
  assert.equal(deserializeGame({ ...d, tray: [null, { cells: [] , color: 1 }, null] }), null);
});

test('PWA: sw.js barcha fayllarni keshlaydi (build-sw ishga tushirilgan)', async () => {
  const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  const files = await listAppFiles();
  for (const f of files) assert.ok(sw.includes(`'./${f}'`), `sw.js da yo'q: ${f} — "npm run build" ni ishga tushiring`);
  const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable'));
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('manifest.webmanifest'));
});
