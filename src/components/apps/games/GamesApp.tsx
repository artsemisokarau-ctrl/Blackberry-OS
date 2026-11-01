import { useState } from 'react';
import AppFrame from '@/components/ui/AppFrame';
import ListRows, { type ListRow } from '@/components/ui/ListRows';
import GamePlayer, { GAME_LABELS, type GameId } from '@/components/apps/games/GamePlayer';
import { moveCursor, useAppKeys } from '@/lib/appKeys';

const GAMES: { id: GameId; right: string }[] = [
  { id: 'brick', right: 'Arcade' },
  { id: 'mole', right: 'Word' },
  { id: 'snake', right: 'Classic' },
  { id: 'tetris', right: 'Puzzle' },
];

export default function GamesApp() {
  const [game, setGame] = useState<GameId | null>(null);
  const [cursor, setCursor] = useState(0);

  if (game) {
    return (
      <AppFrame appId="games" right={GAME_LABELS[game]}>
        <GamePlayer game={game} onBack={() => setGame(null)} />
      </AppFrame>
    );
  }

  return (
    <AppFrame appId="games" right="Games">
      <GameMenu cursor={cursor} onCursor={setCursor} onOpen={setGame} />
    </AppFrame>
  );
}

interface GameMenuProps {
  cursor: number;
  onCursor: (index: number) => void;
  onOpen: (game: GameId) => void;
}

function GameMenu({ cursor, onCursor, onOpen }: GameMenuProps) {
  useAppKeys((key) => {
    if (key === 'select') {
      onOpen(GAMES[cursor].id);
      return true;
    }
    const next = moveCursor(key, cursor, GAMES.length);
    if (next === null) return false;
    onCursor(next);
    return true;
  });

  const rows: ListRow[] = GAMES.map((item) => ({ id: item.id, primary: GAME_LABELS[item.id], right: item.right }));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
      <ListRows
        rows={rows}
        cursor={cursor}
        visible={4}
      />
      <p className="mt-auto text-[9px] text-zinc-500">Enter: play | Back: home</p>
    </div>
  );
}
