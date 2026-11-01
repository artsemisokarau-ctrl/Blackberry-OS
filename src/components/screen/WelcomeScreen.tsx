interface WelcomeScreenProps {
  onEnter: () => void;
}

export default function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  return (
    <div className="bb-fade-in flex min-h-screen flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_50%_35%,#2a2e35_0%,#0b0c0e_70%)] px-6 text-center text-zinc-100">
      <p className="text-xs font-semibold tracking-[0.5em] text-zinc-400">DOOMBERRY</p>
      <h1 className="text-6xl font-black tracking-tight sm:text-7xl">HELLO.</h1>
      <p className="max-w-md text-base text-zinc-300">Ve al ordenador y compra una BlackBerry.</p>
      <button
        type="button"
        onClick={onEnter}
        className="mt-4 rounded-full border border-zinc-500 px-8 py-2.5 text-xs font-semibold tracking-[0.3em] text-zinc-100 transition hover:border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
      >
        ENTER
      </button>
    </div>
  );
}
