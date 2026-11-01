import { Minus, Plug, Plus, RotateCcw } from 'lucide-react';
import type { PhonePoseControls } from '@/hooks/usePhonePose';
import type { BatteryStatus } from '@/lib/battery';
import { BUTTON_CLASS } from '@/components/ui/buttonStyles';

const ZOOM_STEP = 0.2;

interface BlackBerryToolbarProps {
  pose: PhonePoseControls;
  battery: BatteryStatus;
}

export default function BlackBerryToolbar({ pose, battery }: BlackBerryToolbarProps) {
  const facingBack = Math.cos((pose.pose.rotY * Math.PI) / 180) < 0;
  const empty = battery.level <= 0 && !battery.plugged;
  const percent = Math.round(battery.level);
  const batteryStatus = battery.charging
    ? 'Charging'
    : battery.plugged
      ? 'Fully charged'
      : empty
        ? 'Battery empty. Connect the charger to power on.'
        : 'On battery';

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={pose.flip} className={BUTTON_CLASS}>
          {facingBack ? 'Show front' : 'Rotate to view back'}
        </button>
        <button type="button" onClick={() => pose.setInspecting(!pose.inspecting)} className={BUTTON_CLASS}>
          {pose.inspecting ? 'Done inspecting' : 'Inspect'}
        </button>
        <button type="button" onClick={pose.reset} className={`${BUTTON_CLASS} flex items-center gap-2`}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset view
        </button>
        <button type="button" onClick={() => battery.setPlugged(!battery.plugged)} className={BUTTON_CLASS}>
          {battery.plugged ? 'Unplug charger' : 'Connect charger'}
        </button>
      </div>

      {pose.inspecting && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => pose.zoomBy(-ZOOM_STEP)}
            className={`${BUTTON_CLASS} flex h-9 w-9 items-center justify-center px-0`}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs tabular-nums text-zinc-400">
            {Math.round(pose.pose.zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => pose.zoomBy(ZOOM_STEP)}
            className={`${BUTTON_CLASS} flex h-9 w-9 items-center justify-center px-0`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      <p className="text-[11px] tracking-wide text-zinc-400">
        Battery {percent}% · {batteryStatus}
      </p>

      <div className="flex w-56 items-center gap-3">
        <Plug className={`h-4 w-4 shrink-0 ${battery.plugged ? 'animate-pulse text-emerald-400' : 'text-zinc-600'}`} />
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${battery.level <= 20 ? 'bg-red-500' : 'bg-emerald-400'}`}
            style={{ width: `${battery.level}%` }}
          />
        </div>
      </div>
    </div>
  );
}
