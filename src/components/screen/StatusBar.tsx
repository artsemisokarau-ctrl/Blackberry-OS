import { Bluetooth, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, Wifi } from 'lucide-react';
import { useBatteryStatus } from '@/lib/battery';

const SIGNAL_BARS = [
  { x: 0, height: 2.5, lit: true },
  { x: 3, height: 5, lit: true },
  { x: 6, height: 7.5, lit: true },
  { x: 9, height: 10, lit: false },
];

const LOW_LEVEL = 20;

function SignalBars() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" aria-label="Signal strength">
      {SIGNAL_BARS.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={10 - bar.height}
          width="2"
          height={bar.height}
          rx="0.5"
          fill={bar.lit ? '#f5f5f5' : '#55555c'}
        />
      ))}
    </svg>
  );
}

function BatteryGlyph({ level, charging }: { level: number; charging: boolean }) {
  const className = 'h-3.5 w-3.5';
  if (charging) return <BatteryCharging className={`${className} animate-pulse text-emerald-300`} strokeWidth={2} />;
  if (level <= LOW_LEVEL) return <BatteryLow className={`${className} text-red-400`} strokeWidth={2} />;
  if (level <= 60) return <BatteryMedium className={`${className} text-zinc-100`} strokeWidth={2} />;
  return <BatteryFull className={`${className} text-zinc-100`} strokeWidth={2} />;
}

export default function StatusBar() {
  const { level, charging } = useBatteryStatus();
  const percent = Math.round(level);
  const low = level <= LOW_LEVEL && !charging;

  return (
    <div className="flex h-5 shrink-0 items-center justify-between border-b border-white/10 bg-gradient-to-b from-black/70 to-black/40 px-2 text-[10px] text-zinc-100">
      <div className="flex items-center gap-1" aria-label={`Battery ${percent}%`}>
        <BatteryGlyph level={level} charging={charging} />
        <span className={`font-semibold tabular-nums ${low ? 'text-red-400' : ''}`}>{percent}%</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-semibold">3G</span>
        <SignalBars />
        <Wifi className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
        <Bluetooth className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      </div>
    </div>
  );
}
