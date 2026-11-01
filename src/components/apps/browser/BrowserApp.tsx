import { useState } from 'react';
import { ArrowLeft, ArrowRight, Globe, Home, RotateCw, type LucideIcon } from 'lucide-react';
import AppFrame from '@/components/ui/AppFrame';
import { editText, moveCursor, useAppKeys } from '@/lib/appKeys';
import { hostOf, resolveAddress, SPEED_DIALS } from '@/lib/browser';

type Zone = 'address' | 'toolbar' | 'content';
type ToolAction = 'back' | 'forward' | 'refresh' | 'home';

const TOOLS: { id: ToolAction; label: string; Icon: LucideIcon }[] = [
  { id: 'back', label: 'Back', Icon: ArrowLeft },
  { id: 'forward', label: 'Forward', Icon: ArrowRight },
  { id: 'refresh', label: 'Refresh', Icon: RotateCw },
  { id: 'home', label: 'Home', Icon: Home },
];

export default function BrowserApp() {
  const [history, setHistory] = useState<(string | null)[]>([null]);
  const [index, setIndex] = useState(0);
  const [zone, setZone] = useState<Zone>('content');
  const [draft, setDraft] = useState('');
  const [toolIndex, setToolIndex] = useState(0);
  const [dialIndex, setDialIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const current = history[index];

  const navigate = (url: string | null) => {
    setHistory([...history.slice(0, index + 1), url]);
    setIndex(index + 1);
    setLoading(url !== null);
    setError('');
  };

  const runTool = (action: ToolAction) => {
    if (action === 'back' && index > 0) {
      setIndex(index - 1);
      setLoading(history[index - 1] !== null);
    }
    if (action === 'forward' && index < history.length - 1) {
      setIndex(index + 1);
      setLoading(history[index + 1] !== null);
    }
    if (action === 'refresh' && current !== null) {
      setLoading(true);
      setReloadKey(reloadKey + 1);
    }
    if (action === 'home') navigate(null);
  };

  const submit = () => {
    const result = resolveAddress(draft);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(result.url);
    setZone('content');
    setDraft('');
  };

  const editAddress = (start: string) => {
    setZone('address');
    setDraft(start);
    setError('');
  };

  useAppKeys((key) => {
    if (zone === 'address') {
      if (key === 'select') {
        submit();
        return true;
      }
      if (key === 'back') {
        setZone('content');
        setDraft('');
        return true;
      }
      if (key === 'down') {
        setZone('toolbar');
        return true;
      }
      const next = editText(draft, key);
      if (next === null) return false;
      setDraft(next);
      return true;
    }

    if (zone === 'toolbar') {
      if (key === 'select') {
        runTool(TOOLS[toolIndex].id);
        return true;
      }
      if (key === 'left' || key === 'right') {
        setToolIndex(moveCursor(key, toolIndex, TOOLS.length) ?? toolIndex);
        return true;
      }
      if (key === 'up') {
        editAddress(current ?? '');
        return true;
      }
      if (key === 'down') {
        setZone('content');
        return true;
      }
      if (key.length === 1) {
        editAddress(key);
        return true;
      }
      return false;
    }

    if (key === 'select' && current === null) {
      navigate(SPEED_DIALS[dialIndex].url);
      setZone('content');
      return true;
    }
    if (key === 'up' && (current !== null || dialIndex < 2)) {
      setZone('toolbar');
      return true;
    }
    if (current === null && (key === 'up' || key === 'down' || key === 'left' || key === 'right')) {
      const next = moveCursor(key, dialIndex, SPEED_DIALS.length, 2);
      if (next !== null) setDialIndex(next);
      return true;
    }
    if (key.length === 1) {
      editAddress(key);
      return true;
    }
    return false;
  });

  const addressText = zone === 'address' ? draft : (current ?? '');
  const focusRing = (active: boolean) => (active ? 'ring-2 ring-[#d7261e]' : 'ring-1 ring-zinc-300');

  return (
    <AppFrame appId="browser" right={current === null ? 'Start' : hostOf(current)}>
      <div className="flex min-h-0 flex-1 flex-col bg-zinc-100">
        <div className="flex items-center gap-1.5 bg-[#d7261e] px-2 py-1.5 text-white">
          <Globe className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="text-[10px] font-black tracking-wide">OPERA MINI</span>
        </div>

        <div className="flex items-center gap-1.5 bg-white px-2 py-1.5">
          <div className={`flex min-w-0 flex-1 items-center rounded-md bg-zinc-50 px-2 py-1 ${focusRing(zone === 'address')}`}>
            <span className={`truncate text-[11px] ${addressText ? 'text-zinc-900' : 'text-zinc-400'}`}>
              {addressText || 'Type a web address'}
              {zone === 'address' && <span className="ml-px inline-block w-px animate-pulse bg-zinc-900">&nbsp;</span>}
            </span>
          </div>
        </div>

        <div className="flex items-stretch gap-1 border-y border-zinc-300 bg-zinc-200 px-1 py-1">
          {TOOLS.map((tool, position) => {
            const active = zone === 'toolbar' && toolIndex === position;
            const disabled = (tool.id === 'back' && index === 0) || (tool.id === 'forward' && index >= history.length - 1);
            return (
              <button
                key={tool.id}
                type="button"
                tabIndex={-1}
                aria-label={tool.label}
                disabled={disabled}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-md bg-white py-1 text-[9px] font-semibold text-zinc-700 transition disabled:opacity-40 ${focusRing(active)}`}
              >
                <tool.Icon className="h-3.5 w-3.5" strokeWidth={2} />
                {tool.label}
              </button>
            );
          })}
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          {loading && <div className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-[#d7261e]" />}
          {current === null ? (
            <StartPage selected={zone === 'content' ? dialIndex : -1} />
          ) : (
            <iframe
              key={`${current}-${reloadKey}`}
              src={current}
              title={hostOf(current)}
              tabIndex={-1}
              onLoad={() => setLoading(false)}
              className="pointer-events-none h-full w-full flex-1 border-0 bg-white"
            />
          )}
        </div>

        {error ? (
          <p className="bg-red-50 px-2 py-1 text-[9px] text-red-700">{error}</p>
        ) : (
          <p className="bg-zinc-200 px-2 py-1 text-[8px] leading-tight text-zinc-600">
            Some websites block display inside other apps. Pages are view-only here; use the address bar to visit a site.
          </p>
        )}
      </div>
    </AppFrame>
  );
}

interface StartPageProps {
  selected: number;
}

function StartPage({ selected }: StartPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
      <p className="text-[9px] font-bold tracking-[0.25em] text-zinc-500">SPEED DIAL</p>
      <div className="grid grid-cols-2 gap-2">
        {SPEED_DIALS.map((dial, position) => (
          <div
            key={dial.url}
            className={`flex flex-col items-center gap-1 rounded-lg bg-white py-3 transition ${
              selected === position ? 'ring-2 ring-[#d7261e]' : 'ring-1 ring-zinc-300'
            }`}
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-black text-white"
              style={{ backgroundColor: dial.color }}
            >
              {dial.label.charAt(0)}
            </span>
            <span className="text-[10px] font-semibold text-zinc-800">{dial.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
