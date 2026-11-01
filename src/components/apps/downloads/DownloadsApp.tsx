import { useRef, useState } from 'react';
import { Download, Gamepad2 } from 'lucide-react';
import AppFrame from '@/components/ui/AppFrame';
import GamePlayer, { GAME_LABELS } from '@/components/apps/games/GamePlayer';
import { moveCursor, useAppKeys } from '@/lib/appKeys';
import {
  ACCEPTED_GAME_EXTENSIONS,
  MAX_GAME_BYTES,
  fitsStorage,
  isGameFile,
  readAsDataUrl,
  simulatorGameFor,
  titleFor,
  type DownloadedGame,
} from '@/lib/downloads';
import { usePersistentState } from '@/hooks/usePersistentState';
import { STORAGE_KEYS } from '@/lib/records';

type Install = { phase: 'idle' } | { phase: 'installing'; name: string; percent: number } | { phase: 'error'; message: string } | { phase: 'done'; name: string };

export default function DownloadsApp() {
  const [games, setGames] = usePersistentState<DownloadedGame[]>(STORAGE_KEYS.downloads, []);
  const [playing, setPlaying] = useState<DownloadedGame | null>(null);

  if (playing && playing.playsAs) {
    return (
      <AppFrame appId="downloads" right={playing.title}>
        <GamePlayer game={playing.playsAs} onBack={() => setPlaying(null)} />
      </AppFrame>
    );
  }

  return (
    <AppFrame appId="downloads" right={`${games.length} item${games.length === 1 ? '' : 's'}`}>
      <DownloadsList games={games} onImport={(game) => setGames([...games, game])} onRemove={(id) => setGames(games.filter((item) => item.id !== id))} onPlay={setPlaying} />
    </AppFrame>
  );
}

interface DownloadsListProps {
  games: DownloadedGame[];
  onImport: (game: DownloadedGame) => void;
  onRemove: (id: string) => void;
  onPlay: (game: DownloadedGame) => void;
}

function DownloadsList({ games, onImport, onRemove, onPlay }: DownloadsListProps) {
  const [cursor, setCursor] = useState(0);
  const [install, setInstall] = useState<Install>({ phase: 'idle' });
  const [notice, setNotice] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const rowCount = games.length + 1;

  const importFile = async (file: File) => {
    if (!isGameFile(file.name)) {
      setInstall({ phase: 'error', message: `Choose a ${ACCEPTED_GAME_EXTENSIONS.join(' or ')} file.` });
      return;
    }
    if (file.size > MAX_GAME_BYTES) {
      setInstall({ phase: 'error', message: 'This game is larger than 512 KB and cannot be stored.' });
      return;
    }
    const jadText = file.name.toLowerCase().endsWith('.jad') ? await file.text() : null;
    const title = titleFor(file.name, jadText);
    setInstall({ phase: 'installing', name: title, percent: 0 });
    try {
      const dataUrl = await readAsDataUrl(file, (percent) => setInstall({ phase: 'installing', name: title, percent }));
      const game: DownloadedGame = {
        id: `${Date.now()}-${file.name}`,
        title,
        fileName: file.name,
        size: file.size,
        importedAt: Date.now(),
        playsAs: simulatorGameFor(title),
        dataUrl,
      };
      if (!fitsStorage(games, game)) {
        setInstall({ phase: 'error', message: 'Storage is full. Remove a game first.' });
        return;
      }
      onImport(game);
      setInstall({ phase: 'done', name: title });
    } catch {
      setInstall({ phase: 'error', message: 'The game could not be imported. Try again.' });
    }
  };

  useAppKeys((key) => {
    if (key === 'select') {
      if (cursor === 0) {
        fileInput.current?.click();
        return true;
      }
      const game = games[cursor - 1];
      if (!game.playsAs) {
        setNotice(`${game.title} needs Java, which this simulator cannot run.`);
        return true;
      }
      onPlay(game);
      return true;
    }
    if (key === 'backspace' && cursor > 0) {
      onRemove(games[cursor - 1].id);
      setCursor(Math.max(0, cursor - 1));
      return true;
    }
    const next = moveCursor(key, cursor, rowCount);
    if (next === null) return false;
    setCursor(next);
    setNotice('');
    return true;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5 p-2">
      <input
        ref={fileInput}
        type="file"
        accept={ACCEPTED_GAME_EXTENSIONS.join(',')}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void importFile(file);
        }}
      />

      <div className={`flex items-center gap-2 rounded-[4px] px-2 py-1.5 ${cursor === 0 ? 'bb-select text-white' : 'text-zinc-200'}`}>
        <Download className="h-4 w-4 shrink-0" strokeWidth={1.8} />
        <div className="min-w-0">
          <div className="text-[11px] font-semibold">Import game from computer</div>
          <div className={`text-[9px] ${cursor === 0 ? 'text-white/80' : 'text-zinc-500'}`}>.JAR or .JAD, up to 512 KB</div>
        </div>
      </div>

      {install.phase === 'installing' && (
        <div className="flex flex-col gap-1 px-2 py-1">
          <div className="flex justify-between text-[9px] text-zinc-400">
            <span className="truncate">Installing {install.name}</span>
            <span className="tabular-nums">{install.percent}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full bg-emerald-400 transition-[width] duration-200" style={{ width: `${install.percent}%` }} />
          </div>
        </div>
      )}
      {install.phase === 'done' && <p className="px-2 text-[9px] text-emerald-300">{install.name} installed.</p>}
      {install.phase === 'error' && <p className="px-2 text-[9px] text-red-300">{install.message}</p>}
      {notice && <p className="px-2 text-[9px] text-amber-200">{notice}</p>}

      <ul className="flex min-h-0 flex-1 flex-col gap-[2px] overflow-y-auto">
        {games.length === 0 && (
          <li className="px-2 py-4 text-center text-[10px] text-zinc-500">
            No games yet. Import a .JAR or .JAD file from your computer to see it here.
          </li>
        )}
        {games.map((game, index) => {
          const selected = cursor === index + 1;
          return (
            <li
              key={game.id}
              className={`flex items-center gap-2 rounded-[4px] px-2 py-1.5 ${selected ? 'bb-select text-white' : 'text-zinc-200'}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-[#7ed957]">
                <Gamepad2 className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-semibold">{game.title}</div>
                <div className={`truncate text-[9px] ${selected ? 'text-white/80' : 'text-zinc-500'}`}>
                  {game.playsAs ? `Plays as ${GAME_LABELS[game.playsAs]}` : 'Not playable in simulator'}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[9px] text-zinc-500">Enter: open | Backspace: remove | Back: home</p>
    </div>
  );
}
