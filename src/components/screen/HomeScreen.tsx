import { ChevronDown, Search, Volume2 } from 'lucide-react';
import AppDrawer from '@/components/screen/AppDrawer';
import AppIcon from '@/components/screen/AppIcon';
import StatusBar from '@/components/screen/StatusBar';
import Wallpaper from '@/components/screen/Wallpaper';
import { useNow } from '@/hooks/useNow';
import { APPS, DOCK_SIZE } from '@/lib/apps';
import { pad } from '@/lib/format';
import type { WallpaperId } from '@/lib/records';

interface HomeScreenProps {
  selectedIndex: number;
  wallpaper: WallpaperId;
  drawerOpen: boolean;
}

export default function HomeScreen({ selectedIndex, wallpaper, drawerOpen }: HomeScreenProps) {
  const now = useNow();
  const date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const time = `${now.getHours() % 12 || 12}:${pad(now.getMinutes())}`;
  const meridiem = now.getHours() < 12 ? 'AM' : 'PM';
  const dock = APPS.slice(0, DOCK_SIZE);
  const selectedApp = APPS[selectedIndex];

  return (
    <div className="relative flex h-full w-full touch-none flex-col overflow-hidden">
      <Wallpaper variant={wallpaper} />
      <div className="relative flex h-full w-full flex-col">
        <StatusBar />
        <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-start px-3 pt-1">
          <span className="pt-1 text-[11px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">{date}</span>
          <span className="flex items-start text-[34px] font-light leading-none tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
            {time}
            <span className="ml-0.5 mt-0.5 text-[9px] font-medium">{meridiem}</span>
          </span>
          <span aria-hidden="true" />
        </div>
        <div className="mt-1 flex h-6 shrink-0 items-center justify-between border-y border-white/10 bg-gradient-to-b from-black/60 to-black/30 px-3">
          <Volume2 className="h-3.5 w-3.5 text-zinc-200" strokeWidth={1.8} aria-hidden="true" />
          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-white">
            All
            <ChevronDown className="h-3 w-3" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <Search className="h-3.5 w-3.5 text-zinc-200" strokeWidth={1.8} aria-hidden="true" />
        </div>
        <div className="flex-1" />
        <p
          aria-live="polite"
          className="h-3.5 shrink-0 text-center text-[9px] leading-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
        >
          {selectedApp.label}
        </p>
        <div className="mx-4 mb-3 mt-1 flex shrink-0 justify-around rounded-[12px] border border-white/15 bg-black/35 px-1 py-0.5 backdrop-blur-sm">
          {dock.map((app, index) => (
            <div key={app.id} className="flex items-center justify-center">
              <AppIcon app={app} selected={index === selectedIndex && !drawerOpen} size="lg" />
            </div>
          ))}
        </div>
      </div>
      {drawerOpen && <AppDrawer selectedIndex={selectedIndex} />}
    </div>
  );
}
