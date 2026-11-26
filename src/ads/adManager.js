// Reklama boshqaruvchisi: provayderlar (AdMob / AdSense H5 / demo / yo'q) + siyosat (src/logic/ads.js).
import { ADS_CONFIG } from './config.js';
import { canShowRewarded, noteRewarded, noteLevelEnd, shouldShowInterstitial, noteInterstitial, rollAdDay } from '../logic/ads.js';

export function createAdManager({ state, save, day, audio, config = ADS_CONFIG, onDemo }) {
  let provider = null;
  let busy = false;

  function pickProvider() {
    const p = config.provider;
    const admob = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob;
    if ((p === 'auto' || p === 'admob') && admob && config.admob.rewardedId) return admobProvider(admob, config.admob);
    if ((p === 'auto' || p === 'h5') && config.h5.clientId) return h5Provider(config.h5);
    if (p === 'demo') return demoProvider(onDemo);
    return null;
  }

  // Reklama vaqtida musiqa/ovoz to'xtaydi
  const quiet = () => { try { audio && audio.pause(); } catch {} };
  const loud = () => { try { audio && audio.started && audio.resume(); } catch {} };

  function showRewarded(placement, onReward, onFail) {
    const d = day();
    if (busy) return false;
    if (!canShowRewarded(state, placement, d)) { onFail && onFail('limit'); return false; }
    if (!provider) {
      if (config.grantWhenUnavailable) { noteRewarded(state, placement, Date.now(), d); save(); onReward(); return true; }
      onFail && onFail('unavailable'); return false;
    }
    busy = true; quiet();
    provider.rewarded(placement, (ok) => {
      busy = false; loud();
      if (ok) { noteRewarded(state, placement, Date.now(), day()); save(); onReward(); }
      else onFail && onFail('skipped');
    });
    return true;
  }

  // Bosqich tugagach chaqiriladi; reklama ko'rsatilsa ham, ko'rsatilmasa ham done() chaqiriladi.
  function levelBreak(done) {
    noteLevelEnd(state); save();
    const now = Date.now();
    if (!provider || busy || !shouldShowInterstitial(state, now, day())) { done(); return false; }
    busy = true; quiet();
    noteInterstitial(state, now, day()); save();
    provider.interstitial(() => { busy = false; loud(); done(); });
    return true;
  }

  return {
    init() { provider = pickProvider(); if (provider && provider.init) provider.init(); return !!provider; },
    get provider() { return provider ? provider.name : 'none'; },
    get busy() { return busy; },
    state,
    canShow: (placement) => canShowRewarded(rollAdDay(state, day()), placement, day()),
    showRewarded,
    levelBreak,
    setNoAds(v) { state.noAds = !!v; save(); }, // kelajakda "Reklamasiz" xaridi uchun
  };
}

// --- Google AdSense H5 Games Ads (veb / PWA) ---
function h5Provider(cfg) {
  let ready = false;
  return {
    name: 'h5',
    init() {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adBreak = window.adConfig = function (o) { window.adsbygoogle.push(o); };
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(cfg.clientId);
      s.crossOrigin = 'anonymous';
      s.setAttribute('data-ad-frequency-hint', '180s');
      if (cfg.testMode) s.setAttribute('data-adbreak-test', 'on');
      s.onload = () => { ready = true; };
      document.head.appendChild(s);
      window.adConfig({ preloadAdBreaks: 'on', sound: 'on' });
    },
    rewarded(name, cb) {
      if (!ready) { cb(false); return; }
      let done = false, got = false;
      const finish = () => { if (!done) { done = true; cb(got); } };
      window.adBreak({
        type: 'reward', name,
        beforeReward(showAdFn) { showAdFn(); },
        adViewed() { got = true; },
        adDismissed() { got = false; },
        adBreakDone() { finish(); },
      });
      setTimeout(() => { if (!done && !got) finish(); }, 45000); // reklama kelmasa osilib qolmaslik
    },
    interstitial(cb) {
      if (!ready) { cb(); return; }
      window.adBreak({ type: 'next', name: 'level_break', adBreakDone() { cb(); } });
    },
  };
}

// --- AdMob (Capacitor ilova, @capacitor-community/admob plagini) ---
function admobProvider(AdMob, cfg) {
  return {
    name: 'admob',
    init() { try { AdMob.initialize({ initializeForTesting: !!cfg.testing }); } catch {} },
    async rewarded(name, cb) {
      try {
        await AdMob.prepareRewardVideoAd({ adId: cfg.rewardedId, isTesting: !!cfg.testing });
        const r = await AdMob.showRewardVideoAd();
        cb(!!r);
      } catch { cb(false); }
    },
    async interstitial(cb) {
      if (!cfg.interstitialId) { cb(); return; }
      try {
        await AdMob.prepareInterstitial({ adId: cfg.interstitialId, isTesting: !!cfg.testing });
        await AdMob.showInterstitial();
      } catch {}
      cb();
    },
  };
}

// --- Demo: ekranda soxta reklama oynasi (sinov uchun) ---
function demoProvider(onDemo) {
  return {
    name: 'demo',
    rewarded(name, cb) { onDemo ? onDemo({ kind: 'reward', name, done: cb }) : cb(true); },
    interstitial(cb) { onDemo ? onDemo({ kind: 'inter', done: () => cb() }) : cb(); },
  };
}
