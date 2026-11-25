import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nodeDistance, cityHeaderDistance, nodeX, screenY, scrollFor, clampScroll, nodeAt, visibleCount, totalDistance, NODE_GAP } from '../src/ui/mapLayout.js';
import { ADVENTURE_LEVELS, CITIES } from '../src/logic/levels.js';
import { BUILDING_IDS, buildingCells, buildingMask, decoratedCount } from '../src/logic/buildings.js';
import { pickLanguage, t, setLanguage, STRINGS, LANGS } from '../src/i18n.js';

test('xarita: tugunlar pastdan yuqoriga o\'sib boradi, shahar sarlavhasi bosqichlardan oldin', () => {
  for (let i = 1; i < ADVENTURE_LEVELS + 20; i++) assert.ok(nodeDistance(i) >= nodeDistance(i - 1) + NODE_GAP, 'i=' + i);
  for (let c = 0; c < CITIES.length; c++) {
    const hd = cityHeaderDistance(c);
    assert.ok(hd < nodeDistance(c * 20), 'sarlavha shaharning 1-bosqichidan pastda');
    if (c > 0) assert.ok(hd > nodeDistance(c * 20 - 1), 'oldingi shahar bossidan yuqorida');
  }
});

test('xarita: scroll chegaralari va teginish', () => {
  const w = 390, h = 844;
  assert.equal(clampScroll(-100, h, 0), 0);
  assert.ok(clampScroll(1e9, h, 0) <= totalDistance(0));
  for (const idx of [0, 7, 45, 139]) {
    const s = scrollFor(idx, h, 139);
    const y = screenY(nodeDistance(idx), s, h);
    assert.equal(nodeAt(nodeX(idx, w), y, w, h, s, 139), idx);
  }
  assert.equal(nodeAt(-500, -500, w, h, 0, 0), -1);
  assert.equal(visibleCount(0), ADVENTURE_LEVELS);
  assert.equal(visibleCount(200), 206);
  for (let i = 0; i < 50; i++) { const x = nodeX(i, w); assert.ok(x > 30 && x < w - 30); }
});

test('binolar: har shaharda o\'z binosi, kataklar 8x8 ichida', () => {
  for (const c of CITIES) assert.ok(BUILDING_IDS.includes(c.building), c.id);
  for (const id of BUILDING_IDS) {
    const cells = buildingCells(id);
    assert.ok(cells.length >= 20, id);
    for (const [r, c] of cells) assert.ok(r >= 0 && r < 8 && c >= 0 && c < 8);
    assert.equal(buildingMask(id).flat().filter(Boolean).length, cells.length);
    assert.equal(decoratedCount(id, 0), 0);
    assert.equal(decoratedCount(id, 20), cells.length);
    assert.ok(decoratedCount(id, 10) > 0 && decoratedCount(id, 10) < cells.length);
  }
});

test('til: telefon tiliga qarab tanlanadi, kalitlar to\'liq', () => {
  assert.equal(pickLanguage(['uz-Latn-UZ', 'en']), 'uz');
  assert.equal(pickLanguage(['de-DE', 'ru-RU']), 'ru');
  assert.equal(pickLanguage(['tr']), 'tr');
  assert.equal(pickLanguage(['fr-FR']), 'en');
  assert.equal(pickLanguage([]), 'en');
  for (const l of LANGS) for (const k of Object.keys(STRINGS.en)) assert.ok(STRINGS[l][k], `${l}: ${k} yo'q`);
  setLanguage('uz');
  assert.equal(t('city.kokand'), "Qo'qon");
  setLanguage('xx');
  assert.equal(t('city.kokand'), 'Kokand');
  assert.equal(t('yoq.kalit'), 'yoq.kalit');
});
