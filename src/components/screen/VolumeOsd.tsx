interface VolumeOsdProps {
  level: number;
  max: number;
}

export default function VolumeOsd({ level, max }: VolumeOsdProps) {
  return (
    <div className="bb-fade-in absolute left-1/2 top-6 flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-md border border-zinc-600 bg-zinc-900/95 px-4 py-2 shadow-2xl">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-300">Volume</span>
      <div className="flex gap-[3px]">
        {Array.from({ length: max }, (_, index) => (
          <span
            key={index}
            className={`h-3 w-2 rounded-[1px] ${index < level ? 'bg-[#7ed957]' : 'bg-zinc-700'}`}
          />
        ))}
      </div>
    </div>
  );
}
