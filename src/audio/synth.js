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

// Har ekran/shahar o'z kuyiga ega: seed, lad, tonika, temp (BEAT soniya), doira usuli.
export const MUSIC_THEMES = {
  menu:       { seed: 1405, scale: 'hijaz',    base: 62, beat: 0.32, doira: 0 },
  khiva:      { seed: 1220, scale: 'dorian',   base: 62, beat: 0.30, doira: 0 },
  bukhara:    { seed: 2111, scale: 'minor',    base: 60, beat: 0.34, doira: 1 },
  samarkand:  { seed: 1370, scale: 'hijaz',    base: 64, beat: 0.30, doira: 0 },
  shahrisabz: { seed: 4410, scale: 'major',    base: 62, beat: 0.28, doira: 2 },
  tashkent:   { seed: 2930, scale: 'dorian',   base: 65, beat: 0.27, doira: 2 },
  kokand:     { seed: 1709, scale: 'phrygian', base: 62, beat: 0.31, doira: 1 },
  termez:     { seed: 3330, scale: 'minor',    base: 59, beat: 0.35, doira: 0 },
  eternal:    { seed: 7777, scale: 'phrygian', base: 60, beat: 0.33, doira: 1 },
  daily:      { seed: 5050, scale: 'major',    base: 64, beat: 0.29, doira: 2 },
};

// Doira usullari (6/8)
export const DOIRA_PATTERNS = [
  ['dum', null, 'tak', 'tak', null, 'tak'],
  ['dum', null, null, 'dum', 'tak', null],
  ['dum', 'tak', null, 'dum', 'tak', 'tak'],
];

// Mavzu → ijro uchun tayyor ma'lumot (deterministik).
export function themeMusic(name) {
  const th = MUSIC_THEMES[name] || MUSIC_THEMES.menu;
  const scale = SCALES[th.scale] || SCALE;
  return { ...th, scaleArr: scale, melody: generateMelody(th.seed), doiraPattern: DOIRA_PATTERNS[th.doira] || DOIRA_PATTERNS[0] };
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
