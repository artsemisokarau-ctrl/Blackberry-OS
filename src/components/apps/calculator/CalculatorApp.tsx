import { useState } from 'react';
import AppFrame from '@/components/ui/AppFrame';
import { useAppKeys } from '@/lib/appKeys';
import { applyKey, CALC_START, type CalcState, type Operator } from '@/lib/calculator';

interface CalcButton {
  label: string;
  key: string;
  className?: string;
  tone?: 'util' | 'op' | 'digit' | 'accent';
}

const BUTTONS: CalcButton[] = [
  { label: 'C', key: 'c', tone: 'util' },
  { label: 'DEL', key: 'backspace', tone: 'util' },
  { label: '÷', key: '/', tone: 'op' },
  { label: '×', key: '*', tone: 'op' },
  { label: '7', key: '7', tone: 'digit' },
  { label: '8', key: '8', tone: 'digit' },
  { label: '9', key: '9', tone: 'digit' },
  { label: '−', key: '-', tone: 'op' },
  { label: '4', key: '4', tone: 'digit' },
  { label: '5', key: '5', tone: 'digit' },
  { label: '6', key: '6', tone: 'digit' },
  { label: '+', key: '+', tone: 'op' },
  { label: '1', key: '1', tone: 'digit' },
  { label: '2', key: '2', tone: 'digit' },
  { label: '3', key: '3', tone: 'digit' },
  { label: '=', key: '=', tone: 'accent', className: 'row-span-2' },
  { label: '0', key: '0', tone: 'digit', className: 'col-span-2' },
  { label: '.', key: '.', tone: 'digit' },
];

const OPERATOR_SYMBOL: Record<Operator, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };

const TONE_CLASS: Record<NonNullable<CalcButton['tone']>, string> = {
  util: 'bg-zinc-800 text-zinc-200',
  op: 'bg-zinc-700 text-[#7ed957]',
  digit: 'bb-key text-zinc-100',
  accent: 'bb-call text-white',
};

export default function CalculatorApp() {
  const [state, setState] = useState<CalcState>(CALC_START);

  const press = (key: string) => setState((prev) => applyKey(prev, key) ?? prev);

  useAppKeys((key) => {
    const next = applyKey(state, key);
    if (next === null) return false;
    setState(next);
    return true;
  });

  const expression =
    state.operator && state.stored !== null ? `${String(state.stored)} ${OPERATOR_SYMBOL[state.operator]}` : '';

  return (
    <AppFrame appId="calculator">
      <div className="flex flex-col gap-2 p-2">
        <div className="flex h-[52px] flex-col items-end justify-end rounded-[4px] bg-black/60 px-3 py-1 text-right">
          <span className="h-3 text-[10px] text-zinc-500">{expression}</span>
          <span className="w-full truncate font-mono text-2xl text-zinc-100">{state.display}</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {BUTTONS.map((button) => (
            <button
              key={button.label}
              type="button"
              onPointerDown={() => press(button.key)}
              className={`flex h-[27px] items-center justify-center rounded-[4px] text-xs font-semibold ${
                TONE_CLASS[button.tone ?? 'digit']
              } ${button.className ?? ''}`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}
