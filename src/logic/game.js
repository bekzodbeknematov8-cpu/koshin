// O'yin holati: maydon + pastdagi 3 ta shakl (tray).
import { createBoard, placePiece, canPlaceAnywhere, BOARD_SIZE } from './board.js';
import { createRng, randomPiece } from './shapes.js';

export const TRAY_SIZE = 3;

export function createGame(seed = Date.now()) {
  const rng = createRng(seed);
  const state = { board: createBoard(BOARD_SIZE), tray: [], rng, moves: 0 };
  refillTray(state);
  return state;
}

export function refillTray(state) {
  state.tray = Array.from({ length: TRAY_SIZE }, () => randomPiece(state.rng));
}

// trayIndex dagi shaklni (row, col) ga qo'yishga urinish. true/false qaytaradi.
export function tryPlace(state, trayIndex, row, col) {
  const piece = state.tray[trayIndex];
  if (!piece) return false;
  const next = placePiece(state.board, piece.cells, row, col, piece.color);
  if (!next) return false;
  state.board = next;
  state.tray[trayIndex] = null;
  state.moves++;
  if (state.tray.every((p) => p === null)) refillTray(state);
  return true;
}

export function hasAnyMove(state) {
  return state.tray.some((p) => p && canPlaceAnywhere(state.board, p.cells));
}
