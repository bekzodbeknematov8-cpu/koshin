// Umumiy UI elementlar: dumaloq tugmalar va belgilar (matnsiz tushunarli).
import { UI, FONT } from '../render/palette.js';
import { star as starPath } from '../render/tiles.js';

export function drawRoundButton(ctx, x, y, r, icon, opts = {}) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = opts.fill || UI.gold;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r - 3, 0, Math.PI * 2); ctx.stroke();
  const fg = opts.fg || '#1b2457';
  ctx.fillStyle = fg; ctx.strokeStyle = fg;
  ctx.lineWidth = r * 0.14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  drawIcon(ctx, icon, x, y, r * 0.5, fg);
  if (opts.badge) {
    ctx.fillStyle = '#e0561f';
    ctx.beginPath(); ctx.arc(x + r * 0.72, y - r * 0.72, r * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.round(r * 0.38)}px ${FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(opts.badge), x + r * 0.72, y - r * 0.7);
  }
  ctx.restore();
}

export function drawIcon(ctx, icon, x, y, s, color = '#1b2457') {
  ctx.save();
  ctx.fillStyle = color; ctx.strokeStyle = color;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (!ctx.lineWidth || ctx.lineWidth < 1) ctx.lineWidth = Math.max(2, s * 0.28);
  switch (icon) {
    case 'play':
      ctx.beginPath(); ctx.moveTo(x - s * 0.45, y - s * 0.7); ctx.lineTo(x + s * 0.75, y); ctx.lineTo(x - s * 0.45, y + s * 0.7); ctx.closePath(); ctx.fill();
      break;
    case 'retry': {
      ctx.lineWidth = s * 0.28;
      ctx.beginPath(); ctx.arc(x, y, s * 0.7, -Math.PI * 0.3, Math.PI * 1.5); ctx.stroke();
      const a = -Math.PI * 0.3, ax = x + Math.cos(a) * s * 0.7, ay = y + Math.sin(a) * s * 0.7;
      ctx.beginPath(); ctx.moveTo(ax + s * 0.35, ay - s * 0.05); ctx.lineTo(ax - s * 0.1, ay - s * 0.45); ctx.lineTo(ax - s * 0.12, ay + s * 0.3); ctx.closePath(); ctx.fill();
      break;
    }
    case 'map': case 'home':
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.85); ctx.lineTo(x + s * 0.85, y - s * 0.05); ctx.lineTo(x + s * 0.6, y - s * 0.05);
      ctx.lineTo(x + s * 0.6, y + s * 0.75); ctx.lineTo(x - s * 0.6, y + s * 0.75); ctx.lineTo(x - s * 0.6, y - s * 0.05);
      ctx.lineTo(x - s * 0.85, y - s * 0.05); ctx.closePath(); ctx.fill();
      break;
    case 'back':
      ctx.lineWidth = s * 0.3;
      ctx.beginPath(); ctx.moveTo(x + s * 0.3, y - s * 0.7); ctx.lineTo(x - s * 0.4, y); ctx.lineTo(x + s * 0.3, y + s * 0.7); ctx.stroke();
      break;
    case 'close':
      ctx.lineWidth = s * 0.3;
      ctx.beginPath(); ctx.moveTo(x - s * 0.55, y - s * 0.55); ctx.lineTo(x + s * 0.55, y + s * 0.55);
      ctx.moveTo(x + s * 0.55, y - s * 0.55); ctx.lineTo(x - s * 0.55, y + s * 0.55); ctx.stroke();
      break;
    case 'ad': {
      // "reklama ko'r": ekran + play
      ctx.lineWidth = s * 0.18;
      ctx.strokeRect(x - s * 0.85, y - s * 0.6, s * 1.7, s * 1.2);
      ctx.beginPath(); ctx.moveTo(x - s * 0.25, y - s * 0.35); ctx.lineTo(x + s * 0.4, y); ctx.lineTo(x - s * 0.25, y + s * 0.35); ctx.closePath(); ctx.fill();
      break;
    }
    case 'infinity':
      ctx.lineWidth = s * 0.25;
      ctx.beginPath();
      ctx.ellipse(x - s * 0.45, y, s * 0.42, s * 0.32, 0, 0, Math.PI * 2);
      ctx.moveTo(x + s * 0.87, y);
      ctx.ellipse(x + s * 0.45, y, s * 0.42, s * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'calendar':
      ctx.lineWidth = s * 0.18;
      ctx.strokeRect(x - s * 0.75, y - s * 0.55, s * 1.5, s * 1.35);
      ctx.fillRect(x - s * 0.75, y - s * 0.55, s * 1.5, s * 0.4);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) ctx.fillRect(x - s * 0.5 + i * s * 0.4, y + s * 0.05 + j * s * 0.35, s * 0.2, s * 0.2);
      break;
    case 'star':
      starPath(ctx, x, y, 5, s, s * 0.45, -Math.PI / 2); ctx.fill();
      break;
    case 'lock':
      ctx.lineWidth = s * 0.22;
      ctx.beginPath(); ctx.arc(x, y - s * 0.2, s * 0.4, Math.PI, 0); ctx.stroke();
      ctx.fillRect(x - s * 0.6, y - s * 0.2, s * 1.2, s * 0.95);
      break;
    case 'gear': {
      starPath(ctx, x, y, 8, s * 0.85, s * 0.65, 0); ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.arc(x, y, s * 0.3, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'share': {
      const pts = [[x + s * 0.5, y - s * 0.6], [x - s * 0.5, y], [x + s * 0.5, y + s * 0.6]];
      ctx.lineWidth = s * 0.18;
      ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(...pts[1]); ctx.lineTo(...pts[2]); ctx.stroke();
      for (const [px, py] of pts) { ctx.beginPath(); ctx.arc(px, py, s * 0.26, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'bomb': {
      ctx.beginPath(); ctx.arc(x - s * 0.1, y + s * 0.15, s * 0.62, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x + s * 0.1, y - s * 0.65, s * 0.32, s * 0.3);
      ctx.lineWidth = s * 0.12;
      ctx.beginPath(); ctx.moveTo(x + s * 0.3, y - s * 0.65); ctx.quadraticCurveTo(x + s * 0.5, y - s * 1.0, x + s * 0.8, y - s * 0.85); ctx.stroke();
      ctx.fillStyle = '#ff9a2e';
      starPath(ctx, x + s * 0.85, y - s * 0.88, 6, s * 0.25, s * 0.1, 0); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath(); ctx.arc(x - s * 0.32, y - s * 0.05, s * 0.14, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'hammer': {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 4);
      ctx.fillRect(-s * 0.1, -s * 0.3, s * 0.2, s * 1.15);
      ctx.fillRect(-s * 0.6, -s * 0.72, s * 1.2, s * 0.45);
      ctx.restore();
      break;
    }
    case 'rotate': {
      ctx.lineWidth = s * 0.22;
      ctx.beginPath(); ctx.arc(x, y, s * 0.62, Math.PI * 0.9, Math.PI * 2.25); ctx.stroke();
      const a = Math.PI * 2.25, ax = x + Math.cos(a) * s * 0.62, ay = y + Math.sin(a) * s * 0.62;
      ctx.beginPath(); ctx.moveTo(ax + s * 0.32, ay - s * 0.12); ctx.lineTo(ax - s * 0.05, ay + s * 0.38); ctx.lineTo(ax - s * 0.3, ay - s * 0.2); ctx.closePath(); ctx.fill();
      break;
    }
    case 'swap': {
      ctx.lineWidth = s * 0.2;
      ctx.beginPath(); ctx.moveTo(x - s * 0.7, y - s * 0.3); ctx.lineTo(x + s * 0.5, y - s * 0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + s * 0.8, y - s * 0.3); ctx.lineTo(x + s * 0.4, y - s * 0.65); ctx.lineTo(x + s * 0.4, y + s * 0.05); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + s * 0.7, y + s * 0.35); ctx.lineTo(x - s * 0.5, y + s * 0.35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - s * 0.8, y + s * 0.35); ctx.lineTo(x - s * 0.4, y); ctx.lineTo(x - s * 0.4, y + s * 0.7); ctx.closePath(); ctx.fill();
      break;
    }
    case 'coin': drawCoin(ctx, x, y, s); break;
    case 'trophy': {
      ctx.beginPath(); ctx.moveTo(x - s * 0.6, y - s * 0.75); ctx.lineTo(x + s * 0.6, y - s * 0.75); ctx.lineTo(x + s * 0.45, y); ctx.quadraticCurveTo(x, y + s * 0.3, x - s * 0.45, y); ctx.closePath(); ctx.fill();
      ctx.lineWidth = s * 0.14;
      ctx.beginPath(); ctx.arc(x - s * 0.62, y - s * 0.42, s * 0.25, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + s * 0.62, y - s * 0.42, s * 0.25, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
      ctx.fillRect(x - s * 0.1, y + s * 0.1, s * 0.2, s * 0.4);
      ctx.fillRect(x - s * 0.4, y + s * 0.5, s * 0.8, s * 0.2);
      break;
    }
    case 'list': {
      for (let i = 0; i < 3; i++) {
        const yy = y - s * 0.5 + i * s * 0.5;
        ctx.beginPath(); ctx.arc(x - s * 0.6, yy, s * 0.11, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(x - s * 0.35, yy - s * 0.08, s * 1.05, s * 0.16);
      }
      break;
    }
    case 'speaker': case 'speaker-off': {
      ctx.beginPath(); ctx.moveTo(x - s * 0.8, y - s * 0.3); ctx.lineTo(x - s * 0.4, y - s * 0.3); ctx.lineTo(x, y - s * 0.7); ctx.lineTo(x, y + s * 0.7); ctx.lineTo(x - s * 0.4, y + s * 0.3); ctx.lineTo(x - s * 0.8, y + s * 0.3); ctx.closePath(); ctx.fill();
      ctx.lineWidth = s * 0.14;
      if (icon === 'speaker') { ctx.beginPath(); ctx.arc(x + s * 0.1, y, s * 0.45, -0.8, 0.8); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s * 0.1, y, s * 0.75, -0.8, 0.8); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(x + s * 0.25, y - s * 0.35); ctx.lineTo(x + s * 0.85, y + s * 0.35); ctx.moveTo(x + s * 0.85, y - s * 0.35); ctx.lineTo(x + s * 0.25, y + s * 0.35); ctx.stroke(); }
      break;
    }
    case 'note': case 'note-off': {
      ctx.beginPath(); ctx.ellipse(x - s * 0.35, y + s * 0.5, s * 0.28, s * 0.2, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + s * 0.45, y + s * 0.35, s * 0.28, s * 0.2, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = s * 0.13;
      ctx.beginPath(); ctx.moveTo(x - s * 0.1, y + s * 0.5); ctx.lineTo(x - s * 0.1, y - s * 0.6); ctx.lineTo(x + s * 0.7, y - s * 0.75); ctx.lineTo(x + s * 0.7, y + s * 0.35); ctx.stroke();
      if (icon === 'note-off') { ctx.lineWidth = s * 0.16; ctx.beginPath(); ctx.moveTo(x - s * 0.8, y - s * 0.8); ctx.lineTo(x + s * 0.9, y + s * 0.8); ctx.stroke(); }
      break;
    }
    case 'vibrate': case 'vibrate-off': {
      ctx.lineWidth = s * 0.14;
      ctx.strokeRect(x - s * 0.3, y - s * 0.6, s * 0.6, s * 1.2);
      ctx.beginPath(); ctx.moveTo(x - s * 0.55, y - s * 0.35); ctx.lineTo(x - s * 0.55, y + s * 0.35); ctx.moveTo(x + s * 0.55, y - s * 0.35); ctx.lineTo(x + s * 0.55, y + s * 0.35);
      ctx.moveTo(x - s * 0.8, y - s * 0.2); ctx.lineTo(x - s * 0.8, y + s * 0.2); ctx.moveTo(x + s * 0.8, y - s * 0.2); ctx.lineTo(x + s * 0.8, y + s * 0.2); ctx.stroke();
      if (icon === 'vibrate-off') { ctx.lineWidth = s * 0.16; ctx.beginPath(); ctx.moveTo(x - s * 0.9, y - s * 0.8); ctx.lineTo(x + s * 0.9, y + s * 0.8); ctx.stroke(); }
      break;
    }
    case 'globe': {
      ctx.lineWidth = s * 0.12;
      ctx.beginPath(); ctx.arc(x, y, s * 0.75, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, y, s * 0.32, s * 0.75, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - s * 0.75, y); ctx.lineTo(x + s * 0.75, y); ctx.stroke();
      break;
    }
    case 'gift': {
      ctx.fillRect(x - s * 0.7, y - s * 0.15, s * 1.4, s * 0.9);
      ctx.fillRect(x - s * 0.8, y - s * 0.45, s * 1.6, s * 0.3);
      ctx.lineWidth = s * 0.14;
      ctx.beginPath(); ctx.ellipse(x - s * 0.25, y - s * 0.6, s * 0.25, s * 0.15, 0.4, 0, Math.PI * 2); ctx.ellipse(x + s * 0.25, y - s * 0.6, s * 0.25, s * 0.15, -0.4, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

// Ipak Yo'li tangasi: dumaloq, o'rtasida to'rtburchak teshik.
export function drawCoin(ctx, x, y, r) {
  ctx.save();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#ffe9a0'); g.addColorStop(1, '#c48a1a');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8a5a0a'; ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.beginPath(); ctx.arc(x, y, r * 0.78, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#5a3a06';
  ctx.fillRect(x - r * 0.25, y - r * 0.25, r * 0.5, r * 0.5);
  ctx.restore();
}

export function drawStar(ctx, x, y, r, filled, color = UI.gold) {
  ctx.save();
  starPath(ctx, x, y, 5, r, r * 0.45, -Math.PI / 2);
  if (filled) { ctx.fillStyle = color; ctx.fill(); }
  else { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}

// Matnni qatorlarga bo'lish (canvas).
export function wrapText(ctx, text, maxW) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export function hit(x, y, bx, by, r) { return Math.hypot(x - bx, y - by) <= r; }

export function panel(ctx, x, y, w, h, r = 18) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#132459';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = UI.gold;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x + 4, y + 4, w - 8, h - 8, r - 4); ctx.stroke();
}
