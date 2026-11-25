// Ilova belgilarini (PNG) koshin plitkasi chizish kodidan yaratadi: icons/icon-192.png, icon-512.png, maskable-512.png.
// Ishlatish: node tools/make-icons.mjs  (Playwright kerak)
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const root = new URL('..', import.meta.url).pathname;
const server = createServer(async (req, res) => {
  if (req.url === '/blank.html') { res.writeHead(200, { 'content-type': 'text/html' }); res.end('<!doctype html><body></body>'); return; }
  try { const b = await readFile(join(root, req.url)); res.writeHead(200, { 'content-type': extname(req.url) === '.js' ? 'text/javascript' : 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://localhost:${server.address().port}/blank.html`);
const out = await page.evaluate(async () => {
  const { tileSprite } = await import('/src/render/tiles.js');
  const make = (size, maskable) => {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, '#0a1433'); g.addColorStop(1, '#2a2a6e');
    x.fillStyle = g;
    if (maskable) x.fillRect(0, 0, size, size);
    else { x.beginPath(); x.roundRect(0, 0, size, size, size * 0.22); x.fill(); }
    // 2x2 koshin plitkalari
    const inner = maskable ? size * 0.56 : size * 0.72, s = inner / 2, o = (size - inner) / 2;
    [[0, 0, 0], [1, 0, 1], [0, 1, 2], [1, 1, 4]].forEach(([cx, cy, col]) => x.drawImage(tileSprite(col, s), o + cx * s, o + cy * s, s, s));
    return c.toDataURL('image/png');
  };
  return { i192: make(192, false), i512: make(512, false), m512: make(512, true) };
});
const w = (name, url) => writeFile(join(root, 'icons', name), Buffer.from(url.split(',')[1], 'base64'));
await w('icon-192.png', out.i192); await w('icon-512.png', out.i512); await w('maskable-512.png', out.m512);
await browser.close(); server.close();
console.log('icons OK');
