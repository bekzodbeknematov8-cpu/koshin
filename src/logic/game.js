// O'yin holati: maydon + pastdagi 3 ta shakl (tray), ochko, combo, streak.
import { createBoard, placePiece, canPlaceAnywhere, BOARD_SIZE } from './board.js';
import { createRng, randomPiece } from './shapes.js';
import { clearLines, applyMoveScore, isBoardEmpty } from './score.js';

export const TRAY_SIZE = 3;

export function createGame(seed = Date.now(), opts = {}) {
  const rng = createRng(seed);
  const state = {
    board: createBoard(BOARD_SIZE), tray: [], rng, moves: 0,
    score: 0, streak: 0, idle: 0, bestCombo: 0, linesCleared: 0,
    over: false, opts,
  };
  refillTray(state);
  return state;
}

export function refillTray(state) {
  const gen = state.opts && state.opts.generator;
  state.tray = gen ? gen(state) : Array.from({ length: TRAY_SIZE }, () => randomPiece(state.rng));
}

// trayIndex dagi shaklni (row, col) ga qo'yishga urinish.
// Muvaffaqiyatda natija obyekti, aks holda false qaytaradi.
export function tryPlace(state, trayIndex, row, col) {
  if (state.over) return false;
  const piece = state.tray[trayIndex];
  if (!piece) return false;
  const placed = placePiece(state.board, piece.cells, row, col, piece.color);
  if (!placed) return false;
  const { board, cleared, lines } = clearLines(placed);
  state.board = board;
  state.tray[trayIndex] = null;
  state.moves++;
  state.linesCleared += lines;
  if (lines > state.bestCombo) state.bestCombo = lines;
  const result = applyMoveScore(state, piece.cells.length, lines, lines > 0 && isBoardEmpty(board));
  if (state.tray.every((p) => p === null)) refillTray(state);
  state.over = !hasAnyMove(state);
  return { ...result, cleared, placed: piece.cells.map(([dr, dc]) => [row + dr, col + dc]), over: state.over };
}

export function hasAnyMove(state) {
  return state.tray.some((p) => p && canPlaceAnywhere(state.board, p.cells));
}
