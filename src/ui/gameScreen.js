// O'yin ekrani: maydon, shakllar, sudrab qo'yish, effektlar.
// Rejimlar (sarguzasht/kunlik/cheksiz) shu ekranni `hooks` orqali sozlaydi.
import { createGame, tryPlace } from '../logic/game.js';
import { canPlace, placePiece, EMPTY, STONE, BOARD_SIZE } from '../logic/board.js';
import { stoneSprite, iceSprite, chainSprite, gemSprite, targetSprite } from '../render/obstacles.js';
import { findFullLines } from '../logic/score.js';
import { shapeSize } from '../logic/shapes.js';
import { tileSprite, emptyCellSprite, rr } from '../render/tiles.js';
import { UI, FONT } from '../render/palette.js';
import { createParticles, burst, stepParticles, trimParticles } from '../fx/particles.js';
import { easeOutBack, easeOutCubic, approach, clamp01 } from '../fx/ease.js';
import { drawCoin, drawRoundButton, hit } from './widgets.js';
import { t } from '../i18n.js';
import { POWERUPS, BOARD_TARGET, canUse, consume, applyPowerup, PRICES } from '../logic/powerups.js';

export function createGameScreen(app, hooks = {}) {
  const N = BOARD_SIZE;
  let game = hooks.createGame ? hooks.createGame() : createGame(Date.now());
  let L = {};
  let drag = null;       // { index, x, y, row, col, valid, preview }
  let returning = [];    // noto'g'ri tashlangan shakl tray'ga qaytadi
  let pops = [];         // qo'yilgan kataklar "pop"
  let shrink = [];       // tozalanayotgan kataklar
  let texts = [];        // combo yozuvlari
  let shake = 0;
  let beams = [];        // tozalangan qator/ustun nuri
  let rings = [];        // to'lqin halqasi
  let flash = 0;         // "perfect" chaqnashi (1 → 0)
  let trayIn = 0, trayRef = null; // yangi shakllar kirib kelishi
  let shownScore = 0;
  let overAt = 0;
  const ps = createParticles(Date.now() & 0xffff);
  let best = hooks.best ? hooks.best() : 0;

  function layout(w, h) {
    const top = hooks.hudHeight ? hooks.hudHeight : 86;
    const barH = hooks.wallet ? 70 : 0;
    const avail = h - top - barH - 12;
    const boardPx = Math.min(w - 28, avail / 1.45, 540);
    const cell = boardPx / N;
    const bx = (w - boardPx) / 2;
    const by = top + Math.max(8, (avail - boardPx * 1.45) * 0.35);
    const trayY = by + boardPx + cell * 0.55;
    const trayH = cell * 3;
    L = { w, h, cell, bx, by, boardPx, trayY, trayH, slotW: Math.min(w, boardPx + 40) / 3, trayX: (w - Math.min(w, boardPx + 40)) / 2, trayCell: cell * 0.56,
      barY: trayY + trayH + barH / 2, barH };
  }

  const sprite = (color, s) => tileSprite(color, s * app.dpr);
  const drawTile = (x, y, s, color) => ctxDraw(sprite(color, s), x, y, s);
  function ctxDraw(img, x, y, s) { app.ctx.drawImage(img, x, y, s, s); }

  function drawPiece(p, x, y, s) {
    p.cells.forEach(([dr, dc], k) => {
      drawTile(x + dc * s, y + dr * s, s, p.color);
      if (p.gems && p.gems.includes(k)) app.ctx.drawImage(gemSprite(s * app.dpr), x + dc * s, y + dr * s, s, s);
    });
  }

  let armed = null, aim = null, denied = 0;
  function barButtons() {
    const gap = Math.min(76, (L.w - 40) / 4);
    return POWERUPS.map((id, k) => ({ id, x: L.w / 2 + (k - 1.5) * gap, y: L.barY, r: 24 }));
  }
  function drawBar(ctx, now) {
    const wal = hooks.wallet();
    for (const b of barButtons()) {
      const n = wal.inv[b.id] || 0;
      const usable = canUse(wal, b.id) && !game.over;
      const on = armed === b.id;
      ctx.save();
      ctx.globalAlpha = usable ? 1 : 0.4;
      if (on) { ctx.fillStyle = 'rgba(255,120,60,0.35)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 7 + 2 * Math.sin(now / 120), 0, Math.PI * 2); ctx.fill(); }
      const shakeX = denied && now - denied < 300 && armedDenied === b.id ? Math.sin(now / 20) * 4 : 0;
      drawRoundButton(ctx, b.x + shakeX, b.y, b.r, b.id, { fill: on ? '#ff9a5a' : '#2a4aa0', fg: '#fff2cf', badge: n > 0 ? n : null });
      if (n <= 0) {
        // narxi
        ctx.font = `bold 11px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(8,12,36,0.85)';
        ctx.beginPath(); ctx.roundRect(b.x - 22, b.y + b.r - 6, 44, 16, 8); ctx.fill();
        drawCoin(ctx, b.x - 12, b.y + b.r + 2, 5);
        ctx.fillStyle = UI.gold; ctx.fillText(String(PRICES[b.id]), b.x + 5, b.y + b.r + 2.5);
      }
      ctx.restore();
    }
  }
  let armedDenied = null;
  function cellAt(x, y) {
    const c = Math.floor((x - L.bx) / L.cell), r = Math.floor((y - L.by) / L.cell);
    return r >= 0 && c >= 0 && r < N && c < N ? { r, c } : null;
  }
  function firePowerup(id, target) {
    const wal = hooks.wallet();
    if (!canUse(wal, id)) return false;
    const apply = (s) => applyPowerup(s, id, target);
    const res = hooks.powerup ? hooks.powerup(game, apply) : apply(game);
    if (!res) return false;
    consume(wal, id);
    if (hooks.onWallet) hooks.onWallet(wal);
    const now = performance.now();
    screen.fxClear(res.cleared);
    for (const c of res.broken || []) burst(ps, L.bx + (c.c + 0.5) * L.cell, L.by + (c.r + 0.5) * L.cell, L.cell, 10, c.stone ? ['#a49a8a', '#7d7466', '#cfc6b6'] : ['#d8dce4', '#9aa3b2', '#c9a23a']);
    if (id === 'bomb') { shake = 0.6; app.vibrate([25, 20, 25]); } else app.vibrate(15);
    app.sound && app.sound(id);
    app.track && app.track({ ...res, lines: 0, powerup: id });
    if (hooks.onMove) hooks.onMove(game, { ...res, lines: 0, powerup: id });
    if (game.over) overAt = now + 250;
    return true;
  }

  function slotOrigin(i, piece, s) {
    const { rows, cols } = shapeSize(piece.cells);
    const cx = L.trayX + L.slotW * i + L.slotW / 2;
    const cy = L.trayY + L.trayH / 2;
    return { x: cx - (cols * s) / 2, y: cy - (rows * s) / 2 };
  }

  function dragOrigin(piece, x, y) {
    const { rows, cols } = shapeSize(piece.cells);
    const s = L.cell;
    return { x: x - (cols * s) / 2, y: y - rows * s - s * 0.9 };
  }

  function updateSnap() {
    const p = game.tray[drag.index];
    const o = dragOrigin(p, drag.x, drag.y);
    drag.col = Math.round((o.x - L.bx) / L.cell);
    drag.row = Math.round((o.y - L.by) / L.cell);
    drag.valid = canPlace(game.board, p.cells, drag.row, drag.col);
    drag.preview = drag.valid ? findFullLines(placePiece(game.board, p.cells, drag.row, drag.col, p.color)) : null;
  }

  let baseCache = null;
  function boardBase() {
    const key = `${L.w}x${L.h}@${app.dpr}`;
    if (baseCache && baseCache.key === key) return baseCache;
    const m = Math.max(8, L.cell * 0.22) + 22; // soya uchun zaxira
    const x = L.bx - m, y = L.by - m, w = L.boardPx + m * 2, h = w;
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(w * app.dpr); cv.height = Math.ceil(h * app.dpr);
    const c = cv.getContext('2d');
    c.scale(app.dpr, app.dpr);
    c.translate(-x, -y);
    drawFrame(c);
    const empty = emptyCellSprite(L.cell * app.dpr);
    for (let r = 0; r < N; r++) for (let cc = 0; cc < N; cc++) c.drawImage(empty, L.bx + cc * L.cell, L.by + r * L.cell, L.cell, L.cell);
    baseCache = { key, cv, x, y, w, h };
    return baseCache;
  }

  function drawFrame(ctx) {
    const { bx, by, boardPx } = L;
    const m = Math.max(8, L.cell * 0.22);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = UI.boardFrame;
    rr(ctx, bx - m, by - m, boardPx + m * 2, boardPx + m * 2, m * 1.2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = UI.boardFrameEdge;
    ctx.lineWidth = 1.5;
    rr(ctx, bx - m + 3, by - m + 3, boardPx + m * 2 - 6, boardPx + m * 2 - 6, m);
    ctx.stroke();
    // hoshiyadagi mayda oltin nuqtalar (girih hoshiya)
    ctx.fillStyle = UI.goldDeep;
    const step = L.cell / 2;
    for (let i = 0; i <= N * 2; i++) {
      const t = bx + i * step;
      for (const [x, y] of [[t, by - m / 2], [t, by + boardPx + m / 2], [bx - m / 2, by + i * step], [bx + boardPx + m / 2, by + i * step]]) {
        ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function drawHUD(ctx, now) {
    const { w } = L;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = UI.text;
    ctx.font = `bold 34px ${FONT}`;
    ctx.fillText(String(Math.round(shownScore)), w / 2, L.by - Math.max(18, L.cell * 0.5));
    // rekord
    ctx.textAlign = 'left';
    ctx.font = `bold 16px ${FONT}`;
    ctx.fillStyle = UI.gold;
    if (!hooks.hideBest) {
      drawCrown(ctx, hooks.bestX || 16, 18, 16);
      ctx.fillText(String(Math.max(best, game.score)), (hooks.bestX || 16) + 22, 32);
    }
    // streak alangasi (ochko yonida)
    if (game.streak > 1) {
      const pulse = 1 + 0.08 * Math.sin(now / 120);
      ctx.font = `bold 34px ${FONT}`;
      const sx = w / 2 + ctx.measureText(String(Math.round(shownScore))).width / 2 + 22;
      const sy = L.by - Math.max(18, L.cell * 0.5) - 12;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(pulse, pulse);
      drawFlame(ctx, 0, 0, 12);
      ctx.restore();
      ctx.textAlign = 'left';
      ctx.font = `bold 16px ${FONT}`;
      ctx.fillStyle = UI.gold;
      ctx.fillText('×' + game.streak, sx + 12, sy + 6);
    }
    // tangalar
    if (hooks.wallet) {
      const wal = hooks.wallet();
      ctx.font = `bold 16px ${FONT}`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillStyle = UI.gold;
      ctx.fillText(String(wal.coins), w - 14, 30);
      const tw = ctx.measureText(String(wal.coins)).width;
      drawCoin(ctx, w - 26 - tw, 30, 10);
      ctx.textBaseline = 'alphabetic';
    }
    if (hooks.drawHUD) hooks.drawHUD(ctx, L, game, now);
  }

  function draw(now, dt) {
    const ctx = app.ctx;
    const { w, h, cell, bx, by } = L;
    app.paintBg();
    shownScore = approach(shownScore, game.score, dt, 8);

    ctx.save();
    if (shake > 0) {
      const k = shake * 8;
      ctx.translate((Math.random() - 0.5) * k, (Math.random() - 0.5) * k);
      shake = Math.max(0, shake - dt * 2.5);
    }
    // hoshiya + bo'sh kataklar bitta keshlangan rasm (har kadrda 64 ta rasm o'rniga 1 ta)
    const base = boardBase();
    ctx.drawImage(base.cv, base.x, base.y, base.w, base.h);
    const popMap = new Map();
    pops = pops.filter((p) => now - p.t < 260);
    for (const p of pops) popMap.set(p.r * N + p.c, (now - p.t) / 260);
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++) {
        const x = bx + c * cell, y = by + r * cell;
        const tg = game.target && game.target[r][c];
        if (tg) ctx.drawImage(targetSprite(cell * app.dpr, tg === 2), x, y, cell, cell);
        const v = game.board[r][c];
        if (v === EMPTY) continue;
        if (v === STONE) { ctx.drawImage(stoneSprite(cell * app.dpr), x, y, cell, cell); continue; }
        const k = popMap.get(r * N + c);
        if (k !== undefined) {
          const s = cell * (0.75 + 0.25 * easeOutBack(k, 3));
          drawTile(x + (cell - s) / 2, y + (cell - s) / 2, s, v);
        } else drawTile(x, y, cell, v);
        const o = game.obs && game.obs[r][c];
        if (o) {
          if (o.t === 'ice') ctx.drawImage(iceSprite(cell * app.dpr, o.hp), x, y, cell, cell);
          else if (o.t === 'chain') ctx.drawImage(chainSprite(cell * app.dpr), x, y, cell, cell);
          else if (o.t === 'gem') { const gs = cell * (0.9 + 0.06 * Math.sin(now / 300 + r + c)); ctx.drawImage(gemSprite(cell * app.dpr), x + (cell - gs) / 2, y + (cell - gs) / 2, gs, gs); }
        }
        if (hooks.drawCellOverlay) hooks.drawCellOverlay(ctx, game, r, c, x, y, cell, now);
      }
    if (hooks.drawBoardOverlay) hooks.drawBoardOverlay(ctx, game, L, now);
    if (armed && BOARD_TARGET[armed]) {
      ctx.save();
      ctx.strokeStyle = `rgba(255,120,60,${0.6 + 0.3 * Math.sin(now / 150)})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(bx - 2, by - 2, L.boardPx + 4, L.boardPx + 4);
      if (aim) {
        const k = armed === 'bomb' ? 1 : 0;
        ctx.fillStyle = 'rgba(255,120,60,0.35)';
        ctx.fillRect(bx + Math.max(0, aim.c - k) * cell, by + Math.max(0, aim.r - k) * cell,
          (Math.min(N - 1, aim.c + k) - Math.max(0, aim.c - k) + 1) * cell, (Math.min(N - 1, aim.r + k) - Math.max(0, aim.r - k) + 1) * cell);
      }
      ctx.restore();
    }

    // ko'rsatma: qayerga tushadi + qaysi qatorlar tozalanadi
    if (drag && drag.valid) {
      const p = game.tray[drag.index];
      ctx.globalAlpha = 0.42;
      for (const [dr, dc] of p.cells) drawTile(bx + (drag.col + dc) * cell, by + (drag.row + dr) * cell, cell, p.color);
      ctx.globalAlpha = 1;
      const pv = drag.preview;
      if (pv && (pv.rows.length || pv.cols.length)) {
        const a = 0.25 + 0.15 * Math.sin(now / 90);
        ctx.fillStyle = `rgba(245,197,66,${a})`;
        for (const r of pv.rows) ctx.fillRect(bx, by + r * cell, L.boardPx, cell);
        for (const c of pv.cols) ctx.fillRect(bx + c * cell, by, cell, L.boardPx);
      }
    }

    // tozalanayotgan kataklar
    shrink = shrink.filter((s) => now - s.t < 320);
    for (const s of shrink) {
      const k = easeOutCubic((now - s.t) / 320);
      const size = cell * (1 - k);
      ctx.globalAlpha = 1 - k * 0.6;
      drawTile(bx + s.c * cell + (cell - size) / 2, by + s.r * cell + (cell - size) / 2, size, s.color);
      ctx.globalAlpha = 1;
    }

    // tozalash nurlari: oltin chiziq kengayib, so'nadi
    beams = beams.filter((b) => now - b.t < 420);
    for (const b of beams) {
      const k = (now - b.t) / 420;
      const thick = cell * (0.35 + 0.9 * easeOutCubic(k));
      ctx.globalAlpha = (1 - k) * 0.85;
      ctx.fillStyle = k < 0.25 ? '#fff6d0' : UI.gold;
      if (b.row !== undefined) ctx.fillRect(bx - 6, by + (b.row + 0.5) * cell - thick / 2, L.boardPx + 12, thick);
      else ctx.fillRect(bx + (b.col + 0.5) * cell - thick / 2, by - 6, thick, L.boardPx + 12);
    }
    ctx.globalAlpha = 1;
    // to'lqin halqasi
    rings = rings.filter((r) => now - r.t < 520);
    for (const r of rings) {
      const k = (now - r.t) / 520;
      ctx.globalAlpha = (1 - k) * 0.9;
      ctx.strokeStyle = r.color || UI.gold;
      ctx.lineWidth = 6 * (1 - k) + 1;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r0 + (r.r1 - r.r0) * easeOutCubic(k), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // yangi shakllar to'plami: pastdan sakrab kiradi
    if (!trayRef) trayRef = game.tray;
    else if (trayRef !== game.tray) { trayRef = game.tray; trayIn = now; } // almashtirish/qayta boshlash
    const trayK = clamp01((now - trayIn) / 380);

    // tray
    game.tray.forEach((p, i) => {
      if (!p || (drag && drag.index === i) || returning.some((r) => r.index === i)) return;
      const s = L.trayCell;
      const o = slotOrigin(i, p, s);
      const fits = hooks.fits ? hooks.fits(game, p) : true;
      ctx.globalAlpha = fits ? 1 : 0.35;
      if (trayK < 1) {
        const ki = clamp01(trayK * 1.4 - i * 0.18);
        const sc = Math.max(0.01, easeOutBack(ki, 2));
        const { rows, cols } = shapeSize(p.cells);
        const cx = o.x + (cols * s) / 2, cy = o.y + (rows * s) / 2;
        ctx.save(); ctx.translate(cx, cy + (1 - ki) * 40); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
        drawPiece(p, o.x, o.y, s);
        ctx.restore();
      } else drawPiece(p, o.x, o.y, s);
      ctx.globalAlpha = 1;
    });
    returning = returning.filter((r) => now - r.t < 180);
    for (const r of returning) {
      const p = game.tray[r.index];
      if (!p) continue;
      const k = easeOutCubic((now - r.t) / 180);
      const s = L.cell + (L.trayCell - L.cell) * k;
      const t = slotOrigin(r.index, p, L.trayCell);
      const x = r.x + (t.x - r.x) * k, y = r.y + (t.y - r.y) * k;
      drawPiece(p, x, y, s);
    }
    if (drag) {
      const p = game.tray[drag.index];
      const o = dragOrigin(p, drag.x, drag.y);
      // arzon soya (shadowBlur kuchsiz telefonlarda sekin)
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      for (const [dr, dc] of p.cells) ctx.fillRect(o.x + dc * cell + 4, o.y + dr * cell + 10, cell - 4, cell - 4);
      drawPiece(p, o.x, o.y, cell);
    }

    if (hooks.wallet) drawBar(ctx, now);

    // oltin chang
    stepParticles(ps, dt);
    for (const p of ps.list) {
      // aylanuvchi romb (save/restore'siz — tezroq)
      ctx.globalAlpha = 1 - p.life / p.max;
      ctx.fillStyle = p.color;
      const cs = Math.cos(p.spin) * p.r * 1.3, sn = Math.sin(p.spin) * p.r * 1.3;
      ctx.beginPath();
      ctx.moveTo(p.x + cs, p.y + sn); ctx.lineTo(p.x - sn, p.y + cs); ctx.lineTo(p.x - cs, p.y - sn); ctx.lineTo(p.x + sn, p.y - cs);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // combo yozuvlari
    texts = texts.filter((t) => now - t.t < t.dur);
    for (const t of texts) {
      const k = (now - t.t) / t.dur;
      const sc = easeOutBack(clamp01(k * 3), 2.2);
      ctx.save();
      ctx.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      ctx.translate(t.x, t.y - k * 30);
      ctx.scale(sc, sc);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${t.size}px ${FONT}`;
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(20,20,60,0.85)';
      ctx.strokeText(t.text, 0, 0);
      ctx.fillStyle = t.color || UI.gold;
      ctx.fillText(t.text, 0, 0);
      ctx.restore();
    }

    if (flash > 0) {
      ctx.fillStyle = `rgba(255,240,190,${flash * 0.45})`;
      ctx.fillRect(0, 0, w, h);
      flash = Math.max(0, flash - dt * 1.6);
    }

    drawHUD(ctx, now);

    if (game.over && hooks.drawOver) { if (now >= overAt) hooks.drawOver(ctx, L, game, now - overAt); }
    else if (game.over) drawGameOver(ctx, now);
  }

  function drawGameOver(ctx, now) {
    const k = easeOutCubic((now - overAt) / 400);
    const { w, h } = L;
    ctx.fillStyle = `rgba(5,10,30,${0.72 * k})`;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.globalAlpha = k;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = UI.text;
    ctx.font = `bold 52px ${FONT}`;
    ctx.fillText(String(game.score), w / 2, h * 0.4);
    ctx.fillStyle = UI.gold;
    drawCrown(ctx, w / 2 - 50, h * 0.4 + 36, 18);
    ctx.font = `bold 20px ${FONT}`;
    ctx.fillText(String(best), w / 2 + 10, h * 0.4 + 46);
    const rv = reviveOn();
    drawRestartButton(ctx, w / 2 - (rv ? 60 : 0), h * 0.62, 38);
    if (rv) {
      const pulse = 1 + 0.06 * Math.sin(now / 170);
      drawRoundButton(ctx, w / 2 + 60, h * 0.62, 38 * pulse, 'ad', { fill: '#1aa3a3', fg: '#fff2cf', badge: '↺' });
      ctx.fillStyle = UI.text; ctx.font = `bold 14px ${FONT}`;
      ctx.fillText(t('over.revive'), w / 2 + 60, h * 0.62 + 56);
    }
    ctx.restore();
  }

  function lineFx(cleared, now) {
    const rows = new Map(), cols = new Map();
    for (const c of cleared) { rows.set(c.r, (rows.get(c.r) || 0) + 1); cols.set(c.c, (cols.get(c.c) || 0) + 1); }
    let n = 0;
    for (const [r, k] of rows) if (k >= N) { beams.push({ row: r, t: now + n * 40 }); n++; }
    for (const [c, k] of cols) if (k >= N) { beams.push({ col: c, t: now + n * 40 }); n++; }
    return n;
  }

  function onPlaced(res, piece) {
    const now = performance.now();
    const tray0 = trayRef;
    if (res.lines) {
      lineFx(res.cleared, now);
      let sr = 0, sc = 0;
      for (const [r, c] of res.placed) { sr += r; sc += c; }
      const px = L.bx + (sc / res.placed.length + 0.5) * L.cell, py = L.by + (sr / res.placed.length + 0.5) * L.cell;
      rings.push({ x: px, y: py, r0: L.cell * 0.5, r1: L.cell * (2.5 + res.lines), t: now });
      if (res.lines > 1) rings.push({ x: px, y: py, r0: L.cell * 0.3, r1: L.cell * (1.6 + res.lines), t: now + 90, color: UI.turq });
    }
    if (res.perfect) flash = 1;
    if (tray0 && game.tray !== tray0) { trayIn = now; trayRef = game.tray; } // yangi uchlik keldi
    for (const [r, c] of res.placed) pops.push({ r, c, t: now });
    for (const c of res.cleared) {
      shrink.push({ ...c, t: now });
      burst(ps, L.bx + (c.c + 0.5) * L.cell, L.by + (c.r + 0.5) * L.cell, L.cell, res.lines > 1 ? 9 : 6);
    }
    for (const c of res.cracked || []) burst(ps, L.bx + (c.c + 0.5) * L.cell, L.by + (c.r + 0.5) * L.cell, L.cell, 8, ['#e8f8ff', '#bfe9ff', '#ffffff']);
    for (const c of res.broken || []) burst(ps, L.bx + (c.c + 0.5) * L.cell, L.by + (c.r + 0.5) * L.cell, L.cell, 10, c.stone ? ['#a49a8a', '#7d7466', '#cfc6b6'] : ['#d8dce4', '#9aa3b2', '#c9a23a']);
    if (res.events && res.events.build) for (const [r, c] of res.placed) if (game.target && game.target[r] && game.target[r][c] === 2) burst(ps, L.bx + (c + 0.5) * L.cell, L.by + (r + 0.5) * L.cell, L.cell, 3);
    trimParticles(ps);
    const cx = L.bx + L.boardPx / 2, cy = L.by + L.boardPx / 2;
    if (res.perfect) texts.push({ text: '✦ ✦ ✦', x: cx, y: cy - 40, size: 46, t: now, dur: 1300, color: UI.turq });
    if (res.lines > 1) {
      texts.push({ text: '×' + res.lines, x: cx, y: cy, size: 40 + res.lines * 8, t: now, dur: 1000 });
      shake = Math.min(1, 0.25 + res.lines * 0.15);
    } else if (res.lines === 1 && res.streak > 1) {
      texts.push({ text: '🔥' + res.streak, x: cx, y: cy, size: 36, t: now, dur: 800 });
    }
    if (res.lines) {
      texts.push({ text: '+' + res.gained, x: cx, y: cy + 50, size: 24, t: now, dur: 900, color: UI.text });
      app.vibrate(res.lines > 1 ? [18, 30, 18] : 12);
    }
    app.sound && app.sound(res.lines ? (res.lines > 1 ? 'combo' : 'clear') : 'place', res);
    if (game.score > best) best = game.score;
    app.track && app.track(res);
    if (hooks.onMove) hooks.onMove(game, res, piece);
    if (res.over) { overAt = now + 250; if (hooks.onOver) hooks.onOver(game); }
  }

  function pickTray(x, y) {
    if (y < L.trayY - L.cell * 0.2 || y > L.trayY + L.trayH + L.cell) return -1;
    const i = Math.floor((x - L.trayX) / L.slotW);
    return i >= 0 && i < 3 && game.tray[i] ? i : -1;
  }

  const reviveOn = () => !!(hooks.canRevive && hooks.onRevive && hooks.canRevive(game));
  function restartHit(x, y) {
    return Math.hypot(x - L.w / 2 + (reviveOn() ? 60 : 0), y - L.h * 0.62) < (reviveOn() ? 44 : 50);
  }
  function reviveHit(x, y) {
    return reviveOn() && Math.hypot(x - L.w / 2 - 60, y - L.h * 0.62) < 44;
  }

  const screen = {
    get game() { return game; },
    set game(g) { game = g; shownScore = g.score; },
    get layoutInfo() { return L; },
    layout,
    draw,
    active(now) {
      return !!drag || !!armed || beams.length || rings.length || flash > 0 || now - trayIn < 400 || (now - denied < 350) || returning.length || pops.length || shrink.length || texts.length || ps.list.length || shake > 0 ||
        Math.round(shownScore) !== game.score || (game.over && now - overAt < 1500) || (game.streak > 1) || (hooks.animating && hooks.animating(now));
    },
    pointerDown(x, y) {
      if (game.over) {
        if (hooks.onOverTap) { if (performance.now() - overAt > 300) hooks.onOverTap(x, y, L, game); return; }
        if (performance.now() - overAt < 300) return;
        if (reviveHit(x, y)) {
          const g0 = game;
          hooks.onRevive(game, (res) => {
            if (game !== g0) return;
            screen.fxClear(res.cleared);
            texts.push({ text: '↺', x: L.w / 2, y: L.by + L.boardPx / 2, size: 64, t: performance.now(), dur: 900, color: UI.turq });
            app.requestFrame();
          });
        } else if (restartHit(x, y)) screen.restart();
        else if (hooks.pointerDown) hooks.pointerDown(x, y, L, game); // masalan, ortga tugmasi
        return;
      }
      if (hooks.pointerDown && hooks.pointerDown(x, y, L, game)) return;
      if (hooks.wallet) {
        const b = barButtons().find((bb) => hit(x, y, bb.x, bb.y, bb.r + 6));
        if (b) {
          if (armed === b.id) { armed = null; aim = null; return; }
          if (!canUse(hooks.wallet(), b.id)) { denied = performance.now(); armedDenied = b.id; app.vibrate(30); return; }
          armed = b.id; aim = null;
          app.sound && app.sound('pick');
          return;
        }
        if (armed) {
          if (BOARD_TARGET[armed]) {
            const cl = cellAt(x, y);
            if (cl) { aim = cl; return; }
          } else {
            const ti = pickTray(x, y);
            if (ti >= 0) { if (firePowerup(armed, { index: ti })) armed = null; return; }
          }
          armed = null; aim = null;
          return;
        }
      }
      const i = pickTray(x, y);
      if (i < 0) return;
      drag = { index: i, x, y };
      updateSnap();
      app.sound && app.sound('pick');
    },
    pointerMove(x, y) {
      if (armed && aim) { const cl = cellAt(x, y); if (cl) aim = cl; return; }
      if (!drag) return;
      drag.x = x; drag.y = y;
      updateSnap();
    },
    pointerUp(x, y) {
      if (armed && aim) {
        const cl = cellAt(x, y) || aim;
        if (firePowerup(armed, cl)) armed = null;
        aim = null;
        return;
      }
      if (!drag) return;
      const d = drag;
      drag = null;
      const piece = game.tray[d.index];
      if (d.valid) {
        const res = hooks.place ? hooks.place(game, d.index, d.row, d.col) : tryPlace(game, d.index, d.row, d.col);
        if (res) { onPlaced(res, piece); return; }
      }
      const o = dragOrigin(piece, d.x, d.y);
      returning.push({ index: d.index, x: o.x, y: o.y, t: performance.now() });
    },
    pointerCancel() { drag = null; },
    restart() {
      game = hooks.createGame ? hooks.createGame() : createGame(Date.now());
      shownScore = 0; texts = []; pops = []; shrink = []; beams = []; rings = []; flash = 0; trayIn = performance.now();
      if (hooks.onRestart) hooks.onRestart(game);
    },
    // kuchaytirgichlar va boshqa rejimlar uchun effektlar
    fxClear(cells) {
      const now = performance.now();
      for (const c of cells) {
        shrink.push({ ...c, t: now });
        burst(ps, L.bx + (c.c + 0.5) * L.cell, L.by + (c.r + 0.5) * L.cell, L.cell, 6);
      }
      trimParticles(ps);
    },
    fxText(text, opts = {}) {
      texts.push({ text, x: opts.x ?? L.w / 2, y: opts.y ?? L.by + L.boardPx / 2, size: opts.size || 34, t: performance.now(), dur: opts.dur || 1000, color: opts.color });
    },
    fxOnPlaced: onPlaced,
    setBest(v) { best = v; },
  };
  return screen;
}

// --- Belgilar (matnsiz tushunarli bo'lishi uchun) ---
export function drawCrown(ctx, x, y, s) {
  ctx.save();
  ctx.fillStyle = UI.gold;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.85);
  ctx.lineTo(x, y + s * 0.2);
  ctx.lineTo(x + s * 0.3, y + s * 0.5);
  ctx.lineTo(x + s * 0.5, y);
  ctx.lineTo(x + s * 0.7, y + s * 0.5);
  ctx.lineTo(x + s, y + s * 0.2);
  ctx.lineTo(x + s, y + s * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawFlame(ctx, x, y, s) {
  ctx.save();
  const g = ctx.createLinearGradient(x, y - s, x, y + s);
  g.addColorStop(0, '#ffe08a');
  g.addColorStop(1, '#e0561f');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.bezierCurveTo(x + s * 0.9, y - s * 0.2, x + s * 0.8, y + s, x, y + s);
  ctx.bezierCurveTo(x - s * 0.8, y + s, x - s * 0.9, y - s * 0.2, x, y - s);
  ctx.fill();
  ctx.restore();
}

export function drawRestartButton(ctx, x, y, r) {
  ctx.save();
  ctx.fillStyle = UI.gold;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#1b2457';
  ctx.lineWidth = r * 0.16;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r * 0.5, -Math.PI * 0.35, Math.PI * 1.45); ctx.stroke();
  const a = -Math.PI * 0.35, ax = x + Math.cos(a) * r * 0.5, ay = y + Math.sin(a) * r * 0.5;
  ctx.fillStyle = '#1b2457';
  ctx.beginPath(); ctx.moveTo(ax + r * 0.22, ay - r * 0.05); ctx.lineTo(ax - r * 0.08, ay - r * 0.28); ctx.lineTo(ax - r * 0.05, ay + r * 0.18); ctx.closePath(); ctx.fill();
  ctx.restore();
}
