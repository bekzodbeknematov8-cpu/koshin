// Kundalik topshiriqlar, kirish mukofoti, yutuqlar va statistika — DOM'siz mantiq.
import { createRng } from './shapes.js';

// --- Statistika (yutuqlar shundan hisoblanadi) ---
export const STAT_KEYS = ['lines', 'pieces', 'combos', 'bestCombo', 'levelsWon', 'stars', 'bosses', 'endlessBest', 'dailyPlayed', 'dailyStreakBest', 'gems', 'powerups', 'perfects', 'ice', 'stones', 'chains', 'coinsEarned'];

export function createStats() {
  return Object.fromEntries(STAT_KEYS.map((k) => [k, 0]));
}

export function sanitizeStats(raw) {
  const s = createStats();
  if (raw && typeof raw === 'object') for (const k of STAT_KEYS) if (Number.isFinite(raw[k]) && raw[k] >= 0) s[k] = Math.floor(raw[k]);
  return s;
}

// Yurish natijasidan statistika va topshiriq hodisalari. Qaytaradi: [{ type, n }] hodisalar ro'yxati.
export function eventsFromMove(res) {
  const ev = [];
  if (!res) return ev;
  if (res.powerup) ev.push({ type: 'powerups', n: 1 });
  else ev.push({ type: 'pieces', n: 1 });
  if (res.lines) ev.push({ type: 'lines', n: res.lines });
  if (res.lines >= 2) ev.push({ type: 'combos', n: 1 }, { type: 'bestCombo', max: res.lines });
  if (res.perfect) ev.push({ type: 'perfects', n: 1 });
  const e = res.events || {};
  if (e.gems) ev.push({ type: 'gems', n: e.gems });
  if (e.ice) ev.push({ type: 'ice', n: e.ice });
  if (e.stone) ev.push({ type: 'stones', n: e.stone });
  if (e.chain) ev.push({ type: 'chains', n: e.chain });
  return ev;
}

export function applyStatEvents(stats, events) {
  for (const e of events) {
    if (!(e.type in stats)) continue;
    if (e.max !== undefined) stats[e.type] = Math.max(stats[e.type], e.max);
    else stats[e.type] += e.n || 0;
  }
  return stats;
}

// --- Yutuqlar ---
export const ACHIEVEMENTS = [
  { id: 'first_line', stat: 'lines', goal: 1, coins: 20 },
  { id: 'lines_100', stat: 'lines', goal: 100, coins: 50 },
  { id: 'lines_1000', stat: 'lines', goal: 1000, coins: 200 },
  { id: 'combo_3', stat: 'bestCombo', goal: 3, coins: 50 },
  { id: 'combo_4', stat: 'bestCombo', goal: 4, coins: 150 },
  { id: 'perfect', stat: 'perfects', goal: 1, coins: 80 },
  { id: 'levels_10', stat: 'levelsWon', goal: 10, coins: 50 },
  { id: 'levels_50', stat: 'levelsWon', goal: 50, coins: 150 },
  { id: 'stars_100', stat: 'stars', goal: 100, coins: 150 },
  { id: 'boss_1', stat: 'bosses', goal: 1, coins: 100 },
  { id: 'boss_7', stat: 'bosses', goal: 7, coins: 500 },
  { id: 'endless_2000', stat: 'endlessBest', goal: 2000, coins: 60 },
  { id: 'endless_10000', stat: 'endlessBest', goal: 10000, coins: 250 },
  { id: 'daily_7', stat: 'dailyStreakBest', goal: 7, coins: 150 },
  { id: 'gems_50', stat: 'gems', goal: 50, coins: 100 },
  { id: 'ice_50', stat: 'ice', goal: 50, coins: 100 },
  { id: 'stones_50', stat: 'stones', goal: 50, coins: 100 },
  { id: 'powerups_20', stat: 'powerups', goal: 20, coins: 60 },
];

// Yangi ochilgan yutuqlar (unlocked — ochilganlar to'plami/obyekti, o'zgartiriladi).
export function checkAchievements(stats, unlocked) {
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (unlocked[a.id]) continue;
    if ((stats[a.stat] || 0) >= a.goal) { unlocked[a.id] = true; fresh.push(a); }
  }
  return fresh;
}

export function achievementProgress(stats, a) {
  return Math.min(1, (stats[a.stat] || 0) / a.goal);
}

// --- Kundalik topshiriqlar ---
export const QUEST_TEMPLATES = [
  { type: 'lines', amounts: [10, 20, 30], coins: [30, 50, 70] },
  { type: 'pieces', amounts: [30, 60, 90], coins: [20, 40, 60] },
  { type: 'combos', amounts: [2, 4, 6], coins: [40, 60, 90] },
  { type: 'levelsWon', amounts: [2, 3, 5], coins: [40, 60, 90] },
  { type: 'stars', amounts: [4, 6, 9], coins: [40, 60, 90] },
  { type: 'powerups', amounts: [1, 2, 3], coins: [20, 30, 45] },
  { type: 'dailyPlayed', amounts: [1, 1, 1], coins: [40, 40, 40] },
  { type: 'gems', amounts: [5, 10, 15], coins: [40, 60, 80] },
];

export function generateQuests(day) {
  const rng = createRng(0x9e5 ^ (day * 2654435761));
  const pool = QUEST_TEMPLATES.slice();
  const out = [];
  for (let i = 0; i < 3; i++) {
    const k = Math.floor(rng() * pool.length);
    const t = pool.splice(k, 1)[0];
    out.push({ type: t.type, target: t.amounts[i], coins: t.coins[i], progress: 0, claimed: false });
  }
  return out;
}

export function createQuestState(day) {
  return { day, list: generateQuests(day) };
}

export function rollQuests(qs, day) {
  if (!qs || qs.day !== day || !Array.isArray(qs.list)) return createQuestState(day);
  return qs;
}

export function trackQuests(qs, events) {
  for (const e of events) {
    if (e.max !== undefined) continue;
    for (const q of qs.list) if (q.type === e.type && !q.claimed) q.progress = Math.min(q.target, q.progress + (e.n || 0));
  }
  return qs;
}

export function claimQuest(qs, i) {
  const q = qs.list[i];
  if (!q || q.claimed || q.progress < q.target) return 0;
  q.claimed = true;
  return q.coins;
}

export function claimableCount(qs) {
  return qs.list.filter((q) => !q.claimed && q.progress >= q.target).length;
}

// --- Kirish mukofoti (ketma-ket kunlar) ---
export const LOGIN_REWARDS = [20, 30, 40, 50, 60, 80, 150];

export function createLogin() { return { lastDay: 0, streak: 0 }; }

// Bugun birinchi kirishda mukofot qaytaradi (bo'lmasa null).
export function checkLogin(st, day) {
  if (st.lastDay === day) return null;
  st.streak = st.lastDay === day - 1 ? st.streak + 1 : 1;
  st.lastDay = day;
  const idx = (st.streak - 1) % LOGIN_REWARDS.length;
  return { day: idx + 1, coins: LOGIN_REWARDS[idx], bomb: idx === LOGIN_REWARDS.length - 1 ? 1 : 0 };
}
