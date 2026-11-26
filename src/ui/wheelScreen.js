// Omad charxpalagi ekrani: kuniga 1 bepul aylantirish, keyin reklama evaziga.
import { UI, FONT } from '../render/palette.js';
import { t } from '../i18n.js';
import { drawRoundButton, drawIcon, drawCoin, hit, panel } from './widgets.js';
import { WHEEL, canSpinFree, spin, grantPrize } from '../logic/wheel.js';
import { easeOutCubic, easeOutBack, clamp01 } from '../fx/ease.js';
import { createParticles, burst, stepParticles } from '../fx/particles.js';
import { createRng } from '../logic/shapes.js';

const SEG_COLORS = ['#1f5fc8', '#1aa3a3', '#f0c04a', '#2a4aa0', '#e9eef7', '#1aa3a3', '#1f5fc8', '#d9822b'];
const A = (Math.PI * 2) / WHEEL.length;

export function createWheelScreen(app, { getState, saveState, wallet, onWallet, day, onBack }) {
  let w = 0, h = 0;
  let rot = 0, anim = null, result = null, resultT = 0, lastTick = -1;
  const rng = createRng((Date.now() & 0xffffff) ^ 0x5a5a);
  const ps = createParticles(Date.now() & 0xffff);

  const geo = () => { const R = Math.min(w * 0.42, h * 0.3, 190); return { cx: w / 2, cy: h * 0.42, R }; };
  const spinBtn = () => ({ x: w / 2, y: geo().cy + geo().R + 80, r: 40 });
  const mode = () => {
    const s = getState();
    if (canSpinFree(s, day())) return 'free';
    return app.ads.canShow('wheel_spin') ? 'ad' : 'none';
  };

  function start(free) {
    const r = spin(getState(), day(), rng, { free });
    if (!r) return;
    saveState();
    // ko'rsatkich tepada (-90°): bo'lak markazi o'sha joyga kelishi kerak
    const target = -Math.PI / 2 - r.index * A - A / 2;
    const base = rot - (rot % (Math.PI * 2));
    let end = base + 6 * Math.PI * 2 + (((target % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2));
    if (end - rot < 5 * Math.PI * 2) end += Math.PI * 2;
    anim = { from: rot, to: end, t0: performance.now(), dur: 4200, r };
    result = null;
  }

  function drawWheel(ctx, now) {
    const { cx, cy, R } = geo();
    ctx.save();
    // tashqi hoshiya va chiroqchalar
    ctx.fillStyle = '#132459';
    ctx.beginPath(); ctx.arc(cx, cy, R + 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = UI.gold; ctx.lineWidth = 3; ctx.stroke();
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const on = anim ? (Math.floor(now / 90) + i) % 2 === 0 : (Math.floor(now / 500) + i) % 2 === 0;
      ctx.fillStyle = on ? '#fff2b0' : '#8a6a1e';
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (R + 8), cy + Math.sin(a) * (R + 8), 3.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    WHEEL.forEach((p, i) => {
      ctx.fillStyle = SEG_COLORS[i];
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, i * A, (i + 1) * A); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(240,192,74,0.8)'; ctx.lineWidth = 2; ctx.stroke();
      // sovg'a belgisi
      ctx.save();
      ctx.rotate(i * A + A / 2);
      ctx.translate(R * 0.66, 0);
      ctx.rotate(Math.PI / 2);
      const dark = SEG_COLORS[i] === '#e9eef7' || SEG_COLORS[i] === '#f0c04a';
      const fg = dark ? '#1b2457' : '#fff2cf';
      if (p.kind === 'coins') {
        drawCoin(ctx, 0, -10, R * 0.075);
        ctx.fillStyle = fg; ctx.font = `bold ${Math.round(R * 0.1)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(p.n), 0, R * 0.08);
      } else {
        ctx.lineWidth = R * 0.03;
        drawIcon(ctx, p.kind, 0, -4, R * 0.09, fg);
      }
      ctx.restore();
    });
    // markaz: girih yulduzcha
    ctx.fillStyle = UI.gold;
    ctx.beginPath();
    for (let k = 0; k < 16; k++) { const rr = k % 2 ? R * 0.09 : R * 0.17, a = (k * Math.PI) / 8; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1b2457'; ctx.beginPath(); ctx.arc(0, 0, R * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // ko'rsatkich (tepada)
    ctx.save();
    const wob = anim ? Math.sin(now / 40) * 0.12 : 0;
    ctx.translate(cx, cy - R - 10); ctx.rotate(wob);
    ctx.fillStyle = '#e0561f'; ctx.strokeStyle = '#fff2cf'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(14, -14); ctx.lineTo(0, 18); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  return {
    layout(W, H) { w = W; h = H; },
    draw(now, dt) {
      const ctx = app.ctx;
      app.paintBg();
      if (anim) {
        const k = clamp01((now - anim.t0) / anim.dur);
        rot = anim.from + (anim.to - anim.from) * easeOutCubic(k);
        const seg = Math.floor((rot + Math.PI / 2) / A);
        if (seg !== lastTick) { lastTick = seg; app.sfx('tick'); }
        if (k >= 1) {
          result = anim.r; resultT = now; anim = null;
          grantPrize(wallet, result.prize); onWallet();
          app.sfx('prize'); app.vibrate([20, 40, 20]);
          const { cx, cy, R } = geo();
          for (let i = 0; i < 6; i++) burst(ps, cx + (rng() - 0.5) * R, cy - R * 0.6 + (rng() - 0.5) * R * 0.4, R * 0.3, 10);
        }
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = UI.gold; ctx.font = `bold 26px ${FONT}`;
      ctx.fillText(t('menu.wheel'), w / 2, 34);
      drawRoundButton(ctx, 30, 30, 20, 'back', { fill: 'rgba(240,192,74,0.9)' });
      ctx.textAlign = 'right'; ctx.font = `bold 18px ${FONT}`; ctx.fillStyle = UI.gold;
      ctx.fillText(String(wallet.coins), w - 16, 30);
      drawCoin(ctx, w - 30 - ctx.measureText(String(wallet.coins)).width, 30, 11);
      drawWheel(ctx, now);
      // tugma
      const b = spinBtn(), m = mode();
      if (!anim) {
        ctx.textAlign = 'center';
        if (m === 'none') {
          ctx.fillStyle = UI.text; ctx.font = `bold 17px ${FONT}`;
          ctx.fillText(t('wheel.tomorrow'), b.x, b.y);
        } else {
          const pulse = 1 + 0.05 * Math.sin(now / 200);
          drawRoundButton(ctx, b.x, b.y, b.r * pulse, m === 'free' ? 'play' : 'ad', { badge: m === 'ad' ? app.ads.state && Math.max(0, 2 - (app.ads.state.today.wheel_spin || 0)) : null });
          ctx.fillStyle = UI.text; ctx.font = `bold 15px ${FONT}`;
          ctx.fillText(m === 'free' ? t('wheel.free') : t('wheel.again'), b.x, b.y + b.r + 18);
        }
      }
      // natija
      if (result) {
        const k = clamp01((now - resultT) / 400);
        const sc = easeOutBack(k, 2.2);
        const pw = Math.min(w - 60, 260), ph = 120, px = (w - pw) / 2, py = geo().cy - ph / 2;
        ctx.save();
        ctx.translate(w / 2, py + ph / 2); ctx.scale(sc, sc); ctx.translate(-w / 2, -(py + ph / 2));
        panel(ctx, px, py, pw, ph);
        const p = result.prize;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (p.kind === 'coins') {
          drawCoin(ctx, w / 2 - 40, py + ph / 2, 18);
          ctx.fillStyle = UI.gold; ctx.font = `bold 34px ${FONT}`; ctx.textAlign = 'left';
          ctx.fillText('+' + p.n, w / 2 - 14, py + ph / 2 + 2);
        } else {
          drawRoundButton(ctx, w / 2 - 30, py + ph / 2, 30, p.kind, { fill: '#2a4aa0', fg: '#fff2cf' });
          ctx.fillStyle = UI.gold; ctx.font = `bold 34px ${FONT}`; ctx.textAlign = 'left';
          ctx.fillText('+' + p.n, w / 2 + 10, py + ph / 2 + 2);
        }
        ctx.restore();
      }
      stepParticles(ps, dt || 1 / 60);
      for (const p of ps.list) {
        ctx.globalAlpha = 1 - p.life / p.max; ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
    },
    active() { return true; }, // chiroqchalar doim miltillaydi
    pointerDown(x, y) {
      if (hit(x, y, 30, 30, 26)) { if (!anim) onBack(); return; }
      if (anim) return;
      if (result && performance.now() - resultT > 500) { result = null; return; }
      const b = spinBtn();
      if (!hit(x, y, b.x, b.y, b.r + 8)) return;
      const m = mode();
      if (m === 'free') start(true);
      else if (m === 'ad') app.ads.showRewarded('wheel_spin', () => { start(false); app.requestFrame(); }, (why) => app.toast(t(why === 'limit' ? 'ad.limit' : 'ad.fail'), 'ad'));
    },
    get spinning() { return !!anim; },
  };
}
