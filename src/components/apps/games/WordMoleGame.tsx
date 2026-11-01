import { useEffect, useState } from 'react';
import { useAppKeys, moveCursor } from '@/lib/appKeys';
import {
  MOLE_COLUMNS,
  MOLE_ROUND_MS,
  MOLE_TICK_MS,
  advanceWordMole,
  createWordMole,
  whackMole,
  type WordMoleGame as WordMoleState,
} from '@/lib/games/wordMole';

interface WordMoleGameProps {
  onBack: () => void;
}

const LETTER_KEY = /^[a-z]$/i;
const ARROWS = ['up', 'down', 'left', 'right'];

export default function WordMoleGame({ onBack }: WordMoleGameProps) {
  const [game, setGame] = useState<WordMoleState>(createWordMole);

  useEffect(() => {
    if (game.over) return;
    const timer = window.setInterval(() => setGame((current) => advanceWordMole(current)), MOLE_TICK_MS);
    return () => window.clearInterval(timer);
  }, [game.over]);

  useAppKeys((key) => {
    if (key === 'back') {
      onBack();
      return true;
    }
    if (game.over) {
      if (key === 'select') {
        setGame(createWordMole());
        return true;
      }
      return false;
    }
    if (key === 'select') {
      setGame((current) => whackMole(current, current.holes[current.cursor]?.letter ?? '', current.cursor));
      return true;
    }
    if (ARROWS.includes(key)) {
      setGame((current) => {
        const next = moveCursor(key, current.cursor, current.holes.length, MOLE_COLUMNS);
        return next === null ? current : { ...current, cursor: next };
      });
      return true;
    }
    if (LETTER_KEY.test(key)) {
      const letter = key.toUpperCase();
      setGame((current) => whackMole(current, letter));
      return true;
    }
    return false;
  });

  const secondsLeft = Math.max(0, Math.ceil((MOLE_ROUND_MS - game.elapsed) / 1000));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 bg-zinc-950 p-2">
      <div className="flex justify-between text-[10px] text-zinc-400">
        <span>
          Score <span className="font-mono text-zinc-100">{game.score}</span>
        </span>
        <span>
          Time <span className="font-mono text-zinc-100">{secondsLeft}s</span>
        </span>
      </div>

      <div className="flex justify-center gap-[3px] rounded-[4px] bg-zinc-900 py-1.5" aria-label="Word to spell">
        {game.word.split('').map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className={`w-4 text-center font-mono text-sm font-bold ${
              index < game.progress
                ? 'text-[#7ed957]'
                : index === game.progress
                  ? 'border-b-2 border-[#7ed957] text-zinc-100'
                  : 'text-zinc-600'
            }`}
          >
            {letter}
          </span>
        ))}
      </div>

      <div className="relative grid flex-1 grid-cols-3 content-center gap-2 px-6">
        {game.holes.map((mole, index) => (
          <button
            key={index}
            type="button"
            aria-label={mole ? `Mole ${mole.letter}` : 'Empty hole'}
            onPointerDown={() => setGame((current) => whackMole(current, current.holes[index]?.letter ?? '', index))}
            className={`relative flex h-11 items-end justify-center rounded-full bg-[radial-gradient(ellipse_at_50%_30%,#1b1f1a_0%,#070807_70%)] shadow-[inset_0_3px_5px_rgba(0,0,0,0.9)] ring-1 transition ${
              index === game.cursor ? 'ring-[#7ed957]' : 'ring-white/10'
            }`}
          >
            {mole && (
              <span className="mb-1 flex h-7 w-7 items-center justify-center rounded-full border border-black/60 bg-gradient-to-b from-[#b08862] to-[#5a3d25] font-mono text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                {mole.letter}
              </span>
            )}
          </button>
        ))}
        {game.over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[4px] bg-black/75 text-center">
            <p className="text-sm font-bold text-zinc-100">Time is up</p>
            <p className="text-[10px] text-zinc-300">Final score {game.score}</p>
            <p className="text-[10px] text-zinc-400">Enter to play again</p>
          </div>
        )}
      </div>

      <p className="text-[9px] text-zinc-500">Type letters to whack | Arrows + Enter | Back: games</p>
    </div>
  );
}
