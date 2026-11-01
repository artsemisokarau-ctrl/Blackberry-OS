import { Fingerprint } from 'lucide-react';
import type { KeyInput } from '@/lib/keys';

interface ClicksBodyKeysProps {
  onKey: (key: KeyInput) => void;
}

const LETTER_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

const KEY =
  'flex h-9 items-center justify-center rounded-[6px] bg-gradient-to-b from-[#3a3e45] via-[#262930] to-[#15171b] text-[12px] font-semibold uppercase text-zinc-100 shadow-[0_2px_0_#050608,0_3px_5px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14)] transition-transform active:translate-y-px active:shadow-[0_1px_0_#050608] select-none';

export default function ClicksBodyKeys({ onKey }: ClicksBodyKeysProps) {
  return (
    <div className="mt-3 flex flex-col gap-[5px] rounded-[14px] bg-black/55 p-1.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)]">
      {LETTER_ROWS.map((row, rowIndex) => (
        <div key={row} className={`flex gap-[5px] ${rowIndex === 1 ? 'px-2.5' : ''}`}>
          {row.split('').map((letter) => (
            <button key={letter} type="button" aria-label={letter} onPointerDown={() => onKey(letter)} className={`${KEY} flex-1`}>
              {letter}
            </button>
          ))}
          {rowIndex === 2 && (
            <button type="button" aria-label="Backspace" onPointerDown={() => onKey('backspace')} className={`${KEY} flex-[1.6] text-[10px]`}>
              Del
            </button>
          )}
        </div>
      ))}
      <div className="flex gap-[5px]">
        <button type="button" aria-label="Period" onPointerDown={() => onKey('.')} className={`${KEY} flex-1`}>
          .
        </button>
        <button
          type="button"
          aria-label="Space (fingerprint sensor)"
          title="Spacebar fingerprint sensor (simulated)"
          onPointerDown={() => onKey(' ')}
          className={`${KEY} flex-[4]`}
        >
          <Fingerprint className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.6} />
        </button>
        <button type="button" aria-label="Enter" onPointerDown={() => onKey('select')} className={`${KEY} flex-[2] text-[10px]`}>
          Enter
        </button>
      </div>
    </div>
  );
}
