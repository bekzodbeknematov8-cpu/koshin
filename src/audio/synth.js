// Ovoz sintezi (sof hisob, Node'da test qilinadi): dutor/rubob uslubidagi chertma tor (Karplus–Strong),
// doira (chirmanda) zarbi va kuy generatori. Hech qanday tayyor ovoz fayli ishlatilmaydi.
import { createRng } from '../logic/shapes.js';

// D asosidagi lad (o'zbek kuylarida uchraydigan "ortirilgan sekunda" bilan): D Eb F# G A Bb C# D
export const SCALE = [0, 1, 4, 5, 7, 8, 11, 12];
export const BASE_MIDI = 62; // D4

export function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
export function scaleNote(step, octave = 0) {
  const n = SCALE.length - 1;
  const o = Math.floor(step / n);
  const i = ((step % n) + n) % n;
  return BASE_MIDI + SCALE[i] + 12 * (o + octave);
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
  pick: [{ step: 4, t: 0, b: 0.35, dur: 0.25 }],
  place: [{ step: 0, t: 0, oct: -1, b: 0.4, dur: 0.4 }],
  clear: [{ step: 2, t: 0 }, { step: 4, t: 0.06 }, { step: 7, t: 0.12 }],
  combo: [{ step: 0, t: 0 }, { step: 2, t: 0.05 }, { step: 4, t: 0.1 }, { step: 7, t: 0.15 }, { step: 9, t: 0.2 }, { drum: 'dum', t: 0 }, { drum: 'tak', t: 0.2 }],
  win: [{ step: 0, t: 0 }, { step: 4, t: 0.12 }, { step: 7, t: 0.24 }, { step: 11, t: 0.36 }, { step: 14, t: 0.5, dur: 1.2 }, { drum: 'dum', t: 0 }, { drum: 'tak', t: 0.36 }, { drum: 'dum', t: 0.5 }],
  lose: [{ step: 7, t: 0 }, { step: 5, t: 0.15 }, { step: 3, t: 0.3 }, { step: 0, t: 0.45, dur: 1 }],
  bomb: [{ drum: 'dum', t: 0 }, { drum: 'dum', t: 0.08 }, { step: 0, t: 0, oct: -1, b: 0.9 }],
  hammer: [{ drum: 'tak', t: 0 }, { step: 3, t: 0.03, b: 0.9, dur: 0.3 }],
  rotate: [{ step: 4, t: 0, dur: 0.3 }, { step: 7, t: 0.05, dur: 0.3 }],
  swap: [{ step: 7, t: 0, dur: 0.3 }, { step: 4, t: 0.05, dur: 0.3 }],
  button: [{ step: 7, t: 0, b: 0.3, dur: 0.2 }],
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
