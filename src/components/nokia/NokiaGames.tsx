import { useEffect, useState } from 'react';
import { moveCursor, useAppKeys } from '@/lib/appKeys';
import { createSnake, stepSnake, turnSnake, SNAKE_COLS, SNAKE_ROWS, SNAKE_TICK_MS, type Dir, type SnakeGame } from '@/lib/games/snake';
import {
  createTetris,
  dropTetris,
  moveTetris,
  rotateTetris,
  TETRIS_COLS,
  TETRIS_TICK_MS,
  type PieceKind,
  type TetrisGame,
} from '@/lib/games/tetris';

export type NokiaGameView = 'snake' | 'tetris';

const GAMES: { view: NokiaGameView; label: string }[] = [
  { view: 'snake', label: 'Snake' },
  { view: 'tetris', label: 'Tetris' },
];

const DIRECTION_KEYS: Record<string, Dir | undefined> = {
  up: 'up',
  '2': 'up',
  down: 'down',
  '8': 'down',
  left: 'left',
  '4': 'left',
  right: 'right',
  '6': 'right',
};

const TETRIS_COLORS: Record<PieceKind, string> = {
  I: '#5ad1f0',
  O: '#f2d15b',
  T: '#e58f4a',
  S: '#7ed957',
  Z: '#ef6b6b',
  J: '#6b9cff',
  L: '#f5a25a',
};

interface NokiaGamesMenuProps {
  onOpen: (view: NokiaGameView) => void;
  onBack: () => void;
}

export function NokiaGamesMenu({ onOpen, onBack }: NokiaGamesMenuProps) {
  const [cursor, setCursor] = useState(0);

  useAppKeys((key) => {
    if (key === 'back') {
      onBack();
      return true;
    }
    if (key === 'select') {
      onOpen(GAMES[cursor].view);
      return true;
    }
    const next = moveCursor(key, cursor, GAMES.length);
    if (next === null) return false;
    setCursor(next);
    return true;
  });

  return (
    <div className="flex flex-1 flex-col gap-2 p-3">
      {GAMES.map((game, index) => {
        const selected = index === cursor;
        return (
          <div
            key={game.view}
            className={`flex flex-col rounded-[8px] border px-3 py-2 transition-colors duration-200 ${
              selected ? 'border-[#7ed957] bg-[#16261a]' : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <span className="text-[12px] font-semibold">{game.label}</span>
            <span className="text-[9px] text-zinc-500">Simulator recreation</span>
          </div>
        );
      })}
    </div>
  );
}

export function NokiaSnake({ onBack }: { onBack: () => void }) {
  const [game, setGame] = useState<SnakeGame>(createSnake);

  useEffect(() => {
    if (game.over) return;
    const timer = window.setInterval(() => setGame((current) => stepSnake(current)), SNAKE_TICK_MS);
    return () => window.clearInterval(timer);
  }, [game.over]);

  useAppKeys((key) => {
    if (key === 'back') {
      onBack();
      return true;
    }
    if (game.over && key === 'select') {
      setGame(createSnake());
      return true;
    }
    const dir = DIRECTION_KEYS[key];
    if (!dir) return false;
    setGame((current) => turnSnake(current, dir));
    return true;
  });

  const bodyKeys = new Set(game.body.map((cell) => `${cell.x},${cell.y}`));
  const head = game.body[0];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-2">
      <div className="flex w-full justify-between text-[10px] text-zinc-400">
        <span>Score {game.score}</span>
        <span>2 4 6 8 to steer</span>
      </div>
      <div
        className="relative grid gap-px rounded-[3px] bg-[#070b09] p-px ring-1 ring-white/10"
        style={{ gridTemplateColumns: `repeat(${SNAKE_COLS}, 9px)` }}
      >
        {Array.from({ length: SNAKE_COLS * SNAKE_ROWS }, (_, index) => {
          const x = index % SNAKE_COLS;
          const y = Math.floor(index / SNAKE_COLS);
          const cell = `${x},${y}`;
          const isHead = head.x === x && head.y === y;
          const isBody = bodyKeys.has(cell);
          const isFood = game.food.x === x && game.food.y === y;
          const tone = isHead
            ? 'bg-[#b9f27c]'
            : isBody
              ? 'bg-[#6fbf4a]'
              : isFood
                ? 'rounded-full bg-[#f2b84b]'
                : '';
          return <div key={cell} className={`h-[9px] w-[9px] ${tone}`} />;
        })}
        {game.over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/75 text-center">
            <span className="text-[12px] font-bold">Game over</span>
            <span className="text-[10px] text-zinc-300">Select to restart</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function NokiaTetris({ onBack }: { onBack: () => void }) {
  const [game, setGame] = useState<TetrisGame>(createTetris);

  useEffect(() => {
    if (game.over) return;
    const timer = window.setInterval(() => setGame((current) => dropTetris(current)), TETRIS_TICK_MS);
    return () => window.clearInterval(timer);
  }, [game.over]);

  useAppKeys((key) => {
    if (key === 'back') {
      onBack();
      return true;
    }
    if (game.over) {
      if (key !== 'select') return false;
      setGame(createTetris());
      return true;
    }
    switch (key) {
      case 'left':
      case '4':
        setGame((current) => moveTetris(current, -1));
        return true;
      case 'right':
      case '6':
        setGame((current) => moveTetris(current, 1));
        return true;
      case 'up':
      case '5':
      case 'select':
        setGame((current) => rotateTetris(current));
        return true;
      case 'down':
      case '8':
        setGame((current) => dropTetris(current));
        return true;
      default:
        return false;
    }
  });

  const display: (PieceKind | null)[][] = game.board.map((row) => [...row]);
  game.piece.shape.forEach((row, r) =>
    row.forEach((filled, c) => {
      if (filled) display[game.piece.y + r][game.piece.x + c] = game.piece.kind;
    }),
  );

  return (
    <div className="flex flex-1 items-center justify-center gap-3 p-2">
      <div className="relative grid gap-px rounded-[3px] bg-[#070b09] p-px ring-1 ring-white/10" style={{ gridTemplateColumns: `repeat(${TETRIS_COLS}, 9px)` }}>
        {display.flat().map((kind, index) => (
          <div
            key={index}
            className="h-[9px] w-[9px] rounded-[1px]"
            style={{ backgroundColor: kind ? TETRIS_COLORS[kind] : 'transparent' }}
          />
        ))}
        {game.over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/75 text-center">
            <span className="text-[12px] font-bold">Game over</span>
            <span className="text-[10px] text-zinc-300">Select to restart</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 text-[10px] text-zinc-400">
        <div>
          <p>Score</p>
          <p className="font-mono text-sm text-zinc-100">{game.score}</p>
        </div>
        <div>
          <p>Lines</p>
          <p className="font-mono text-sm text-zinc-100">{game.lines}</p>
        </div>
        <p className="text-[9px] leading-relaxed text-zinc-500">
          4 6 move
          <br />
          5 turn
          <br />
          8 drop
        </p>
      </div>
    </div>
  );
}
