// Ovoz sintezi (sof hisob, Node'da test qilinadi): dutor/rubob uslubidagi chertma tor (Karplus–Strong),
// doira (chirmanda) zarbi va kuy generatori. Hech qanday tayyor ovoz fayli ishlatilmaydi.
import { createRng } from '../logic/shapes.js';

// D asosidagi lad (o'zbek kuylarida uchraydigan "ortirilgan sekunda" bilan): D Eb F# G A Bb C# D
export const SCALE = [0, 1, 4, 5, 7, 8, 11, 12];
export const BASE_MIDI = 62; // D4

export function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
export function scaleNote(step, octave = 0, scale = SCALE, base = BASE_MIDI) {
  const n = scale.length - 1;
  const o = Math.floor(step / n);
  const i = ((step % n) + n) % n;
  return base + scale[i] + 12 * (o + octave);
}

// Ladlar (o'zbek/sharq musiqasida uchraydigan rang-baranglik)
export const SCALES = {
  hijaz: SCALE,                          // D Eb F# G A Bb C# — ortirilgan sekunda
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],    // yengil, kuychan
  phrygian: [0, 1, 3, 5, 7, 8, 10, 12],  // sirli
  major: [0, 2, 4, 5, 7, 9, 11, 12],     // quvnoq (bayram)
  minor: [0, 2, 3, 5, 7, 8, 10, 12],     // mayin
};

// Har ekran/shahar o'z kuyiga ega. Musiqa sokin bo'lishi shart (uzoq o'ynalganda asabga tegmasin):
// sekin temp, kam nota, uzun notalar, yumshoq nay/qo'ng'iroqcha, akkord foni, doira juda past yoki yo'q.
// prog — akkordlar ketma-ketligi indeksi, lead — bosh cholg'u.
export const MUSIC_THEMES = {
  menu:       { seed: 1405, scale: 'dorian',   base: 62, beat: 0.42, doira: -1, prog: 0, lead: 'flute' },
  khiva:      { seed: 1220, scale: 'dorian',   base: 60, beat: 0.40, doira: -1, prog: 1, lead: 'bell' },
  bukhara:    { seed: 2111, scale: 'minor',    base: 60, beat: 0.44, doira: 0,  prog: 2, lead: 'flute' },
  samarkand:  { seed: 1370, scale: 'hijaz',    base: 62, beat: 0.42, doira: -1, prog: 3, lead: 'flute' },
  shahrisabz: { seed: 4410, scale: 'major',    base: 60, beat: 0.38, doira: 1,  prog: 0, lead: 'bell' },
  tashkent:   { seed: 2930, scale: 'major',    base: 62, beat: 0.38, doira: 0,  prog: 1, lead: 'flute' },
  kokand:     { seed: 1709, scale: 'dorian',   base: 64, beat: 0.41, doira: -1, prog: 2, lead: 'bell' },
  termez:     { seed: 3330, scale: 'minor',    base: 59, beat: 0.45, doira: -1, prog: 3, lead: 'flute' },
  eternal:    { seed: 7777, scale: 'minor',    base: 62, beat: 0.43, doira: -1, prog: 1, lead: 'bell' },
  daily:      { seed: 5050, scale: 'major',    base: 64, beat: 0.39, doira: 0,  prog: 2, lead: 'flute' },
};

// Doira usullari (6/8) — faqat yengil urg'u
export const DOIRA_PATTERNS = [
  ['dum', null, null, 'tak', null, null],
  ['dum', null, null, 'dum', null, 'tak'],
];

// Akkordlar ketma-ketligi: lad pog'onalari (0 = tonika). Oxirgi takt tonikaga qaytadi — halqa silliq.
export const PROGRESSIONS = [
  [0, 3, 4, 0, 5, 3, 4, 0],
  [0, 5, 3, 4, 0, 5, 4, 0],
  [0, 3, 0, 4, 5, 3, 4, 0],
  [0, 6, 5, 4, 0, 3, 4, 0],
];

// Takt ritmlari (6/8, sakkizlik birliklarda): [boshlanish, uzunlik]. Kam va uzun notalar.
const RHYTHMS = [
  [[0, 3], [3, 3]],
  [[0, 2], [2, 1], [3, 3]],
  [[0, 3], [3, 2], [5, 1]],
  [[0, 4], [4, 2]],
  [[0, 2], [3, 3]],
];
const END_RHYTHM = [[0, 6]];

// Kuy kompozitori: 2 taktli motiv → A A' B A'' shakli (takrorlanuvchi, eslab qolinadigan),
// kuchli hissalarda akkord tovushi, ichida faqat silliq (±1–2) harakat.
export function composeMelody(seed = 1405, progression = PROGRESSIONS[0]) {
  const rng = createRng(seed);
  const pick = (a) => a[Math.floor(rng() * a.length)];
  const lo = 2, hi = 10;
  const clamp = (v) => Math.max(lo, Math.min(hi, v));
  const motif = () => [0, 1].map(() => {
    const r = pick(RHYTHMS);
    return r.map(([b, len], i) => ({ beat: b, len, off: i === 0 ? 0 : pick([-2, -1, -1, 1, 1, 2]) }));
  });
  const A = motif(), B = motif();
  const plan = [A[0], A[1], A[0], A[1].map((n, i) => ({ ...n, off: -n.off })), B[0], B[1], A[0], END_RHYTHM.map(([b, len]) => ({ beat: b, len, off: 0 }))];
  const notes = [];
  let prev = pick([2, 4, 4, 6, 7]);
  for (let bar = 0; bar < 8; bar++) {
    const root = progression[bar % progression.length];
    // eng yaqin akkord tovushi (root, root+2, root+4 va oktavalari)
    const tones = [];
    for (let o = -7; o <= 14; o += 7) for (const d of [0, 2, 4]) tones.push(root + d + o);
    const cand = tones.filter((t) => t >= lo && t <= hi);
    let anchor = cand.reduce((best, t) => (Math.abs(t - prev) < Math.abs(best - prev) ? t : best), cand[0]);
    if (bar === 7) {
      const roots = tones.filter((t) => t >= 0 && t <= hi).filter((t) => ((t - root) % 7 + 7) % 7 === 0);
      if (roots.length) anchor = roots.reduce((best, t) => (Math.abs(t - prev) < Math.abs(best - prev) ? t : best), roots[0]);
    }
    let cur = anchor;
    for (const n of plan[bar]) {
      cur = bar === 7 ? cur : clamp(cur + n.off);
      notes.push({ bar, beat: n.beat, len: n.len, step: cur });
    }
    prev = cur;
  }
  return notes;
}

// Mavzu → ijro uchun tayyor ma'lumot (deterministik).
export function themeMusic(name) {
  const th = MUSIC_THEMES[name] || MUSIC_THEMES.menu;
  const scale = SCALES[th.scale] || SCALE;
  const chords = PROGRESSIONS[th.prog] || PROGRESSIONS[0];
  return { ...th, scaleArr: scale, chords, melody: composeMelody(th.seed, chords), doiraPattern: DOIRA_PATTERNS[th.doira] || null };
}

// Nay (yog'och puflama cholg'u) uslubi: toza sinus + ozgina garmonika, kech boshlanuvchi vibrato,
// yumshoq kirish va so'nish. Keskin hujum yo'q — quloqqa tegmaydi.
export function flute(freq, sampleRate, duration = 1, { attack = 0.07, release = 0.25 } = {}) {
  const len = Math.max(1, Math.floor(sampleRate * duration));
  const out = new Float32Array(len);
  const rng = createRng(Math.round(freq));
  let ph = 0, noise = 0;
  const att = Math.max(1, Math.floor(sampleRate * attack));
  const rel = Math.min(len, Math.max(1, Math.floor(sampleRate * release)));
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate;
    const vib = 1 + 0.004 * Math.min(1, Math.max(0, (t - 0.2) * 3)) * Math.sin(2 * Math.PI * 5 * t);
    ph += (2 * Math.PI * freq * vib) / sampleRate;
    noise = noise * 0.97 + (rng() * 2 - 1) * 0.03; // nafas shovqini (filtrlangan)
    let env = 1;
    if (i < att) env = i / att;
    if (i > len - rel) env *= (len - i) / rel;
    env *= 1 - 0.25 * Math.min(1, t / Math.max(0.3, duration)); // biroz so'nadi
    out[i] = (Math.sin(ph) + 0.18 * Math.sin(2 * ph) + 0.05 * Math.sin(3 * ph) + noise * 0.6) * env;
  }
  return normalize(out, 0.7);
}

// Akkord foni (pad): ozgina farqli sozlangan sinuslar, sekin kirish/chiqish — iliq "havo".
export function pad(freq, sampleRate, duration = 2) {
  const len = Math.max(1, Math.floor(sampleRate * duration));
  const out = new Float32Array(len);
  const att = Math.floor(len * 0.3), rel = Math.floor(len * 0.4);
  const ws = [0.997, 1, 1.003].map((d) => (2 * Math.PI * freq * d) / sampleRate);
  for (let i = 0; i < len; i++) {
    let env = 1;
    if (i < att) env = Math.sin((i / att) * Math.PI / 2);
    if (i > len - rel) env *= Math.sin(((len - i) / rel) * Math.PI / 2);
    out[i] = (Math.sin(ws[0] * i) + Math.sin(ws[1] * i) + Math.sin(ws[2] * i) + 0.15 * Math.sin(2 * ws[1] * i)) * env;
  }
  return normalize(out, 0.6);
}

// Karplus–Strong: chertilgan tor. brightness 0..1 (rubob — yorqinroq, dutor — yumshoqroq).
export function pluck(freq, sampleRate, duration = 0.8, { brightness = 0.6, decay = 0.996, seed = 1 } = {}) {
  const len = Math.max(1, Math.floor(sampleRate * duration));
  const out = new Float32Array(len);
  const period = Math.max(2, Math.round(sampleRate / freq));
  const buf = new Float32Array(period);
  const rng = createRng(seed);
  for (let i = 0; i < period; i++) buf[i] = rng() * 2 - 1;
  // yumshatish: chertish shovqinini filtrlash
  const b = Math.max(0.05, Math.min(1, brightness));
  for (let i = 1; i < period; i++) buf[i] = buf[i] * b + buf[i - 1] * (1 - b);
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const cur = buf[idx];
    const nxt = buf[(idx + 1) % period];
    buf[idx] = decay * 0.5 * (cur + nxt);
    out[i] = cur;
    idx = (idx + 1) % period;
  }
  // boshlanish/tugash klikini yo'qotish
  const fade = Math.min(len, Math.floor(sampleRate * 0.01));
  for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
  return normalize(out, 0.8);
}

// Yumshoq "qo'ng'iroqcha" ovozi (kalimba/marimba uslubi): sinuslar yig'indisi, shovqinsiz.
// Telefon karnayida ham toza eshitiladi; fon kuyi va shakl qo'yish ovozi uchun.
export function softTone(freq, sampleRate, duration = 0.6, { brightness = 0.5, attack = 0.006 } = {}) {
  const len = Math.max(1, Math.floor(sampleRate * duration));
  const out = new Float32Array(len);
  const b = Math.max(0, Math.min(1, brightness));
  // [nisbat, kuch, so'nish tezligi]
  const partials = [[1, 1, 4], [2, 0.25 * b, 7], [3, 0.12 * b, 10], [4.2, 0.06 * b, 16]];
  const nyq = sampleRate / 2;
  const att = Math.max(1, Math.floor(sampleRate * attack));
  for (const [ratio, amp, dk] of partials) {
    const f = freq * ratio;
    if (f >= nyq * 0.9 || amp <= 0) continue;
    const w = (2 * Math.PI * f) / sampleRate;
    const k = dk / Math.max(0.15, duration);
    for (let i = 0; i < len; i++) out[i] += Math.sin(w * i) * amp * Math.exp(-(i / sampleRate) * k);
  }
  for (let i = 0; i < Math.min(att, len); i++) out[i] *= i / att;
  const fade = Math.min(len, Math.floor(sampleRate * 0.02));
  for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
  return normalize(out, 0.7);
}

// Doira: past "dum" yoki baland "tak".
export function drum(sampleRate, kind = 'dum', seed = 7) {
  const dur = kind === 'dum' ? 0.35 : 0.12;
  const len = Math.floor(sampleRate * dur);
  const out = new Float32Array(len);
  const rng = createRng(seed);
  const f0 = kind === 'dum' ? 110 : 420;
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * (kind === 'dum' ? 12 : 40));
    const f = f0 * (1 + 0.6 * Math.exp(-t * 30));
    ph += (2 * Math.PI * f) / sampleRate;
    const noise = (rng() * 2 - 1) * (kind === 'dum' ? 0.15 : 0.6);
    out[i] = (Math.sin(ph) * (kind === 'dum' ? 1 : 0.4) + noise) * env;
  }
  return normalize(out, 0.7);
}

export function normalize(arr, peak = 0.8) {
  let m = 0;
  for (const v of arr) if (Math.abs(v) > m) m = Math.abs(v);
  if (m > 0) { const k = peak / m; for (let i = 0; i < arr.length; i++) arr[i] *= k; }
  return arr;
}

// Effekt "notalari": [{ step, t (soniya), oct?, drum? }]
export const SFX = {
  pick: [{ step: 7, t: 0, soft: true, b: 0.3, dur: 0.15, v: 0.4 }],
  place: [{ step: 4, t: 0, soft: true, b: 0.35, dur: 0.22, v: 0.7 }, { step: 7, t: 0.045, soft: true, b: 0.3, dur: 0.3, v: 0.45 }],
  clear: [{ step: 2, t: 0 }, { step: 4, t: 0.06 }, { step: 7, t: 0.12 }],
  combo: [{ step: 0, t: 0 }, { step: 2, t: 0.05 }, { step: 4, t: 0.1 }, { step: 7, t: 0.15 }, { step: 9, t: 0.2 }, { drum: 'dum', t: 0 }, { drum: 'tak', t: 0.2 }],
  win: [{ step: 0, t: 0 }, { step: 4, t: 0.12 }, { step: 7, t: 0.24 }, { step: 11, t: 0.36 }, { step: 14, t: 0.5, dur: 1.2 }, { drum: 'dum', t: 0 }, { drum: 'tak', t: 0.36 }, { drum: 'dum', t: 0.5 }],
  lose: [{ step: 7, t: 0 }, { step: 5, t: 0.15 }, { step: 3, t: 0.3 }, { step: 0, t: 0.45, dur: 1 }],
  bomb: [{ drum: 'dum', t: 0 }, { drum: 'dum', t: 0.08 }, { step: 0, t: 0, oct: -1, b: 0.9 }],
  hammer: [{ drum: 'tak', t: 0 }, { step: 3, t: 0.03, b: 0.9, dur: 0.3 }],
  rotate: [{ step: 4, t: 0, dur: 0.3 }, { step: 7, t: 0.05, dur: 0.3 }],
  swap: [{ step: 7, t: 0, dur: 0.3 }, { step: 4, t: 0.05, dur: 0.3 }],
  button: [{ step: 7, t: 0, b: 0.3, dur: 0.2 }],
  tick: [{ drum: 'tak', t: 0 }],
  prize: [{ step: 7, t: 0, b: 0.9 }, { step: 9, t: 0.08, b: 0.9 }, { step: 11, t: 0.16, b: 0.9 }, { step: 14, t: 0.24, b: 0.9, dur: 1.1 }, { drum: 'dum', t: 0 }, { drum: 'tak', t: 0.24 }],
  star: [{ step: 11, t: 0, b: 0.95, dur: 0.5 }, { step: 14, t: 0.05, b: 0.95, dur: 0.6 }],
  revive: [{ step: 0, t: 0, oct: -1 }, { step: 4, t: 0.1 }, { step: 7, t: 0.2 }, { step: 11, t: 0.3, dur: 1 }],
  coin: [{ step: 11, t: 0, b: 0.9, dur: 0.3 }, { step: 14, t: 0.07, b: 0.9, dur: 0.4 }],
};

// Fon kuyi: deterministik, qisqa va takrorlanuvchi (8 taktli), lad ichida silliq harakat.
export function generateMelody(seed = 1405, bars = 8, notesPerBar = 6) {
  const rng = createRng(seed);
  const notes = [];
  let step = 4;
  for (let b = 0; b < bars; b++) {
    for (let k = 0; k < notesPerBar; k++) {
      if (k > 0 && rng() < 0.22) continue; // pauza
      const move = [-2, -1, -1, 0, 1, 1, 2][Math.floor(rng() * 7)];
      step = Math.max(0, Math.min(9, step + move));
      if (k === 0) step = [0, 4, 3, 2, 0, 4, 5, 0][b % 8]; // har takt tayanch notadan
      notes.push({ bar: b, beat: k, step });
    }
  }
  return notes;
}

// Doira ritmi (6/8): dum . tak tak . tak
export const DOIRA_PATTERN = ['dum', null, 'tak', 'tak', null, 'tak'];
