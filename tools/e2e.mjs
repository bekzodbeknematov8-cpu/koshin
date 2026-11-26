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

// Omad charxi: bepul aylantirish → sovg'a hamyonga tushadi, ikkinchisi reklama bilan
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.__open.wheel());
await page.waitForTimeout(150);
const w0 = await page.evaluate(() => JSON.parse(localStorage.getItem('koshin.wallet') || 'null'));
const sb = await page.evaluate(() => { const R = Math.min(390 * 0.42, 844 * 0.3, 190); return { x: 195, y: 844 * 0.42 + R + 80 }; });
await page.mouse.click(sb.x, sb.y);
await page.waitForTimeout(200);
check(await page.evaluate(() => window.__app.scene.spinning), 'charx aylanyapti');
await page.waitForTimeout(4600);
const w1 = await page.evaluate(() => JSON.parse(localStorage.getItem('koshin.wallet')));
const sum = (w) => (w ? w.coins + Object.values(w.inv).reduce((a, b) => a + b, 0) : 0);
check(sum(w1) > sum(w0), 'charx sovg\'asi hamyonga tushdi');
check(await page.evaluate(() => JSON.parse(localStorage.getItem('koshin.wheel')).freeUsed === true), 'bepul aylantirish sarflandi');
await page.mouse.click(195, 400); // natijani yopish
await page.waitForTimeout(600);
await page.mouse.click(195, 400);
await page.mouse.click(sb.x, sb.y); // reklama bilan
await page.waitForTimeout(200);
check(await page.evaluate(() => window.__app.scene.spinning), 'reklama bilan yana aylantirildi');
await page.waitForTimeout(4600);

// Bepul tanga (reklama): menyudan
await page.evaluate(() => window.__open.menu());
await page.waitForTimeout(100);
const c0 = await page.evaluate(() => JSON.parse(localStorage.getItem('koshin.wallet')).coins);
await page.mouse.click(195 + 60, 844 * 0.9);
await page.waitForTimeout(100);
const c1 = await page.evaluate(() => JSON.parse(localStorage.getItem('koshin.wallet')).coins);
check(c1 === c0 + 25, 'bepul tanga +25');

// Cheksiz: o'yin tugadi → ikkinchi imkoniyat
await page.evaluate(() => window.__open.endless());
await page.waitForTimeout(100);
await page.evaluate(() => {
  const s = window.__app.scene; s.restart(); const g = s.game;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) g.board[r][c] = (r * 3 + c) % 4 === 0 ? -1 : 1;
  g.tray = [{ id: 'sq3', cells: [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]], color: 2 }, null, null];
  g.over = true; window.__app.requestFrame();
});
await page.waitForTimeout(800);
await page.mouse.click(195 + 60, 844 * 0.62);
await page.waitForTimeout(150);
const rv = await page.evaluate(() => ({ over: window.__app.scene.game.over, revived: window.__app.scene.game.revived }));
check(!rv.over && rv.revived, 'ikkinchi imkoniyat: o\'yin davom etdi');

// Demo reklama oynasi: ko'rsatiladi va 3 soniyadan keyin yopiladi
await page.evaluate(async () => {
  const { createAdManager } = await import('./src/ads/adManager.js');
  const { createAdState } = await import('./src/logic/ads.js');
  const m = createAdManager({ state: createAdState(), save() {}, day: () => 1, config: { provider: 'demo', h5: {}, admob: {}, grantWhenUnavailable: true },
    onDemo: (o) => { window.__app.adOverlay = { ...o, t: performance.now() }; window.__app.requestFrame(); } });
  m.init(); window.__demoGot = false;
  m.showRewarded('free_coins', () => { window.__demoGot = true; });
});
await page.waitForTimeout(300);
await page.mouse.click(195, 400);
check(!(await page.evaluate(() => window.__demoGot)), 'demo reklama: vaqtidan oldin yopilmaydi');
await page.waitForTimeout(3000);
await page.mouse.click(195, 400);
check(await page.evaluate(() => window.__demoGot && !window.__app.adOverlay), 'demo reklama: ko\'rilgandan keyin mukofot');

// Kichik ekran (iPhone SE): hamma narsa sig'adi
await page.setViewportSize({ width: 320, height: 568 });
await page.evaluate(() => window.__open.level(30));
await page.waitForTimeout(200);
const fit = await page.evaluate(() => { const L = window.__app.scene.layoutInfo; return { bottom: L.barY + 30, h: L.h, right: L.bx + L.boardPx, w: L.w }; });
check(fit.bottom <= fit.h && fit.right <= fit.w, `kichik ekranga sig'adi (${Math.round(fit.bottom)}/${fit.h})`);

await browser.close(); server.close();
if (errors.length) { console.error('Konsol xatolari:\n' + errors.join('\n')); process.exit(1); }
console.log('E2E OK');
