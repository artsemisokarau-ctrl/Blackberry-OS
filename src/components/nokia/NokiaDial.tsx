import { useEffect, useState } from 'react';
import { useAppKeys } from '@/lib/appKeys';
import type { KeyInput } from '@/lib/keys';

interface NokiaDialProps {
  onBack: () => void;
}

const DIAL_CHAR = /^[0-9*#+]$/;
const MAX_DIGITS = 20;
const CALL_MS = 3000;

export default function NokiaDial({ onBack }: NokiaDialProps) {
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'calling' | 'ended'>('idle');

  useEffect(() => {
    if (status !== 'calling') return;
    const timer = window.setTimeout(() => setStatus('ended'), CALL_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  useAppKeys((key: KeyInput) => {
    if (status !== 'idle') {
      setStatus('idle');
      return true;
    }
    if (key === 'back') {
      if (number) setNumber('');
      else onBack();
      return true;
    }
    if (key === 'end') {
      setNumber('');
      return true;
    }
    if (key === 'backspace') {
      setNumber((current) => current.slice(0, -1));
      return true;
    }
    if (key === 'select' || key === 'call') {
      if (number) setStatus('calling');
      return true;
    }
    if (DIAL_CHAR.test(key)) {
      setNumber((current) => (current.length < MAX_DIGITS ? current + key : current));
      return true;
    }
    return false;
  });

  return (
    <div className="flex flex-1 flex-col gap-3 p-3">
      <div className="flex min-h-[64px] items-end justify-center rounded-[8px] bg-white/[0.04] px-2 py-2">
        {number ? (
          <span className="break-all text-center font-mono text-lg tracking-wider text-zinc-100">{number}</span>
        ) : (
          <span className="text-[11px] text-zinc-500">Type a number</span>
        )}
      </div>

      {status === 'calling' && (
        <p className="text-center text-[11px] font-semibold text-[#7ed957]">Calling {number}...</p>
      )}
      {status === 'ended' && (
        <p className="text-center text-[11px] text-zinc-300">Call ended (simulated). Press any key.</p>
      )}

      <p className="mt-auto text-center text-[9px] leading-relaxed text-zinc-500">
        Call starts a simulated call only. Back clears the number.
      </p>
    </div>
  );
}
