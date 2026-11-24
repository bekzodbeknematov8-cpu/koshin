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
};

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
