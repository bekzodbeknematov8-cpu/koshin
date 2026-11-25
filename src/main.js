// Ilova qobig'i: canvas, sahnalar (ekranlar), kirish hodisalari, kadr sikli.
import { createGameScreen } from './ui/gameScreen.js';
import { createMapScreen } from './ui/mapScreen.js';
import { createLevelScreen } from './ui/levelMode.js';
import { createProgress, recordResult, sanitizeProgress } from './logic/progress.js';
import { sanitizeWallet, addCoins, levelReward, endlessReward } from './logic/powerups.js';
import { pickLanguage, setLanguage } from './i18n.js';
import { drawRoundButton, hit } from './ui/widgets.js';
import { createDailyHub } from './ui/dailyMode.js';
import { sanitizeDailyState, canStart, rollDay, dayNumber } from './logic/daily.js';
import { submitScore } from './net/leaderboard.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const app = {
  canvas, ctx, dpr: 1, w: 0, h: 0,
  scene: null,
  vibrate(p) { try { if (app.settings.vibration !== false && navigator.vibrate) navigator.vibrate(p); } catch {} },
  sound: null,
  settings: {},
  // Reklama uchun joy: hozircha darhol mukofot beradi (haqiqiy SDK keyin ulanadi).
  ads: { showRewarded(placement, onReward) { onReward(); } },
  setScene(s) {
    app.scene = s;
    if (s.layout) s.layout(app.w, app.h);
    app.requestFrame();
  },
  requestFrame,
};

function resize() {
  app.dpr = Math.min(window.devicePixelRatio || 1, 2);
  app.w = window.innerWidth; app.h = window.innerHeight;
  canvas.width = Math.round(app.w * app.dpr); canvas.height = Math.round(app.h * app.dpr);
  canvas.style.width = app.w + 'px'; canvas.style.height = app.h + 'px';
  ctx.setTransform(app.dpr, 0, 0, app.dpr, 0, 0);
  if (app.scene && app.scene.layout) app.scene.layout(app.w, app.h);
}

let pending = false, last = 0;
function requestFrame() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(frame);
}
function frame(now) {
  pending = false;
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
  last = now;
  if (app.scene) {
    app.scene.draw(now, dt);
    if (app.scene.active && app.scene.active(now)) requestFrame();
    else last = 0;
  }
}

const pos = (e) => [e.clientX, e.clientY];
let activePointer = null;
canvas.addEventListener('pointerdown', (e) => {
  if (activePointer !== null) return; // bir vaqtda bitta barmoq
  activePointer = e.pointerId;
  try { canvas.setPointerCapture(e.pointerId); } catch {}
  app.scene && app.scene.pointerDown && app.scene.pointerDown(...pos(e));
  requestFrame();
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId !== activePointer) return;
  app.scene && app.scene.pointerMove && app.scene.pointerMove(...pos(e));
  requestFrame();
});
const up = (e) => {
  if (e.pointerId !== activePointer) return;
  activePointer = null;
  app.scene && app.scene.pointerUp && app.scene.pointerUp(...pos(e));
  requestFrame();
};
canvas.addEventListener('pointerup', up);
canvas.addEventListener('pointercancel', (e) => {
  if (e.pointerId !== activePointer) return;
  activePointer = null;
  app.scene && app.scene.pointerCancel && app.scene.pointerCancel();
  requestFrame();
});
window.addEventListener('resize', () => { resize(); requestFrame(); });

// --- saqlash (10-bosqichda kengaytiriladi) ---
const load = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

setLanguage(pickLanguage(navigator.languages || [navigator.language]));
let progress = sanitizeProgress(load('koshin.progress', createProgress()));
let best = Number(load('koshin.best', 0)) || 0;
const wallet = sanitizeWallet(load('koshin.wallet', null));
const saveWallet = () => save('koshin.wallet', wallet);
const walletHooks = { wallet: () => wallet, onWallet: saveWallet };
const daily = sanitizeDailyState(load('koshin.daily', null));
const saveDaily = () => save('koshin.daily', daily);

resize();

function openMap(focusIndex) {
  if (focusIndex !== undefined) map.focus(focusIndex);
  app.setScene(map);
}

function openLevel(index) {
  app.setScene(createLevelScreen(app, index, {
    onExit: () => openMap(index),
    onWin: (i, stars, g) => {
      const first = !progress.stars[i];
      recordResult(progress, i, stars); save('koshin.progress', progress);
      // tanga: birinchi o'tishda to'liq, qayta o'tishda yarmi
      const coins = Math.round(levelReward(stars, g.level.boss) * (first ? 1 : 0.5));
      addCoins(wallet, coins); saveWallet();
      g.coinsEarned = coins;
    },
    onNext: (i) => openLevel(i),
    extraHooks: walletHooks,
  }));
}

function openEndless() {
  const screen = createGameScreen(app, {
    best: () => best,
    bestX: 60,
    ...walletHooks,
    onMove(game) { if (game.score > best) { best = game.score; save('koshin.best', best); } },
    onOver(game) { addCoins(wallet, endlessReward(game.score)); saveWallet(); submitScore('endless', { score: game.score }); },
    pointerDown(x, y) { if (hit(x, y, 30, 30, 24)) { openMap(); return true; } return false; },
    drawHUD(c) { drawRoundButton(c, 30, 30, 20, 'back', { fill: 'rgba(240,192,74,0.9)' }); },
  });
  app.setScene(screen);
}

function openDaily() {
  app.setScene(createDailyHub(app, { getState: () => daily, saveState: saveDaily, wallet, onWallet: saveWallet, onBack: () => openMap() }));
}

const map = createMapScreen(app, {
  getProgress: () => progress,
  onPlay: openLevel,
  buttons: [
    { icon: 'infinity', onTap: openEndless },
    { icon: 'calendar', onTap: openDaily, badge: () => (canStart(rollDay(daily, dayNumber())) ? '!' : null) },
  ],
  wallet: () => wallet,
});
openMap();

window.__koshin = () => {
  const g = app.scene && app.scene.game;
  return g ? { score: g.score, moves: g.moves, over: g.over, status: g.status } : { scene: 'map' };
};
window.__app = app;
window.__open = { level: openLevel, endless: openEndless, map: openMap, daily: openDaily };
