import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAdState, sanitizeAdState, canShowRewarded, noteRewarded, rewardedLeft, noteLevelEnd, shouldShowInterstitial, noteInterstitial, AD_RULES } from '../src/logic/ads.js';
import { createGame } from '../src/logic/game.js';
import { EMPTY, BOARD_SIZE } from '../src/logic/board.js';
import { reviveGame } from '../src/logic/revive.js';
import { WHEEL, createWheelState, sanitizeWheelState, canSpinFree, spin, pickSegment, grantPrize } from '../src/logic/wheel.js';
import { createWallet } from '../src/logic/powerups.js';
import { createRng } from '../src/logic/shapes.js';

const MIN = 60000;

test('reklama: yangi o\'yinchiga oraliq reklama yo\'q', () => {
  const s = createAdState(1);
  for (let i = 0; i < AD_RULES.interstitial.firstAfterLevels - 1; i++) { noteLevelEnd(s); assert.equal(shouldShowInterstitial(s, 10 * MIN * (i + 1), 1), false); }
  noteLevelEnd(s);
  assert.equal(shouldShowInterstitial(s, 100 * MIN, 1), true);
});

test('reklama: oraliq reklama chastotasi va vaqt oralig\'i', () => {
  const s = createAdState(1);
  for (let i = 0; i < 10; i++) noteLevelEnd(s);
  let now = 100 * MIN;
  assert.ok(shouldShowInterstitial(s, now, 1));
  noteInterstitial(s, now, 1);
  noteLevelEnd(s); noteLevelEnd(s); noteLevelEnd(s);
  assert.equal(shouldShowInterstitial(s, now + MIN, 1), false, '3 daqiqa o\'tmagan');
  assert.equal(shouldShowInterstitial(s, now + 4 * MIN, 1), true);
  noteInterstitial(s, now + 4 * MIN, 1);
  noteLevelEnd(s);
  assert.equal(shouldShowInterstitial(s, now + 20 * MIN, 1), false, 'har 3 bosqichda');
});

test('reklama: mukofotli reklamadan keyin tinchlik; noAds oraliqni o\'chiradi', () => {
  const s = createAdState(1);
  for (let i = 0; i < 10; i++) noteLevelEnd(s);
  noteRewarded(s, 'extra_moves', 50 * MIN, 1);
  assert.equal(shouldShowInterstitial(s, 51 * MIN, 1), false);
  assert.equal(shouldShowInterstitial(s, 53 * MIN, 1), true);
  s.noAds = true;
  assert.equal(shouldShowInterstitial(s, 90 * MIN, 1), false);
  assert.ok(canShowRewarded(s, 'free_coins', 1), 'mukofotli reklama qoladi');
});

test('reklama: kunlik chegaralar va yangi kun', () => {
  const s = createAdState(1);
  const cap = AD_RULES.rewarded.caps.free_coins;
  for (let i = 0; i < cap; i++) { assert.ok(canShowRewarded(s, 'free_coins', 1)); noteRewarded(s, 'free_coins', i, 1); }
  assert.equal(canShowRewarded(s, 'free_coins', 1), false);
  assert.equal(rewardedLeft(s, 'free_coins', 1), 0);
  assert.ok(canShowRewarded(s, 'extra_moves', 1), 'boshqa joy alohida');
  assert.equal(canShowRewarded(s, 'yoq', 1), false);
  assert.ok(canShowRewarded(s, 'free_coins', 2), 'ertasi kun yana');
  assert.equal(s.today.free_coins, undefined);
});

test('reklama: buzilgan holat tozalanadi', () => {
  const s = sanitizeAdState({ day: -3, today: { free_coins: 2, x: 9, revive: 'a' }, noAds: 'yes', levelEnds: 7.8 });
  assert.equal(s.day, 0); assert.equal(s.today.free_coins, 2); assert.equal(s.today.x, undefined);
  assert.equal(s.today.revive, undefined); assert.equal(s.noAds, false); assert.equal(s.levelEnds, 7);
  assert.deepEqual(sanitizeAdState(null), createAdState());
});

test('ikkinchi imkoniyat: tiqilgan o\'yin davom etadi, faqat bir marta', () => {
  const g = createGame(5);
  for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) g.board[r][c] = (r + c) % 2 ? 1 : (c === 7 - r ? EMPTY : 2);
  g.over = true;
  assert.equal(reviveGame(createGame(1)), null, 'o\'yin tugamagan bo\'lsa — yo\'q');
  const res = reviveGame(g);
  assert.ok(res && res.rows >= 2 && res.rows <= 4);
  assert.equal(g.over, false);
  assert.ok(res.cleared.length > 0);
  g.over = true;
  assert.equal(reviveGame(g), null, 'ikkinchi marta yo\'q');
});

test('charxpalak: kuniga bitta bepul, og\'irlik bo\'yicha tanlash', () => {
  const s = createWheelState(3);
  const rng = createRng(9);
  assert.ok(canSpinFree(s, 3));
  const r = spin(s, 3, rng);
  assert.ok(r && WHEEL[r.index] === r.prize);
  assert.equal(spin(s, 3, rng), null);
  assert.ok(spin(s, 3, rng, { free: false }), 'reklama bilan');
  assert.ok(canSpinFree(s, 4), 'ertasi kun');
  const counts = WHEEL.map(() => 0);
  const rr = createRng(77);
  for (let i = 0; i < 20000; i++) counts[pickSegment(rr)]++;
  const total = WHEEL.reduce((a, p) => a + p.w, 0);
  WHEEL.forEach((p, i) => assert.ok(Math.abs(counts[i] / 20000 - p.w / total) < 0.02, 'ehtimollik ' + i));
  assert.equal(pickSegment(() => 0.999999), WHEEL.length - 1);
  assert.deepEqual(sanitizeWheelState({ day: 'x', freeUsed: 1 }), createWheelState());
});

test('charxpalak: sovg\'a hamyonga tushadi', () => {
  const w = createWallet(0);
  grantPrize(w, { kind: 'coins', n: 50 });
  grantPrize(w, { kind: 'bomb', n: 1 });
  assert.equal(w.coins, 50);
  assert.equal(w.inv.bomb, 2);
});
