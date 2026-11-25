// Xarita joylashuvi — sof hisob (testlanadi). Yo'l pastdan (Xiva) yuqoriga (Termiz) ko'tariladi.
import { CITIES, LEVELS_PER_CITY, ADVENTURE_LEVELS } from '../logic/levels.js';

export const NODE_GAP = 86;
export const CITY_HEADER = 300;

// d — pastdan masofa (px). Shahar sarlavhasi shahar bosqichlaridan oldin (pastroqda).
export function nodeDistance(index) {
  const city = Math.min(Math.floor(index / LEVELS_PER_CITY), CITIES.length);
  const inCity = index - city * LEVELS_PER_CITY;
  return 120 + (city + 1) * CITY_HEADER + city * LEVELS_PER_CITY * NODE_GAP + inCity * NODE_GAP;
}

export function cityHeaderDistance(cityIdx) {
  return 120 + cityIdx * (CITY_HEADER + LEVELS_PER_CITY * NODE_GAP) + CITY_HEADER * 0.45;
}

export function nodeX(index, w) {
  return w / 2 + Math.sin(index * 0.85) * Math.min(w * 0.3, 150);
}

// Ko'rinadigan bosqichlar soni: sarguzasht + ochilgan Abadiy yo'l bosqichlari + 5.
export function visibleCount(unlocked) {
  return Math.max(ADVENTURE_LEVELS, unlocked + 6);
}

export function totalDistance(unlocked) {
  return nodeDistance(visibleCount(unlocked) - 1) + 200;
}

// Ekran y koordinatasi: scroll — pastdan qancha ko'tarilgan.
export function screenY(d, scroll, h) { return h - (d - scroll); }

// Berilgan bosqichni ekran o'rtasiga keltiradigan scroll qiymati (chegaralangan).
export function scrollFor(index, h, unlocked) {
  const target = nodeDistance(index) - h * 0.45;
  return clampScroll(target, h, unlocked);
}

export function clampScroll(s, h, unlocked) {
  const max = Math.max(0, totalDistance(unlocked) - h);
  return Math.max(0, Math.min(max, s));
}

// Teginish qaysi bosqich tuguniga tushdi.
export function nodeAt(x, y, w, h, scroll, unlocked, radius = 30) {
  const n = visibleCount(unlocked);
  // faqat ekrandagi taxminiy oraliqni tekshiramiz
  for (let i = 0; i < n; i++) {
    const sy = screenY(nodeDistance(i), scroll, h);
    if (sy < -radius || sy > h + radius) continue;
    if (Math.hypot(x - nodeX(i, w), y - sy) <= radius) return i;
  }
  return -1;
}
