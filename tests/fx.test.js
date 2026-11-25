import { test } from 'node:test';
import assert from 'node:assert/strict';
import { easeOutBack, easeOutCubic, approach, clamp01, lerp } from '../src/fx/ease.js';
import { createParticles, burst, stepParticles, trimParticles } from '../src/fx/particles.js';
import { TILE_COLORS, UI } from '../src/render/palette.js';
import { COLOR_COUNT } from '../src/logic/generator.js';

test('easing chegaralari', () => {
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  assert.ok(Math.abs(easeOutBack(1) - 1) < 1e-9);
  assert.ok(Math.abs(easeOutBack(0)) < 1e-9);
  assert.ok(easeOutBack(0.7) > 1, 'back — biroz oshib ketadi');
  assert.equal(clamp01(-2), 0); assert.equal(clamp01(5), 1);
  assert.equal(lerp(10, 20, 0.5), 15);
});

test('approach: ochko silliq yetib boradi', () => {
  let v = 0;
  for (let i = 0; i < 200; i++) v = approach(v, 1000, 1 / 60);
  assert.equal(v, 1000);
  assert.equal(approach(5, 5, 0.1), 5);
});

test('zarrachalar: paydo bo\'ladi, tushadi va yo\'qoladi', () => {
  const ps = createParticles(3);
  burst(ps, 100, 100, 40, 12);
  assert.equal(ps.list.length, 12);
  const y0 = ps.list.reduce((s, p) => s + p.vy, 0);
  stepParticles(ps, 0.05);
  const y1 = ps.list.reduce((s, p) => s + p.vy, 0);
  assert.ok(y1 > y0, 'gravitatsiya pastga tortadi');
  for (let i = 0; i < 100; i++) stepParticles(ps, 0.05);
  assert.equal(ps.list.length, 0);
});

test('zarrachalar soni cheklanadi (kuchsiz telefonlar uchun)', () => {
  const ps = createParticles(1);
  for (let i = 0; i < 100; i++) burst(ps, 0, 0, 10, 10);
  trimParticles(ps, 300);
  assert.equal(ps.list.length, 300);
});

test('palitra: generator ranglari soni bilan mos, har rang o\'z naqshiga ega', () => {
  assert.equal(TILE_COLORS.length, COLOR_COUNT);
  assert.equal(new Set(TILE_COLORS.map((c) => c.pattern)).size, TILE_COLORS.length);
  for (const c of TILE_COLORS) for (const k of ['base', 'light', 'dark', 'motif']) assert.match(c[k], /^#[0-9a-f]{6}$/i);
  assert.ok(UI.gold);
});
