export type ChallengeId = 'nokia-announcement' | 'handheld-console' | 'new-processor' | 'keyboard-phones' | 'blackberry-style';
export type Side = 'yes' | 'no';

export interface Challenge {
  id: ChallengeId;
  question: string;
  outcome: Side;
}

export const RESOLVE_AFTER_MS = 60_000;

export const CHALLENGES: Challenge[] = [
  { id: 'nokia-announcement', question: 'Will a new Nokia phone be announced?', outcome: 'yes' },
  { id: 'handheld-console', question: 'Will a new handheld console launch?', outcome: 'no' },
  { id: 'new-processor', question: 'Will a new processor be released?', outcome: 'yes' },
  { id: 'keyboard-phones', question: 'Will physical-keyboard phones become popular again?', outcome: 'no' },
  { id: 'blackberry-style', question: 'Will a new BlackBerry-style phone appear?', outcome: 'yes' },
];

export const CHALLENGE_BY_ID = Object.fromEntries(CHALLENGES.map((challenge) => [challenge.id, challenge])) as Record<
  ChallengeId,
  Challenge
>;
