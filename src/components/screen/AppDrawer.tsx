import { useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import AppIcon from '@/components/screen/AppIcon';
import { APPS } from '@/lib/apps';

interface AppDrawerProps {
  selectedIndex: number;
}

export default function AppDrawer({ selectedIndex }: AppDrawerProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gridRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <div className="bb-drop-in absolute inset-x-0 bottom-0 top-5 z-20 flex flex-col bg-black/85 backdrop-blur-md">
      <div className="flex shrink-0 items-center justify-center gap-1 py-1 text-[9px] font-medium uppercase tracking-wider text-zinc-300">
        <ChevronUp className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
        All Applications
      </div>
      <div ref={gridRef} className="grid min-h-0 flex-1 grid-cols-4 content-start gap-x-1 gap-y-0.5 overflow-y-auto px-2 pb-2">
        {APPS.map((app, index) => {
          const selected = index === selectedIndex;
          return (
            <div
              key={app.id}
              data-selected={selected}
              className="flex flex-col items-center rounded-[8px]"
            >
              <AppIcon app={app} selected={selected} size="md" />
              <span className="mt-0.5 max-w-full truncate text-[8px] leading-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                {app.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
