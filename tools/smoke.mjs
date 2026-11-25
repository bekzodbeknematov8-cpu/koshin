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
// Pastdagi har bir shaklni maydon markaziga sudrab ko'ramiz
for (const x of [65, 195, 325]) {
  await page.mouse.move(x, 700); await page.mouse.down();
  await page.mouse.move(195, 400, { steps: 8 }); await page.mouse.up();
  await page.waitForTimeout(150);
}
await page.waitForTimeout(500);
if (process.argv[2]) await page.screenshot({ path: process.argv[2] });
const info = await page.evaluate(() => window.__koshin ? window.__koshin() : null);
await browser.close(); server.close();
console.log('info:', JSON.stringify(info));
if (errors.length) { console.error('XATOLAR:\n' + errors.join('\n')); process.exit(1); }
console.log('smoke OK');
