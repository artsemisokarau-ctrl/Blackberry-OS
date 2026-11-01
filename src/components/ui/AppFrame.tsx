import type { ReactNode } from 'react';
import { APP_BY_ID, type AppId } from '@/lib/apps';

interface AppFrameProps {
  appId: AppId;
  right?: ReactNode;
  children: ReactNode;
}

export default function AppFrame({ appId, right, children }: AppFrameProps) {
  const app = APP_BY_ID[appId];
  const Icon = app.icon;

  return (
    <div className="flex h-full w-full flex-col bg-zinc-950">
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-[#7ed957]/40 bg-gradient-to-b from-zinc-800 to-zinc-900 px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#7ed957] drop-shadow-[0_0_4px_rgba(126,217,87,0.45)]" strokeWidth={1.8} />
          <span className="text-xs font-semibold text-zinc-100">{app.label}</span>
        </div>
        {right && <span className="text-[10px] tabular-nums text-zinc-400">{right}</span>}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
