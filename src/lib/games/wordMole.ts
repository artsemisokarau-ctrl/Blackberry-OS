export const MOLE_COLUMNS = 3;
export const MOLE_TICK_MS = 200;
export const MOLE_ROUND_MS = 60000;

const HOLE_COUNT = 9;
const HOLE_LIFE_MS = 1400;
const SPAWN_CHANCE = 0.5;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const WORDS = ['MOLE', 'BERRY', 'QWERTY', 'TRACKPAD', 'KEYBOARD', 'SIGNAL', 'BATTERY', 'MESSAGE', 'CURVE'];

export interface Mole {
  letter: string;
  until: number;
}

export interface WordMoleGame {
  holes: (Mole | null)[];
  word: string;
  progress: number;
  score: number;
  elapsed: number;
  cursor: number;
  over: boolean;
}

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

function nextWord(current: string): string {
  let word = pick(WORDS);
  while (word === current) word = pick(WORDS);
  return word;
}

export function createWordMole(): WordMoleGame {
  return {
    holes: Array<Mole | null>(HOLE_COUNT).fill(null),
    word: pick(WORDS),
    progress: 0,
    score: 0,
    elapsed: 0,
    cursor: 4,
    over: false,
  };
}

export function advanceWordMole(game: WordMoleGame): WordMoleGame {
  if (game.over) return game;
  const elapsed = game.elapsed + MOLE_TICK_MS;
  const holes = game.holes.map((mole) => (mole && mole.until > elapsed ? mole : null));

  const emptyHoles = holes.flatMap((mole, index) => (mole === null ? [index] : []));
  if (emptyHoles.length > 0 && Math.random() < SPAWN_CHANCE) {
    const needed = game.word[game.progress];
    const letter = Math.random() < 0.5 ? needed : pick(ALPHABET);
    holes[pick(emptyHoles)] = { letter, until: elapsed + HOLE_LIFE_MS };
  }

  return { ...game, holes, elapsed, over: elapsed >= MOLE_ROUND_MS };
}

export function whackMole(game: WordMoleGame, letter: string, hole?: number): WordMoleGame {
  if (game.over) return game;

  const target =
    hole === undefined
      ? game.holes.findIndex((mole) => mole?.letter === letter)
      : game.holes[hole]?.letter === letter
        ? hole
        : -1;
  if (target < 0) return { ...game, score: Math.max(0, game.score - 5) };

  const holes = game.holes.map((mole, index) => (index === target ? null : mole));
  if (letter !== game.word[game.progress]) return { ...game, holes, score: Math.max(0, game.score - 5) };

  const progress = game.progress + 1;
  if (progress < game.word.length) return { ...game, holes, progress, score: game.score + 10 };
  return { ...game, holes, word: nextWord(game.word), progress: 0, score: game.score + 60 };
}
