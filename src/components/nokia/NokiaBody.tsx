import type { ReactNode } from 'react';
import NokiaControls from '@/components/nokia/NokiaControls';
import type { KeyInput } from '@/lib/keys';

interface NokiaBodyProps {
  screen: ReactNode;
  closedDisplay: ReactNode;
  open: boolean;
  onToggleOpen: () => void;
  onKey: (key: KeyInput) => void;
  onPower: () => void;
}

const SHELL =
  'bg-gradient-to-b from-[#2f353d] via-[#1b2027] to-[#0c0f13] shadow-[0_30px_50px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-2px_0_rgba(0,0,0,0.6)] ring-1 ring-black';
const BEZEL = 'rounded-[10px] bg-black p-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.08)]';
const GLASS = 'pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent';

export default function NokiaBody({ screen, closedDisplay, open, onToggleOpen, onKey, onPower }: NokiaBodyProps) {
  return (
    <div className="relative w-[260px] select-none">
      <div className={`relative rounded-[30px] px-4 pb-4 pt-3 ${SHELL}`}>
        <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/10 via-transparent to-transparent" />
        <button
          type="button"
          aria-label="Power"
          onPointerDown={onPower}
          className="absolute -right-[3px] top-14 h-10 w-[4px] rounded-r-[3px] bg-gradient-to-b from-[#4a5059] to-[#1d2026] shadow-[0_1px_1px_rgba(0,0,0,0.7)]"
        />
        <div className="flex justify-center gap-[5px]" aria-hidden="true">
          {Array.from({ length: 11 }, (_, index) => (
            <span key={index} className="h-[3px] w-[3px] rounded-full bg-black/85 shadow-[0_1px_0_rgba(255,255,255,0.08)]" />
          ))}
        </div>

        {open ? (
          <div className={`mx-auto mt-3 flex h-[264px] w-[200px] items-center justify-center ${BEZEL}`}>
            <div className="relative h-full w-full overflow-hidden rounded-[3px] bg-[#0d1210]">
              {screen}
              <div className={GLASS} />
            </div>
          </div>
        ) : (
          <div className={`mx-auto mt-3 flex h-[150px] w-[112px] items-center justify-center ${BEZEL}`}>
            <div className="relative h-full w-full overflow-hidden rounded-[3px] bg-[#0d1210]">
              {closedDisplay}
              <div className={GLASS} />
            </div>
          </div>
        )}
        <p className="mt-2 text-center text-[8px] tracking-[0.35em] text-zinc-500">NOKIA</p>
      </div>

      <button
        type="button"
        aria-label={open ? 'Close flip' : 'Open flip'}
        onClick={onToggleOpen}
        className="relative z-10 mx-auto -mt-1 block h-4 w-28 rounded-b-[8px] bg-gradient-to-b from-[#0a0c10] via-[#1b1f25] to-[#333a43] shadow-[0_3px_6px_rgba(0,0,0,0.8),inset_0_-1px_0_rgba(255,255,255,0.12)] ring-1 ring-black/70 transition hover:from-[#11151b] active:scale-y-90"
      />

      {open && (
        <div className={`-mt-1 rounded-[30px] px-4 pb-4 pt-5 ${SHELL}`}>
          <NokiaControls onKey={onKey} />
          <div className="mt-3 flex items-center justify-center gap-4" aria-hidden="true">
            <span className="h-1 w-1 rounded-full bg-zinc-600" />
            <span className="h-1 w-9 rounded-full bg-black shadow-inner" />
            <span className="h-1 w-1 rounded-full bg-zinc-600" />
          </div>
        </div>
      )}
    </div>
  );
}
