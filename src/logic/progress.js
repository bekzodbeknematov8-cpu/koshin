// Sarguzasht progressi — sof ma'lumot (saqlash 10-bosqichda localStorage orqali).
import { ADVENTURE_LEVELS, LEVELS_PER_CITY, CITIES } from './levels.js';

export function createProgress() {
  return { stars: {}, unlocked: 0, fails: {} }; // stars: { [index]: 1..3 }, unlocked — ochiq eng katta index, fails — ketma-ket mag'lubiyatlar
}

export function recordResult(p, index, stars) {
  if (stars <= 0) return p;
  const prev = p.stars[index] || 0;
  if (stars > prev) p.stars[index] = stars;
  if (index + 1 > p.unlocked) p.unlocked = index + 1;
  if (p.fails) delete p.fails[index];
  return p;
}

// Mag'lubiyat hisobi: bir bosqichda qayta-qayta yutqazgan o'yinchiga yordam yurishlari beriladi.
export function recordFail(p, index) {
  if (!p.fails) p.fails = {};
  p.fails[index] = Math.min(20, (p.fails[index] || 0) + 1);
  return p.fails[index];
}

// 2 marta yutqazsa +3, 4 marta +6 yurish (yulduzlarga ta'sir qilmaydi).
export function helpMoves(p, index) {
  const f = (p.fails && p.fails[index]) || 0;
  return f >= 4 ? 6 : f >= 2 ? 3 : 0;
}

export function isUnlocked(p, index) { return index <= p.unlocked; }

export function totalStars(p) {
  return Object.values(p.stars).reduce((a, b) => a + b, 0);
}

export function cityStars(p, cityIdx) {
  let s = 0;
  for (let i = 0; i < LEVELS_PER_CITY; i++) s += p.stars[cityIdx * LEVELS_PER_CITY + i] || 0;
  return s;
}

// Shaharda nechta bosqich o'tilgan (bino bezagi shunga qarab ochiladi).
export function cityCompleted(p, cityIdx) {
  let n = 0;
  for (let i = 0; i < LEVELS_PER_CITY; i++) if (p.stars[cityIdx * LEVELS_PER_CITY + i]) n++;
  return n;
}

export function eternalUnlocked(p) { return p.unlocked >= ADVENTURE_LEVELS; }

export function sanitizeProgress(raw) {
  const p = createProgress();
  if (!raw || typeof raw !== 'object') return p;
  if (Number.isInteger(raw.unlocked) && raw.unlocked >= 0) p.unlocked = raw.unlocked;
  if (raw.stars && typeof raw.stars === 'object')
    for (const [k, v] of Object.entries(raw.stars)) {
      const i = Number(k);
      if (Number.isInteger(i) && i >= 0 && [1, 2, 3].includes(v)) p.stars[i] = v;
    }
  if (raw.fails && typeof raw.fails === 'object')
    for (const [k, v] of Object.entries(raw.fails)) {
      const i = Number(k);
      if (Number.isInteger(i) && i >= 0 && Number.isInteger(v) && v > 0) p.fails[i] = Math.min(20, v);
    }
  return p;
}

export const CITY_COUNT = CITIES.length;
