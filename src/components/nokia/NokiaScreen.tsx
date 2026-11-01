import { useState, type ReactNode } from 'react';
import { Battery, Clock, Gamepad2, Info, Phone, Signal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import NokiaDial from '@/components/nokia/NokiaDial';
import { NokiaGamesMenu, NokiaSnake, NokiaTetris, type NokiaGameView } from '@/components/nokia/NokiaGames';
import CopyButton from '@/components/ui/CopyButton';
import { moveCursor, useAppKeys } from '@/lib/appKeys';
import { useNow } from '@/hooks/useNow';
import { PHONE_NUMBER } from '@/lib/records';

type NokiaView = 'home' | 'games' | NokiaGameView | 'dial' | 'clock' | 'info';

const MENU: { view: NokiaView; label: string; Icon: LucideIcon }[] = [
  { view: 'games', label: 'Games', Icon: Gamepad2 },
  { view: 'dial', label: 'Dial', Icon: Phone },
  { view: 'clock', label: 'Clock', Icon: Clock },
  { view: 'info', label: 'Info', Icon: Info },
];

const TITLES: Record<NokiaView, string> = {
  home: 'Menu',
  games: 'Games',
  snake: 'Snake',
  tetris: 'Tetris',
  dial: 'Dial',
  clock: 'Clock',
  info: 'Info',
};

const SOFT_KEYS: Partial<Record<NokiaView, [string, string]>> = {
  home: ['Select', ''],
  games: ['Play', 'Back'],
  snake: ['', 'Exit'],
  tetris: ['', 'Exit'],
  dial: ['Call', 'Back'],
  clock: ['', 'Back'],
  info: ['', 'Back'],
};

function parentOf(view: NokiaView): NokiaView {
  return view === 'snake' || view === 'tetris' ? 'games' : 'home';
}

function formatClock(now: Date): { time: string; date: string } {
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const date = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return { time, date };
}

export default function NokiaScreen() {
  const [view, setView] = useState<NokiaView>('home');
  const [cursor, setCursor] = useState(0);
  const now = useNow();
  const { time } = formatClock(now);
  const [left, right] = SOFT_KEYS[view] ?? ['', ''];

  const back = () => setView(parentOf(view));

  let content: ReactNode;
  switch (view) {
    case 'home':
      content = <NokiaHome cursor={cursor} onCursor={setCursor} onOpen={setView} />;
      break;
    case 'games':
      content = <NokiaGamesMenu onOpen={setView} onBack={back} />;
      break;
    case 'snake':
      content = <NokiaSnake onBack={back} />;
      break;
    case 'tetris':
      content = <NokiaTetris onBack={back} />;
      break;
    case 'dial':
      content = <NokiaDial onBack={back} />;
      break;
    case 'clock':
      content = <NokiaClock onBack={back} />;
      break;
    case 'info':
      content = <NokiaInfo onBack={back} />;
      break;
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#0d1210] text-zinc-100">
      <header className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="text-[11px] font-semibold">{TITLES[view]}</span>
        <span className="flex items-center gap-1.5 text-[9px] text-zinc-300">
          <Signal className="h-2.5 w-2.5" strokeWidth={2.4} />
          <Battery className="h-2.5 w-2.5" strokeWidth={2.4} />
          <span className="font-mono">{time}</span>
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">{content}</div>

      <footer className="flex justify-between border-t border-white/10 px-3 py-1 text-[10px] text-zinc-400">
        <span>{left}</span>
        <span>{right}</span>
      </footer>
    </div>
  );
}

interface NokiaHomeProps {
  cursor: number;
  onCursor: (index: number) => void;
  onOpen: (view: NokiaView) => void;
}

function NokiaHome({ cursor, onCursor, onOpen }: NokiaHomeProps) {
  useAppKeys((key) => {
    if (key === 'select') {
      onOpen(MENU[cursor].view);
      return true;
    }
    const next = moveCursor(key, cursor, MENU.length, 2);
    if (next === null) return false;
    onCursor(next);
    return true;
  });

  return (
    <div className="grid flex-1 grid-cols-2 content-center gap-3 p-4">
      {MENU.map(({ label, Icon }, index) => {
        const selected = index === cursor;
        return (
          <div
            key={label}
            className={`flex flex-col items-center justify-center gap-2 rounded-[10px] border py-3 transition-colors duration-200 ${
              selected ? 'border-[#7ed957] bg-[#16261a]' : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <Icon className={`h-7 w-7 ${selected ? 'text-[#7ed957]' : 'text-zinc-300'}`} strokeWidth={1.8} />
            <span className="text-[11px]">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function NokiaClock({ onBack }: { onBack: () => void }) {
  const now = useNow();
  const { time, date } = formatClock(now);
  useAppKeys((key) => {
    if (key !== 'back') return false;
    onBack();
    return true;
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
      <span className="font-mono text-4xl tracking-wider">{time}</span>
      <span className="text-[11px] text-zinc-400">{date}</span>
    </div>
  );
}

function NokiaInfo({ onBack }: { onBack: () => void }) {
  useAppKeys((key) => {
    if (key !== 'back') return false;
    onBack();
    return true;
  });

  return (
    <div className="flex flex-1 flex-col gap-3 p-4 text-[11px]">
      <p className="text-zinc-400">Model</p>
      <p>Nokia 2660 Flip (simulator)</p>
      <p className="mt-2 text-zinc-400">Phone number</p>
      <div className="flex items-center justify-between gap-2 rounded-[8px] bg-white/[0.04] px-3 py-2">
        <span className="font-mono">{PHONE_NUMBER}</span>
        <CopyButton text={PHONE_NUMBER} />
      </div>
      <p className="mt-auto text-[9px] text-zinc-500">The number is fictional and only exists in this simulator.</p>
    </div>
  );
}

export function NokiaBootScreen() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0d1210]">
      <span className="text-xl font-bold tracking-[0.3em] text-[#7ed957]">NOKIA</span>
      <span className="mt-2 text-[9px] text-zinc-500">Starting up</span>
    </div>
  );
}

export function NokiaClosedDisplay() {
  const now = useNow();
  const { time, date } = formatClock(now);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-zinc-100">
      <span className="font-mono text-3xl tracking-wider">{time}</span>
      <span className="text-[10px] text-zinc-400">{date}</span>
    </div>
  );
}
