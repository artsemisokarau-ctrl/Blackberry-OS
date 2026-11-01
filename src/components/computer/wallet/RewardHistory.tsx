import { formatDb } from '@/lib/store';
import type { RewardEntry, RewardSource } from '@/lib/wallet';

interface RewardHistoryProps {
  rewards: RewardEntry[];
}

const SOURCE_TONE: Record<RewardSource, string> = {
  'Daily reward': 'bg-sky-500/15 text-sky-300',
  Mission: 'bg-emerald-500/15 text-emerald-300',
  Achievement: 'bg-amber-400/15 text-amber-200',
};

export default function RewardHistory({ rewards }: RewardHistoryProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-bold tracking-[0.25em] text-zinc-400">REWARD HISTORY</h3>
      {rewards.length === 0 ? (
        <p className="text-xs text-zinc-400">No rewards yet. Claim your daily reward to start.</p>
      ) : (
        <ul className="flex max-h-80 flex-col divide-y divide-zinc-800 overflow-y-auto rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
          {rewards.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-4 px-4 py-2.5 text-xs">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="truncate text-zinc-100">{entry.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${SOURCE_TONE[entry.source]}`}>{entry.source}</span>
                  <span>{new Date(entry.at).toLocaleString()}</span>
                </div>
              </div>
              <span className="shrink-0 font-bold text-emerald-400">+{formatDb(entry.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
