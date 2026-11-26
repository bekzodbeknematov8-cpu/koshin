// Omad charxpalagi: kuniga 1 bepul aylantirish + reklama evaziga qo'shimcha. DOM'siz mantiq.
import { addCoins } from './powerups.js';

// 8 ta bo'lak (ketma-ketligi charxdagi joylashuv). w — ehtimollik og'irligi.
export const WHEEL = [
  { kind: 'coins', n: 20, w: 28 },
  { kind: 'hammer', n: 1, w: 14 },
  { kind: 'coins', n: 50, w: 18 },
  { kind: 'rotate', n: 1, w: 12 },
  { kind: 'coins', n: 100, w: 7 },
  { kind: 'swap', n: 1, w: 12 },
  { kind: 'bomb', n: 1, w: 7 },
  { kind: 'coins', n: 300, w: 2 },
];

export function createWheelState(day = 0) { return { day, freeUsed: false, spins: 0 }; }

export function sanitizeWheelState(raw) {
  const s = createWheelState();
  if (!raw || typeof raw !== 'object') return s;
  if (Number.isInteger(raw.day) && raw.day >= 0) s.day = raw.day;
  s.freeUsed = raw.freeUsed === true;
  if (Number.isInteger(raw.spins) && raw.spins >= 0) s.spins = raw.spins;
  return s;
}

export function rollWheelDay(s, day) {
  if (s.day !== day) { s.day = day; s.freeUsed = false; }
  return s;
}

export function canSpinFree(s, day) { return !rollWheelDay(s, day).freeUsed; }

// rng() → [0,1). Tanlangan bo'lak indeksini qaytaradi.
export function pickSegment(rng, wheel = WHEEL) {
  const total = wheel.reduce((a, p) => a + p.w, 0);
  let x = rng() * total;
  for (let i = 0; i < wheel.length; i++) { x -= wheel[i].w; if (x < 0) return i; }
  return wheel.length - 1;
}

// Aylantirish: free=true bo'lsa bepul imkoniyat sarflanadi. Natija: { index, prize } yoki null.
export function spin(s, day, rng, { free = true } = {}) {
  rollWheelDay(s, day);
  if (free && s.freeUsed) return null;
  if (free) s.freeUsed = true;
  s.spins++;
  const index = pickSegment(rng);
  return { index, prize: WHEEL[index] };
}

export function grantPrize(wallet, prize) {
  if (prize.kind === 'coins') addCoins(wallet, prize.n);
  else wallet.inv[prize.kind] = (wallet.inv[prize.kind] || 0) + prize.n;
}
