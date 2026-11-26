// Service worker: o'yin internetsiz ishlashi uchun barcha fayllar keshlanadi (cache-first).
// FILES va VERSION ni tools/build-sw.mjs avtomatik yangilaydi.
const VERSION = '9f5f6c6b45';
const CACHE = 'koshin-' + VERSION;
const FILES = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './index.html',
  './manifest.webmanifest',
  './src/ads/adManager.js',
  './src/ads/config.js',
  './src/audio/sound.js',
  './src/audio/synth.js',
  './src/fx/ease.js',
  './src/fx/particles.js',
  './src/i18n.js',
  './src/logic/ads.js',
  './src/logic/board.js',
  './src/logic/bot.js',
  './src/logic/buildings.js',
  './src/logic/daily.js',
  './src/logic/game.js',
  './src/logic/generator.js',
  './src/logic/levelGame.js',
  './src/logic/levels.js',
  './src/logic/meta.js',
  './src/logic/obstacles.js',
  './src/logic/powerups.js',
  './src/logic/progress.js',
  './src/logic/revive.js',
  './src/logic/score.js',
  './src/logic/shapes.js',
  './src/logic/storage.js',
  './src/logic/wheel.js',
  './src/main.js',
  './src/net/leaderboard.js',
  './src/render/background.js',
  './src/render/obstacles.js',
  './src/render/palette.js',
  './src/render/tiles.js',
  './src/ui/dailyMode.js',
  './src/ui/gameScreen.js',
  './src/ui/levelMode.js',
  './src/ui/mapLayout.js',
  './src/ui/mapScreen.js',
  './src/ui/menuScreens.js',
  './src/ui/wheelScreen.js',
  './src/ui/widgets.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', ...FILES])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('koshin-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match('./index.html'))),
  );
});
