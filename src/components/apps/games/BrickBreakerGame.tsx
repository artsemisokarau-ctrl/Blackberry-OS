import { useEffect, useRef, useState } from 'react';
import { useAppKeys } from '@/lib/appKeys';
import {
  FIELD_HEIGHT,
  FIELD_WIDTH,
  PADDLE_STEP,
  createBrickGame,
  drawBrickGame,
  launchBall,
  movePaddle,
  stepBrickGame,
  type BrickGame,
} from '@/lib/games/brickBreaker';

interface BrickBreakerGameProps {
  onBack: () => void;
}

interface Hud {
  score: number;
  lives: number;
  level: number;
  over: boolean;
  launched: boolean;
}

const hudOf = (game: BrickGame): Hud => ({
  score: game.score,
  lives: game.lives,
  level: game.level,
  over: game.over,
  launched: game.launched,
});

const sameHud = (a: Hud, b: Hud) =>
  a.score === b.score && a.lives === b.lives && a.level === b.level && a.over === b.over && a.launched === b.launched;

export default function BrickBreakerGame({ onBack }: BrickBreakerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<BrickGame>(createBrickGame());
  const hudRef = useRef<Hud>(hudOf(gameRef.current));
  const [hud, setHud] = useState<Hud>(hudRef.current);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const next = stepBrickGame(gameRef.current);
      gameRef.current = next;
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawBrickGame(ctx, next);
      const nextHud = hudOf(next);
      if (!sameHud(hudRef.current, nextHud)) {
        hudRef.current = nextHud;
        setHud(nextHud);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useAppKeys((key) => {
    const current = gameRef.current;
    switch (key) {
      case 'back':
        onBack();
        return true;
      case 'left':
        gameRef.current = movePaddle(current, -PADDLE_STEP);
        return true;
      case 'right':
        gameRef.current = movePaddle(current, PADDLE_STEP);
        return true;
      case 'select':
        gameRef.current = current.over ? createBrickGame() : launchBall(current);
        return true;
      default:
        return false;
    }
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center gap-1.5 bg-zinc-950 p-2">
      <div className="flex justify-between text-[10px] text-zinc-400" style={{ width: FIELD_WIDTH }}>
        <span>
          Score <span className="font-mono text-zinc-100">{hud.score}</span>
        </span>
        <span>Level {hud.level}</span>
        <span>
          Lives <span className="font-mono text-zinc-100">{hud.lives}</span>
        </span>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={FIELD_WIDTH}
          height={FIELD_HEIGHT}
          className="block rounded-[3px] ring-1 ring-white/15"
        />
        {hud.over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[3px] bg-black/65 text-center">
            <p className="text-sm font-bold text-zinc-100">Game over</p>
            <p className="text-[10px] text-zinc-300">Enter to play again</p>
          </div>
        )}
        {!hud.over && !hud.launched && (
          <p className="absolute inset-x-0 bottom-3 text-center text-[9px] text-zinc-300">Enter launches the ball</p>
        )}
      </div>
      <p className="text-[9px] text-zinc-500">Left/Right: paddle | Enter: launch | Back: games</p>
    </div>
  );
}
