interface BlackBerryLogoProps {
  label: string;
  size?: 'sm' | 'lg';
  className?: string;
  tone?: 'light' | 'dark';
}

const BERRY_CELLS = [0, 1, 2].flatMap((row) => [0, 1, 2].map((col) => ({ x: col * 12, y: row * 12 })));

export default function BlackBerryLogo({ label, size = 'sm', className = '', tone = 'light' }: BlackBerryLogoProps) {
  const isLarge = size === 'lg';
  const ink = tone === 'light' ? '#f2f2f2' : '#1c1e23';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 33 33" className={isLarge ? 'h-12 w-12' : 'h-4 w-4'} aria-hidden="true">
        {BERRY_CELLS.map(({ x, y }) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="9" height="9" rx="2" fill={ink} />
        ))}
      </svg>
      <span
        className={`font-bold tracking-[0.12em] ${isLarge ? 'text-2xl' : 'text-[10px]'}`}
        style={{ color: ink }}
      >
        {label}
      </span>
    </div>
  );
}
