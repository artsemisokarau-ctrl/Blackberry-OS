import type { ReactNode } from 'react';
import ClicksBodyKeys from '@/components/clicks/ClicksBodyKeys';
import type { KeyInput } from '@/lib/keys';

interface ClicksBodyProps {
  screen: ReactNode;
  onKey: (key: KeyInput) => void;
  onPower: () => void;
}

export default function ClicksBody({ screen, onKey, onPower }: ClicksBodyProps) {
  return (
    <div className="relative w-[268px] select-none">
      <div className="relative rounded-[34px] bg-gradient-to-b from-[#2a2d33] via-[#18191e] to-[#0a0b0e] p-4 shadow-[0_34px_56px_-22px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_0_0_1px_rgba(255,255,255,0.04)] ring-1 ring-black">
        <div className="pointer-events-none absolute inset-0 rounded-[34px] bg-gradient-to-br from-white/[0.12] via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-full bg-white/20" />
        <button
          type="button"
          aria-label="Power"
          onPointerDown={onPower}
          className="absolute -right-[3px] top-20 h-12 w-1 rounded-r-[3px] bg-gradient-to-b from-[#50555e] to-[#1d2026] shadow-[0_1px_1px_rgba(0,0,0,0.7)]"
        />

        <div className="flex justify-center gap-[5px]" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <span key={index} className="h-[3px] w-[3px] rounded-full bg-black/85 shadow-[0_1px_0_rgba(255,255,255,0.08)]" />
          ))}
        </div>

        <div className="mx-auto mt-3 rounded-[12px] bg-black p-1.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.08)]">
          <div className="relative h-[236px] w-[224px] overflow-hidden rounded-[7px] bg-[#0b1a23]">
            {screen}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
          </div>
        </div>
        <p className="mt-2 text-center text-[8px] tracking-[0.4em] text-zinc-500">CLICKS</p>

        <ClicksBodyKeys onKey={onKey} />

        <div className="mt-3 flex items-center justify-center gap-4" aria-hidden="true">
          <span className="h-1 w-1 rounded-full bg-zinc-600" />
          <span className="h-1.5 w-8 rounded-full bg-black shadow-inner" />
          <span className="h-1 w-1 rounded-full bg-zinc-600" />
        </div>
      </div>
    </div>
  );
}
