export const SNAKE_COLS = 14;
export const SNAKE_ROWS = 18;
export const SNAKE_TICK_MS = 160;

export type Dir = 'up' | 'down' | 'left' | 'right';

export interface Cell {
  x: number;
  y: number;
}

export interface SnakeGame {
  body: Cell[];
  dir: Dir;
  queued: Dir | null;
  food: Cell;
  score: number;
  over: boolean;
}

const DELTA: Record<Dir, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

function placeFood(body: Cell[]): Cell {
  const free: Cell[] = [];
  for (let y = 0; y < SNAKE_ROWS; y++) {
    for (let x = 0; x < SNAKE_COLS; x++) {
      if (!body.some((cell) => cell.x === x && cell.y === y)) free.push({ x, y });
    }
  }
  return free[Math.floor(Math.random() * free.length)];
}

export function createSnake(): SnakeGame {
  const body = [
    { x: 6, y: 9 },
    { x: 5, y: 9 },
    { x: 4, y: 9 },
  ];
  return { body, dir: 'right', queued: null, food: placeFood(body), score: 0, over: false };
}

export function turnSnake(game: SnakeGame, dir: Dir): SnakeGame {
  if (game.over) return game;
  const reference = game.queued ?? game.dir;
  if (dir === reference || dir === OPPOSITE[reference]) return game;
  return { ...game, queued: dir };
}

export function stepSnake(game: SnakeGame): SnakeGame {
  if (game.over) return game;
  const dir = game.queued ?? game.dir;
  const head = game.body[0];
  const next = { x: head.x + DELTA[dir].x, y: head.y + DELTA[dir].y };

  const hitsWall = next.x < 0 || next.y < 0 || next.x >= SNAKE_COLS || next.y >= SNAKE_ROWS;
  const eats = next.x === game.food.x && next.y === game.food.y;
  const solid = eats ? game.body : game.body.slice(0, -1);
  const hitsSelf = solid.some((cell) => cell.x === next.x && cell.y === next.y);
  if (hitsWall || hitsSelf) return { ...game, dir, queued: null, over: true };

  const body = [next, ...solid];
  return {
    body,
    dir,
    queued: null,
    food: eats ? placeFood(body) : game.food,
    score: eats ? game.score + 10 : game.score,
    over: false,
  };
}
