// To'siqlarni chizish: tosh, muz, zanjir, olmos, qurilish nishoni. Hammasi kod bilan (original).
import { rr, star } from './tiles.js';

const cache = new Map();
function sprite(key, s, fn) {
  const size = Math.max(1, Math.round(s));
  const k = key + ':' + size;
  let cv = cache.get(k);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = cv.height = size;
  fn(cv.getContext('2d'), size);
  cache.set(k, cv);
  return cv;
}

export function stoneSprite(s) {
  return sprite('stone', s, (ctx, n) => {
    const g = ctx.createLinearGradient(0, 0, n, n);
    g.addColorStop(0, '#a49a8a'); g.addColorStop(1, '#5d564c');
    ctx.fillStyle = g;
    ctx.beginPath();
    const p = n * 0.08;
    ctx.moveTo(p + n * 0.15, p); ctx.lineTo(n - p - n * 0.1, p + n * 0.05); ctx.lineTo(n - p, n * 0.45);
    ctx.lineTo(n - p - n * 0.05, n - p); ctx.lineTo(p + n * 0.1, n - p); ctx.lineTo(p, n * 0.4); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,34,28,0.6)'; ctx.lineWidth = Math.max(1, n * 0.035);
    ctx.beginPath(); ctx.moveTo(n * 0.3, n * 0.3); ctx.lineTo(n * 0.5, n * 0.5); ctx.lineTo(n * 0.45, n * 0.75);
    ctx.moveTo(n * 0.5, n * 0.5); ctx.lineTo(n * 0.72, n * 0.42); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.ellipse(n * 0.35, n * 0.22, n * 0.18, n * 0.07, -0.3, 0, Math.PI * 2); ctx.fill();
  });
}

export function iceSprite(s, hp) {
  return sprite('ice' + hp, s, (ctx, n) => {
    ctx.fillStyle = hp > 1 ? 'rgba(200,240,255,0.55)' : 'rgba(200,240,255,0.32)';
    rr(ctx, n * 0.04, n * 0.04, n * 0.92, n * 0.92, n * 0.14); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = Math.max(1, n * 0.04);
    rr(ctx, n * 0.07, n * 0.07, n * 0.86, n * 0.86, n * 0.12); ctx.stroke();
    ctx.lineWidth = Math.max(1, n * 0.03);
    ctx.beginPath(); ctx.moveTo(n * 0.2, n * 0.3); ctx.lineTo(n * 0.38, n * 0.16); ctx.moveTo(n * 0.62, n * 0.84); ctx.lineTo(n * 0.82, n * 0.66); ctx.stroke();
    if (hp <= 1) {
      // yoriqlar
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = Math.max(1, n * 0.035);
      ctx.beginPath();
      ctx.moveTo(n * 0.5, n * 0.5); ctx.lineTo(n * 0.15, n * 0.6);
      ctx.moveTo(n * 0.5, n * 0.5); ctx.lineTo(n * 0.7, n * 0.12);
      ctx.moveTo(n * 0.5, n * 0.5); ctx.lineTo(n * 0.88, n * 0.55);
      ctx.moveTo(n * 0.5, n * 0.5); ctx.lineTo(n * 0.42, n * 0.9);
      ctx.stroke();
    }
  });
}

export function chainSprite(s) {
  return sprite('chain', s, (ctx, n) => {
    ctx.lineWidth = Math.max(1.5, n * 0.07);
    for (const [a, flip] of [[Math.PI / 4, 0], [-Math.PI / 4, 1]]) {
      ctx.save();
      ctx.translate(n / 2, n / 2); ctx.rotate(a);
      for (let i = -2; i <= 2; i++) {
        ctx.strokeStyle = (i + flip) % 2 ? '#d8dce4' : '#9aa3b2';
        ctx.beginPath(); ctx.ellipse(i * n * 0.17, 0, n * 0.11, n * 0.065, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }
    // qulf
    ctx.fillStyle = '#c9a23a';
    rr(ctx, n * 0.38, n * 0.46, n * 0.24, n * 0.2, n * 0.03); ctx.fill();
    ctx.strokeStyle = '#c9a23a'; ctx.lineWidth = Math.max(1, n * 0.04);
    ctx.beginPath(); ctx.arc(n * 0.5, n * 0.46, n * 0.08, Math.PI, 0); ctx.stroke();
  });
}

export function gemSprite(s) {
  return sprite('gem', s, (ctx, n) => {
    const cx = n / 2, cy = n / 2, w = n * 0.3, h = n * 0.34;
    ctx.fillStyle = '#e0245e';
    ctx.beginPath(); ctx.moveTo(cx - w, cy - h * 0.3); ctx.lineTo(cx - w * 0.5, cy - h); ctx.lineTo(cx + w * 0.5, cy - h); ctx.lineTo(cx + w, cy - h * 0.3); ctx.lineTo(cx, cy + h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff7aa2';
    ctx.beginPath(); ctx.moveTo(cx - w * 0.5, cy - h); ctx.lineTo(cx, cy - h * 0.3); ctx.lineTo(cx + w * 0.5, cy - h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.moveTo(cx - w * 0.7, cy - h * 0.35); ctx.lineTo(cx - w * 0.35, cy - h * 0.85); ctx.lineTo(cx - w * 0.2, cy - h * 0.35); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff0f5'; ctx.lineWidth = Math.max(1, n * 0.025);
    ctx.beginPath(); ctx.moveTo(cx - w, cy - h * 0.3); ctx.lineTo(cx - w * 0.5, cy - h); ctx.lineTo(cx + w * 0.5, cy - h); ctx.lineTo(cx + w, cy - h * 0.3); ctx.lineTo(cx, cy + h); ctx.closePath(); ctx.stroke();
  });
}

// Qurilish nishoni: bo'sh katakda oltin girih chizig'i; qurilgan katak — oltin nur.
export function targetSprite(s, built) {
  return sprite('target' + (built ? 1 : 0), s, (ctx, n) => {
    if (built) {
      const g = ctx.createRadialGradient(n / 2, n / 2, n * 0.1, n / 2, n / 2, n * 0.7);
      g.addColorStop(0, 'rgba(255,215,110,0.55)'); g.addColorStop(1, 'rgba(255,215,110,0.08)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, n, n);
    } else {
      ctx.strokeStyle = 'rgba(240,192,74,0.75)'; ctx.lineWidth = Math.max(1, n * 0.04);
      ctx.setLineDash([n * 0.08, n * 0.06]);
      rr(ctx, n * 0.1, n * 0.1, n * 0.8, n * 0.8, n * 0.12); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(240,192,74,0.35)';
      star(ctx, n / 2, n / 2, 8, n * 0.2, n * 0.12, Math.PI / 8); ctx.fill();
    }
  });
}

export function drawObstacleIcon(ctx, type, x, y, s, dpr = 1) {
  const size = s * 2;
  const img = type === 'ice' ? iceSprite(size * dpr, 2) : type === 'stone' ? stoneSprite(size * dpr) : type === 'chain' ? chainSprite(size * dpr) : type === 'gems' ? gemSprite(size * dpr) : targetSprite(size * dpr, false);
  if (type === 'ice') { ctx.fillStyle = '#1f5fc8'; ctx.beginPath(); ctx.roundRect(x - s, y - s, size, size, s * 0.3); ctx.fill(); }
  ctx.drawImage(img, x - s, y - s, size, size);
}
