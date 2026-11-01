import { Check } from 'lucide-react';
import { DEVICES, type DeviceId } from '@/lib/devices';

interface MyPhonesProps {
  current: DeviceId;
  onSelect: (device: DeviceId) => void;
}

export default function MyPhones({ current, onSelect }: MyPhonesProps) {
  return (
    <div className="flex min-h-[520px] w-[380px] flex-col gap-4 rounded-[28px] border border-white/10 bg-zinc-950/85 p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">My Phones</p>
        <p className="mt-1 text-lg font-semibold text-zinc-100">Choose a device</p>
      </div>

      {DEVICES.map((device) => {
        const selected = device.id === current;
        return (
          <button
            key={device.id}
            type="button"
            onClick={() => onSelect(device.id)}
            className={`flex items-center gap-4 rounded-[20px] border p-4 text-left transition duration-200 active:scale-[0.98] ${
              selected
                ? 'border-[#7ed957]/70 bg-zinc-900'
                : 'border-white/10 bg-zinc-900/60 hover:border-white/30 hover:bg-zinc-900'
            }`}
          >
            <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-[14px] bg-zinc-800/70">
              {device.id === 'blackberry' ? <BerryThumb /> : device.id === 'nokia' ? <NokiaThumb /> : <ClicksThumb />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-100">{device.label}</p>
              <p className="mt-0.5 text-xs text-zinc-400">{device.subtitle}</p>
            </div>
            {selected && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7ed957] text-zinc-950">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}

      <p className="mt-auto text-[11px] leading-relaxed text-zinc-500">
        Your choice is remembered on this device. Switching turns the phone off.
      </p>
    </div>
  );
}

function BerryThumb() {
  return (
    <div className="h-16 w-10 rounded-[9px] bg-[#17171b] p-[3px] shadow-lg ring-1 ring-zinc-400/50">
      <div className="flex h-full flex-col items-center gap-1 rounded-[6px] pt-1">
        <div className="h-5 w-7 rounded-[2px] bg-black" />
        <div className="grid grid-cols-4 gap-[2px]">
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index} className="h-1.5 w-1.5 rounded-[1px] bg-zinc-500" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClicksThumb() {
  return (
    <div className="h-[66px] w-[34px] rounded-[9px] bg-[#1b1d21] p-[3px] shadow-lg ring-1 ring-black/60">
      <div className="h-[30px] rounded-[3px] bg-[#0b1a23]" />
      <div className="mt-1.5 grid grid-cols-5 gap-[2px]">
        {Array.from({ length: 15 }, (_, index) => (
          <span key={index} className="h-[3px] rounded-[1px] bg-zinc-500" />
        ))}
      </div>
    </div>
  );
}

function NokiaThumb() {
  return (
    <div className="flex flex-col items-center">
      <div className="h-[30px] w-[26px] rounded-[6px] bg-[#23282f] p-[3px] ring-1 ring-black/60">
        <div className="h-full w-full rounded-[2px] bg-[#0d1210]" />
      </div>
      <div className="h-1.5 w-4 bg-[#0b0e12]" />
      <div className="grid h-[30px] w-[26px] grid-cols-3 content-center gap-[2px] rounded-[6px] bg-[#1a1e25] p-[4px] ring-1 ring-black/60">
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} className="h-[4px] w-[4px] rounded-full bg-zinc-500" />
        ))}
      </div>
    </div>
  );
}
