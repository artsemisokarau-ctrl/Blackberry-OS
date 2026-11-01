import type { AppDefinition } from '@/lib/apps';

interface AppIconProps {
  app: AppDefinition;
  selected: boolean;
  size: 'md' | 'lg';
}

export default function AppIcon({ app, selected, size }: AppIconProps) {
  const Icon = app.icon;
  const large = size === 'lg';

  return (
    <div className={`flex items-center justify-center rounded-[8px] p-1 ${selected ? 'bb-select' : ''}`}>
      <div
        className={`relative flex items-center justify-center overflow-hidden border border-black/30 shadow-[0_2px_3px_rgba(0,0,0,0.6)] ${
          large ? 'h-11 w-11 rounded-[11px]' : 'h-8 w-8 rounded-[8px]'
        }`}
        style={{ backgroundColor: app.tint }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-white/0" />
        <Icon
          className={`relative text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] ${large ? 'h-6 w-6' : 'h-4 w-4'}`}
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
