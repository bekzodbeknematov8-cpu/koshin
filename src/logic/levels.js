// Sarguzasht: Ipak Yo'li shaharlari va qoida asosidagi bosqich generatori (qo'lda yozilmaydi).
import { createRng } from './shapes.js';
import { buildingCells, BUILDING_IDS } from './buildings.js';

export const LEVELS_PER_CITY = 20;

// mechanic — shu shaharda kiritiladigan yangi narsa (to'siqlar 6-bosqichda ulanadi).
export const CITIES = [
  { id: 'khiva', color: '#c98a3c', accent: '#f0c04a', mechanic: 'basics', building: 'kaltaminor' },
  { id: 'bukhara', color: '#2f8fb0', accent: '#8fe3f0', mechanic: 'ice', building: 'kalon' },
  { id: 'samarkand', color: '#1f5fc8', accent: '#5fd9d0', mechanic: 'stone', building: 'registan' },
  { id: 'shahrisabz', color: '#3a8f5a', accent: '#e8d27a', mechanic: 'chain', building: 'aksaray' },
  { id: 'tashkent', color: '#7a4fb0', accent: '#d7c2ff', mechanic: 'gems', building: 'kukeldash' },
  { id: 'kokand', color: '#b0503a', accent: '#ffc9a0', mechanic: 'mixed', building: 'khudayar' },
  { id: 'termez', color: '#a0703a', accent: '#ffe0a0', mechanic: 'master', building: 'sultansaodat' },
];

export const ADVENTURE_LEVELS = CITIES.length * LEVELS_PER_CITY;

// To'siq mexanikalari ochilish tartibi: Buxoro — muz, Samarqand — tosh, Shahrisabz — zanjir, Toshkent — olmos.
export const MECHANICS = ['ice', 'stone', 'chain', 'gems'];
const BUILDING_CELLS = Object.fromEntries(BUILDING_IDS.map((id) => [id, buildingCells(id).length]));

// Shahardagi qiyinlik: asta oshadi, har 5-bosqich "nafas rostlash" (biroz oson), boss biroz qiyin.
export function levelDifficulty(index) {
  if (index >= ADVENTURE_LEVELS) {
    // Abadiy yo'l: sekin, cheklangan o'sish
    const k = index - ADVENTURE_LEVELS;
    return Math.min(0.92, 0.7 + 0.22 * (1 - Math.exp(-k / 120)));
  }
  const city = Math.floor(index / LEVELS_PER_CITY);
  const num = (index % LEVELS_PER_CITY) + 1;
  let d = 0.05 + city * 0.085 + (num / LEVELS_PER_CITY) * 0.18; // (2026-11-26: 0.1 → 0.085, Qo'qon keskin qiyin edi)
  if (num % 5 === 0 && num !== LEVELS_PER_CITY) d -= 0.08;
  if (num === LEVELS_PER_CITY) d += 0.04;
  return Math.max(0, Math.min(0.9, d));
}

export function cityOf(index) {
  if (index >= ADVENTURE_LEVELS) return null; // Abadiy yo'l
  return CITIES[Math.floor(index / LEVELS_PER_CITY)];
}

// Shakllar to'plami: o'rgatish bosqichlarida faqat oddiy shakllar.
const TUTORIAL_POOL = ['dot', 'h2', 'v2', 'h3', 'v3', 'sq2', 'l3a', 'l3b', 'l3c', 'l3d'];

// Bosqich ta'rifi (deterministik — bir xil index → bir xil bosqich).
export function generateLevel(index) {
  const rng = createRng(0x51c0 + index * 7919);
  const city = cityOf(index);
  const cityIdx = city ? CITIES.indexOf(city) : -1;
  const num = city ? (index % LEVELS_PER_CITY) + 1 : index - ADVENTURE_LEVELS + 1;
  const boss = !!city && num === LEVELS_PER_CITY;
  const difficulty = levelDifficulty(index);
  const tutorial = index < 3;
  // Yurishlar cheklangan rejimda tiqilib qolish adolatsiz tuyuladi — asosan qat'iy adolat.
  const fairness = 'strict';
  const pool = tutorial ? TUTORIAL_POOL : undefined;

  const progress = city ? num / LEVELS_PER_CITY : 1;
  const tier = city ? cityIdx : CITIES.length + Math.min(10, Math.floor(num / 20));
  const goals = [];
  const obstacles = { ice: 0, chain: 0, stone: 0, gem: 0 };
  let build = null, gemChance = 0;
  const eternalBoss = !city && num % LEVELS_PER_CITY === 0;

  // Shu bosqichda mavjud mexanikalar (shaharlar bo'ylab asta ochiladi).
  const available = MECHANICS.filter((m, i) => tier >= i + 1);
  const mech = city ? city.mechanic : 'master';
  let primary = null;
  if (['ice', 'stone', 'chain', 'gems'].includes(mech)) primary = mech;
  else if (available.length) primary = available[Math.floor(rng() * available.length)];

  const lineTarget = Math.round(3 + Math.min(tier, 9) * 1.2 + progress * 4 + rng() * 2);
  const scoreTarget = Math.round((250 + Math.min(tier, 9) * 180 + progress * 450 + rng() * 150) / 50) * 50;
  const classic = (kind) => {
    if (kind === 'score' || kind === 'both') goals.push({ type: 'score', target: kind === 'both' ? Math.round(scoreTarget * 0.8 / 50) * 50 : scoreTarget });
    if (kind === 'lines' || kind === 'both') goals.push({ type: 'lines', target: kind === 'both' ? Math.max(3, Math.round(lineTarget * 0.8)) : lineTarget });
  };
  const obstacleGoal = (type, extra = 0) => {
    const cnt = Math.max(2, Math.min(8, 2 + Math.floor(num / 4) + Math.floor(Math.min(tier, 9) / 3) + extra));
    if (type === 'gems') {
      obstacles.gem += Math.max(2, Math.round(cnt * 0.6));
      gemChance = 0.22;
      goals.push({ type: 'gems', target: obstacles.gem + 2 + Math.floor(num / 6) });
    } else {
      const k = type === 'ice' ? Math.max(2, Math.round(cnt * 0.6)) : cnt; // muz 2 marta tozalanadi — kamroq
      obstacles[type] += k;
      goals.push({ type, target: k });
    }
  };

  if (index === 0) goals.push({ type: 'lines', target: 2 });
  else if (index === 1) goals.push({ type: 'lines', target: 3 });
  else if (index === 2) goals.push({ type: 'score', target: 200 });
  else if (boss || eternalBoss) {
    // Boss: shaharning mashhur binosini koshinlar bilan qayta qurish
    build = city ? city.building : CITIES[Math.floor(rng() * CITIES.length)].building;
    goals.push({ type: 'build', target: BUILDING_CELLS[build] });
    if (primary && primary !== 'gems') obstacles[primary] += 2;
  } else if (!primary || num <= 1 || rng() < 0.3) {
    classic(['score', 'lines', 'score', 'lines', 'both'][Math.floor(rng() * 5)]);
    // yengil bezak sifatida mavjud to'siqlar
    if (primary && primary !== 'gems' && num > 1) obstacles[primary] += 1 + Math.floor(rng() * 2);
  } else {
    obstacleGoal(primary);
    // aralash shaharlarda ikkinchi mexanika
    if ((mech === 'mixed' || mech === 'master') && available.length > 1 && rng() < 0.6) {
      const other = available.filter((m) => m !== primary);
      obstacleGoal(other[Math.floor(rng() * other.length)], -2);
    }
  }

  // Yurishlar: maqsadga yetarli + zaxira; qiyinlik oshgan sari zaxira kamayadi.
  const buildCells = build ? BUILDING_CELLS[build] : 0;
  // (balans 2026-11-26: bot sinovi bo'yicha to'siqlar uchun ko'proq, oddiy maqsadlar uchun biroz kamroq yurish)
  const per = { lines: 2.8, score: 1 / 43, ice: 9, chain: 4.6, stone: 3.9, gems: 3.4, build: 0.5 };
  const needs = goals.map((g) => (g.type === 'build' ? buildCells : g.target) * per[g.type]);
  // klassik maqsadlar bir-biriga yordam beradi (yig'indining 60%), ikki xil to'siq esa kamroq (85%)
  const obsGoals = goals.filter((g) => ['ice', 'chain', 'stone', 'gems'].includes(g.type)).length;
  const need = Math.max(...needs, (obsGoals > 1 ? 0.85 : 0.6) * needs.reduce((a, b) => a + b, 0));
  const slack = 1.5 - difficulty * 0.35;
  const moves = Math.max(tutorial ? 14 : 8, Math.round(need * slack + 4));

  // to'siqlar o'zi qiyinlik qo'shadi — shakllar biroz yengilroq bo'ladi
  const obsTotal = obstacles.ice + obstacles.chain + obstacles.stone + obstacles.gem;
  const obsKinds = ['ice', 'chain', 'stone', 'gem'].filter((k) => obstacles[k] > 0).length;
  const shapeDifficulty = obsKinds > 1 ? difficulty * 0.6 : obsTotal > 0 || build ? difficulty * 0.72 : difficulty;
  return {
    index, num, boss: boss || eternalBoss, shapeDifficulty, city: city ? city.id : 'eternal', cityIdx,
    difficulty, fairness, pool, goals, moves,
    seed: (0x9e37 * (index + 1)) >>> 0,
    obstacles, build, gemChance,
  };
}

// Yulduzlar: maqsad bajarilsa 1, qolgan yurishlar ulushiga qarab 2–3.
export function starsFor(level, won, movesLeft) {
  if (!won) return 0;
  const frac = movesLeft / level.moves;
  if (frac >= 0.3) return 3;
  if (frac >= 0.12) return 2;
  return 1;
}
