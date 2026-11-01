export const TETRIS_COLS = 10;
export const TETRIS_ROWS = 18;
export const TETRIS_TICK_MS = 550;

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
} as const;

export type PieceKind = keyof typeof SHAPES;
type Shape = number[][];
export type Board = (PieceKind | null)[][];

export interface Piece {
  kind: PieceKind;
  shape: Shape;
  x: number;
  y: number;
}

export interface TetrisGame {
  board: Board;
  piece: Piece;
  score: number;
  lines: number;
  over: boolean;
}

const KINDS = Object.keys(SHAPES) as PieceKind[];
const LINE_SCORES = [0, 100, 300, 500, 800];

function emptyBoard(): Board {
  return Array.from({ length: TETRIS_ROWS }, () => Array<PieceKind | null>(TETRIS_COLS).fill(null));
}

function spawnPiece(): Piece {
  const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
  const shape = SHAPES[kind].map((row) => [...row]);
  return { kind, shape, x: Math.floor((TETRIS_COLS - shape[0].length) / 2), y: 0 };
}

function fits(board: Board, shape: Shape, x: number, y: number): boolean {
  return shape.every((row, r) =>
    row.every((filled, c) => {
      if (!filled) return true;
      const by = y + r;
      const bx = x + c;
      return by >= 0 && by < TETRIS_ROWS && bx >= 0 && bx < TETRIS_COLS && board[by][bx] === null;
    }),
  );
}

export function createTetris(): TetrisGame {
  return { board: emptyBoard(), piece: spawnPiece(), score: 0, lines: 0, over: false };
}

export function moveTetris(game: TetrisGame, dx: number): TetrisGame {
  if (game.over) return game;
  const { piece, board } = game;
  if (!fits(board, piece.shape, piece.x + dx, piece.y)) return game;
  return { ...game, piece: { ...piece, x: piece.x + dx } };
}

export function rotateTetris(game: TetrisGame): TetrisGame {
  if (game.over) return game;
  const { piece, board } = game;
  const shape = Array.from({ length: piece.shape[0].length }, (_, c) => piece.shape.map((row) => row[c]).reverse());
  for (const offset of [0, -1, 1]) {
    if (fits(board, shape, piece.x + offset, piece.y)) {
      return { ...game, piece: { ...piece, shape, x: piece.x + offset } };
    }
  }
  return game;
}

export function dropTetris(game: TetrisGame): TetrisGame {
  if (game.over) return game;
  const { piece, board } = game;
  if (fits(board, piece.shape, piece.x, piece.y + 1)) {
    return { ...game, piece: { ...piece, y: piece.y + 1 } };
  }
  return lockPiece(game);
}

function lockPiece(game: TetrisGame): TetrisGame {
  const board = game.board.map((row) => [...row]);
  const { piece } = game;
  piece.shape.forEach((row, r) =>
    row.forEach((filled, c) => {
      if (filled) board[piece.y + r][piece.x + c] = piece.kind;
    }),
  );

  const kept = board.filter((row) => row.some((cell) => cell === null));
  const cleared = TETRIS_ROWS - kept.length;
  const nextBoard = [
    ...Array.from({ length: cleared }, () => Array<PieceKind | null>(TETRIS_COLS).fill(null)),
    ...kept,
  ];
  const next = spawnPiece();

  return {
    board: nextBoard,
    piece: next,
    score: game.score + LINE_SCORES[cleared],
    lines: game.lines + cleared,
    over: !fits(nextBoard, next.shape, next.x, next.y),
  };
}
