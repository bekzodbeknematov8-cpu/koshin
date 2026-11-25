// Sarguzasht bosqichi ekrani: o'yin ekrani + yurishlar, maqsadlar, g'alaba/mag'lubiyat oynasi.
import { createGameScreen } from './gameScreen.js';
import { generateLevel, ADVENTURE_LEVELS } from '../logic/levels.js';
import { createLevelGame, levelPlace, goalValue, continueLevel, levelPowerup } from '../logic/levelGame.js';
import { UI, FONT } from '../render/palette.js';
import { t } from '../i18n.js';
import { drawObstacleIcon } from '../render/obstacles.js';
import { drawRoundButton, drawStar, drawIcon, hit, panel, drawCoin } from './widgets.js';
import { easeOutBack, easeOutCubic, clamp01 } from '../fx/ease.js';

export function goalIcon(ctx, type, x, y, s) {
  ctx.save();
  switch (type) {
    case 'score': drawStar(ctx, x, y, s, true); break;
    case 'lines':
      ctx.fillStyle = UI.gold;
      for (let i = 0; i < 4; i++) ctx.fillRect(x - s + i * s * 0.52, y - s * 0.3, s * 0.42, s * 0.6);
      break;
    default:
      drawObstacleIcon(ctx, type, x, y, s * 1.1, goalIcon.dpr || 1);
  }
  ctx.restore();
}
goalIcon.extra = {};

export function createLevelScreen(app, index, { onExit, onWin, onNext, extraHooks = {} }) {
  const level = generateLevel(index);
  goalIcon.dpr = app.dpr;
  let screen;
  const overButtons = (L, g) => {
    const cy = L.h * 0.62;
    if (g.status === 'won') return [{ id: 'map', icon: 'map', x: L.w / 2 - 70, y: cy }, { id: 'next', icon: 'play', x: L.w / 2 + 70, y: cy }];
    const list = [{ id: 'map', icon: 'map', x: L.w / 2 - 90, y: cy }, { id: 'retry', icon: 'retry', x: L.w / 2, y: cy }];
    if (!g.continued) list.push({ id: 'ad', icon: 'ad', x: L.w / 2 + 90, y: cy, badge: '+5' });
    return list;
  };

  const hooks = {
    createGame: () => createLevelGame(level),
    place: (g, i, r, c) => levelPlace(g, i, r, c),
    powerup: (g, apply) => levelPowerup(g, apply),
    hudHeight: 118,
    hideBest: true,
    ...extraHooks,
    drawHUD(ctx, L, g, now) {
      // ortga tugma
      drawRoundButton(ctx, 30, 30, 20, 'back', { fill: 'rgba(240,192,74,0.9)' });
      // shahar va bosqich
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = UI.text; ctx.font = `bold 15px ${FONT}`;
      const name = index < ADVENTURE_LEVELS ? `${t('city.' + level.city)} · ${level.num}` : `${t('city.eternal')} · ${level.num}`;
      ctx.fillText(name + (level.boss ? ' ★' : ''), L.w / 2, 20);
      // yurishlar medalyoni
      const mx = 54, my = 82;
      ctx.fillStyle = g.movesLeft <= 3 ? '#c0392b' : '#1f5fc8';
      ctx.beginPath(); ctx.arc(mx, my, 26, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = UI.gold; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = `bold 22px ${FONT}`;
      ctx.fillText(String(g.movesLeft), mx, my + 1);
      // maqsadlar
      const gs = g.goals;
      gs.forEach((goal, k) => {
        const gx = L.w - 60 - k * 92, gy = 82;
        const v = Math.min(goal.target, goalValue(g, goal));
        const done = v >= goal.target;
        ctx.fillStyle = 'rgba(8,12,36,0.7)';
        ctx.beginPath(); ctx.roundRect(gx - 42, gy - 24, 84, 48, 12); ctx.fill();
        goalIcon(ctx, goal.type, gx - 22, gy, 11);
        ctx.fillStyle = done ? UI.turq : UI.text; ctx.font = `bold 14px ${FONT}`; ctx.textAlign = 'left';
        ctx.fillText(done ? '✓' : `${v}/${goal.target}`, gx - 8, gy + 1);
        // progress chizig'i
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(gx - 34, gy + 15, 68, 4);
        ctx.fillStyle = done ? UI.turq : UI.gold; ctx.fillRect(gx - 34, gy + 15, 68 * (v / goal.target), 4);
        ctx.textAlign = 'center';
      });
      if (extraHooks.drawHUD) extraHooks.drawHUD(ctx, L, g, now);
    },
    pointerDown(x, y, L, g) {
      if (hit(x, y, 30, 30, 24)) { onExit(); return true; }
      return extraHooks.pointerDown ? extraHooks.pointerDown(x, y, L, g) : false;
    },
    onMove(g, res) {
      if (extraHooks.onMove) extraHooks.onMove(g, res);
      if (g.status === 'won') { app.sound && app.sound('win'); onWin && onWin(index, g.stars, g); }
      else if (g.status === 'lost') app.sound && app.sound('lose');
    },
    drawOver(ctx, L, g, dt) {
      const k = easeOutCubic(dt / 400);
      ctx.fillStyle = `rgba(5,10,30,${0.72 * k})`;
      ctx.fillRect(0, 0, L.w, L.h);
      const pw = Math.min(L.w - 40, 340), ph = 300, px = (L.w - pw) / 2, py = L.h * 0.62 - 230;
      ctx.save();
      ctx.globalAlpha = k;
      panel(ctx, px, py, pw, ph);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (g.status === 'won') {
        for (let s = 0; s < 3; s++) {
          const appear = clamp01((dt - 300 - s * 250) / 300);
          const sc = s < g.stars ? easeOutBack(appear, 2.5) : 1;
          ctx.save();
          ctx.translate(L.w / 2 + (s - 1) * 70, py + 70 - (s === 1 ? 12 : 0));
          ctx.scale(sc || 0.001, sc || 0.001);
          drawStar(ctx, 0, 0, 30, s < g.stars && appear > 0);
          ctx.restore();
        }
        ctx.fillStyle = UI.text; ctx.font = `bold 40px ${FONT}`;
        ctx.fillText(String(g.score), L.w / 2, py + 150);
        if (g.coinsEarned) {
          drawCoin(ctx, L.w / 2 - 24, py + 205, 12);
          ctx.fillStyle = UI.gold; ctx.font = `bold 22px ${FONT}`; ctx.textAlign = 'left';
          ctx.fillText('+' + g.coinsEarned, L.w / 2 - 6, py + 206);
          ctx.textAlign = 'center';
        }
      } else {
        ctx.fillStyle = UI.text; ctx.font = `bold 40px ${FONT}`;
        ctx.fillText(String(g.score), L.w / 2, py + 70);
        // qaysi maqsad bajarilmadi
        g.goals.forEach((goal, i) => {
          const gx = L.w / 2 + (i - (g.goals.length - 1) / 2) * 110;
          goalIcon(ctx, goal.type, gx - 30, py + 135, 12);
          ctx.fillStyle = UI.text; ctx.font = `bold 16px ${FONT}`; ctx.textAlign = 'left';
          ctx.fillText(`${Math.min(goal.target, goalValue(g, goal))}/${goal.target}`, gx - 14, py + 136);
          ctx.textAlign = 'center';
        });
        if (g.lostReason === 'moves') { ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(L.w / 2, py + 185, 16, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `bold 16px ${FONT}`; ctx.fillText('0', L.w / 2, py + 186); }
      }
      for (const b of overButtons(L, g)) drawRoundButton(ctx, b.x, b.y, 32, b.icon, { badge: b.badge });
      ctx.restore();
    },
    onOverTap(x, y, L, g) {
      for (const b of overButtons(L, g)) {
        if (!hit(x, y, b.x, b.y, 36)) continue;
        if (b.id === 'map') onExit();
        else if (b.id === 'next') onNext(index + 1);
        else if (b.id === 'retry') screen.restart();
        else if (b.id === 'ad') {
          const grant = () => { continueLevel(g, 5); app.requestFrame(); };
          if (app.ads && app.ads.showRewarded) app.ads.showRewarded('extra_moves', grant); else grant();
        }
      }
    },
  };
  screen = createGameScreen(app, hooks);
  screen.level = level;
  return screen;
}
