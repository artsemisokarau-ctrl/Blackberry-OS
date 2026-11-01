import { useEffect, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useNow } from '@/hooks/useNow';
import type { ChallengeId, Side } from '@/lib/exchange';
import type { MetricId, MissionDef } from '@/lib/missions';
import { STORAGE_KEYS } from '@/lib/records';
import {
  addMetric,
  claimDailyReward,
  claimMission,
  debit,
  INITIAL_WALLET,
  normalizeWallet,
  placePrediction,
  recordUnbox,
  settlePredictions,
  type WalletState,
} from '@/lib/wallet';

type Update = (prev: WalletState, at: number) => WalletState | null;

export function useWallet() {
  const [stored, setStored] = usePersistentState<unknown>(STORAGE_KEYS.wallet, INITIAL_WALLET);
  const state = useMemo(() => normalizeWallet(stored), [stored]);
  const tick = useNow(1000).getTime();

  useEffect(() => {
    setStored((prev: unknown) => {
      const current = normalizeWallet(prev);
      const next = settlePredictions(current, Date.now());
      return next === current ? prev : next;
    });
  }, [tick, setStored]);

  const apply = (update: Update): boolean => {
    if (update(state, Date.now()) === null) return false;
    setStored((prev: unknown) => {
      const current = normalizeWallet(prev);
      return update(current, Date.now()) ?? current;
    });
    return true;
  };

  return {
    state,
    spend: (label: string, amount: number) => apply((prev, at) => debit(prev, label, amount, at)),
    claimDaily: () => apply((prev, at) => claimDailyReward(prev, at)),
    claimMission: (def: MissionDef) => apply((prev, at) => claimMission(prev, def, at)),
    predict: (challengeId: ChallengeId, side: Side, stake: number) =>
      apply((prev, at) => placePrediction(prev, challengeId, side, stake, at)),
    bump: (metric: MetricId, amount = 1) => apply((prev, at) => addMetric(prev, metric, amount, at)),
    recordUnbox: (productId: string) => apply((prev, at) => recordUnbox(prev, productId, at)),
  };
}

export type WalletController = ReturnType<typeof useWallet>;
