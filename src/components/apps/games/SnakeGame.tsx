import { useEffect, useState } from 'react';
import { useAppKeys } from '@/lib/appKeys';
import {
  createSnake,
  stepSnake,
  turnSnake,
  SNAKE_COLS,
  SNAKE_ROWS,
  SNAKE_TICK_MS,
  type Dir,
  type SnakeGame as SnakeState,
} from '@/lib/games/snake';

interface SnakeGameProps {
  onBack: () => void;
}

const DIRECTION_KEYS: Record<string, Dir | undefined> = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
};

const CELL_PX = 12;

export default function SnakeGame({ onBack }: SnakeGameProps) {
  const [game, setGame] = useState<SnakeState>(createSnake);

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
    <div className="flex min-h-0 flex-1 flex-col items-center gap-2 bg-zinc-950 p-2">
      <div className="flex justify-between text-[10px] text-zinc-400" style={{ width: SNAKE_COLS * CELL_PX }}>
        <span>
          Score <span className="font-mono text-zinc-100">{game.score}</span>
        </span>
        <span>Arrows to steer</span>
      </div>
      <div className="relative">
        <div
          className="grid rounded-[3px] bg-[#070b09] ring-1 ring-white/10"
          style={{ gridTemplateColumns: `repeat(${SNAKE_COLS}, ${CELL_PX}px)` }}
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
            return <div key={cell} className={tone} style={{ height: CELL_PX, width: CELL_PX }} />;
          })}
        </div>
        {game.over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[3px] bg-black/75 text-center">
            <p className="text-sm font-bold text-zinc-100">Game over</p>
            <p className="text-[10px] text-zinc-300">Enter to play again</p>
          </div>
        )}
      </div>
      <p className="text-[9px] text-zinc-500">Arrows: steer | Back: games</p>
    </div>
  );
}
