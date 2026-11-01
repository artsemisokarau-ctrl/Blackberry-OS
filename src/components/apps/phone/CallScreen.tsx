import { useEffect, useState } from 'react';
import { PhoneOff } from 'lucide-react';
import { formatDuration } from '@/lib/format';
import { useAppKeys } from '@/lib/appKeys';
import { PHONE_NUMBER } from '@/lib/records';

interface CallScreenProps {
  number: string;
  name?: string;
  onEnd: (durationSeconds: number) => void;
}

const RING_MS = 2500;

export default function CallScreen({ number, name, onEnd }: CallScreenProps) {
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setTimeout(() => setConnectedAt(Date.now()), RING_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (connectedAt === null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [connectedAt]);

  const endCall = () => onEnd(connectedAt ? Math.floor((Date.now() - connectedAt) / 1000) : 0);

  useAppKeys((key) => {
    if (key === 'select' || key === 'end' || key === 'back') {
      endCall();
      return true;
    }
    return false;
  });

  const elapsed = connectedAt ? Math.floor((now - connectedAt) / 1000) : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-between p-3 text-center">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] uppercase tracking-wider text-[#7ed957]">
          {connectedAt ? 'Connected' : 'Calling'}
        </span>
        <span className="text-base font-semibold text-zinc-100">{name ?? number}</span>
        {name && <span className="text-[11px] text-zinc-400">{number}</span>}
        <span className="mt-2 font-mono text-lg text-zinc-200">
          {connectedAt ? formatDuration(elapsed) : 'Ringing...'}
        </span>
      </div>
      <div className="flex flex-col items-center gap-0.5 text-[9px] leading-tight text-zinc-500">
        <span>Caller ID: {PHONE_NUMBER}</span>
        <span>Simulated call. No real call is placed.</span>
      </div>
      <button
        type="button"
        onPointerDown={endCall}
        className="bb-end flex h-9 w-full items-center justify-center gap-2 rounded-[6px] text-xs font-semibold text-white"
      >
        <PhoneOff className="h-4 w-4" />
        End call
      </button>
    </div>
  );
}
