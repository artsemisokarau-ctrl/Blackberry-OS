import { Award, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '@/lib/missions';
import type { WalletState } from '@/lib/wallet';

interface AchievementsPanelProps {
  state: WalletState;
}

export default function AchievementsPanel({ state }: AchievementsPanelProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-xs font-bold tracking-[0.25em] text-zinc-400">ACHIEVEMENTS</h3>
        <span className="text-xs text-zinc-400">
          {state.achievements.length} / {ACHIEVEMENTS.length} unlocked
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((achievement) => {
          const done = state.achievements.includes(achievement.id);
          const current = Math.min(achievement.target, state.counters[achievement.metric]);
          return (
            <li
              key={achievement.id}
              className={`flex items-start gap-3 rounded-xl p-4 ring-1 transition ${
                done ? 'bg-zinc-900 ring-amber-400/50' : 'bg-zinc-950 ring-zinc-800'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  done ? 'bg-amber-400 text-zinc-900' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {done ? <Award className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <p className={`text-sm font-semibold ${done ? 'text-zinc-100' : 'text-zinc-400'}`}>{achievement.title}</p>
                <p className="text-xs text-zinc-500">{achievement.description}</p>
                <p className="font-mono text-[10px] text-zinc-500">
                  {done ? 'Unlocked' : `${current} / ${achievement.target}`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
