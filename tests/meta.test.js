import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createStats, sanitizeStats, eventsFromMove, applyStatEvents, ACHIEVEMENTS, checkAchievements, achievementProgress,
  generateQuests, createQuestState, rollQuests, trackQuests, claimQuest, claimableCount, QUEST_TEMPLATES,
  createLogin, checkLogin, LOGIN_REWARDS, STAT_KEYS,
} from '../src/logic/meta.js';
import { pluck, drum, scaleNote, midiToFreq, generateMelody, SFX, SCALE, normalize } from '../src/audio/synth.js';
import { STRINGS, LANGS, tf } from '../src/i18n.js';

test('statistika: yurish hodisalari', () => {
  const s = createStats();
  applyStatEvents(s, eventsFromMove({ lines: 3, perfect: true, events: { gems: 2, ice: 1, stone: 0, chain: 1 } }));
  applyStatEvents(s, eventsFromMove({ lines: 1 }));
  applyStatEvents(s, eventsFromMove({ powerup: 'bomb', lines: 0, events: { stone: 2 } }));
  assert.equal(s.lines, 4);
  assert.equal(s.pieces, 2);
  assert.equal(s.powerups, 1);
  assert.equal(s.combos, 1);
  assert.equal(s.bestCombo, 3);
  assert.equal(s.perfects, 1);
  assert.equal(s.gems, 2);
  assert.equal(s.stones, 2);
  assert.equal(s.chains, 1);
  assert.deepEqual(eventsFromMove(null), []);
  assert.equal(sanitizeStats({ lines: -3, gems: 4.7 }).gems, 4);
});

test('yutuqlar: bir marta ochiladi, progress', () => {
  const s = createStats();
  const un = {};
  assert.equal(checkAchievements(s, un).length, 0);
  s.lines = 120; s.bestCombo = 3;
  const f = checkAchievements(s, un).map((a) => a.id).sort();
  assert.deepEqual(f, ['combo_3', 'first_line', 'lines_100']);
  assert.equal(checkAchievements(s, un).length, 0);
  assert.equal(achievementProgress(s, ACHIEVEMENTS.find((a) => a.id === 'lines_1000')), 0.12);
  for (const a of ACHIEVEMENTS) assert.ok(STAT_KEYS.includes(a.stat), a.id);
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length);
});

test('topshiriqlar: kunga 3 ta, har xil, deterministik', () => {
  for (let d = 1; d < 100; d++) {
    const q = generateQuests(d);
    assert.equal(q.length, 3);
    assert.equal(new Set(q.map((x) => x.type)).size, 3);
    assert.deepEqual(q, generateQuests(d));
    for (const x of q) assert.ok(x.target > 0 && x.coins > 0);
  }
  for (const t of QUEST_TEMPLATES) assert.ok(STAT_KEYS.includes(t.type), t.type);
});

test('topshiriqlar: kuzatish, mukofot olish, yangi kun', () => {
  let qs = createQuestState(5);
  qs.list = [{ type: 'lines', target: 3, coins: 30, progress: 0, claimed: false }, { type: 'gems', target: 2, coins: 40, progress: 0, claimed: false }];
  trackQuests(qs, [{ type: 'lines', n: 2 }, { type: 'bestCombo', max: 2 }]);
  assert.equal(claimQuest(qs, 0), 0, 'hali tugamagan');
  trackQuests(qs, [{ type: 'lines', n: 5 }]);
  assert.equal(qs.list[0].progress, 3);
  assert.equal(claimableCount(qs), 1);
  assert.equal(claimQuest(qs, 0), 30);
  assert.equal(claimQuest(qs, 0), 0, 'ikki marta olinmaydi');
  trackQuests(qs, [{ type: 'lines', n: 5 }]);
  assert.equal(qs.list[0].progress, 3);
  assert.equal(rollQuests(qs, 5), qs);
  assert.notEqual(rollQuests(qs, 6), qs);
  assert.equal(rollQuests(null, 6).day, 6);
});

test('kirish mukofoti: ketma-ket kunlar, 7-kun katta, uzilsa boshidan', () => {
  const st = createLogin();
  const got = [];
  for (let d = 10; d <= 17; d++) got.push(checkLogin(st, d));
  assert.deepEqual(got.map((g) => g.coins), [...LOGIN_REWARDS, LOGIN_REWARDS[0]]);
  assert.equal(got[6].bomb, 1);
  assert.equal(checkLogin(st, 17), null, 'bir kunda bir marta');
  assert.equal(checkLogin(st, 20).day, 1, 'uzildi');
});

test('ovoz sintezi: tor chertish, doira, lad, kuy', () => {
  const sr = 8000;
  const p = pluck(midiToFreq(62), sr, 0.3);
  assert.equal(p.length, 2400);
  let peak = 0; for (const v of p) peak = Math.max(peak, Math.abs(v));
  assert.ok(peak > 0.79 && peak <= 0.8001);
  assert.ok(Math.abs(p[p.length - 1]) < 0.01, 'oxiri jim (klik yo\'q)');
  // so'nish: oxirgi chorak boshidagidan jimroq
  const rms = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += p[i] * p[i]; return Math.sqrt(s / (b - a)); };
  assert.ok(rms(1800, 2300) < rms(0, 500));
  const d = drum(sr, 'dum');
  assert.ok(d.length > 0 && d.every((v) => Number.isFinite(v)));
  assert.equal(scaleNote(0), 62);
  assert.equal(scaleNote(SCALE.length - 1), 74, 'oktava');
  assert.equal(scaleNote(-1), 62 - 1);
  assert.ok(Math.abs(midiToFreq(69) - 440) < 1e-9);
  const m = generateMelody();
  assert.deepEqual(m, generateMelody());
  assert.ok(m.length > 20);
  for (const n of m) assert.ok(n.step >= 0 && n.step <= 9);
  for (const k of ['pick', 'place', 'clear', 'combo', 'win', 'lose', 'bomb', 'hammer', 'rotate', 'swap']) assert.ok(SFX[k], k);
  assert.deepEqual(Array.from(normalize(new Float32Array([0, 0]))), [0, 0]);
});

test('4 til: barcha kalitlar har tilda bor, parametrli matn', () => {
  for (const l of LANGS) for (const k of Object.keys(STRINGS.en)) assert.ok(STRINGS[l][k], `${l}: ${k}`);
  for (const a of ACHIEVEMENTS) assert.ok(STRINGS.en['ach.' + a.id], a.id);
  for (const q of QUEST_TEMPLATES) assert.ok(STRINGS.en['quest.' + q.type], q.type);
  assert.equal(tf('quest.lines', { n: 10 }, 'en'), 'Clear 10 lines');
  assert.equal(tf('quest.lines', { n: 10 }, 'uz'), '10 ta qator tozalang');
});

test('musiqa: har shahar o\'z kuyi, notalar lad ichida', async () => {
  const { themeMusic, MUSIC_THEMES, SCALES, scaleNote: sn } = await import('../src/audio/synth.js');
  const { CITIES } = await import('../src/logic/levels.js');
  for (const c of CITIES) assert.ok(MUSIC_THEMES[c.id], 'mavzu: ' + c.id);
  const seen = new Set();
  for (const name of Object.keys(MUSIC_THEMES)) {
    const th = themeMusic(name);
    assert.ok(th.melody.length > 20 && th.doiraPattern.length === 6);
    assert.ok(th.beat > 0.2 && th.beat < 0.5);
    seen.add(JSON.stringify(th.melody.map((n) => n.step)) + th.scale + th.base);
    for (const n of th.melody) { const m = sn(n.step, 0, th.scaleArr, th.base); assert.ok(m >= 55 && m <= 90, 'diapazon ' + m); }
  }
  assert.equal(seen.size, Object.keys(MUSIC_THEMES).length, 'hamma kuylar har xil');
  assert.equal(themeMusic('yoq').seed, MUSIC_THEMES.menu.seed);
  assert.equal(sn(2, 0, SCALES.major, 60), 64);
});

test('softTone: toza, chegaralangan, klik yo\'q (boshi va oxiri jim)', async () => {
  const { softTone, SFX: S } = await import('../src/audio/synth.js');
  const sr = 22050;
  for (const f of [110, 294, 880, 2000]) {
    const a = softTone(f, sr, 0.4, { brightness: 0.5 });
    assert.equal(a.length, Math.floor(sr * 0.4));
    let peak = 0;
    for (const v of a) { assert.ok(Number.isFinite(v)); peak = Math.max(peak, Math.abs(v)); }
    assert.ok(peak <= 0.7001 && peak > 0.5);
    assert.ok(Math.abs(a[0]) < 0.01 && Math.abs(a[a.length - 1]) < 0.01);
  }
  // shakl qo'yish ovozi endi yumshoq va qisqa
  assert.ok(S.place.every((n) => n.soft && n.dur <= 0.35));
});
