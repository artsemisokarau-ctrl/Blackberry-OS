import { Coins } from 'lucide-react';
import type { WalletController } from '@/hooks/useWallet';
import { formatDb } from '@/lib/store';
import { START_BALANCE } from '@/lib/wallet';
import AchievementsPanel from '@/components/computer/wallet/AchievementsPanel';
import DailyRewardCard from '@/components/computer/wallet/DailyRewardCard';
import MissionsPanel from '@/components/computer/wallet/MissionsPanel';
import RewardHistory from '@/components/computer/wallet/RewardHistory';

interface WalletPageProps {
  wallet: WalletController;
}

export default function WalletPage({ wallet }: WalletPageProps) {
  const { balance, transactions, rewards } = wallet.state;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-2 rounded-2xl bg-black p-6 text-white ring-1 ring-zinc-800">
        <p className="text-[10px] font-semibold tracking-[0.35em] text-zinc-400">DOOMBERRY WALLET</p>
        <p className="flex items-center gap-2 text-4xl font-black tracking-tight">
          <Coins className="h-7 w-7 text-amber-400" />
          {formatDb(balance)}
        </p>
        <p className="text-xs text-zinc-400">DOOMBERRY COINS. Fictional currency with no cash value.</p>
      </header>

      <DailyRewardCard wallet={wallet} />
      <MissionsPanel wallet={wallet} />
      <AchievementsPanel state={wallet.state} />
      <RewardHistory rewards={rewards} />

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-bold tracking-[0.25em] text-zinc-400">TRANSACTION HISTORY</h3>
        {transactions.length === 0 ? (
          <p className="text-xs text-zinc-400">No transactions yet. You start with {formatDb(START_BALANCE)}.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-800 rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="flex items-center justify-between gap-4 px-4 py-2.5 text-xs">
                <div className="min-w-0">
                  <p className="truncate text-zinc-100">{transaction.label}</p>
                  <p className="text-[10px] text-zinc-500">{new Date(transaction.at).toLocaleString()}</p>
                </div>
                <span className={`shrink-0 font-bold ${transaction.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {transaction.amount >= 0 ? '+' : '-'}
                  {formatDb(Math.abs(transaction.amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
