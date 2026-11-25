// Shaharlarning mashhur binolari 8x8 koshin "loyihasi" sifatida (erkin, soddalashtirilgan talqin).
// Boss bosqichida o'yinchi shu kataklarni koshin bilan to'ldirib binoni "qayta quradi";
// xaritada esa bino o'tilgan bosqichlar soniga qarab asta bezaladi.
const M = {
  kaltaminor: [
    '........',
    '..####..',
    '..####..',
    '.######.',
    '.######.',
    '.######.',
    '########',
    '########',
  ],
  kalon: [
    '...##...',
    '..####..',
    '...##...',
    '...##...',
    '..####..',
    '..####..',
    '.######.',
    '.######.',
  ],
  registan: [
    '#......#',
    '#.####.#',
    '#.#..#.#',
    '#.#..#.#',
    '#.#..#.#',
    '########',
    '########',
    '########',
  ],
  aksaray: [
    '##....##',
    '##....##',
    '##.##.##',
    '##.##.##',
    '########',
    '########',
    '###..###',
    '###..###',
  ],
  kukeldash: [
    '...##...',
    '..####..',
    '.######.',
    '########',
    '#.#..#.#',
    '########',
    '##.##.##',
    '########',
  ],
  khudayar: [
    '#.#..#.#',
    '########',
    '#..##..#',
    '########',
    '#.#.#.#.',
    '########',
    '##.##.##',
    '########',
  ],
  sultansaodat: [
    '.#....#.',
    '###..###',
    '###..###',
    '########',
    '#..##..#',
    '#..##..#',
    '########',
    '########',
  ],
};

export const BUILDING_IDS = Object.keys(M);

// Binoning kataklari ro'yxati [[r,c], ...] (pastdan yuqoriga tartiblangan — qurilish tartibi).
export function buildingCells(id) {
  const rows = M[id];
  if (!rows) return [];
  const out = [];
  for (let r = rows.length - 1; r >= 0; r--)
    for (let c = 0; c < rows[r].length; c++) if (rows[r][c] === '#') out.push([r, c]);
  return out;
}

export function buildingMask(id) {
  return (M[id] || []).map((row) => [...row].map((ch) => ch === '#'));
}

// Xaritada nechta katak bezalgan: completed (0..20) ga mutanosib, boss o'tilsa — hammasi.
export function decoratedCount(id, completed, levelsPerCity = 20) {
  const total = buildingCells(id).length;
  if (completed >= levelsPerCity) return total;
  return Math.floor((total * completed) / levelsPerCity);
}
