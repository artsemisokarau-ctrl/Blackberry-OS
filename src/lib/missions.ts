export interface Counters {
  storeVisits: number;
  exchangeVisits: number;
  dailyClaims: number;
  cycles: number;
  predictions: number;
  wins: number;
  orders: number;
  unboxes: number;
  uniqueModels: number;
  missionsClaimed: number;
  rewardsEarned: number;
}

export type MetricId = keyof Counters;

export type MissionCategory = 'daily' | 'weekly' | 'special' | 'collection' | 'shopping' | 'tech';

export const MISSION_CATEGORIES: { id: MissionCategory; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'special', label: 'Special' },
  { id: 'collection', label: 'Collection' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'tech', label: 'Tech' },
];

export interface MissionDef {
  id: string;
  category: MissionCategory;
  period: 'once' | 'daily' | 'weekly';
  title: string;
  description: string;
  objective: string;
  metric: MetricId;
  target: number;
  reward: number;
}

export const MISSIONS: MissionDef[] = [
  { id: 'daily-claim', category: 'daily', period: 'daily', title: 'Show up', description: 'Claim your daily reward.', objective: 'Claim 1 daily reward', metric: 'dailyClaims', target: 1, reward: 5 },
  { id: 'daily-store', category: 'daily', period: 'daily', title: 'Window shopping', description: 'Open DOOMSTORE.COM on the computer.', objective: 'Visit DOOMSTORE 1 time', metric: 'storeVisits', target: 1, reward: 3 },
  { id: 'daily-exchange', category: 'daily', period: 'daily', title: 'Market check', description: 'Open TECH EXCHANGE on the computer.', objective: 'Visit TECH EXCHANGE 1 time', metric: 'exchangeVisits', target: 1, reward: 3 },
  { id: 'daily-predict', category: 'daily', period: 'daily', title: 'Daily call', description: 'Place a prediction today.', objective: 'Place 1 prediction', metric: 'predictions', target: 1, reward: 5 },
  { id: 'weekly-predict', category: 'weekly', period: 'weekly', title: 'Busy week', description: 'Make several predictions this week.', objective: 'Place 3 predictions', metric: 'predictions', target: 3, reward: 15 },
  { id: 'weekly-wins', category: 'weekly', period: 'weekly', title: 'On a roll', description: 'Win two predictions this week.', objective: 'Win 2 predictions', metric: 'wins', target: 2, reward: 20 },
  { id: 'weekly-unbox', category: 'weekly', period: 'weekly', title: 'Unpacking party', description: 'Open two phones this week.', objective: 'Unbox 2 phones', metric: 'unboxes', target: 2, reward: 15 },
  { id: 'weekly-claims', category: 'weekly', period: 'weekly', title: 'Loyal user', description: 'Claim five daily rewards this week.', objective: 'Claim 5 daily rewards', metric: 'dailyClaims', target: 5, reward: 15 },
  { id: 'special-first-predict', category: 'special', period: 'once', title: 'First call', description: 'Place your first prediction.', objective: 'Place 1 prediction', metric: 'predictions', target: 1, reward: 10 },
  { id: 'special-first-win', category: 'special', period: 'once', title: 'Called it', description: 'Win your first prediction.', objective: 'Win 1 prediction', metric: 'wins', target: 1, reward: 15 },
  { id: 'special-cycle', category: 'special', period: 'once', title: 'Full week', description: 'Finish a full seven-day daily cycle.', objective: 'Complete 1 cycle', metric: 'cycles', target: 1, reward: 50 },
  { id: 'special-missions', category: 'special', period: 'once', title: 'Task master', description: 'Claim rewards from five missions.', objective: 'Claim 5 missions', metric: 'missionsClaimed', target: 5, reward: 25 },
  { id: 'collection-first', category: 'collection', period: 'once', title: 'First unboxing', description: 'Unbox your first phone.', objective: 'Unbox 1 phone', metric: 'unboxes', target: 1, reward: 25 },
  { id: 'collection-three', category: 'collection', period: 'once', title: 'Three of a kind', description: 'Unbox three different models.', objective: 'Unbox 3 different models', metric: 'uniqueModels', target: 3, reward: 30 },
  { id: 'collection-five', category: 'collection', period: 'once', title: 'Collector', description: 'Unbox five different models.', objective: 'Unbox 5 different models', metric: 'uniqueModels', target: 5, reward: 50 },
  { id: 'collection-ten', category: 'collection', period: 'once', title: 'Unboxing veteran', description: 'Unbox ten phones in total.', objective: 'Unbox 10 phones', metric: 'unboxes', target: 10, reward: 40 },
  { id: 'shopping-first', category: 'shopping', period: 'once', title: 'First order', description: 'Place your first store order.', objective: 'Place 1 order', metric: 'orders', target: 1, reward: 20 },
  { id: 'shopping-three', category: 'shopping', period: 'once', title: 'Repeat customer', description: 'Place three store orders.', objective: 'Place 3 orders', metric: 'orders', target: 3, reward: 40 },
  { id: 'shopping-browse', category: 'shopping', period: 'once', title: 'Browser', description: 'Visit DOOMSTORE.COM ten times.', objective: 'Visit DOOMSTORE 10 times', metric: 'storeVisits', target: 10, reward: 15 },
  { id: 'tech-visit', category: 'tech', period: 'once', title: 'Insider', description: 'Visit TECH EXCHANGE five times.', objective: 'Visit TECH EXCHANGE 5 times', metric: 'exchangeVisits', target: 5, reward: 10 },
  { id: 'tech-predict', category: 'tech', period: 'once', title: 'Analyst', description: 'Place five predictions.', objective: 'Place 5 predictions', metric: 'predictions', target: 5, reward: 25 },
  { id: 'tech-wins', category: 'tech', period: 'once', title: 'Sharp eye', description: 'Win five predictions.', objective: 'Win 5 predictions', metric: 'wins', target: 5, reward: 40 },
];

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  metric: MetricId;
  target: number;
  reward: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'collector', title: 'Collector', description: 'Unbox three different models.', metric: 'uniqueModels', target: 3, reward: 30 },
  { id: 'regular', title: 'Regular', description: 'Claim seven daily rewards.', metric: 'dailyClaims', target: 7, reward: 40 },
  { id: 'shopper', title: 'Shopper', description: 'Place five store orders.', metric: 'orders', target: 5, reward: 60 },
  { id: 'oracle', title: 'Oracle', description: 'Win ten predictions.', metric: 'wins', target: 10, reward: 100 },
  { id: 'full-cycle', title: 'Full Cycle', description: 'Finish three seven-day cycles.', metric: 'cycles', target: 3, reward: 75 },
  { id: 'earner', title: 'Earner', description: 'Receive 25 rewards.', metric: 'rewardsEarned', target: 25, reward: 50 },
];
