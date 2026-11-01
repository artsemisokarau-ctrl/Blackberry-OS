import { useRef, useState, type PointerEvent } from 'react';
import { Battery, BellOff, ChevronLeft, Circle, Cloud, Signal, Wifi, WifiOff } from 'lucide-react';
import { CLICKS_APPS, ClicksAppView, type ClicksAppId } from '@/components/clicks/ClicksApps';
import { useNow } from '@/hooks/useNow';
import { useAppKeys } from '@/lib/appKeys';

type Surface = 'home' | 'drawer' | 'shade' | ClicksAppId;

const SWIPE_PX = 48;
const WALLPAPER =
  'radial-gradient(120% 70% at 85% 0%, #3f8fa6 0%, transparent 60%), radial-gradient(90% 60% at 0% 100%, #e0a25f 0%, transparent 62%), linear-gradient(180deg, #13303d 0%, #0a1820 100%)';
const PANEL = 'absolute inset-0 bg-[#081119]/95 backdrop-blur-md transition-transform duration-300 ease-out';

const DOCK_IDS: ClicksAppId[] = ['clock', 'calculator', 'calendar', 'settings'];

function formatTime(now: Date): string {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function formatDate(now: Date): string {
  return now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function ClicksBootScreen() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center" style={{ background: WALLPAPER }}>
      <span className="text-lg font-semibold tracking-[0.25em] text-white">CLICKS</span>
    </div>
  );
}

export default function ClicksScreen() {
  const [surface, setSurface] = useState<Surface>('home');
  const [query, setQuery] = useState('');
  const [wifi, setWifi] = useState(true);
  const [dnd, setDnd] = useState(false);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const now = useNow();

  const isApp = !['home', 'drawer', 'shade'].includes(surface);
  const matches = CLICKS_APPS.filter((app) => app.label.toLowerCase().includes(query.trim().toLowerCase()));

  const goHome = () => {
    setQuery('');
    setSurface('home');
  };

  const openApp = (id: ClicksAppId) => {
    setQuery('');
    setSurface(id);
  };

  useAppKeys((key) => {
    if (key === 'back') {
      if (surface === 'home') return false;
      goHome();
      return true;
    }
    if (isApp) return false;

    if (surface === 'home') {
      if (key === 'up') {
        setSurface('drawer');
        return true;
      }
      if (key === 'down') {
        setSurface('shade');
        return true;
      }
      return false;
    }

    if (surface === 'shade') {
      if (key === 'up') goHome();
      return true;
    }

    if (key === 'down') {
      goHome();
      return true;
    }
    if (key === 'select') {
      if (query && matches[0]) openApp(matches[0].id);
      return true;
    }
    if (key === 'backspace') {
      setQuery((current) => current.slice(0, -1));
      return true;
    }
    if (key.length === 1 && /^[a-z0-9 ]$/i.test(key)) {
      setQuery((current) => current + key.toLowerCase());
      return true;
    }
    return false;
  });

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dy) < SWIPE_PX || Math.abs(dy) < Math.abs(dx)) return;
    if (dy < 0) {
      if (surface === 'home') setSurface('drawer');
      else if (surface === 'shade') goHome();
    } else if (surface === 'home') {
      setSurface('shade');
    } else if (surface === 'drawer') {
      goHome();
    }
  };

  const time = formatTime(now);
  const date = formatDate(now);

  return (
    <div
      className="relative h-full w-full touch-none overflow-hidden text-white"
      style={{ background: WALLPAPER }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex h-7 items-center justify-between px-3 text-[9px] font-medium text-white/90">
        <span className="tabular-nums">{time}</span>
        <span className="flex items-center gap-1.5">
          {dnd && <BellOff className="h-2.5 w-2.5" strokeWidth={2.2} />}
          {wifi ? <Wifi className="h-2.5 w-2.5" strokeWidth={2.2} /> : <WifiOff className="h-2.5 w-2.5" strokeWidth={2.2} />}
          <Signal className="h-2.5 w-2.5" strokeWidth={2.2} />
          <Battery className="h-2.5 w-2.5" strokeWidth={2.2} />
          <span>86%</span>
        </span>
      </div>

      {surface === 'home' && (
        <div className="absolute inset-0 flex flex-col px-3 pb-3 pt-9">
          <div className="rounded-[18px] bg-white/10 p-3 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-3xl font-light tabular-nums">{time}</p>
            <p className="text-[10px] text-white/70">{date}</p>
          </div>
          <div className="mt-2 flex items-center gap-3 rounded-[18px] bg-white/10 px-3 py-2.5 ring-1 ring-white/10 backdrop-blur-md">
            <Cloud className="h-5 w-5 text-[#f4c27a]" strokeWidth={1.8} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">18 C</p>
              <p className="text-[9px] text-white/70">Partly cloudy</p>
            </div>
            <span className="text-[7px] uppercase tracking-wider text-white/40">Sample</span>
          </div>

          <p className="mt-auto pb-2 text-center text-[8px] uppercase tracking-[0.2em] text-white/50">
            Swipe up for apps
          </p>
          <div className="flex justify-around rounded-[22px] bg-white/15 p-2 ring-1 ring-white/10 backdrop-blur-md">
            {DOCK_IDS.map((id) => {
              const app = CLICKS_APPS.find((item) => item.id === id);
              if (!app) return null;
              const Icon = app.Icon;
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={app.label}
                  onClick={() => openApp(id)}
                  className={`flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br ${app.tone} shadow-lg ring-1 ring-white/15 transition active:scale-90`}
                >
                  <Icon className="h-5 w-5 text-white" strokeWidth={1.9} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        className={`${PANEL} flex flex-col px-3 pb-12 pt-9 ${
          surface === 'drawer' ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        }`}
      >
        <div className="mb-3 flex h-8 items-center rounded-full bg-white/10 px-3 text-xs ring-1 ring-white/10">
          {query ? (
            <span>{query}</span>
          ) : (
            <span className="text-white/40">Type to search apps</span>
          )}
        </div>
        {matches.length > 0 ? (
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {matches.map((app) => (
              <AppTile key={app.id} label={app.label} tone={app.tone} Icon={app.Icon} onOpen={() => openApp(app.id)} />
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-white/50">No apps match</p>
        )}
      </div>

      <div
        className={`${PANEL} flex flex-col gap-4 px-4 pb-4 pt-10 ${
          surface === 'shade' ? 'translate-y-0' : 'pointer-events-none -translate-y-full'
        }`}
      >
        <div>
          <p className="text-3xl font-light tabular-nums">{time}</p>
          <p className="text-[10px] text-white/60">{date}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <QuickToggle label="Wi-Fi" on={wifi} onToggle={() => setWifi((value) => !value)} />
          <QuickToggle label="Do not disturb" on={dnd} onToggle={() => setDnd((value) => !value)} />
        </div>
        <p className="text-[10px] text-white/50">No notifications</p>
      </div>

      {surface !== 'home' && (
        <>
          {isApp && (
            <div className="absolute inset-x-0 bottom-9 top-7 overflow-hidden bg-[#0c141b] p-3">
              <div className="flex h-full flex-col">
                <ClicksAppView id={surface as ClicksAppId} />
              </div>
            </div>
          )}
          <nav className="absolute inset-x-0 bottom-0 z-20 flex h-9 items-center justify-around bg-black/70 backdrop-blur-md">
            <button type="button" aria-label="Back" onClick={() => goHome()} className="flex h-8 w-12 items-center justify-center text-white/80 transition active:scale-90">
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <button type="button" aria-label="Home" onClick={() => goHome()} className="flex h-8 w-12 items-center justify-center text-white/80 transition active:scale-90">
              <Circle className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </nav>
        </>
      )}
    </div>
  );
}

interface AppTileProps {
  label: string;
  tone: string;
  Icon: (typeof CLICKS_APPS)[number]['Icon'];
  onOpen: () => void;
}

function AppTile({ label, tone, Icon, onOpen }: AppTileProps) {
  return (
    <button type="button" onClick={onOpen} className="flex flex-col items-center gap-1 transition active:scale-95">
      <span className={`flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br ${tone} shadow-lg ring-1 ring-white/15`}>
        <Icon className="h-5 w-5 text-white" strokeWidth={1.9} />
      </span>
      <span className="text-[9px] text-white/85">{label}</span>
    </button>
  );
}

interface QuickToggleProps {
  label: string;
  on: boolean;
  onToggle: () => void;
}

function QuickToggle({ label, on, onToggle }: QuickToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={`flex items-center justify-between rounded-[12px] px-3 py-2.5 text-[10px] font-medium transition ${
        on ? 'bg-[#e08a52] text-white' : 'bg-white/10 text-white/80'
      }`}
    >
      {label}
      <span className={`h-2 w-2 rounded-full ${on ? 'bg-white' : 'bg-white/30'}`} />
    </button>
  );
}
