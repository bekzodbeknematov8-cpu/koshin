// Shakllar: har biri [row, col] kataklar ro'yxati, (0,0) dan boshlab normallashtirilgan.
export const SHAPES = {
  dot: [[0, 0]],
  h2: [[0, 0], [0, 1]],
  v2: [[0, 0], [1, 0]],
  h3: [[0, 0], [0, 1], [0, 2]],
  v3: [[0, 0], [1, 0], [2, 0]],
  h4: [[0, 0], [0, 1], [0, 2], [0, 3]],
  v4: [[0, 0], [1, 0], [2, 0], [3, 0]],
  h5: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  v5: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  sq2: [[0, 0], [0, 1], [1, 0], [1, 1]],
  sq3: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  l3a: [[0, 0], [1, 0], [1, 1]],
  l3b: [[0, 1], [1, 0], [1, 1]],
  l3c: [[0, 0], [0, 1], [1, 0]],
  l3d: [[0, 0], [0, 1], [1, 1]],
  l4a: [[0, 0], [1, 0], [2, 0], [2, 1]],
  l4b: [[0, 1], [1, 1], [2, 1], [2, 0]],
  t4: [[0, 0], [0, 1], [0, 2], [1, 1]],
  s4: [[0, 1], [0, 2], [1, 0], [1, 1]],
  z4: [[0, 0], [0, 1], [1, 1], [1, 2]],
  bigL: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
  // 3-bosqich: qo'shimcha burilgan variantlar
  l4c: [[0, 0], [0, 1], [0, 2], [1, 0]],
  l4d: [[0, 0], [0, 1], [0, 2], [1, 2]],
  l4e: [[0, 0], [0, 1], [1, 1], [2, 1]],
  l4f: [[0, 0], [0, 1], [1, 0], [2, 0]],
  l4g: [[0, 2], [1, 0], [1, 1], [1, 2]],
  l4h: [[0, 0], [1, 0], [1, 1], [1, 2]],
  t4b: [[0, 1], [1, 0], [1, 1], [1, 2]],
  t4c: [[0, 0], [1, 0], [1, 1], [2, 0]],
  t4d: [[0, 1], [1, 0], [1, 1], [2, 1]],
  s4v: [[0, 0], [1, 0], [1, 1], [2, 1]],
  z4v: [[0, 1], [1, 0], [1, 1], [2, 0]],
  bigL2: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]],
  bigL3: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
  bigL4: [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2]],
  r23: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
  r32: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]],
  d2: [[0, 0], [1, 1]],
  d2b: [[0, 1], [1, 0]],
};

// Murakkablik toifasi: 0 — oson (kichik), 1 — o'rta, 2 — katta/noqulay.
export const SHAPE_TIER = {
  dot: 0, h2: 0, v2: 0, h3: 0, v3: 0, sq2: 0, l3a: 0, l3b: 0, l3c: 0, l3d: 0,
  h4: 1, v4: 1, l4a: 1, l4b: 1, l4c: 1, l4d: 1, l4e: 1, l4f: 1, l4g: 1, l4h: 1,
  t4: 1, t4b: 1, t4c: 1, t4d: 1, s4: 1, z4: 1, s4v: 1, z4v: 1, d2: 1, d2b: 1,
  h5: 2, v5: 2, sq3: 2, bigL: 2, bigL2: 2, bigL3: 2, bigL4: 2, r23: 2, r32: 2,
};

// Kataklarni (0,0) ga normallashtirish va tartiblash.
export function normalize(cells) {
  let mr = Infinity, mc = Infinity;
  for (const [r, c] of cells) { if (r < mr) mr = r; if (c < mc) mc = c; }
  return cells.map(([r, c]) => [r - mr, c - mc]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

// Soat yo'nalishida 90° burish (Aylantirish kuchaytirgichi uchun).
export function rotateCells(cells) {
  const { rows } = shapeSize(cells);
  return normalize(cells.map(([r, c]) => [c, rows - 1 - r]));
}

const keyOf = (cells) => normalize(cells).map(String).join('|');
const ID_BY_KEY = Object.fromEntries(Object.entries(SHAPES).map(([id, cells]) => [keyOf(cells), id]));
export function shapeIdOf(cells) { return ID_BY_KEY[keyOf(cells)] || null; }

export const SHAPE_IDS = Object.keys(SHAPES);

export function shapeSize(cells) {
  let rows = 0, cols = 0;
  for (const [r, c] of cells) {
    if (r + 1 > rows) rows = r + 1;
    if (c + 1 > cols) cols = c + 1;
  }
  return { rows, cols };
}

// Kichik deterministik RNG (mulberry32) — testlar va kunlik seed uchun.
export function createRng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 1-bosqich: oddiy tasodifiy tanlov. Adolatlilik qoidasi 3-bosqichda qo'shiladi.
export function randomPiece(rng, colorCount = 5) {
  const id = SHAPE_IDS[Math.floor(rng() * SHAPE_IDS.length)];
  return { id, cells: SHAPES[id], color: Math.floor(rng() * colorCount) };
}
