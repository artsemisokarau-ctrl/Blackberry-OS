import { CHALLENGE_BY_ID, RESOLVE_AFTER_MS, type ChallengeId, type Side } from '@/lib/exchange';
import { newId } from '@/lib/records';
import { ACHIEVEMENTS, MISSIONS, type Counters, type MetricId, type MissionDef } from '@/lib/missions';

export const START_BALANCE = 100;
export const DAILY_REWARDS = [10, 15, 20, 25, 30, 40, 60];
export const PREDICTION_MULTIPLIER = 2;
export const STAKE_OPTIONS = [10, 20, 50];

const MAX_TRANSACTIONS = 50;
const MAX_REWARDS = 200;
const DAY_MS = 24 * 60 * 60 * 1000;
const STREAK_WINDOW_MS = 48 * 60 * 60 * 1000;

export interface Transaction {
  id: string;
  at: number;
  label: string;
  amount: number;
}

export type RewardSource = 'Daily reward' | 'Mission' | 'Achievement';

export interface RewardEntry {
  id: string;
  at: number;
  name: string;
  amount: number;
  source: RewardSource;
}

export type PredictionStatus = 'active' | 'won' | 'lost';

export interface Prediction {
  id: string;
  challengeId: ChallengeId;
  side: Side;
  stake: number;
  placedAt: number;
  resolvesAt: number;
  status: PredictionStatus;
  payout: number;
}

export interface MissionRecord {
  key: string;
  progress: number;
  claimed: boolean;
}

export interface DailyRecord {
  claimedAt: number | null;
  day: number;
}

export interface WalletState {
  balance: number;
  transactions: Transaction[];
  predictions: Prediction[];
  counters: Counters;
  unboxedModels: string[];
  daily: DailyRecord;
  missions: Record<string, MissionRecord>;
  achievements: string[];
  rewards: RewardEntry[];
}

const ZERO_COUNTERS: Counters = {
  storeVisits: 0,
  exchangeVisits: 0,
  dailyClaims: 0,
  cycles: 0,
  predictions: 0,
  wins: 0,
  orders: 0,
  unboxes: 0,
  uniqueModels: 0,
  missionsClaimed: 0,
  rewardsEarned: 0,
};

export const INITIAL_WALLET: WalletState = {
  balance: START_BALANCE,
  transactions: [],
  predictions: [],
  counters: ZERO_COUNTERS,
  unboxedModels: [],
  daily: { claimedAt: null, day: 0 },
  missions: {},
  achievements: [],
  rewards: [],
};

export function dayKey(at: number): string {
  const date = new Date(at);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function weekKey(at: number): string {
  const date = new Date(at);
  const sinceMonday = (date.getDay() + 6) % 7;
  return dayKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() - sinceMonday).getTime());
}

function periodKey(def: MissionDef, at: number): string {
  if (def.period === 'once') return 'once';
  return def.period === 'daily' ? dayKey(at) : weekKey(at);
}

// Saved wallets from earlier versions are upgraded here, keeping balance, transactions and predictions.
export function normalizeWallet(raw: unknown): WalletState {
  const stored = (raw ?? {}) as Partial<WalletState> & { lastDailyClaim?: string | null };
  const legacyClaim = stored.lastDailyClaim
    ? (() => {
        const [year, month, day] = stored.lastDailyClaim.split('-').map(Number);
        return new Date(year, month - 1, day).getTime();
      })()
    : null;
  return {
    balance: typeof stored.balance === 'number' ? stored.balance : START_BALANCE,
    transactions: Array.isArray(stored.transactions) ? stored.transactions : [],
    predictions: Array.isArray(stored.predictions) ? stored.predictions : [],
    counters: { ...ZERO_COUNTERS, ...stored.counters },
    unboxedModels: Array.isArray(stored.unboxedModels) ? stored.unboxedModels : [],
    daily: stored.daily ?? { claimedAt: legacyClaim, day: 0 },
    missions: stored.missions ?? {},
    achievements: Array.isArray(stored.achievements) ? stored.achievements : [],
    rewards: Array.isArray(stored.rewards) ? stored.rewards : [],
  };
}

function addTransaction(state: WalletState, label: string, amount: number, at: number): WalletState {
  const transaction: Transaction = { id: newId(), at, label, amount };
  return {
    ...state,
    balance: state.balance + amount,
    transactions: [transaction, ...state.transactions].slice(0, MAX_TRANSACTIONS),
  };
}

function grantReward(
  state: WalletState,
  name: string,
  amount: number,
  source: RewardSource,
  at: number,
): WalletState {
  const entry: RewardEntry = { id: newId(), at, name, amount, source };
  const credited = addTransaction(state, name, amount, at);
  const withReward = { ...credited, rewards: [entry, ...credited.rewards].slice(0, MAX_REWARDS) };
  return addMetric(withReward, 'rewardsEarned', 1, at);
}

function unlockAchievements(state: WalletState, at: number): WalletState {
  let next = state;
  for (const achievement of ACHIEVEMENTS) {
    if (next.achievements.includes(achievement.id)) continue;
    if (next.counters[achievement.metric] < achievement.target) continue;
    next = grantReward(
      { ...next, achievements: [...next.achievements, achievement.id] },
      `Achievement: ${achievement.title}`,
      achievement.reward,
      'Achievement',
      at,
    );
  }
  return next;
}

export function addMetric(state: WalletState, metric: MetricId, amount: number, at: number): WalletState {
  const counters = { ...state.counters, [metric]: state.counters[metric] + amount };
  const missions = { ...state.missions };
  for (const def of MISSIONS) {
    if (def.metric !== metric) continue;
    const key = periodKey(def, at);
    const previous = missions[def.id];
    const sameperiod = previous?.key === key;
    const base = sameperiod ? previous.progress : 0;
    missions[def.id] = {
      key,
      progress: Math.min(def.target, base + amount),
      claimed: sameperiod ? previous.claimed : false,
    };
  }
  return unlockAchievements({ ...state, counters, missions }, at);
}

export function recordUnbox(state: WalletState, productId: string, at: number): WalletState {
  const isNewModel = !state.unboxedModels.includes(productId);
  const next = addMetric(
    { ...state, unboxedModels: isNewModel ? [...state.unboxedModels, productId] : state.unboxedModels },
    'unboxes',
    1,
    at,
  );
  return isNewModel ? addMetric(next, 'uniqueModels', 1, at) : next;
}

export interface MissionProgress {
  progress: number;
  target: number;
  claimed: boolean;
  claimable: boolean;
}

export function missionView(def: MissionDef, state: WalletState, now: number): MissionProgress {
  const record = state.missions[def.id];
  const current = record?.key === periodKey(def, now);
  const progress = current ? record.progress : 0;
  const claimed = current && record.claimed;
  return { progress, target: def.target, claimed, claimable: !claimed && progress >= def.target };
}

export function claimMission(state: WalletState, def: MissionDef, at: number): WalletState | null {
  if (!missionView(def, state, at).claimable) return null;
  const record = { key: periodKey(def, at), progress: def.target, claimed: true };
  const marked = { ...state, missions: { ...state.missions, [def.id]: record } };
  const paid = grantReward(marked, `Mission: ${def.title}`, def.reward, 'Mission', at);
  return addMetric(paid, 'missionsClaimed', 1, at);
}

export function dailyStatus(state: WalletState, now: number) {
  const { claimedAt, day } = state.daily;
  const streakAlive = claimedAt !== null && now - claimedAt < STREAK_WINDOW_MS;
  const nextDay = streakAlive ? (day >= DAILY_REWARDS.length ? 1 : day + 1) : 1;
  const availableAt = claimedAt === null ? now : claimedAt + DAY_MS;
  return { claimable: now >= availableAt, availableAt, nextDay };
}

export function claimDailyReward(state: WalletState, at: number): WalletState | null {
  const status = dailyStatus(state, at);
  if (!status.claimable) return null;
  const day = status.nextDay;
  const claimed = { ...state, daily: { claimedAt: at, day } };
  const paid = grantReward(claimed, `Daily reward: day ${day}`, DAILY_REWARDS[day - 1], 'Daily reward', at);
  const counted = addMetric(paid, 'dailyClaims', 1, at);
  return day === DAILY_REWARDS.length ? addMetric(counted, 'cycles', 1, at) : counted;
}

export function debit(state: WalletState, label: string, amount: number, at: number): WalletState | null {
  if (amount <= 0 || amount > state.balance) return null;
  return addTransaction(state, label, -amount, at);
}

export function placePrediction(
  state: WalletState,
  challengeId: ChallengeId,
  side: Side,
  stake: number,
  at: number,
): WalletState | null {
  if (state.predictions.some((prediction) => prediction.challengeId === challengeId)) return null;
  const question = CHALLENGE_BY_ID[challengeId].question;
  const debited = debit(state, `Prediction stake: ${question}`, stake, at);
  if (!debited) return null;
  const prediction: Prediction = {
    id: newId(),
    challengeId,
    side,
    stake,
    placedAt: at,
    resolvesAt: at + RESOLVE_AFTER_MS,
    status: 'active',
    payout: 0,
  };
  return addMetric({ ...debited, predictions: [prediction, ...debited.predictions] }, 'predictions', 1, at);
}

export function settlePredictions(state: WalletState, at: number): WalletState {
  const due = state.predictions.filter((prediction) => prediction.status === 'active' && at >= prediction.resolvesAt);
  if (due.length === 0) return state;
  let next = state;
  for (const prediction of due) {
    const challenge = CHALLENGE_BY_ID[prediction.challengeId];
    const won = prediction.side === challenge.outcome;
    const payout = won ? prediction.stake * PREDICTION_MULTIPLIER : 0;
    next = {
      ...next,
      predictions: next.predictions.map((item) =>
        item.id === prediction.id ? { ...item, status: won ? 'won' : 'lost', payout } : item,
      ),
    };
    if (won) {
      next = addTransaction(next, `Prediction won: ${challenge.question}`, payout, at);
      next = addMetric(next, 'wins', 1, at);
    }
  }
  return next;
}
