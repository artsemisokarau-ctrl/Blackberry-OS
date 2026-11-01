import BlackBerryLogo from '@/components/BlackBerryLogo';

const DOTS = [0, 1, 2, 3, 4];

export default function BootScreen() {
  return (
    <div className="bb-fade-in flex h-full w-full flex-col items-center justify-center gap-7 bg-black">
      <BlackBerryLogo label="DOOMBERRY" size="lg" className="bb-logo-in" />
      <div className="flex gap-2">
        {DOTS.map((dot) => (
          <span
            key={dot}
            className="bb-dot h-1.5 w-1.5 rounded-full bg-[#7ed957]"
            style={{ animationDelay: `${dot * 160}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
