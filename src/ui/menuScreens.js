// Bosh menyu, sozlamalar, topshiriqlar, yutuqlar va kunlik sovg'a oynasi.
import { tileSprite, star as starPath } from '../render/tiles.js';
import { UI, FONT } from '../render/palette.js';
import { t, tf, LANGS, LANG_NAMES, getLanguage } from '../i18n.js';
import { drawRoundButton, drawIcon, hit, panel, drawCoin, wrapText } from './widgets.js';
import { ACHIEVEMENTS, achievementProgress, claimQuest } from '../logic/meta.js';
import { easeOutBack, clamp01 } from '../fx/ease.js';

function title(ctx, w, y, size = 54) {
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `bold ${size}px ${FONT}`;
  ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(10,16,50,0.8)';
  ctx.strokeText(t('title'), w / 2, y);
  const g = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
  g.addColorStop(0, '#ffe9a0'); g.addColorStop(1, '#d9a62e');
  ctx.fillStyle = g;
  ctx.fillText(t('title'), w / 2, y);
  ctx.font = `bold 16px ${FONT}`;
  ctx.fillStyle = UI.turq;
  ctx.fillText(t('subtitle'), w / 2, y + size * 0.72);
  ctx.restore();
}

function backBtn(ctx) { drawRoundButton(ctx, 30, 30, 20, 'back', { fill: 'rgba(240,192,74,0.9)' }); }

export function createMenu(app, opts) {
  let w = 0, h = 0, popup = null, popT = 0;
  const items = () => {
    const cy = h * 0.6;
    const k = Math.min(1, h / 760); // kichik ekranlarda tugmalar kichrayadi
    return [
      { id: 'play', icon: 'play', x: w / 2, y: h * 0.42, r: 52 * k, label: 'menu.play' },
      { id: 'daily', icon: 'calendar', x: w / 2 - 80, y: cy, r: 32 * k, label: 'menu.daily', badge: opts.badges.daily },
      { id: 'endless', icon: 'infinity', x: w / 2 + 80, y: cy, r: 32 * k, label: 'menu.endless' },
      { id: 'quests', icon: 'list', x: w / 2 - 100, y: h * 0.78, r: 26 * k, label: 'menu.quests', badge: opts.badges.quests },
      { id: 'achievements', icon: 'trophy', x: w / 2, y: h * 0.78, r: 26 * k, label: 'menu.achievements' },
      { id: 'settings', icon: 'gear', x: w / 2 + 100, y: h * 0.78, r: 26 * k, label: 'menu.settings' },
    ];
  };
  return {
    layout(W, H) { w = W; h = H; },
    showPopup(p) { popup = p; popT = performance.now(); app.requestFrame(); },
    draw(now) {
      const ctx = app.ctx;
      app.paintBg();
      // bezak: aylanayotgan koshinlar
      const s = Math.min(w, 420) / 9;
      for (let i = 0; i < 5; i++) {
        const a = now / 4000 + (i * Math.PI * 2) / 5;
        const x = w / 2 + Math.cos(a) * Math.min(w * 0.36, 160), y = h * 0.2 - 62 + Math.sin(a) * 12;
        ctx.globalAlpha = 0.85;
        ctx.drawImage(tileSprite(i, s * app.dpr), x - s / 2, y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      title(ctx, w, h * 0.2);
      // tangalar
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.font = `bold 18px ${FONT}`; ctx.fillStyle = UI.gold;
      const coins = String(opts.wallet().coins);
      ctx.fillText(coins, w - 16, 28);
      drawCoin(ctx, w - 30 - ctx.measureText(coins).width, 28, 11);
      for (const b of items()) {
        const pulse = b.id === 'play' ? 1 + 0.04 * Math.sin(now / 300) : 1;
        drawRoundButton(ctx, b.x, b.y, b.r * pulse, b.icon, { badge: b.badge && b.badge() });
        ctx.fillStyle = UI.text; ctx.font = `bold ${b.id === 'play' ? 18 : 13}px ${FONT}`; ctx.textAlign = 'center';
        ctx.fillText(t(b.label), b.x, b.y + b.r + 14);
      }
      if (popup) drawPopup(ctx, now);
    },
    active() { return true; },
    pointerDown(x, y) {
      app.audio && app.audio.unlock();
      if (popup) {
        if (performance.now() - popT > 400) { const p = popup; popup = null; p.onClose && p.onClose(); }
        return;
      }
      for (const b of items()) if (hit(x, y, b.x, b.y, b.r + 8)) { app.sfx('button'); opts.on[b.id](); return; }
    },
  };

  function drawPopup(ctx, now) {
    const k = clamp01((now - popT) / 350);
    ctx.fillStyle = `rgba(5,10,30,${0.7 * k})`; ctx.fillRect(0, 0, w, h);
    const pw = Math.min(w - 40, 320), ph = 260, px = (w - pw) / 2, py = h * 0.3;
    ctx.save();
    const sc = easeOutBack(k, 2);
    ctx.translate(w / 2, py + ph / 2); ctx.scale(sc, sc); ctx.translate(-w / 2, -(py + ph / 2));
    panel(ctx, px, py, pw, ph);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    drawIcon(ctx, popup.icon || 'gift', w / 2, py + 60, 30, UI.gold);
    ctx.fillStyle = UI.text; ctx.font = `bold 20px ${FONT}`;
    ctx.fillText(popup.title, w / 2, py + 118);
    if (popup.sub) { ctx.font = `15px ${FONT}`; ctx.fillStyle = UI.turq; ctx.fillText(popup.sub, w / 2, py + 148); }
    if (popup.coins) { drawCoin(ctx, w / 2 - 30, py + 200, 14); ctx.fillStyle = UI.gold; ctx.font = `bold 28px ${FONT}`; ctx.textAlign = 'left'; ctx.fillText('+' + popup.coins, w / 2 - 10, py + 201); }
    ctx.restore();
  }
}

// Sozlamalar: ovoz, musiqa, tebranish, til.
export function createSettings(app, { settings, onChange, onBack, onExport, onImport }) {
  let note = null;
  let w = 0, h = 0;
  const rows = () => {
    const x = w / 2, y0 = h * 0.24;
    return [
      { id: 'sound', icon: settings.sound !== false ? 'speaker' : 'speaker-off', y: y0, on: settings.sound !== false },
      { id: 'music', icon: settings.music !== false ? 'note' : 'note-off', y: y0 + 80, on: settings.music !== false },
      { id: 'vibration', icon: settings.vibration !== false ? 'vibrate' : 'vibrate-off', y: y0 + 160, on: settings.vibration !== false },
    ].map((r) => ({ ...r, x }));
  };
  const langBtns = () => LANGS.map((l, i) => ({ l, x: w / 2 + (i - 1.5) * Math.min(86, (w - 32) / 4), y: h * 0.24 + 290 }));
  return {
    layout(W, H) { w = W; h = H; },
    draw() {
      const ctx = app.ctx;
      app.paintBg();
      const pw = Math.min(w - 32, 380);
      panel(ctx, (w - pw) / 2, h * 0.24 - 60, pw, onExport ? 520 : 420);
      backBtn(ctx);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = UI.gold; ctx.font = `bold 22px ${FONT}`;
      ctx.fillText(t('menu.settings'), w / 2, 30);
      for (const r of rows()) {
        drawRoundButton(ctx, r.x - 90, r.y, 26, r.icon, { fill: r.on ? UI.gold : '#4a5277' });
        ctx.fillStyle = UI.text; ctx.font = `bold 18px ${FONT}`; ctx.textAlign = 'left';
        ctx.fillText(t('set.' + r.id), r.x - 50, r.y);
        // tumbler
        const tx = r.x + 80, ty = r.y;
        ctx.fillStyle = r.on ? UI.turq : '#4a5277';
        ctx.beginPath(); ctx.roundRect(tx - 24, ty - 13, 48, 26, 13); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r.on ? tx + 11 : tx - 11, ty, 10, 0, Math.PI * 2); ctx.fill();
        ctx.textAlign = 'center';
      }
      drawIcon(ctx, 'globe', w / 2, h * 0.24 + 240, 16, UI.gold);
      for (const b of langBtns()) {
        const sel = b.l === getLanguage();
        ctx.fillStyle = sel ? UI.gold : 'rgba(255,255,255,0.1)';
        ctx.beginPath(); ctx.roundRect(b.x - 38, b.y - 18, 76, 36, 10); ctx.fill();
        ctx.fillStyle = sel ? '#1b2457' : UI.text; ctx.font = `bold 13px ${FONT}`;
        ctx.fillText(LANG_NAMES[b.l], b.x, b.y);
      }
      // zaxira nusxa: boshqa telefonga ko'chirish
      if (onExport) {
        const y = h * 0.24 + 400;
        drawRoundButton(ctx, w / 2 - 45, y, 22, 'share', { fill: '#2a4aa0', fg: '#fff2cf' });
        drawRoundButton(ctx, w / 2 + 45, y, 22, 'list', { fill: '#2a4aa0', fg: '#fff2cf' });
        if (note && performance.now() - note.t < 2000) { ctx.fillStyle = UI.turq; ctx.font = `bold 20px ${FONT}`; ctx.fillText(note.text, w / 2, y + 44); }
      }
    },
    active() { return !!note && performance.now() - note.t < 2000; },
    pointerDown(x, y) {
      if (hit(x, y, 30, 30, 24)) { onBack(); return; }
      for (const r of rows()) if (y > r.y - 30 && y < r.y + 30 && Math.abs(x - r.x) < 160) { settings[r.id] = !r.on; onChange(r.id); app.requestFrame(); return; }
      for (const b of langBtns()) if (Math.abs(x - b.x) < 40 && Math.abs(y - b.y) < 20) { settings.lang = b.l; onChange('lang'); app.requestFrame(); return; }
      if (onExport) {
        const by = h * 0.24 + 400;
        const done = (ok) => { note = { text: ok ? '✓' : '✗', t: performance.now() }; app.requestFrame(); };
        if (hit(x, y, w / 2 - 45, by, 26)) onExport().then(done);
        else if (hit(x, y, w / 2 + 45, by, 26)) done(onImport());
      }
    },
  };
}

// Aylantiriladigan ro'yxat (topshiriqlar / yutuqlar).
function createList(app, { titleKey, rows, drawRow, rowH = 86, onTapRow, onBack }) {
  let w = 0, h = 0, scroll = 0, touch = null;
  const top = 70;
  const maxScroll = () => Math.max(0, rows().length * rowH + 20 - (h - top));
  return {
    layout(W, H) { w = W; h = H; },
    draw(now) {
      const ctx = app.ctx;
      app.paintBg();
      ctx.fillStyle = 'rgba(6,10,30,0.4)'; ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.beginPath(); ctx.rect(0, top, w, h - top); ctx.clip();
      const rw = Math.min(w - 24, 440), rx = (w - rw) / 2;
      rows().forEach((row, i) => {
        const y = top + 10 + i * rowH - scroll;
        if (y < top - rowH || y > h) return;
        ctx.fillStyle = 'rgba(19,36,89,0.92)';
        ctx.beginPath(); ctx.roundRect(rx, y, rw, rowH - 10, 14); ctx.fill();
        drawRow(ctx, row, rx, y, rw, rowH - 10, now);
      });
      ctx.restore();
      ctx.fillStyle = 'rgba(8,12,36,0.8)'; ctx.fillRect(0, 0, w, top);
      backBtn(ctx);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = UI.gold; ctx.font = `bold 22px ${FONT}`;
      ctx.fillText(t(titleKey), w / 2, 32);
    },
    active() { return !!touch; },
    pointerDown(x, y) {
      if (hit(x, y, 30, 30, 24)) { onBack(); return; }
      touch = { y0: y, s0: scroll, moved: false, x };
    },
    pointerMove(x, y) {
      if (!touch) return;
      if (Math.abs(y - touch.y0) > 8) touch.moved = true;
      scroll = Math.max(0, Math.min(maxScroll(), touch.s0 - (y - touch.y0)));
    },
    pointerUp(x, y) {
      const tc = touch; touch = null;
      if (!tc || tc.moved || y < top) return;
      const i = Math.floor((y - top - 10 + scroll) / rowH);
      const rw = Math.min(w - 24, 440), rx = (w - rw) / 2;
      if (i >= 0 && i < rows().length && onTapRow) onTapRow(rows()[i], i, x - rx, rw);
    },
  };
}

function bar(ctx, x, y, w, k, color) {
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.roundRect(x, y, w, 8, 4); ctx.fill();
  ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, Math.max(8, w * k), 8, 4); ctx.fill();
}

export function createQuestsScreen(app, { getQuests, wallet, onClaim, onBack }) {
  return createList(app, {
    titleKey: 'menu.quests',
    rows: () => getQuests().list,
    onBack,
    drawRow(ctx, q, x, y, w, h) {
      const done = q.progress >= q.target;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = UI.text; ctx.font = `bold 16px ${FONT}`;
      ctx.fillText(tf('quest.' + q.type, { n: q.target }), x + 16, y + 24);
      bar(ctx, x + 16, y + 46, w - 140, q.progress / q.target, done ? UI.turq : UI.gold);
      ctx.fillStyle = UI.text; ctx.font = `13px ${FONT}`;
      ctx.fillText(`${q.progress}/${q.target}`, x + w - 116, y + 50);
      // mukofot tugmasi
      const bx = x + w - 50, by = y + h / 2;
      if (q.claimed) { drawIcon(ctx, 'star', bx, by, 14, UI.turq); return; }
      ctx.fillStyle = done ? UI.gold : 'rgba(255,255,255,0.1)';
      ctx.beginPath(); ctx.roundRect(bx - 36, by - 18, 72, 36, 12); ctx.fill();
      drawCoin(ctx, bx - 18, by, 9);
      ctx.fillStyle = done ? '#1b2457' : UI.gold; ctx.font = `bold 15px ${FONT}`;
      ctx.fillText(String(q.coins), bx - 4, by + 1);
    },
    onTapRow(q, i, rx, rw) {
      if (rx < rw - 100) return;
      const c = claimQuest(getQuests(), i);
      if (c) { wallet.coins += c; app.sfx('coin'); onClaim(); }
    },
  });
}

export function createAchievementsScreen(app, { getStats, unlocked, onBack }) {
  return createList(app, {
    titleKey: 'menu.achievements',
    rows: () => ACHIEVEMENTS,
    onBack,
    rowH: 78,
    drawRow(ctx, a, x, y, w, h) {
      const st = getStats();
      const got = !!unlocked[a.id];
      const k = achievementProgress(st, a);
      ctx.save();
      ctx.globalAlpha = got ? 1 : 0.75;
      // medal
      ctx.fillStyle = got ? UI.gold : '#3b4370';
      starPath(ctx, x + 36, y + h / 2, 8, 22, 16, Math.PI / 8); ctx.fill();
      drawIcon(ctx, 'trophy', x + 36, y + h / 2, 10, got ? '#1b2457' : 'rgba(255,255,255,0.4)');
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = UI.text; ctx.font = `bold 16px ${FONT}`;
      ctx.fillText(t('ach.' + a.id), x + 72, y + 22);
      bar(ctx, x + 72, y + 40, w - 170, k, got ? UI.turq : UI.gold);
      ctx.fillStyle = UI.text; ctx.font = `12px ${FONT}`;
      ctx.fillText(`${Math.min(st[a.stat] || 0, a.goal)}/${a.goal}`, x + w - 92, y + 44);
      drawCoin(ctx, x + w - 40, y + 22, 8);
      ctx.fillStyle = UI.gold; ctx.font = `bold 13px ${FONT}`;
      ctx.fillText(String(a.coins), x + w - 28, y + 23);
      ctx.restore();
    },
  });
}

export { wrapText };
