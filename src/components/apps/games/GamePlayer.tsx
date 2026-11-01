import BrickBreakerGame from '@/components/apps/games/BrickBreakerGame';
import WordMoleGame from '@/components/apps/games/WordMoleGame';
import SnakeGame from '@/components/apps/games/SnakeGame';
import TetrisGame from '@/components/apps/games/TetrisGame';

export type GameId = 'brick' | 'mole' | 'snake' | 'tetris';

export const GAME_LABELS: Record<GameId, string> = {
  brick: 'BrickBreaker',
  mole: 'Word Mole',
  snake: 'Snake',
  tetris: 'Tetris',
};

interface GamePlayerProps {
  game: GameId;
  onBack: () => void;
}

export default function GamePlayer({ game, onBack }: GamePlayerProps) {
  switch (game) {
    case 'brick':
      return <BrickBreakerGame onBack={onBack} />;
    case 'mole':
      return <WordMoleGame onBack={onBack} />;
    case 'snake':
      return <SnakeGame onBack={onBack} />;
    case 'tetris':
      return <TetrisGame onBack={onBack} />;
  }
}
