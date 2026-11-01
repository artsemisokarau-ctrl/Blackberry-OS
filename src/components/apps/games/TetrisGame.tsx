import { useEffect, useState } from 'react';
import { useAppKeys } from '@/lib/appKeys';
import {
  createTetris,
  dropTetris,
  moveTetris,
  rotateTetris,
  TETRIS_COLS,
  TETRIS_TICK_MS,
  type PieceKind,
  type TetrisGame as TetrisState,
} from '@/lib/games/tetris';

interface TetrisGameProps {
  onBack: () => void;
}

const TETRIS_COLORS: Record<PieceKind, string> = {
  I: '#5ad1f0',
  O: '#f2d15b',
  T: '#e58f4a',
  S: '#7ed957',
  Z: '#ef6b6b',
  J: '#6b9cff',
  L: '#f5a25a',
};

const CELL_PX = 16;

export default function TetrisGame({ onBack }: TetrisGameProps) {
  const [game, setGame] = useState<TetrisState>(createTetris);

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
        setGame((current) => moveTetris(current, -1));
        return true;
      case 'right':
        setGame((current) => moveTetris(current, 1));
        return true;
      case 'up':
      case 'select':
        setGame((current) => rotateTetris(current));
        return true;
      case 'down':
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
    <div className="flex min-h-0 flex-1 items-center justify-center gap-3 bg-zinc-950 p-2">
      <div className="relative">
        <div
          className="grid gap-px rounded-[3px] bg-[#070b09] p-px ring-1 ring-white/10"
          style={{ gridTemplateColumns: `repeat(${TETRIS_COLS}, ${CELL_PX}px)` }}
        >
          {display.flat().map((kind, index) => (
            <div
              key={index}
              className="rounded-[2px]"
              style={{
                height: CELL_PX,
                width: CELL_PX,
                backgroundColor: kind ? TETRIS_COLORS[kind] : 'transparent',
              }}
            />
          ))}
        </div>
        {game.over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[3px] bg-black/75 text-center">
            <p className="text-sm font-bold text-zinc-100">Game over</p>
            <p className="text-[10px] text-zinc-300">Enter to play again</p>
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
          Left/Right move
          <br />
          Up or Enter turn
          <br />
          Down drop
          <br />
          Back: games
        </p>
      </div>
    </div>
  );
}
