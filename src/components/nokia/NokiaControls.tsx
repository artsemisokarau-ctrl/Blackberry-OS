import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Phone, PhoneOff } from 'lucide-react';
import type { KeyInput } from '@/lib/keys';

interface NokiaControlsProps {
  onKey: (key: KeyInput) => void;
}

const KEY_FACE =
  'flex h-10 items-center justify-center rounded-[12px] bg-gradient-to-b from-[#3a424c] to-[#171c22] text-zinc-100 shadow-[0_2px_0_#07090c,inset_0_1px_0_rgba(255,255,255,0.14)] transition-transform active:translate-y-px active:shadow-[0_1px_0_#07090c] select-none';

const DIGIT_KEYS: { value: string; letters: string }[] = [
  { value: '1', letters: '' },
  { value: '2', letters: 'ABC' },
  { value: '3', letters: 'DEF' },
  { value: '4', letters: 'GHI' },
  { value: '5', letters: 'JKL' },
  { value: '6', letters: 'MNO' },
  { value: '7', letters: 'PQRS' },
  { value: '8', letters: 'TUV' },
  { value: '9', letters: 'WXYZ' },
  { value: '*', letters: '+' },
  { value: '0', letters: '' },
  { value: '#', letters: '' },
];

export default function NokiaControls({ onKey }: NokiaControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Left soft key"
          onPointerDown={() => onKey('select')}
          className={`${KEY_FACE} h-5 w-14 rounded-[6px]`}
        />
        <NavRing onKey={onKey} />
        <button
          type="button"
          aria-label="Right soft key"
          onPointerDown={() => onKey('back')}
          className={`${KEY_FACE} h-5 w-14 rounded-[6px]`}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          aria-label="Call"
          onPointerDown={() => onKey('call')}
          className={`${KEY_FACE} bg-gradient-to-b from-[#4fd46a] to-[#1c8c3a] text-white`}
        >
          <Phone className="h-4 w-4" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          aria-label="Clear"
          onPointerDown={() => onKey('backspace')}
          className={`${KEY_FACE} text-[10px] font-semibold`}
        >
          Clear
        </button>
        <button
          type="button"
          aria-label="End"
          onPointerDown={() => onKey('end')}
          className={`${KEY_FACE} bg-gradient-to-b from-[#e0534a] to-[#8f1f19] text-white`}
        >
          <PhoneOff className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {DIGIT_KEYS.map(({ value, letters }) => (
          <button
            key={value}
            type="button"
            aria-label={`Key ${value}`}
            onPointerDown={() => onKey(value)}
            className={`${KEY_FACE} flex-col gap-0 py-1`}
          >
            <span className="text-base font-semibold leading-none">{value}</span>
            {letters && <span className="mt-0.5 text-[7px] tracking-[0.12em] text-zinc-400">{letters}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavRing({ onKey }: NokiaControlsProps) {
  const zone = 'absolute flex items-center justify-center text-zinc-300 active:text-white';
  return (
    <div className="relative h-[72px] w-[72px] shrink-0 rounded-full bg-gradient-to-b from-[#2a3038] to-[#12161b] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-black/70">
      <button type="button" aria-label="Up" onPointerDown={() => onKey('up')} className={`${zone} left-1/2 top-0.5 h-6 w-10 -translate-x-1/2`}>
        <ChevronUp className="h-4 w-4" strokeWidth={2.4} />
      </button>
      <button type="button" aria-label="Down" onPointerDown={() => onKey('down')} className={`${zone} bottom-0.5 left-1/2 h-6 w-10 -translate-x-1/2`}>
        <ChevronDown className="h-4 w-4" strokeWidth={2.4} />
      </button>
      <button type="button" aria-label="Left" onPointerDown={() => onKey('left')} className={`${zone} left-0.5 top-1/2 h-10 w-6 -translate-y-1/2`}>
        <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
      </button>
      <button type="button" aria-label="Right" onPointerDown={() => onKey('right')} className={`${zone} right-0.5 top-1/2 h-10 w-6 -translate-y-1/2`}>
        <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
      </button>
      <button
        type="button"
        aria-label="OK"
        onPointerDown={() => onKey('select')}
        className="absolute left-1/2 top-1/2 h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#4b535e] to-[#20252c] text-[9px] font-bold tracking-wider text-zinc-100 shadow-[0_2px_0_#07090c,inset_0_1px_0_rgba(255,255,255,0.15)] active:translate-y-[calc(-50%+1px)]"
      >
        OK
      </button>
    </div>
  );
}
