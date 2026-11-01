import { ArrowBigUp, CornerDownLeft, Delete, type LucideIcon } from 'lucide-react';
import type { KeyInput } from '@/lib/keys';

interface KeyDef {
  value: KeyInput | null;
  label: string;
  sub?: string;
  icon?: LucideIcon;
  grow?: number;
}

const withSymbols = (letters: string, symbols: string[]): KeyDef[] =>
  letters.split('').map((char, index) => ({ value: char, label: char.toUpperCase(), sub: symbols[index] }));

const KEY_ROWS: { keys: KeyDef[]; indent?: boolean }[] = [
  { keys: withSymbols('qwertyuiop', ['#', '1', '2', '3', '(', ')', '_', '-', '*', '@']) },
  {
    indent: true,
    keys: [
      ...withSymbols('asdfghjkl', ['*', '4', '5', '6', '/', ';', ':', '!', '"']),
      { value: 'backspace', label: 'del', icon: Delete, grow: 1.4 },
    ],
  },
  {
    keys: [
      { value: null, label: 'alt', grow: 1.3 },
      ...withSymbols('zxcvbnm', ['7', '8', '9', '?', '!', ':', '!']),
      { value: null, label: '', grow: 1 },
      { value: 'select', label: 'enter', icon: CornerDownLeft, grow: 1.4 },
    ],
  },
  {
    keys: [
      { value: null, label: 'shift', icon: ArrowBigUp, grow: 1.5 },
      { value: '0', label: '0' },
      { value: ' ', label: 'space', grow: 4 },
      { value: null, label: 'sym', grow: 1.2 },
      { value: null, label: 'aA', grow: 1.5 },
    ],
  },
];

const KEY_CLASS =
  'relative flex h-[36px] items-center justify-center rounded-[6px] border border-white/5 bg-gradient-to-b from-[#3a3c42] via-[#1c1d21] to-[#0b0c0e] text-[12px] font-semibold text-zinc-100 shadow-[0_2px_0_#040405,inset_0_1px_0_rgba(255,255,255,0.14)] transition-[transform,box-shadow] duration-75 active:translate-y-[1px] active:shadow-[0_1px_0_#040405]';

interface KeyboardProps {
  onKey: (key: KeyInput) => void;
}

export default function Keyboard({ onKey }: KeyboardProps) {
  return (
    <div className="flex w-full flex-col gap-[5px] rounded-[14px] bg-black/40 p-[6px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]">
      {KEY_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className={`flex gap-[4px] ${row.indent ? 'px-[14px]' : ''}`}>
          {row.keys.map((key, keyIndex) => {
            const Icon = key.icon;
            const inert = key.value === null;
            return (
              <button
                key={`${rowIndex}-${keyIndex}`}
                type="button"
                aria-label={key.label || 'Key'}
                onPointerDown={() => {
                  if (key.value !== null) onKey(key.value);
                }}
                style={{ flex: key.grow ?? 1 }}
                className={`${KEY_CLASS} ${inert ? 'text-[9px] font-normal text-zinc-400' : ''}`}
              >
                {key.sub && (
                  <span className="pointer-events-none absolute left-[3px] top-[2px] text-[8px] font-normal leading-none text-zinc-400">
                    {key.sub}
                  </span>
                )}
                {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={2} /> : key.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
