// Reklama siyosati — DOM'siz mantiq (Node'da test qilinadi).
// Maqsad: daromad, lekin o'yinchini bezor qilmaslik:
//  - rewarded (mukofotli) reklama — faqat o'yinchi o'zi tanlaganda; har joy uchun kunlik chegara;
//  - interstitial (oraliq) — faqat bosqichlar orasida, yangi o'yinchiga yo'q, kamdan-kam;
//  - mukofotli reklama ko'rgan o'yinchiga yaqin orada oraliq reklama ko'rsatilmaydi;
//  - "Reklamasiz" (noAds) — oraliq reklama butunlay o'chadi, mukofotlilar qoladi (o'yinchi ixtiyori).

export const AD_RULES = {
  interstitial: {
    firstAfterLevels: 6,   // dastlabki 6 ta bosqich tugashigacha — hech qanday oraliq reklama
    everyLevels: 3,        // keyin har 3 ta bosqich tugashida ko'pi bilan bittadan
    minGapMs: 180000,      // ikki oraliq reklama orasida kamida 3 daqiqa
    afterRewardedMs: 120000, // mukofotli reklamadan keyin 2 daqiqa tinch
    perDay: 10,
  },
  rewarded: {
    perDay: 40,
    caps: { extra_moves: 20, daily_attempt: 1, double_coins: 15, free_coins: 5, free_powerup: 3, revive: 10, wheel_spin: 2 },
  },
};

export const REWARDED_PLACEMENTS = Object.keys(AD_RULES.rewarded.caps);
export const FREE_COINS = 25;

export function createAdState(day = 0) {
  return { day, today: {}, totalToday: 0, interToday: 0, lastInterAt: 0, lastRewardedAt: 0, levelEnds: 0, sinceInter: 0, noAds: false, watched: 0 };
}

const num = (v, d = 0) => (Number.isFinite(v) && v >= 0 ? v : d);

export function sanitizeAdState(raw) {
  const s = createAdState();
  if (!raw || typeof raw !== 'object') return s;
  for (const k of ['day', 'totalToday', 'interToday', 'lastInterAt', 'lastRewardedAt', 'levelEnds', 'sinceInter', 'watched']) s[k] = Math.floor(num(raw[k]));
  s.noAds = raw.noAds === true;
  if (raw.today && typeof raw.today === 'object')
    for (const p of REWARDED_PLACEMENTS) if (Number.isInteger(raw.today[p]) && raw.today[p] > 0) s.today[p] = raw.today[p];
  return s;
}

// Yangi kun — kunlik hisoblagichlar nolga.
export function rollAdDay(s, day) {
  if (s.day !== day) { s.day = day; s.today = {}; s.totalToday = 0; s.interToday = 0; }
  return s;
}

export function rewardedLeft(s, placement, day = s.day) {
  rollAdDay(s, day);
  const cap = AD_RULES.rewarded.caps[placement];
  if (cap === undefined) return 0;
  return Math.max(0, Math.min(cap - (s.today[placement] || 0), AD_RULES.rewarded.perDay - s.totalToday));
}

export function canShowRewarded(s, placement, day = s.day) {
  return rewardedLeft(s, placement, day) > 0;
}

export function noteRewarded(s, placement, now, day = s.day) {
  rollAdDay(s, day);
  s.today[placement] = (s.today[placement] || 0) + 1;
  s.totalToday++;
  s.watched++;
  s.lastRewardedAt = now;
}

// Bosqich tugadi (g'alaba yoki mag'lubiyat) — hisoblagich.
export function noteLevelEnd(s) {
  s.levelEnds++;
  s.sinceInter++;
}

// Bosqichdan keyin oraliq reklama ko'rsatish kerakmi?
export function shouldShowInterstitial(s, now, day = s.day) {
  rollAdDay(s, day);
  const R = AD_RULES.interstitial;
  if (s.noAds) return false;
  if (s.levelEnds < R.firstAfterLevels) return false;
  if (s.sinceInter < R.everyLevels) return false;
  if (s.interToday >= R.perDay) return false;
  if (s.lastInterAt && now - s.lastInterAt < R.minGapMs) return false;
  if (s.lastRewardedAt && now - s.lastRewardedAt < R.afterRewardedMs) return false;
  return true;
}

export function noteInterstitial(s, now, day = s.day) {
  rollAdDay(s, day);
  s.interToday++;
  s.lastInterAt = now;
  s.sinceInter = 0;
}
