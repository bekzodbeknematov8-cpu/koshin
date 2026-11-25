// Ilova qobig'i: canvas, sahnalar (ekranlar), kirish hodisalari, kadr sikli.
import { createGameScreen } from './ui/gameScreen.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const app = {
  canvas, ctx, dpr: 1, w: 0, h: 0,
  scene: null,
  vibrate(p) { try { if (app.settings.vibration !== false && navigator.vibrate) navigator.vibrate(p); } catch {} },
  sound: null,
  settings: {},
  setScene(s) {
    app.scene = s;
    if (s.layout) s.layout(app.w, app.h);
    app.requestFrame();
  },
  requestFrame,
};

function resize() {
  app.dpr = Math.min(window.devicePixelRatio || 1, 2);
  app.w = window.innerWidth; app.h = window.innerHeight;
  canvas.width = Math.round(app.w * app.dpr); canvas.height = Math.round(app.h * app.dpr);
  canvas.style.width = app.w + 'px'; canvas.style.height = app.h + 'px';
  ctx.setTransform(app.dpr, 0, 0, app.dpr, 0, 0);
  if (app.scene && app.scene.layout) app.scene.layout(app.w, app.h);
}

let pending = false, last = 0;
function requestFrame() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(frame);
}
function frame(now) {
  pending = false;
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
  last = now;
  if (app.scene) {
    app.scene.draw(now, dt);
    if (app.scene.active && app.scene.active(now)) requestFrame();
    else last = 0;
  }
}

const pos = (e) => [e.clientX, e.clientY];
let activePointer = null;
canvas.addEventListener('pointerdown', (e) => {
  if (activePointer !== null) return; // bir vaqtda bitta barmoq
  activePointer = e.pointerId;
  try { canvas.setPointerCapture(e.pointerId); } catch {}
  app.scene && app.scene.pointerDown && app.scene.pointerDown(...pos(e));
  requestFrame();
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId !== activePointer) return;
  app.scene && app.scene.pointerMove && app.scene.pointerMove(...pos(e));
  requestFrame();
});
const up = (e) => {
  if (e.pointerId !== activePointer) return;
  activePointer = null;
  app.scene && app.scene.pointerUp && app.scene.pointerUp(...pos(e));
  requestFrame();
};
canvas.addEventListener('pointerup', up);
canvas.addEventListener('pointercancel', (e) => {
  if (e.pointerId !== activePointer) return;
  activePointer = null;
  app.scene && app.scene.pointerCancel && app.scene.pointerCancel();
  requestFrame();
});
window.addEventListener('resize', () => { resize(); requestFrame(); });

resize();
let best = 0;
try { best = Number(localStorage.getItem('koshin.best') || 0); } catch {}
const screen = createGameScreen(app, {
  best: () => best,
  onMove(game) { if (game.score > best) { best = game.score; try { localStorage.setItem('koshin.best', String(best)); } catch {} } },
});
app.setScene(screen);

window.__koshin = () => ({ score: screen.game.score, moves: screen.game.moves, over: screen.game.over });
window.__app = app;
