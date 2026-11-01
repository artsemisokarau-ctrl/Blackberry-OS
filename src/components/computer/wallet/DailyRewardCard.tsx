import { useEffect, useState } from 'react';
import { CalendarCheck, Clock } from 'lucide-react';
import { useNow } from '@/hooks/useNow';
import type { WalletController } from '@/hooks/useWallet';
import { formatDb } from '@/lib/store';
import { DAILY_REWARDS, dailyStatus } from '@/lib/wallet';

interface DailyRewardCardProps {
  wallet: WalletController;
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = String(Math.floor(total / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export default function DailyRewardCard({ wallet }: DailyRewardCardProps) {
  const now = useNow(1000).getTime();
  const [burst, setBurst] = useState<number | null>(null);
  const status = dailyStatus(wallet.state, now);
  const completedDays = status.nextDay - 1;

  useEffect(() => {
    if (burst === null) return;
    const timer = window.setTimeout(() => setBurst(null), 1400);
    return () => window.clearTimeout(timer);
  }, [burst]);

  const claim = () => {
    if (wallet.claimDaily()) setBurst(DAILY_REWARDS[status.nextDay - 1]);
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-zinc-900 p-5 ring-1 ring-zinc-800">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-bold tracking-[0.25em] text-zinc-400">DAILY REWARD</h3>
          <p className="text-xs text-zinc-400">
            Claim once every 24 hours. Claim within 48 hours to keep your streak. A full cycle of seven days starts over.
          </p>
        </div>
        <div className="relative shrink-0">
          {burst !== null && (
            <span
              key={burst}
              className="pointer-events-none absolute -top-2 right-0 animate-bounce whitespace-nowrap text-sm font-black text-amber-300"
            >
              +{formatDb(burst)}
            </span>
          )}
          {status.claimable ? (
            <button
              type="button"
              onClick={claim}
              className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-zinc-900 transition hover:bg-amber-300 active:scale-95"
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              Claim {formatDb(DAILY_REWARDS[status.nextDay - 1])}
            </button>
          ) : (
            <p className="flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-300 ring-1 ring-zinc-800">
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              {formatCountdown(status.availableAt - now)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAILY_REWARDS.map((amount, index) => {
          const day = index + 1;
          const done = day <= completedDays;
          const next = day === status.nextDay;
          const tone = done
            ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40'
            : next
              ? 'bg-amber-400/10 text-amber-200 ring-amber-400'
              : 'bg-zinc-950 text-zinc-500 ring-zinc-800';
          return (
            <div key={day} className={`flex flex-col items-center gap-1 rounded-xl py-2 ring-1 transition ${tone}`}>
              <span className="text-[10px] font-semibold uppercase tracking-wide">Day {day}</span>
              <span className="text-xs font-bold">{formatDb(amount)}</span>
            </div>
          );
        })}
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-emerald-400 transition-[width] duration-500"
          style={{ width: `${(completedDays / DAILY_REWARDS.length) * 100}%` }}
        />
      </div>
    </section>
  );
}
