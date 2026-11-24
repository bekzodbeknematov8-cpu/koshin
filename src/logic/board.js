// Maydon mantig'i — DOM/Canvas'dan mustaqil.
export const BOARD_SIZE = 8;
export const EMPTY = -1;

export function createBoard(size = BOARD_SIZE) {
  return Array.from({ length: size }, () => Array(size).fill(EMPTY));
}

export function inBounds(board, r, c) {
  return r >= 0 && c >= 0 && r < board.length && c < board[0].length;
}

export function canPlace(board, cells, row, col) {
  if (!Array.isArray(cells) || cells.length === 0) return false;
  for (const [dr, dc] of cells) {
    const r = row + dr, c = col + dc;
    if (!inBounds(board, r, c) || board[r][c] !== EMPTY) return false;
  }
  return true;
}

// Yangi maydon qaytaradi (immutable), joylashmasa null.
export function placePiece(board, cells, row, col, color) {
  if (!canPlace(board, cells, row, col)) return null;
  const next = board.map((line) => line.slice());
  for (const [dr, dc] of cells) next[row + dr][col + dc] = color;
  return next;
}

export function canPlaceAnywhere(board, cells) {
  for (let r = 0; r < board.length; r++)
    for (let c = 0; c < board[0].length; c++)
      if (canPlace(board, cells, r, c)) return true;
  return false;
}

export function filledCount(board) {
  let n = 0;
  for (const line of board) for (const v of line) if (v !== EMPTY) n++;
  return n;
}
