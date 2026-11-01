import { useState } from 'react';
import { Calculator as CalculatorIcon, CalendarDays, Clock as ClockIcon, Settings as SettingsIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import CopyButton from '@/components/ui/CopyButton';
import { useNow } from '@/hooks/useNow';
import { applyKey, CALC_START, type CalcState } from '@/lib/calculator';
import { useAppKeys } from '@/lib/appKeys';
import { PHONE_NUMBER } from '@/lib/records';

export type ClicksAppId = 'clock' | 'calculator' | 'calendar' | 'settings';

export const CLICKS_APPS: { id: ClicksAppId; label: string; Icon: LucideIcon; tone: string }[] = [
  { id: 'clock', label: 'Clock', Icon: ClockIcon, tone: 'from-[#3a8ab0] to-[#15405a]' },
  { id: 'calculator', label: 'Calculator', Icon: CalculatorIcon, tone: 'from-[#5aa37c] to-[#1f4d36]' },
  { id: 'calendar', label: 'Calendar', Icon: CalendarDays, tone: 'from-[#e08a52] to-[#8a3f22]' },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon, tone: 'from-[#78889c] to-[#2c3744]' },
];

export function ClicksAppView({ id }: { id: ClicksAppId }) {
  switch (id) {
    case 'clock':
      return <ClockApp />;
    case 'calculator':
      return <CalculatorApp />;
    case 'calendar':
      return <CalendarApp />;
    case 'settings':
      return <SettingsApp />;
  }
}

function formatTime(now: Date): string {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function formatDate(now: Date): string {
  return now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function ClockApp() {
  const now = useNow();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-white">
      <span className="text-5xl font-light tabular-nums tracking-tight">{formatTime(now)}</span>
      <span className="text-xs text-white/60">{formatDate(now)}</span>
    </div>
  );
}

const CALC_ROWS: [string, string][][] = [
  [['C', 'c'], ['DEL', 'backspace'], ['/', '/'], ['*', '*']],
  [['7', '7'], ['8', '8'], ['9', '9'], ['-', '-']],
  [['4', '4'], ['5', '5'], ['6', '6'], ['+', '+']],
  [['1', '1'], ['2', '2'], ['3', '3'], ['=', '=']],
  [['0', '0'], ['.', '.']],
];

function CalculatorApp() {
  const [state, setState] = useState<CalcState>(CALC_START);

  const press = (key: string) => setState((current) => applyKey(current, key) ?? current);

  useAppKeys((key) => {
    const next = applyKey(state, key);
    if (!next) return false;
    setState(next);
    return true;
  });

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex min-h-[64px] items-end justify-end rounded-[12px] bg-white/[0.04] px-3 py-2">
        <span className="break-all text-right text-3xl font-light tabular-nums text-white">{state.display}</span>
      </div>
      <div className="grid flex-1 grid-cols-4 gap-1.5">
        {CALC_ROWS.flat().map(([label, key], index) => {
          const isZero = label === '0';
          return (
            <button
              key={`${label}-${index}`}
              type="button"
              onPointerDown={() => press(key)}
              className={`flex items-center justify-center rounded-[12px] text-sm font-medium transition active:scale-95 ${
                label === '=' || label === '+' || label === '-' || label === '*' || label === '/'
                  ? 'bg-[#e08a52]/90 text-white'
                  : 'bg-white/10 text-white hover:bg-white/15'
              } ${isZero ? 'col-span-2' : ''}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function CalendarApp() {
  const now = useNow();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const monthName = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-1 flex-col gap-3 text-white">
      <p className="text-sm font-semibold">{monthName}</p>
      <div className="grid grid-cols-7 gap-y-1.5 text-center text-[10px]">
        {WEEKDAYS.map((day) => (
          <span key={day} className="text-white/50">
            {day}
          </span>
        ))}
        {cells.map((day, index) => (
          <span
            key={index}
            className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs tabular-nums ${
              day === now.getDate() ? 'bg-[#e08a52] font-semibold text-white' : 'text-white/85'
            }`}
          >
            {day ?? ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function SettingsApp() {
  return (
    <div className="flex flex-1 flex-col gap-3 text-white">
      <p className="text-sm font-semibold">Settings</p>
      <div className="rounded-[12px] bg-white/[0.06] p-3">
        <p className="text-[10px] text-white/50">Device</p>
        <p className="text-xs">Clicks Communicator (simulator)</p>
      </div>
      <div className="rounded-[12px] bg-white/[0.06] p-3">
        <p className="text-[10px] text-white/50">Phone number</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="font-mono text-xs">{PHONE_NUMBER}</span>
          <CopyButton text={PHONE_NUMBER} />
        </div>
      </div>
      <p className="mt-auto text-[9px] text-white/40">The number is fictional and only exists in this simulator.</p>
    </div>
  );
}
