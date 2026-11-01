import { useBatteryStatus } from '@/lib/battery';

export default function ChargerCable() {
  const { plugged } = useBatteryStatus();

  return (
    <div className="relative h-28 w-full" aria-label={plugged ? 'Charger connected' : 'Charger disconnected'}>
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 380 112" aria-hidden="true">
        <path
          d="M190 0 V46 Q190 70 214 72 H262"
          pathLength={1}
          fill="none"
          stroke="#050506"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={plugged ? 0 : 1}
          className="transition-[stroke-dashoffset] duration-[900ms] ease-out"
        />
      </svg>
      <div className="absolute left-[262px] top-[52px] flex h-10 w-14 items-center justify-end rounded-[10px] bg-gradient-to-b from-[#f4f5f7] to-[#aeb3bb] pr-2.5 shadow-[0_6px_10px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-black/25">
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
            plugged ? 'bg-emerald-400 shadow-[0_0_5px_1px_rgba(52,211,153,0.7)]' : 'bg-zinc-500'
          }`}
        />
      </div>
    </div>
  );
}
