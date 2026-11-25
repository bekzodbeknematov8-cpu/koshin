// Kunlik Naqsh: har kuni hamma o'yinchiga bir xil boshqotirma (sana asosidagi seed).
import { createRng, SHAPES } from './shapes.js';
import { pickShapeId, makePiece } from './generator.js';
import { createGame, tryPlace, hasAnyMove } from './game.js';
import { EMPTY } from './board.js';

export const DAILY_EPOCH = Date.UTC(2026, 0, 1); // Koshin #1 = 2026-01-01
export const DAILY_TRAYS = 10;                   // 30 ta shakl, hamma uchun bir xil ketma-ketlik
export const STREAK_REWARD_DAY = 7;

// Mahalliy sana (Y, M, D) bo'yicha kun raqami — vaqt mintaqasidan qat'i nazar shu sana uchun bir xil.
export function dayNumber(date = new Date()) {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((utc - DAILY_EPOCH) / 86400000) + 1;
}

export function dailySeed(day) {
  // oddiy aralashtirish (FNV ga o'xshash)
  let h = 0x811c9dc5 ^ day;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  return (h ^ (h >>> 16)) >>> 0;
}

// Boshlang'ich naqsh: simmetrik koshin naqshi (qator/ustun to'la emas).
export function dailyPattern(day) {
  const rng = createRng(dailySeed(day) ^ 0xbeef);
  const b = Array.from({ length: 8 }, () => Array(8).fill(EMPTY));
  const cells = 3 + Math.floor(rng() * 4); // chorakda 3..6 → jami 12..24 katak
  let placed = 0;
  for (let k = 0; k < cells * 3 && placed < cells; k++) {
    const r = Math.floor(rng() * 4), c = Math.floor(rng() * 4);
    if (b[r][c] !== EMPTY) continue;
    const color = Math.floor(rng() * 5);
    // 4 tomonlama simmetriya
    for (const [rr, cc] of [[r, c], [r, 7 - c], [7 - r, c], [7 - r, 7 - c]]) b[rr][cc] = color;
    placed++;
  }
  // to'la qator/ustun bo'lmasin
  for (let i = 0; i < 8; i++) {
    if (b[i].every((v) => v !== EMPTY)) { b[i][3] = EMPTY; b[i][4] = EMPTY; }
    if (b.every((row) => row[i] !== EMPTY)) { b[3][i] = EMPTY; b[4][i] = EMPTY; }
  }
  return b;
}

// Shakllar ketma-ketligi (maydondan mustaqil — hamma uchun bir xil).
export function dailySequence(day) {
  const rng = createRng(dailySeed(day));
  const out = [];
  for (let i = 0; i < DAILY_TRAYS * 3; i++) out.push(makePiece(pickShapeId(rng, 0.35), rng));
  return out;
}

export function createDailyGame(day) {
  const seq = dailySequence(day);
  let next = 0;
  const g = createGame(dailySeed(day), {
    generator: () => {
      const t = seq.slice(next, next + 3).map((p) => ({ ...p }));
      next += 3;
      while (t.length < 3) t.push(null);
      return t;
    },
  });
  g.day = day;
  g.board = dailyPattern(day);
  g.trayIndex = 1; // nechanchi tray
  g.trayLines = [0];
  g.over = !hasAnyMove(g);
  return g;
}

// Kunlik o'yinda yurish: tray bo'yicha qatorlarni yozib boradi (ulashish uchun).
export function dailyPlace(g, i, r, c) {
  const before = g.tray.filter(Boolean).length;
  const res = tryPlace(g, i, r, c);
  if (!res) return false;
  g.trayLines[g.trayLines.length - 1] += res.lines;
  if (before === 1) {
    // tray tugadi — yangi tray boshlandi (yoki ketma-ketlik tugadi)
    if (g.trayLines.length < DAILY_TRAYS) g.trayLines.push(0);
    if (g.tray.every((p) => p === null)) { g.over = true; res.over = true; }
  }
  return res;
}

// Ulashish matni: "Koshin #128 🟦🟨🟦⬜🟨 2450"
export function shareText(day, score, trayLines) {
  const em = trayLines.map((n) => (n >= 2 ? '🟨' : n === 1 ? '🟦' : '⬜')).join('');
  return `Koshin #${day} ${em} ${score}`;
}

// --- Holat: urinishlar, seriya (streak), 7-kun mukofoti ---
export function createDailyState() {
  return { day: 0, attempts: 0, adUsed: false, best: 0, streak: 0, lastDay: 0, claimed: 0, history: {} };
}

export function sanitizeDailyState(raw) {
  const s = createDailyState();
  if (!raw || typeof raw !== 'object') return s;
  for (const k of ['day', 'attempts', 'best', 'streak', 'lastDay', 'claimed']) if (Number.isInteger(raw[k]) && raw[k] >= 0) s[k] = raw[k];
  s.adUsed = raw.adUsed === true;
  if (Array.isArray(raw.lastLines)) s.lastLines = raw.lastLines.filter((n) => Number.isInteger(n) && n >= 0).slice(0, DAILY_TRAYS);
  if (raw.history && typeof raw.history === 'object')
    for (const [k, v] of Object.entries(raw.history)) if (Number.isInteger(Number(k)) && Number.isFinite(v)) s.history[k] = v;
  return s;
}

// Yangi kunga o'tish: urinishlar yangilanadi; kun o'tkazib yuborilgan bo'lsa seriya uziladi.
export function rollDay(s, today) {
  if (s.day !== today) {
    s.day = today; s.attempts = 0; s.adUsed = false; s.best = 0;
  }
  if (s.lastDay && today - s.lastDay > 1) s.streak = 0;
  return s;
}

export function attemptsLeft(s) {
  return (s.adUsed ? 2 : 1) - s.attempts;
}

export function canStart(s) { return attemptsLeft(s) > 0; }

export function startAttempt(s) {
  if (!canStart(s)) return false;
  s.attempts++;
  return true;
}

// Reklama ko'rib yana 1 urinish (kuniga bir marta).
export function grantAdAttempt(s) {
  if (s.adUsed) return false;
  s.adUsed = true;
  return true;
}

// Natijani yozish. Kunning birinchi o'yini seriyani oshiradi. Mukofot kerak bo'lsa qaytaradi.
export function finishAttempt(s, today, score) {
  let reward = null;
  if (s.lastDay !== today) {
    s.streak = s.lastDay === today - 1 ? s.streak + 1 : 1;
    s.lastDay = today;
    // seriya kuniga faqat bir marta oshadi, shuning uchun mukofot ham bir marta beriladi
    if (s.streak % STREAK_REWARD_DAY === 0) {
      s.claimed++;
      reward = { coins: 200, bomb: 1 };
    }
  }
  if (score > s.best) s.best = score;
  const prev = s.history[today] || 0;
  if (score > prev) s.history[today] = score;
  // tarixni cheklaymiz (oxirgi 60 kun)
  const keys = Object.keys(s.history).map(Number).sort((a, b) => a - b);
  while (keys.length > 60) delete s.history[keys.shift()];
  return reward;
}

export { SHAPES };
