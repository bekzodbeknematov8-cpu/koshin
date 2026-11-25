// Sarguzasht: Ipak Yo'li shaharlari va qoida asosidagi bosqich generatori (qo'lda yozilmaydi).
import { createRng } from './shapes.js';

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

// Shahardagi qiyinlik: asta oshadi, har 5-bosqich "nafas rostlash" (biroz oson), boss biroz qiyin.
export function levelDifficulty(index) {
  if (index >= ADVENTURE_LEVELS) {
    // Abadiy yo'l: sekin, cheklangan o'sish
    const k = index - ADVENTURE_LEVELS;
    return Math.min(0.92, 0.7 + 0.22 * (1 - Math.exp(-k / 120)));
  }
  const city = Math.floor(index / LEVELS_PER_CITY);
  const num = (index % LEVELS_PER_CITY) + 1;
  let d = 0.05 + city * 0.1 + (num / LEVELS_PER_CITY) * 0.18;
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
  const fairness = difficulty < 0.6 || index < 10 ? 'strict' : 'normal';
  const pool = tutorial ? TUTORIAL_POOL : undefined;

  // Maqsad turi navbat bilan tanlanadi (qoida asosida).
  const goals = [];
  const progress = city ? num / LEVELS_PER_CITY : 1;
  const tier = city ? cityIdx : CITIES.length + Math.floor(num / 20);
  const kind = boss ? 'both' : ['score', 'lines', 'score', 'lines', 'both'][Math.floor(rng() * 5)];
  const lineTarget = Math.round(3 + tier * 1.2 + progress * 4 + rng() * 2);
  const scoreTarget = Math.round((250 + tier * 180 + progress * 450 + rng() * 150) / 50) * 50;
  if (index === 0) goals.push({ type: 'lines', target: 2 });
  else if (index === 1) goals.push({ type: 'lines', target: 3 });
  else if (index === 2) goals.push({ type: 'score', target: 200 });
  else {
    if (kind === 'score' || kind === 'both') goals.push({ type: 'score', target: kind === 'both' ? Math.round(scoreTarget * 0.8 / 50) * 50 : scoreTarget });
    if (kind === 'lines' || kind === 'both') goals.push({ type: 'lines', target: kind === 'both' ? Math.max(3, Math.round(lineTarget * 0.8)) : lineTarget });
  }

  // Yurishlar: maqsadga yetarli + zaxira; qiyinlik oshgan sari zaxira kamayadi.
  const need = goals.reduce((m, g) => Math.max(m, g.type === 'lines' ? g.target * 2.8 : g.target / 45), 0);
  const slack = 1.55 - difficulty * 0.35;
  const moves = Math.max(8, Math.round(need * slack + 4));

  return {
    index, num, boss, city: city ? city.id : 'eternal', cityIdx,
    difficulty, fairness, pool, goals, moves,
    seed: (0x9e37 * (index + 1)) >>> 0,
    obstacles: [], // 6-bosqichda to'ldiriladi
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
