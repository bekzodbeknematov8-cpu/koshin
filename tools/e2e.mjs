// To'liq o'yin oqimi (brauzerda, haqiqiy sudrash bilan): menyu → xarita → 1-bosqich → bot o'ynaydi → g'alaba →
// yulduz saqlanadi → keyingi bosqich; Cheksiz rejim qayta yuklashdan keyin davom etadi; til o'zgaradi; mag'lubiyat → +5 yurish.
// Ishlatish: node tools/e2e.mjs
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const root = new URL('..', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  const p = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  try { const b = await readFile(p); res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const url = `http://localhost:${server.address().port}/index.html`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
await ctx.addInitScript(() => { window.__noSW = true; });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const check = (cond, msg) => { if (!cond) throw new Error('XATO: ' + msg); console.log('✓', msg); };

await page.goto(url);
await page.waitForTimeout(500);
await page.mouse.click(10, 420); // sovg'a oynasini yopish
await page.waitForTimeout(450);
await page.mouse.click(10, 420);
check((await page.evaluate(() => window.__koshin())).scene === 'menu', 'bosh menyu ochildi');

// Sarguzasht tugmasi (ekran markazi, h*0.42)
await page.mouse.click(195, 844 * 0.42);
await page.waitForTimeout(200);
check((await page.evaluate(() => window.__koshin())).scene === 'map', 'xarita ochildi');

// 1-bosqich tuguni: xarita joylashuvidan hisoblaymiz
const node = await page.evaluate(async () => {
  const m = await import('./src/ui/mapLayout.js');
  const s = m.scrollFor(0, innerHeight, 0);
  return { x: m.nodeX(0, innerWidth), y: m.screenY(m.nodeDistance(0), s, innerHeight) };
});
await page.mouse.click(node.x, node.y);
await page.waitForTimeout(250);
check((await page.evaluate(() => window.__koshin())).status === 'playing', '1-bosqich tugunni bosib ochildi');

// Bot haqiqiy sudrash bilan o'ynaydi
async function playByDrag(maxMoves = 60) {
  for (let i = 0; i < maxMoves; i++) {
    const st = await page.evaluate(async () => {
      const { bestMove } = await import('./src/logic/bot.js');
      const { shapeSize } = await import('./src/logic/shapes.js');
      const s = window.__app.scene, g = s.game, L = s.layoutInfo;
      if (g.over) return { over: true };
      const m = bestMove(g);
      if (!m) return { over: true };
      const p = g.tray[m.index];
      const { rows, cols } = shapeSize(p.cells);
      return {
        from: { x: L.trayX + L.slotW * (m.index + 0.5), y: L.trayY + L.trayH / 2 },
        to: { x: L.bx + m.col * L.cell + (cols * L.cell) / 2, y: L.by + m.row * L.cell + rows * L.cell + 0.9 * L.cell },
        moves: g.moves,
      };
    });
    if (st.over) return;
    await page.mouse.move(st.from.x, st.from.y);
    await page.mouse.down();
    await page.mouse.move(st.to.x, st.to.y, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(30);
    const after = await page.evaluate(() => window.__app.scene.game.moves);
    if (after !== st.moves + 1 && !(await page.evaluate(() => window.__app.scene.game.over))) throw new Error('sudrab qo\'yish joyiga tushmadi (yurish ' + i + ')');
  }
}
await playByDrag();
let st = await page.evaluate(() => window.__koshin());
check(st.status === 'won', '1-bosqich yutildi (sudrab qo\'yish aniq joyga tushadi)');
await page.waitForTimeout(1600);
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('koshin.progress')));
check(saved.stars[0] >= 1 && saved.unlocked === 1, `yulduz saqlandi (${saved.stars[0]}★)`);
const coins = await page.evaluate(() => JSON.parse(localStorage.getItem('koshin.wallet')).coins);
check(coins > 120, 'tanga qo\'shildi: ' + coins);

// "Keyingi" tugmasi (g'alaba oynasi: w/2+70, h*0.62)
await page.mouse.click(195 + 70, 844 * 0.62);
await page.waitForTimeout(250);
check(await page.evaluate(() => window.__app.scene.level && window.__app.scene.level.index === 1), 'keyingi bosqichga o\'tildi');

// Mag'lubiyat va +5 yurish (reklama joyi)
await page.evaluate(() => { const g = window.__app.scene.game; g.movesLeft = 1; window.__app.requestFrame(); });
await playByDrag(1);
st = await page.evaluate(() => window.__koshin());
if (st.status === 'lost') {
  await page.waitForTimeout(700);
  await page.mouse.click(195 + 90, 844 * 0.62);
  await page.waitForTimeout(100);
  const g = await page.evaluate(() => ({ s: window.__app.scene.game.status, m: window.__app.scene.game.movesLeft }));
  check(g.s === 'playing' && g.m === 5, 'mag\'lubiyatdan keyin +5 yurish berildi');
} else console.log('(bosqich bitta yurishda yutildi — +5 tekshiruvi o\'tkazildi)');

// Cheksiz rejim: bir necha yurish → qayta yuklash → davom etadi
await page.evaluate(() => window.__open.endless());
await page.waitForTimeout(150);
await playByDrag(5);
const before = await page.evaluate(() => ({ score: window.__app.scene.game.score, moves: window.__app.scene.game.moves }));
await page.reload();
await page.waitForTimeout(400);
await page.evaluate(() => window.__open.endless());
await page.waitForTimeout(150);
const after = await page.evaluate(() => ({ score: window.__app.scene.game.score, moves: window.__app.scene.game.moves }));
check(after.moves === before.moves && after.score === before.score, `Cheksiz o'yin qayta yuklashdan keyin davom etdi (${after.score})`);

// Til: sozlamalardan O'zbekcha
await page.evaluate(() => window.__open.settings());
await page.waitForTimeout(100);
await page.mouse.click(195 + (1 - 1.5) * 86, 844 * 0.24 + 290);
await page.waitForTimeout(100);
const lang = await page.evaluate(async () => (await import('./src/i18n.js')).t('city.kokand'));
check(lang === "Qo'qon", 'til O\'zbekchaga o\'zgardi');
const savedLang = await page.evaluate(() => JSON.parse(localStorage.getItem('koshin.settings')).lang);
check(savedLang === 'uz', 'til saqlandi');

// Kichik ekran (iPhone SE): hamma narsa sig'adi
await page.setViewportSize({ width: 320, height: 568 });
await page.evaluate(() => window.__open.level(30));
await page.waitForTimeout(200);
const fit = await page.evaluate(() => { const L = window.__app.scene.layoutInfo; return { bottom: L.barY + 30, h: L.h, right: L.bx + L.boardPx, w: L.w }; });
check(fit.bottom <= fit.h && fit.right <= fit.w, `kichik ekranga sig'adi (${Math.round(fit.bottom)}/${fit.h})`);

await browser.close(); server.close();
if (errors.length) { console.error('Konsol xatolari:\n' + errors.join('\n')); process.exit(1); }
console.log('E2E OK');
