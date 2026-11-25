// Ipak Yo'li xaritasi: shaharlar, bosqich tugunlari, yulduzlar, binolar, qiziqarli faktlar.
import { CITIES, LEVELS_PER_CITY, ADVENTURE_LEVELS } from '../logic/levels.js';
import { cityCompleted, isUnlocked, totalStars } from '../logic/progress.js';
import { buildingCells, decoratedCount } from '../logic/buildings.js';
import { nodeDistance, cityHeaderDistance, nodeX, screenY, scrollFor, clampScroll, nodeAt, visibleCount, CITY_HEADER } from './mapLayout.js';
import { tileSprite } from '../render/tiles.js';
import { UI, FONT } from '../render/palette.js';
import { t } from '../i18n.js';
import { drawStar, drawRoundButton, wrapText, hit, drawIcon, drawCoin } from './widgets.js';

export function createMapScreen(app, { getProgress, onPlay, buttons = [], wallet }) {
  let w = 0, h = 0, scroll = 0, vel = 0;
  let touch = null; // { y0, s0, moved, t, lastY, lastT }
  let initialized = false;

  function layout(W, H) {
    w = W; h = H;
    const p = getProgress();
    if (!initialized) { scroll = scrollFor(Math.min(p.unlocked, visibleCount(p.unlocked) - 1), h, p.unlocked); initialized = true; }
    scroll = clampScroll(scroll, h, p.unlocked);
  }

  function focus(index) { const p = getProgress(); scroll = scrollFor(index, h, p.unlocked); }

  function drawBuilding(ctx, id, cx, cy, size, decorated, color) {
    const cells = buildingCells(id);
    const s = size / 8;
    const x0 = cx - size / 2, y0 = cy - size / 2;
    cells.forEach(([r, c], k) => {
      const x = x0 + c * s, y = y0 + r * s;
      if (k < decorated) ctx.drawImage(tileSprite((r * 3 + c) % 5, s * app.dpr), x, y, s, s);
      else { ctx.fillStyle = 'rgba(12,18,48,0.85)'; ctx.fillRect(x + 1, y + 1, s - 2, s - 2); ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.strokeRect(x + 1.5, y + 1.5, s - 3, s - 3); ctx.globalAlpha = 1; }
    });
  }

  function drawCityHeader(ctx, ci, p) {
    const city = ci < CITIES.length ? CITIES[ci] : { id: 'eternal', color: '#5a3a8e', accent: '#f0c04a' };
    const y = screenY(cityHeaderDistance(ci), scroll, h);
    if (y < -CITY_HEADER || y > h + CITY_HEADER) return;
    const pw = Math.min(w - 32, 420), px = (w - pw) / 2, ph = 210, py = y - ph / 2;
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = 'rgba(10,16,44,0.82)';
    ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 18); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = city.accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(px + 4, py + 4, pw - 8, ph - 8, 14); ctx.stroke();
    // nom lentasi
    ctx.fillStyle = city.color;
    ctx.beginPath(); ctx.roundRect(px + 20, py - 16, pw - 40, 36, 12); ctx.fill();
    ctx.fillStyle = '#fff8e6';
    ctx.font = `bold 20px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(t('city.' + city.id), w / 2, py + 2);
    // bino
    const bsize = 96;
    if (ci < CITIES.length) {
      const done = cityCompleted(p, ci);
      drawBuilding(ctx, city.building, px + 24 + bsize / 2, py + 40 + bsize / 2, bsize, decoratedCount(city.building, done), city.accent);
      ctx.fillStyle = UI.gold; ctx.font = `bold 14px ${FONT}`;
      ctx.fillText(`${done}/${LEVELS_PER_CITY}`, px + 24 + bsize / 2, py + 40 + bsize + 16);
    } else {
      ctx.save(); ctx.translate(px + 24 + bsize / 2, py + 40 + bsize / 2);
      drawIcon(ctx, 'infinity', 0, 0, 40, UI.gold); ctx.restore();
    }
    // fakt
    ctx.fillStyle = UI.text; ctx.font = `14px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    const tx = px + 24 + bsize + 16, tw = pw - (tx - px) - 20;
    const lines = wrapText(ctx, t('fact.' + city.id), tw).slice(0, 8);
    lines.forEach((ln, i) => ctx.fillText(ln, tx, py + 36 + i * 18));
    ctx.restore();
  }

  function draw(now, dt) {
    const ctx = app.ctx;
    const p = getProgress();
    if (!touch && Math.abs(vel) > 5) { scroll = clampScroll(scroll + vel * dt, h, p.unlocked); vel *= Math.pow(0.04, dt); } else if (!touch) vel = 0;
    app.paintBg();
    ctx.fillStyle = 'rgba(6,10,30,0.35)'; ctx.fillRect(0, 0, w, h);
    const n = visibleCount(p.unlocked);

    // yo'l (karvon yo'li — nuqtali chiziq)
    ctx.save();
    ctx.strokeStyle = 'rgba(240,192,74,0.55)'; ctx.lineWidth = 5; ctx.setLineDash([2, 12]); ctx.lineCap = 'round';
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < n; i++) {
      const y = screenY(nodeDistance(i), scroll, h);
      if (y < -200 || y > h + 200) { started = false; continue; }
      const x = nodeX(i, w);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      if (i % LEVELS_PER_CITY === LEVELS_PER_CITY - 1 && i < ADVENTURE_LEVELS) { ctx.stroke(); ctx.beginPath(); started = false; }
    }
    ctx.stroke();
    ctx.restore();

    for (let ci = 0; ci <= CITIES.length; ci++) drawCityHeader(ctx, ci, p);

    // tugunlar
    for (let i = 0; i < n; i++) {
      const y = screenY(nodeDistance(i), scroll, h);
      if (y < -40 || y > h + 40) continue;
      const x = nodeX(i, w);
      const open = isUnlocked(p, i);
      const boss = i < ADVENTURE_LEVELS && i % LEVELS_PER_CITY === LEVELS_PER_CITY - 1;
      const current = i === p.unlocked;
      const city = CITIES[Math.min(CITIES.length - 1, Math.floor(i / LEVELS_PER_CITY))];
      const r = boss ? 30 : 24;
      ctx.save();
      if (current) {
        const pulse = 1 + 0.08 * Math.sin(now / 200);
        ctx.fillStyle = 'rgba(240,192,74,0.25)';
        ctx.beginPath(); ctx.arc(x, y, r * 1.5 * pulse, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
      ctx.fillStyle = open ? (i < ADVENTURE_LEVELS ? city.color : '#5a3a8e') : '#2a3157';
      ctx.beginPath();
      if (boss) { for (let k = 0; k < 16; k++) { const a = (k * Math.PI) / 8, rr = k % 2 ? r * 0.82 : r; ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); }
      else ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = open ? UI.gold : 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, r - 4, 0, Math.PI * 2); ctx.stroke();
      if (open) {
        ctx.fillStyle = '#fff8e6'; ctx.font = `bold ${boss ? 18 : 16}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(i < ADVENTURE_LEVELS ? i + 1 : '∞' + (i - ADVENTURE_LEVELS + 1)), x, y + 1);
      } else drawIcon(ctx, 'lock', x, y, 10, 'rgba(255,255,255,0.35)');
      const st = p.stars[i] || 0;
      if (st) for (let k = 0; k < 3; k++) drawStar(ctx, x + (k - 1) * 14, y + r + 6 - (k === 1 ? 3 : 0), 7, k < st);
    }

    // yuqori panel: jami yulduzlar + tugmalar
    ctx.fillStyle = 'rgba(8,12,36,0.7)'; ctx.fillRect(0, 0, w, 58);
    drawStar(ctx, 26, 29, 12, true);
    ctx.fillStyle = UI.gold; ctx.font = `bold 18px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(String(totalStars(p)), 44, 30);
    if (wallet) {
      const sw = ctx.measureText(String(totalStars(p))).width;
      drawCoin(ctx, 64 + sw, 29, 11);
      ctx.fillStyle = UI.gold;
      ctx.fillText(String(wallet().coins), 80 + sw, 30);
    }
    buttons.forEach((b, k) => {
      const bx = w - 32 - k * 54;
      drawRoundButton(ctx, bx, 29, 21, b.icon, { badge: b.badge && b.badge() });
    });
  }

  return {
    layout, draw, focus,
    active() { return !!touch || Math.abs(vel) > 5; },
    pointerDown(x, y) {
      if (y < 58) {
        buttons.forEach((b, k) => { if (hit(x, y, w - 32 - k * 54, 29, 24)) b.onTap(); });
        return;
      }
      touch = { y0: y, s0: scroll, moved: false, x0: x, lastY: y, lastT: performance.now() };
      vel = 0;
    },
    pointerMove(x, y) {
      if (!touch) return;
      const dy = y - touch.y0;
      if (Math.abs(dy) > 8) touch.moved = true;
      const p = getProgress();
      scroll = clampScroll(touch.s0 + dy, h, p.unlocked);
      const now = performance.now();
      const dtm = Math.max(1, now - touch.lastT);
      vel = ((y - touch.lastY) / dtm) * 1000;
      touch.lastY = y; touch.lastT = now;
    },
    pointerUp(x, y) {
      if (!touch) return;
      const tc = touch; touch = null;
      if (!tc.moved) {
        vel = 0;
        const p = getProgress();
        const i = nodeAt(tc.x0, tc.y0, w, h, scroll, p.unlocked);
        if (i >= 0 && isUnlocked(p, i)) onPlay(i);
      }
    },
    pointerCancel() { touch = null; },
  };
}
