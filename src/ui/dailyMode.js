// Kunlik Naqsh: markaz (seriya, urinishlar, ulashish) va o'yin ekrani.
import { createGameScreen, drawFlame } from './gameScreen.js';
import {
  dayNumber, createDailyGame, dailyPlace, shareText, rollDay, canStart, startAttempt, grantAdAttempt,
  attemptsLeft, finishAttempt, DAILY_TRAYS, STREAK_REWARD_DAY,
} from '../logic/daily.js';
import { backgroundCanvas } from '../render/background.js';
import { UI, FONT } from '../render/palette.js';
import { drawRoundButton, hit, panel, drawCoin, drawIcon } from './widgets.js';
import { easeOutCubic } from '../fx/ease.js';
import { submitScore } from '../net/leaderboard.js';

export async function shareResult(text) {
  try {
    if (navigator.share) { await navigator.share({ text }); return 'shared'; }
  } catch { /* bekor qilindi */ }
  try {
    if (navigator.clipboard) { await navigator.clipboard.writeText(text); return 'copied'; }
  } catch { /* ruxsat yo'q */ }
  return 'failed';
}

function drawStreak(ctx, cx, y, s) {
  // 7 ta nuqta: seriyaning joriy haftasi, 7-si sovg'a
  const k = s.streak % STREAK_REWARD_DAY;
  const filled = s.streak > 0 && k === 0 ? STREAK_REWARD_DAY : k;
  for (let i = 0; i < STREAK_REWARD_DAY; i++) {
    const x = cx + (i - 3) * 34;
    const on = i < filled;
    ctx.fillStyle = on ? UI.gold : 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.arc(x, y, i === 6 ? 13 : 10, 0, Math.PI * 2); ctx.fill();
    if (i === 6) drawCoin(ctx, x, y, 7);
  }
}

export function createDailyHub(app, { getState, saveState, wallet, onWallet, onBack, onFinish }) {
  let w = 0, h = 0, toast = null;
  const today = () => dayNumber(new Date());

  function buttons() {
    const s = getState();
    const list = [{ id: 'back', icon: 'back', x: 30, y: 30, r: 20 }];
    const cy = h * 0.72;
    if (canStart(s)) list.push({ id: 'play', icon: 'play', x: w / 2, y: cy, r: 40 });
    else if (!s.adUsed) list.push({ id: 'ad', icon: 'ad', x: w / 2, y: cy, r: 36, badge: '+1' });
    if (s.attempts > 0 && s.best >= 0 && s.history[today()] !== undefined) list.push({ id: 'share', icon: 'share', x: w / 2 + 100, y: cy, r: 28 });
    return list;
  }

  function play() {
    const s = getState();
    if (!startAttempt(s)) return;
    saveState();
    app.setScene(createDailyGameScreen(app, today(), {
      onDone(game) {
        const prevBest = s.history[today()];
        const reward = finishAttempt(s, today(), game.score);
        if (prevBest === undefined || game.score >= prevBest) s.lastLines = game.trayLines.slice();
        if (reward) { wallet.coins += reward.coins; wallet.inv.bomb = (wallet.inv.bomb || 0) + reward.bomb; onWallet(); game.reward = reward; }
        saveState();
        submitScore('daily', { day: today(), score: game.score });
        if (onFinish) onFinish(game, s);
      },
      onExit: () => app.setScene(hub),
    }));
  }

  const hub = {
    layout(W, H) { w = W; h = H; rollDay(getState(), today()); saveState(); },
    draw(now) {
      const ctx = app.ctx;
      const s = getState();
      ctx.drawImage(backgroundCanvas(w, h, app.dpr), 0, 0, w, h);
      const pw = Math.min(w - 32, 360), px = (w - pw) / 2, py = h * 0.14, ph = h * 0.48;
      panel(ctx, px, py, pw, ph);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      drawIcon(ctx, 'calendar', w / 2, py + 50, 26, UI.gold);
      ctx.fillStyle = UI.text; ctx.font = `bold 30px ${FONT}`;
      ctx.fillText('#' + today(), w / 2, py + 105);
      // seriya
      ctx.save(); ctx.translate(w / 2 - 26, py + 160); drawFlame(ctx, 0, 0, 16); ctx.restore();
      ctx.fillStyle = UI.gold; ctx.font = `bold 26px ${FONT}`; ctx.textAlign = 'left';
      ctx.fillText(String(s.streak), w / 2 - 4, py + 162);
      ctx.textAlign = 'center';
      drawStreak(ctx, w / 2, py + 215, s);
      if (s.history[today()] !== undefined) {
        ctx.fillStyle = UI.text; ctx.font = `bold 22px ${FONT}`;
        ctx.fillText(String(s.history[today()]), w / 2, py + ph - 40);
      }
      // urinishlar
      for (let i = 0; i < attemptsLeft(s); i++) { ctx.fillStyle = UI.turq; ctx.beginPath(); ctx.arc(w / 2 + (i - (attemptsLeft(s) - 1) / 2) * 18, py + ph - 14, 5, 0, Math.PI * 2); ctx.fill(); }
      for (const b of buttons()) drawRoundButton(ctx, b.x, b.y, b.r, b.icon, { badge: b.badge, fill: b.id === 'back' ? 'rgba(240,192,74,0.9)' : undefined });
      if (toast && now - toast.t < 1500) {
        ctx.globalAlpha = 1 - (now - toast.t) / 1500;
        ctx.fillStyle = UI.turq; ctx.font = `bold 28px ${FONT}`;
        ctx.fillText(toast.text, w / 2, h * 0.84);
        ctx.globalAlpha = 1;
      }
    },
    active(now) { return !!toast && now - toast.t < 1500; },
    pointerDown(x, y) {
      for (const b of buttons()) {
        if (!hit(x, y, b.x, b.y, b.r + 6)) continue;
        const s = getState();
        if (b.id === 'back') onBack();
        else if (b.id === 'play') play();
        else if (b.id === 'ad') app.ads.showRewarded('daily_attempt', () => { grantAdAttempt(s); saveState(); app.requestFrame(); });
        else if (b.id === 'share') {
          const text = shareText(today(), s.history[today()], s.lastLines || []);
          shareResult(text).then((r) => { toast = { text: r === 'failed' ? '✗' : '✓', t: performance.now() }; app.requestFrame(); });
        }
        return;
      }
    },
  };
  return hub;
}

export function createDailyGameScreen(app, day, { onDone, onExit }) {
  let screen, shareToast = null;
  const overButtons = (L) => [
    { id: 'back', icon: 'map', x: L.w / 2 - 60, y: L.h * 0.66 },
    { id: 'share', icon: 'share', x: L.w / 2 + 60, y: L.h * 0.66 },
  ];
  screen = createGameScreen(app, {
    createGame: () => createDailyGame(day),
    place: (g, i, r, c) => dailyPlace(g, i, r, c),
    hudHeight: 100,
    hideBest: true,
    drawHUD(ctx, L, g) {
      drawRoundButton(ctx, 30, 30, 20, 'back', { fill: 'rgba(240,192,74,0.9)' });
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = UI.text; ctx.font = `bold 16px ${FONT}`;
      ctx.fillText('#' + day, L.w / 2, 22);
      // qolgan shakllar (tray'lar)
      const left = DAILY_TRAYS - g.trayLines.length + 1;
      for (let i = 0; i < DAILY_TRAYS; i++) {
        ctx.fillStyle = i < left ? UI.gold : 'rgba(255,255,255,0.15)';
        ctx.fillRect(L.w / 2 + (i - DAILY_TRAYS / 2) * 14, 40, 10, 6);
      }
    },
    pointerDown(x, y) {
      if (hit(x, y, 30, 30, 24)) { onExit(); return true; }
      return false;
    },
    onMove(g, res) {
      if (g.over && !g.done) {
        g.done = true;
        onDone(g);
        // ulashish uchun tray natijalari
        g.share = shareText(day, g.score, g.trayLines);
      }
    },
    drawOver(ctx, L, g, dt) {
      const k = easeOutCubic(dt / 400);
      ctx.fillStyle = `rgba(5,10,30,${0.72 * k})`; ctx.fillRect(0, 0, L.w, L.h);
      ctx.save(); ctx.globalAlpha = k;
      const pw = Math.min(L.w - 40, 340), px = (L.w - pw) / 2, py = L.h * 0.25;
      panel(ctx, px, py, pw, L.h * 0.5);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = UI.text; ctx.font = `bold 20px ${FONT}`;
      ctx.fillText('#' + day, L.w / 2, py + 36);
      ctx.font = `bold 48px ${FONT}`;
      ctx.fillText(String(g.score), L.w / 2, py + 95);
      // emoji to'r o'rniga rangli kvadratlar
      g.trayLines.forEach((n, i) => {
        ctx.fillStyle = n >= 2 ? UI.gold : n === 1 ? '#1f5fc8' : 'rgba(255,255,255,0.25)';
        ctx.fillRect(L.w / 2 + (i - g.trayLines.length / 2) * 22, py + 140, 18, 18);
      });
      if (g.reward) { drawCoin(ctx, L.w / 2 - 30, py + 190, 12); ctx.fillStyle = UI.gold; ctx.font = `bold 22px ${FONT}`; ctx.fillText('+' + g.reward.coins, L.w / 2 + 10, py + 191); }
      for (const b of overButtons(L)) drawRoundButton(ctx, b.x, b.y, 32, b.icon);
      if (shareToast && performance.now() - shareToast.t < 1500) { ctx.fillStyle = UI.turq; ctx.font = `bold 26px ${FONT}`; ctx.fillText(shareToast.text, L.w / 2, L.h * 0.66 + 60); }
      ctx.restore();
    },
    onOverTap(x, y, L, g) {
      for (const b of overButtons(L)) {
        if (!hit(x, y, b.x, b.y, 36)) continue;
        if (b.id === 'back') onExit();
        else shareResult(g.share || shareText(day, g.score, g.trayLines)).then((r) => { shareToast = { text: r === 'failed' ? '✗' : '✓', t: performance.now() }; app.requestFrame(); });
      }
    },
  });
  return screen;
}
