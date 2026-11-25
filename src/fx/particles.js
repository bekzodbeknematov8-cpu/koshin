// Oltin chang zarrachalari — sof mantiq (chizish alohida).
import { createRng } from '../logic/shapes.js';

export function createParticles(seed = 1) {
  return { list: [], rng: createRng(seed) };
}

// (x, y) — katak markazi, size — katak o'lchami (px).
export function burst(ps, x, y, size, count = 10, palette = ['#f5c542', '#ffe08a', '#d9a62e', '#fff4cf']) {
  const { rng } = ps;
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2;
    const sp = size * (1.5 + rng() * 4);
    ps.list.push({
      x: x + (rng() - 0.5) * size * 0.6,
      y: y + (rng() - 0.5) * size * 0.6,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - size * 3,
      r: size * (0.04 + rng() * 0.07),
      life: 0,
      max: 0.6 + rng() * 0.6,
      color: palette[Math.floor(rng() * palette.length)],
      spin: rng() * Math.PI,
    });
  }
}

// dt soniyada. Tirik zarrachalar sonini qaytaradi.
export function stepParticles(ps, dt, gravity = 900) {
  const out = [];
  for (const p of ps.list) {
    p.life += dt;
    if (p.life >= p.max) continue;
    p.vy += gravity * dt;
    p.vx *= Math.pow(0.35, dt);
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.spin += dt * 6;
    out.push(p);
  }
  ps.list = out;
  return out.length;
}

export const MAX_PARTICLES = 600;
export function trimParticles(ps, max = MAX_PARTICLES) {
  if (ps.list.length > max) ps.list.splice(0, ps.list.length - max);
}
