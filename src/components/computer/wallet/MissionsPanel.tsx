import { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { useNow } from '@/hooks/useNow';
import type { WalletController } from '@/hooks/useWallet';
import { MISSION_CATEGORIES, MISSIONS, type MissionCategory, type MissionDef } from '@/lib/missions';
import { formatDb } from '@/lib/store';
import { missionView } from '@/lib/wallet';

interface MissionsPanelProps {
  wallet: WalletController;
}

const PERIOD_NOTE: Record<MissionDef['period'], string> = {
  daily: 'Resets every day',
  weekly: 'Resets every Monday',
  once: 'One-time mission',
};

export default function MissionsPanel({ wallet }: MissionsPanelProps) {
  const now = useNow(1000).getTime();
  const [category, setCategory] = useState<MissionCategory>('daily');
  const missions = MISSIONS.filter((mission) => mission.category === category);

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xs font-bold tracking-[0.25em] text-zinc-400">MISSIONS</h3>
      <div role="tablist" className="flex flex-wrap gap-2">
        {MISSION_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={category === item.id}
            onClick={() => setCategory(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              category === item.id ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {missions.map((def) => {
          const view = missionView(def, wallet.state, now);
          const percent = (view.progress / view.target) * 100;
          return (
            <li
              key={def.id}
              className={`flex flex-col gap-3 rounded-xl p-4 ring-1 transition ${
                view.claimed ? 'bg-zinc-950 ring-zinc-800' : view.claimable ? 'bg-zinc-900 ring-amber-400/60' : 'bg-zinc-900 ring-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className={`text-sm font-semibold ${view.claimed ? 'text-zinc-500' : 'text-zinc-100'}`}>{def.title}</p>
                  <p className="text-xs text-zinc-400">{def.description}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-emerald-300">+{formatDb(def.reward)}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{def.objective}</span>
                  <span className="font-mono">
                    {view.progress}/{view.target}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full rounded-full bg-emerald-400 transition-[width] duration-500" style={{ width: `${percent}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-wide text-zinc-500">{PERIOD_NOTE[def.period]}</span>
                {view.claimed ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    Claimed
                  </span>
                ) : view.claimable ? (
                  <button
                    type="button"
                    onClick={() => wallet.claimMission(def)}
                    className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-zinc-900 transition hover:bg-amber-300 active:scale-95"
                  >
                    Claim {formatDb(def.reward)}
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Lock className="h-3 w-3" />
                    In progress
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
