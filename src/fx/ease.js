// Animatsiya yordamchilari — DOM'siz, test qilinadi.
export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInCubic = (t) => Math.pow(clamp01(t), 3);
export function easeOutBack(t, s = 1.70158) {
  t = clamp01(t) - 1;
  return t * t * ((s + 1) * t + s) + 1;
}
// Ochko sanog'i animatsiyasi: ko'rsatilayotgan qiymat maqsadga silliq yaqinlashadi.
export function approach(shown, target, dt, speed = 10) {
  if (shown === target) return target;
  const next = shown + (target - shown) * (1 - Math.exp(-speed * dt));
  return Math.abs(target - next) < 1 ? target : next;
}
