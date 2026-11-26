// Ilova qobig'i: canvas, sahnalar (ekranlar), kirish hodisalari, kadr sikli.
import { createGameScreen } from './ui/gameScreen.js';
import { backgroundCanvas } from './render/background.js';
import { createGame } from './logic/game.js';
import { createMapScreen } from './ui/mapScreen.js';
import { createLevelScreen } from './ui/levelMode.js';
import { createProgress, recordResult, recordFail, helpMoves, sanitizeProgress } from './logic/progress.js';
import { sanitizeWallet, addCoins, levelReward, endlessReward } from './logic/powerups.js';
import { pickLanguage, setLanguage, t } from './i18n.js';
import { createSound } from './audio/sound.js';
import { createStore, serializeGame, deserializeGame } from './logic/storage.js';
import { createMenu, createSettings, createQuestsScreen, createAchievementsScreen } from './ui/menuScreens.js';
import { sanitizeStats, eventsFromMove, applyStatEvents, checkAchievements, rollQuests, trackQuests, claimableCount, createLogin, checkLogin } from './logic/meta.js';
import { drawIcon } from './ui/widgets.js';
import { UI, FONT } from './render/palette.js';
import { drawRoundButton, hit } from './ui/widgets.js';
import { createDailyHub } from './ui/dailyMode.js';
import { sanitizeDailyState, canStart, rollDay, dayNumber } from './logic/daily.js';
import { submitScore } from './net/leaderboard.js';
import { createAdManager } from './ads/adManager.js';
import { sanitizeAdState, FREE_COINS } from './logic/ads.js';
import { sanitizeWheelState, canSpinFree } from './logic/wheel.js';
import { reviveGame } from './logic/revive.js';
import { createWheelScreen } from './ui/wheelScreen.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
// Fon alohida qatlamda (bir marta chiziladi) — har kadrda katta rasmni qayta chizmaslik uchun.
const bgCanvas = document.getElementById('bg');
const bgCtx = bgCanvas ? bgCanvas.getContext('2d', { alpha: false }) : null;
let bgKey = '';

const toasts = [];
const app = {
  canvas, ctx, dpr: 1, w: 0, h: 0,
  scene: null,
  vibrate(p) { try { if (app.settings.vibration !== false && navigator.vibrate) navigator.vibrate(p); } catch {} },
  sound: null, // (name) => ovoz effekti
  sfx(name) { app.sound && app.sound(name); },
  audio: null,
  toast(text, icon = 'trophy') { toasts.push({ text, icon, t: performance.now() }); requestFrame(); },
  settings: {},
  ads: null, // createAdManager (pastda)
  adOverlay: null, // demo reklama oynasi
  setScene(s) {
    app.scene = s;
    if (s.layout) s.layout(app.w, app.h);
    app.requestFrame();
  },
  requestFrame,
  paintBg() {
    const key = `${app.w}x${app.h}@${app.dpr}`;
    if (bgCtx && bgKey !== key) {
      bgKey = key;
      bgCanvas.width = Math.round(app.w * app.dpr); bgCanvas.height = Math.round(app.h * app.dpr);
      bgCanvas.style.width = app.w + 'px'; bgCanvas.style.height = app.h + 'px';
      bgCtx.drawImage(backgroundCanvas(app.w, app.h, app.dpr), 0, 0, bgCanvas.width, bgCanvas.height);
    }
    if (bgCtx) ctx.clearRect(0, 0, app.w, app.h);
    else ctx.drawImage(backgroundCanvas(app.w, app.h, app.dpr), 0, 0, app.w, app.h);
  },
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
    if (app.adOverlay) drawAdOverlay(now);
    const toastOn = drawToasts(now) || !!app.adOverlay;
    if ((app.scene.active && app.scene.active(now)) || toastOn) requestFrame();
    else last = 0;
  }
}

// Demo reklama oynasi (ADS_CONFIG.provider = 'demo'): haqiqiy reklama o'rnida sinov uchun.
const AD_DEMO_MS = 3000;
function drawAdOverlay(now) {
  const o = app.adOverlay;
  const left = Math.max(0, Math.ceil((AD_DEMO_MS - (now - o.t)) / 1000));
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.92)'; ctx.fillRect(0, 0, app.w, app.h);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = UI.gold; ctx.font = `bold 28px ${FONT}`;
  ctx.fillText(t('ad.label') + (o.kind === 'reward' ? ' ▶' : ''), app.w / 2, app.h * 0.42);
  ctx.fillStyle = UI.text; ctx.font = `bold 18px ${FONT}`;
  ctx.fillText(left > 0 ? String(left) : t('ad.tapClose'), app.w / 2, app.h * 0.52);
  ctx.restore();
}
function adOverlayTap() {
  const o = app.adOverlay;
  if (performance.now() - o.t < AD_DEMO_MS) return;
  app.adOverlay = null;
  o.done(true);
}

const pos = (e) => [e.clientX, e.clientY];
let activePointer = null;
canvas.addEventListener('pointerdown', (e) => {
  if (activePointer !== null) return; // bir vaqtda bitta barmoq
  activePointer = e.pointerId;
  try { canvas.setPointerCapture(e.pointerId); } catch {}
  if (app.audio && !app.audio.started) app.audio.unlock(); // ovozga ruxsat faqat teginishdan keyin
  if (app.adOverlay) { adOverlayTap(); requestFrame(); return; }
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
let backend = null;
try { backend = window.localStorage; } catch { backend = null; }
const store = createStore(backend);
store.migrate();
const load = (k, d) => store.get(k.replace(/^koshin\./, ''), d);
const save = (k, v) => store.set(k.replace(/^koshin\./, ''), v);

// Yutuq va xabarlar lentasi (har qanday ekran ustida)
function drawToasts(now) {
  while (toasts.length && now - toasts[0].t > 2600) toasts.shift();
  if (!toasts.length) return false;
  const tt = toasts[0];
  const k = Math.min(1, (now - tt.t) / 250, (2600 - (now - tt.t)) / 250);
  const w = Math.min(app.w - 24, 360), x = (app.w - w) / 2, y = -60 + 76 * k;
  ctx.save();
  ctx.fillStyle = 'rgba(19,36,89,0.96)';
  ctx.beginPath(); ctx.roundRect(x, y, w, 50, 14); ctx.fill();
  ctx.strokeStyle = UI.gold; ctx.lineWidth = 1.5; ctx.stroke();
  drawIcon(ctx, tt.icon, x + 30, y + 25, 12, UI.gold);
  ctx.fillStyle = UI.text; ctx.font = `bold 16px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(tt.text, x + 54, y + 26);
  ctx.restore();
  return true;
}

const settings = Object.assign({ sound: true, music: true, vibration: true, lang: null }, load('koshin.settings', {}) || {});
app.settings = settings;
setLanguage(settings.lang || pickLanguage(navigator.languages || [navigator.language]));
const audio = createSound(settings);
app.audio = audio;
app.sound = (name) => audio.play(name);
document.addEventListener('visibilitychange', () => { if (document.hidden) { audio.pause(); saveEndless(); } else if (audio.started) audio.resume(); });

let progress = sanitizeProgress(load('koshin.progress', createProgress()));
let best = Number(load('koshin.best', 0)) || 0;
const wallet = sanitizeWallet(load('koshin.wallet', null));
const saveWallet = () => save('koshin.wallet', wallet);
const walletHooks = { wallet: () => wallet, onWallet: saveWallet };
const daily = sanitizeDailyState(load('koshin.daily', null));
const saveDaily = () => save('koshin.daily', daily);
const stats = sanitizeStats(load('koshin.stats', null));
const unlocked = load('koshin.achievements', {}) || {};
let quests = rollQuests(load('koshin.quests', null), dayNumber());
const login = Object.assign(createLogin(), load('koshin.login', {}) || {});
const adState = sanitizeAdState(load('koshin.ads', null));
const wheelState = sanitizeWheelState(load('koshin.wheel', null));
app.ads = createAdManager({
  state: adState, save: () => save('koshin.ads', adState), day: dayNumber, audio,
  onDemo: (o) => { app.adOverlay = { ...o, t: performance.now() }; requestFrame(); },
});
app.ads.init();
const adFail = (why) => app.toast(t(why === 'limit' ? 'ad.limit' : 'ad.fail'), 'ad');
const saveMeta = () => { save('koshin.stats', stats); save('koshin.achievements', unlocked); save('koshin.quests', quests); };

// Hodisalarni statistika, topshiriqlar va yutuqlarga yo'naltirish
function record(events) {
  quests = rollQuests(quests, dayNumber());
  applyStatEvents(stats, events);
  trackQuests(quests, events);
  for (const a of checkAchievements(stats, unlocked)) {
    addCoins(wallet, a.coins); saveWallet();
    app.toast(t('ach.' + a.id) + '  +' + a.coins);
    app.sfx('coin');
  }
  saveMeta();
}
app.track = (res) => record(eventsFromMove(res));

resize();

function openMenu() { audio.setTheme('menu'); app.setScene(menu); }

function openMap(focusIndex) {
  if (focusIndex !== undefined) map.focus(focusIndex);
  audio.setTheme('menu');
  app.setScene(map);
}

function openLevel(index) {
  const lv = createLevelScreen(app, index, {
    onExit: () => openMap(index),
    onWin: (i, stars, g) => {
      const prevStars = progress.stars[i] || 0;
      recordResult(progress, i, stars); save('koshin.progress', progress);
      // tanga: birinchi o'tishda to'liq, qayta o'tishda yarmi
      const coins = Math.round(levelReward(stars, g.level.boss) * (prevStars ? 0.5 : 1));
      addCoins(wallet, coins); saveWallet();
      g.coinsEarned = coins;
      const ev = [{ type: 'levelsWon', n: 1 }, { type: 'stars', n: Math.max(0, stars - prevStars) }];
      if (g.level.boss && !prevStars) ev.push({ type: 'bosses', n: 1 });
      record(ev);
    },
    onLose: (i) => { recordFail(progress, i); save('koshin.progress', progress); },
    bonusMoves: () => helpMoves(progress, index),
    onNext: (i) => app.ads.levelBreak(() => openLevel(i)),
    onLeave: (go) => app.ads.levelBreak(go),
    onDouble: (g) => {
      if (!g.coinsEarned || g.doubled) return;
      app.ads.showRewarded('double_coins', () => {
        addCoins(wallet, g.coinsEarned); saveWallet();
        g.coinsEarned *= 2; g.doubled = true;
        app.sfx('coin'); app.requestFrame();
      }, adFail);
    },
    canDouble: () => app.ads.canShow('double_coins'),
    adFail,
    extraHooks: walletHooks,
  });
  audio.setTheme(lv.level.city || 'eternal');
  app.setScene(lv);
}

let endlessScreen = null;
function saveEndless() {
  const g = endlessScreen && endlessScreen.game;
  if (!g) return;
  if (g.over) store.remove('endlessGame'); else save('koshin.endlessGame', serializeGame(g));
}
function openEndless() {
  const resumed = deserializeGame(load('koshin.endlessGame', null));
  let first = true;
  const screen = createGameScreen(app, {
    createGame: () => {
      const g = first && resumed;
      first = false;
      return g || createGame(Date.now());
    },
    best: () => best,
    bestX: 60,
    ...walletHooks,
    onMove(game) { if (game.score > best) { best = game.score; save('koshin.best', best); } saveEndless(); },
    onRestart() { store.remove('endlessGame'); },
    onOver(game) {
      store.remove('endlessGame');
      // ikkinchi imkoniyatdan keyin tanga faqat yangi ochko uchun
      const coins = endlessReward(game.score) - endlessReward(game.paidScore || 0);
      game.paidScore = game.score;
      addCoins(wallet, coins); saveWallet();
      submitScore('endless', { score: game.score });
      record([{ type: 'endlessBest', max: game.score }]);
      app.sfx('lose');
    },
    canRevive: (game) => !game.revived && app.ads.canShow('revive'),
    onRevive(game, done) {
      app.ads.showRewarded('revive', () => {
        const res = reviveGame(game);
        if (res) { app.sfx('revive'); done(res); saveEndless(); }
      }, adFail);
    },
    pointerDown(x, y) { if (hit(x, y, 30, 30, 24)) { saveEndless(); openMenu(); return true; } return false; },
    drawHUD(c) { drawRoundButton(c, 30, 30, 20, 'back', { fill: 'rgba(240,192,74,0.9)' }); },
  });
  endlessScreen = screen;
  audio.setTheme('eternal');
  app.setScene(screen);
}

function openDaily(back = openMenu) {
  audio.setTheme('daily');
  app.setScene(createDailyHub(app, {
    getState: () => daily, saveState: saveDaily, wallet, onWallet: saveWallet, onBack: () => back(),
    onFinish: (game, s) => record([{ type: 'dailyPlayed', n: 1 }, { type: 'dailyStreakBest', max: s.streak }]),
  }));
}

function openSettings() {
  app.setScene(createSettings(app, {
    settings,
    onChange(key) {
      save('koshin.settings', settings);
      if (key === 'lang') setLanguage(settings.lang);
      if (key === 'music') { if (settings.music) audio.startMusic(); else audio.stopMusic(); }
      if (key === 'vibration' && settings.vibration) app.vibrate(30);
      if (key === 'sound' && settings.sound) app.sfx('button');
    },
    onBack: openMenu,
    // zaxira kodi: nusxa olish / boshqa telefondan joylash
    async onExport() {
      const code = store.exportAll();
      try { if (navigator.share) { await navigator.share({ text: code }); return true; } } catch {}
      try { await navigator.clipboard.writeText(code); return true; } catch { return false; }
    },
    onImport() {
      const code = window.prompt('Koshin backup code');
      if (!code) return false;
      if (!store.importAll(code)) return false;
      location.reload();
      return true;
    },
  }));
}

function openQuests() {
  quests = rollQuests(quests, dayNumber());
  app.setScene(createQuestsScreen(app, { getQuests: () => quests, wallet, onClaim: () => { saveWallet(); saveMeta(); }, onBack: openMenu }));
}

function openWheel() {
  app.setScene(createWheelScreen(app, {
    getState: () => wheelState, saveState: () => save('koshin.wheel', wheelState), wallet, onWallet: saveWallet, day: dayNumber, onBack: openMenu,
  }));
}

function freeCoins() {
  app.ads.showRewarded('free_coins', () => {
    addCoins(wallet, FREE_COINS); saveWallet();
    app.sfx('coin'); app.toast('+' + FREE_COINS, 'coin');
  }, adFail);
}

function openAchievements() {
  app.setScene(createAchievementsScreen(app, { getStats: () => stats, unlocked, onBack: openMenu }));
}

const map = createMapScreen(app, {
  getProgress: () => progress,
  onPlay: openLevel,
  buttons: [
    { icon: 'home', onTap: openMenu },
    { icon: 'calendar', onTap: () => openDaily(() => openMap()), badge: () => (canStart(rollDay(daily, dayNumber())) ? '!' : null) },
    { icon: 'infinity', onTap: openEndless },
  ],
  wallet: () => wallet,
});

const menu = createMenu(app, {
  wallet: () => wallet,
  badges: {
    daily: () => (canStart(rollDay(daily, dayNumber())) ? '!' : null),
    quests: () => { quests = rollQuests(quests, dayNumber()); const n = claimableCount(quests); return n || null; },
    wheel: () => (canSpinFree(wheelState, dayNumber()) ? '!' : null),
    freeCoins: () => (app.ads.canShow('free_coins') ? '+' + FREE_COINS : null),
  },
  on: { play: () => openMap(), daily: () => openDaily(), endless: openEndless, quests: openQuests, achievements: openAchievements, settings: openSettings, wheel: openWheel, freeCoins },
});
openMenu();

// Kunlik kirish sovg'asi
{
  const gift = checkLogin(login, dayNumber());
  if (gift) {
    save('koshin.login', login);
    addCoins(wallet, gift.coins);
    if (gift.bomb) wallet.inv.bomb += gift.bomb;
    saveWallet();
    menu.showPopup({ icon: 'gift', title: t('login.title'), sub: t('login.day').replace('{n}', gift.day), coins: gift.coins });
  }
}

window.__koshin = () => {
  const g = app.scene && app.scene.game;
  return g ? { score: g.score, moves: g.moves, over: g.over, status: g.status } : { scene: app.scene === map ? 'map' : app.scene === menu ? 'menu' : 'other' };
};
window.__app = app;
window.__open = { level: openLevel, endless: openEndless, map: openMap, daily: openDaily, menu: openMenu, settings: openSettings, quests: openQuests, achievements: openAchievements, wheel: openWheel };

// PWA: internetsiz ishlash uchun service worker
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol) && !window.__noSW) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
