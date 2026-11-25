// Brauzerda tutun testi (Playwright mavjud bo'lsa): sahifa xatosiz yuklanadimi, sudrab qo'yish ishlaydimi.
// Ishlatish: node tools/smoke.mjs [screenshot.png]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const p = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  try { const b = await readFile(p); res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(`http://localhost:${port}/index.html${process.argv[3] || ''}`);
await page.waitForTimeout(800);
if (process.env.SHOTS) await page.screenshot({ path: process.env.SHOTS + '/map.png' });
// Xarita: birinchi bosqich tuguniga bosish → bosqich ochiladi
const lvl = await page.evaluate(() => {
  if (!window.__open) return null;
  window.__open.level(0);
  return window.__koshin();
});
if (lvl && !lvl.status) throw new Error('bosqich ochilmadi');
if (process.env.SHOTS) { await page.waitForTimeout(300); await page.screenshot({ path: process.env.SHOTS + '/level.png' }); }
await page.evaluate(() => window.__open && window.__open.endless());
await page.waitForTimeout(200);
// Pastdagi har bir shaklni maydon markaziga sudrab ko'ramiz
const L = await page.evaluate(() => { const s = window.__app && window.__app.scene; return s && s.layoutInfo; });
if (L && L.slotW) {
  const targets = [[1, 1], [1, 5], [5, 2]];
  for (let i = 0; i < 3; i++) {
    const x = L.trayX + L.slotW * (i + 0.5), y = L.trayY + L.trayH / 2;
    await page.mouse.move(x, y); await page.mouse.down();
    const [r, c] = targets[i];
    await page.mouse.move(L.bx + (c + 1) * L.cell, L.by + (r + 3.4) * L.cell, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(150);
  }
}
await page.waitForTimeout(500);
if (process.argv[2]) await page.screenshot({ path: process.argv[2] });
// Ixtiyoriy: SHOTS=papka — tozalash va o'yin tugashi holatlarining skrinshotlari
if (process.env.SHOTS && L && L.slotW) {
  const dir = process.env.SHOTS;
  await page.evaluate(() => { const s = window.__app.scene; s.restart(); const g = s.game; for (let c = 0; c < 7; c++) { g.board[3][c] = c % 5; g.board[4][c] = (c + 1) % 5; } g.tray[0] = { id: 'v2', cells: [[0, 0], [1, 0]], color: 2 }; window.__app.requestFrame(); });
  await page.mouse.move(L.trayX + L.slotW * 0.5, L.trayY + L.trayH / 2); await page.mouse.down();
  await page.mouse.move(L.bx + 7.5 * L.cell, L.by + 5.9 * L.cell, { steps: 6 });
  await page.screenshot({ path: dir + '/drag.png' });
  await page.mouse.up(); await page.waitForTimeout(120);
  await page.screenshot({ path: dir + '/clear.png' });
  await page.evaluate(() => { window.__app.scene.game.over = true; window.__app.requestFrame(); });
  await page.waitForTimeout(800);
  await page.screenshot({ path: dir + '/over.png' });
}
const info = await page.evaluate(() => window.__koshin ? window.__koshin() : null);
await browser.close(); server.close();
console.log('info:', JSON.stringify(info));
if (errors.length) { console.error('XATOLAR:\n' + errors.join('\n')); process.exit(1); }
console.log('smoke OK');
