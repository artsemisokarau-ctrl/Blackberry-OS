import { useState } from 'react';
import { Check } from 'lucide-react';
import type { WalletController } from '@/hooks/useWallet';
import { useNow } from '@/hooks/useNow';
import { CHALLENGES, CHALLENGE_BY_ID, type Challenge, type Side } from '@/lib/exchange';
import { formatDb } from '@/lib/store';
import { PREDICTION_MULTIPLIER, STAKE_OPTIONS, type Prediction } from '@/lib/wallet';

interface TechExchangePageProps {
  wallet: WalletController;
}

export default function TechExchangePage({ wallet }: TechExchangePageProps) {
  const now = useNow(1000).getTime();
  const { predictions } = wallet.state;
  const active = predictions.filter((prediction) => prediction.status === 'active');
  const settled = predictions.filter((prediction) => prediction.status !== 'active');

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-1">
        <p className="text-[10px] font-semibold tracking-[0.35em] text-zinc-400">DOOMBERRY</p>
        <h2 className="text-2xl font-black tracking-tight text-zinc-100">TECH EXCHANGE</h2>
        <p className="text-xs text-zinc-400">
          Predict tech outcomes with DB coins. Everything here is fictional. Balance {formatDb(wallet.state.balance)}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {CHALLENGES.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            wallet={wallet}
            predicted={predictions.find((prediction) => prediction.challengeId === challenge.id) ?? null}
          />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-bold tracking-[0.25em] text-zinc-400">ACTIVE PREDICTIONS</h3>
        {active.length === 0 ? (
          <p className="text-xs text-zinc-400">No active predictions.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {active.map((prediction) => (
              <PredictionRow
                key={prediction.id}
                prediction={prediction}
                secondsLeft={Math.max(0, Math.ceil((prediction.resolvesAt - now) / 1000))}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-bold tracking-[0.25em] text-zinc-400">HISTORY</h3>
        {settled.length === 0 ? (
          <p className="text-xs text-zinc-400">No resolved predictions yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {settled.map((prediction) => (
              <PredictionRow key={prediction.id} prediction={prediction} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

interface ChallengeCardProps {
  challenge: Challenge;
  wallet: WalletController;
  predicted: Prediction | null;
}

function ChallengeCard({ challenge, wallet, predicted }: ChallengeCardProps) {
  const [side, setSide] = useState<Side | null>(null);
  const [stake, setStake] = useState(STAKE_OPTIONS[0]);
  const affordable = stake <= wallet.state.balance;
  const canConfirm = side !== null && affordable && !predicted;

  const confirm = () => {
    if (side === null) return;
    if (wallet.predict(challenge.id, side, stake)) setSide(null);
  };

  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-zinc-900 p-5 ring-1 ring-zinc-800">
      <h3 className="text-sm font-semibold leading-snug text-zinc-100">{challenge.question}</h3>

      {predicted ? (
        <p className="rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-200">
          Predicted {predicted.side.toUpperCase()} with {formatDb(predicted.stake)}.{' '}
          {predicted.status === 'active' ? 'Waiting for the result.' : `Result: ${predicted.status.toUpperCase()}.`}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {(['yes', 'no'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={side === option}
                onClick={() => setSide(option)}
                className={`rounded-lg py-2 text-xs font-bold tracking-wider transition ${
                  side === option ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {STAKE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={stake === option}
                onClick={() => setStake(option)}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                  stake === option ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {formatDb(option)}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
            <span>
              Stake {formatDb(stake)}, potential return {formatDb(stake * PREDICTION_MULTIPLIER)} if correct.
            </span>
            {!affordable && <span className="text-red-400">Not enough DB coins for this stake.</span>}
          </div>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={confirm}
            className="rounded-lg bg-emerald-500 py-2 text-xs font-bold tracking-wider text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {side ? `CONFIRM ${side.toUpperCase()} FOR ${formatDb(stake)}` : 'PICK YES OR NO'}
          </button>
        </>
      )}
    </article>
  );
}

interface PredictionRowProps {
  prediction: Prediction;
  secondsLeft?: number;
}

function PredictionRow({ prediction, secondsLeft }: PredictionRowProps) {
  const challenge = CHALLENGE_BY_ID[prediction.challengeId];
  const settledLabel =
    prediction.status === 'won'
      ? `WON +${formatDb(prediction.payout - prediction.stake)}`
      : prediction.status === 'lost'
        ? `LOST -${formatDb(prediction.stake)}`
        : `Resolves in ${secondsLeft ?? 0}s`;

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl bg-zinc-900 px-4 py-3 text-xs ring-1 ring-zinc-800">
      <div className="flex min-w-0 items-center gap-2">
        {prediction.status === 'won' && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
        <span className="truncate text-zinc-100">{challenge.question}</span>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-zinc-400">
        <span>
          {prediction.side.toUpperCase()} · {formatDb(prediction.stake)}
        </span>
        <span
          className={`font-bold ${
            prediction.status === 'won' ? 'text-emerald-400' : prediction.status === 'lost' ? 'text-red-400' : 'text-zinc-100'
          }`}
        >
          {settledLabel}
        </span>
      </div>
    </li>
  );
}
