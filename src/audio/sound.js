// WebAudio orqali ovoz va fon musiqasi. Bufferlar sintez qilinadi va keshlanadi.
import { pluck, softTone, drum, midiToFreq, scaleNote, SFX, themeMusic } from './synth.js';

export function createSound(settings) {
  let ctx = null, master = null, sfxGain = null, musicGain = null;
  const cache = new Map();
  let musicTimer = null, nextTime = 0, pos = 0;
  let theme = themeMusic('menu');
  let themeName = 'menu';

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    // master → yumshatuvchi filtr → kompressor (bir vaqtda ko'p nota chalinsa ham xirillamaydi)
    master = ctx.createGain(); master.gain.value = 0.9;
    let tail = ctx.destination;
    if (ctx.createDynamicsCompressor) {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
      comp.connect(tail); tail = comp;
    }
    if (ctx.createBiquadFilter) {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200; lp.Q.value = 0.5;
      lp.connect(tail); tail = lp;
    }
    master.connect(tail);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(master);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.42; musicGain.connect(master);
    return ctx;
  }

  function buffer(key, make) {
    let b = cache.get(key);
    if (b) return b;
    const data = make(ctx.sampleRate);
    b = ctx.createBuffer(1, data.length, ctx.sampleRate);
    b.getChannelData(0).set(data);
    cache.set(key, b);
    return b;
  }

  function playBuf(b, when, gainNode, vol = 1) {
    const src = ctx.createBufferSource();
    src.buffer = b;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(g); g.connect(gainNode);
    src.start(when);
  }

  function note(n, when, out, vol = 1) {
    if (n.drum) return playBuf(buffer('drum:' + n.drum, (sr) => drum(sr, n.drum)), when, out, vol * 0.8);
    const m = n.music ? scaleNote(n.step, n.oct || 0, theme.scaleArr, theme.base) : scaleNote(n.step, n.oct || 0);
    const b = n.b ?? 0.6, dur = n.dur ?? 0.7;
    if (n.soft) return playBuf(buffer(`s:${m}:${b}:${dur}`, (sr) => softTone(midiToFreq(m), sr, dur, { brightness: b })), when, out, vol * (n.v ?? 1));
    playBuf(buffer(`p:${m}:${b}:${dur}`, (sr) => pluck(midiToFreq(m), sr, dur, { brightness: b, seed: m })), when, out, vol);
  }

  function play(name) {
    if (settings.sound === false) return;
    const list = SFX[name];
    if (!list || !ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime + 0.01;
    for (const n of list) note(n, t0 + n.t, sfxGain);
  }

  function schedule() {
    const per = 6; // 6/8
    // fonda ushlab qolingan bo'lsa — to'planib qolgan notalarni birdan chalmaslik
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
    while (nextTime < ctx.currentTime + 0.6) {
      const bar = Math.floor(pos / per) % 8, beat = pos % per;
      for (const n of theme.melody) if (n.bar === bar && n.beat === beat) note({ step: n.step, b: 0.5, dur: 0.9, music: true, soft: true }, nextTime, musicGain, 0.8);
      if (beat === 0) note({ step: [0, 0, 3, 0, 0, 4, 3, 0][bar], oct: -1, b: 0.25, dur: 1.6, music: true, soft: true }, nextTime, musicGain, 0.55); // bas
      if (beat === 3 && bar % 2 === 1) note({ step: 4, oct: -1, b: 0.25, dur: 1.2, music: true, soft: true }, nextTime, musicGain, 0.3); // ikkinchi tor
      const d = theme.doiraPattern[beat];
      if (d) note({ drum: d }, nextTime, musicGain, 0.22);
      nextTime += theme.beat;
      pos++;
    }
  }

  function startMusic() {
    if (settings.music === false || musicTimer || !ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    nextTime = ctx.currentTime + 0.1;
    musicTimer = setInterval(schedule, 150);
    schedule();
  }

  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  // Brauzerlar ovozni faqat foydalanuvchi teginishidan keyin ruxsat beradi.
  // Har teginishda chaqiriladi: telefonlarda birinchi urinish (pointerdown) ruxsat bermasligi mumkin.
  function unlock() {
    if (!ensure()) return;
    if (ctx.state !== 'running' && !document.hidden) { try { ctx.resume(); } catch {} }
    if (settings.music !== false) startMusic();
  }

  function pause() { stopMusic(); if (ctx && ctx.state === 'running') ctx.suspend(); }
  function resume() { if (ctx) ctx.resume(); if (settings.music !== false) startMusic(); }

  // Shahar/ekran kuyini almashtirish (keyingi taktdan boshlab, uzilishsiz)
  function setTheme(name) {
    if (name === themeName) return;
    themeName = name;
    theme = themeMusic(name);
    pos = Math.ceil(pos / 6) * 6; // yangi takt boshidan
  }

  return { play, startMusic, stopMusic, unlock, pause, resume, setTheme, get theme() { return themeName; }, get started() { return !!ctx; }, get running() { return !!ctx && ctx.state === 'running' && !!musicTimer; } };
}
