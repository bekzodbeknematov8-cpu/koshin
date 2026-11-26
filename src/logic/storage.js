// Saqlash: versiyali, xatoga chidamli, eski kalitlardan ko'chirish, zaxira nusxa (eksport/import).
// backend — localStorage'ga o'xshash obyekt ({ getItem, setItem, removeItem }); testlarda soxta backend.
import { createGame } from './game.js';
import { createObsGrid } from './obstacles.js';

export const SAVE_VERSION = 1;
export const PREFIX = 'koshin.';
export const KEYS = ['settings', 'progress', 'best', 'wallet', 'daily', 'stats', 'achievements', 'quests', 'login', 'endlessGame', 'ads', 'wheel'];

export function createStore(backend) {
  const mem = {};
  let broken = false;
  function get(k, def) {
    if (k in mem) return mem[k];
    let v = def;
    try {
      const raw = backend && backend.getItem(PREFIX + k);
      if (raw != null) v = JSON.parse(raw);
    } catch { v = def; }
    mem[k] = v;
    return v;
  }
  function set(k, v) {
    mem[k] = v;
    if (!backend || broken) return false;
    try { backend.setItem(PREFIX + k, JSON.stringify(v)); return true; }
    catch { broken = true; return false; } // to'lib qolgan yoki taqiqlangan — o'yin xotirada davom etadi
  }
  function remove(k) {
    delete mem[k];
    try { backend && backend.removeItem(PREFIX + k); } catch { /* e'tiborsiz */ }
  }
  function migrate() {
    const v = get('version', 0);
    if (v === SAVE_VERSION) return false;
    // v0 → v1: 'best' raqam sifatida, boshqalar o'zgarmaydi
    const best = Number(get('best', 0));
    set('best', Number.isFinite(best) && best >= 0 ? Math.floor(best) : 0);
    set('version', SAVE_VERSION);
    return true;
  }
  function exportAll() {
    const data = { v: SAVE_VERSION };
    for (const k of KEYS) { const x = get(k, undefined); if (x !== undefined) data[k] = x; }
    return encode(JSON.stringify(data));
  }
  function importAll(str) {
    let data;
    try { data = JSON.parse(decode(str)); } catch { return false; }
    if (!data || typeof data !== 'object' || data.v !== SAVE_VERSION) return false;
    for (const k of KEYS) if (k in data) set(k, data[k]);
    return true;
  }
  return { get, set, remove, migrate, exportAll, importAll, get broken() { return broken; } };
}

// UTF-8 xavfsiz base64
export function encode(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
export function decode(b64) {
  const bin = atob(b64.trim());
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// --- Cheksiz o'yinni saqlash va davom ettirish ---
export function serializeGame(g) {
  return {
    board: g.board, tray: g.tray, score: g.score, streak: g.streak, idle: g.idle, moves: g.moves,
    linesCleared: g.linesCleared, bestCombo: g.bestCombo, rng: g.rng.getState(), over: g.over,
  };
}

export function deserializeGame(data, opts = {}) {
  if (!data || !Array.isArray(data.board) || data.board.length !== 8 || !Array.isArray(data.tray) || data.over) return null;
  const okBoard = data.board.every((row) => Array.isArray(row) && row.length === 8 && row.every((v) => Number.isInteger(v) && v >= -2 && v < 5));
  if (!okBoard) return null;
  const okTray = data.tray.length === 3 && data.tray.every((p) => p === null || (p && Array.isArray(p.cells) && p.cells.length > 0 && Number.isInteger(p.color)));
  if (!okTray) return null;
  const g = createGame(1, opts);
  g.board = data.board.map((r) => r.slice());
  g.tray = data.tray.map((p) => (p ? { ...p, cells: p.cells.map((c) => c.slice()) } : null));
  for (const k of ['score', 'streak', 'idle', 'moves', 'linesCleared', 'bestCombo']) g[k] = Number.isFinite(data[k]) && data[k] >= 0 ? data[k] : 0;
  if (Number.isFinite(data.rng)) g.rng.setState(data.rng);
  g.over = false;
  if (g.tray.every((p) => p === null)) g.tray = createGame(data.rng || 1, opts).tray;
  return g;
}

export { createObsGrid };
