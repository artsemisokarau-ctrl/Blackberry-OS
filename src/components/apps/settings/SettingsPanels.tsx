import { useEffect, useState } from 'react';
import Wallpaper from '@/components/screen/Wallpaper';
import CopyButton from '@/components/ui/CopyButton';
import FormScreen from '@/components/ui/FormScreen';
import ListRows, { type ListRow } from '@/components/ui/ListRows';
import { moveCursor, useAppKeys } from '@/lib/appKeys';
import { playRingtone } from '@/lib/audio';
import { PHONE_COLORS, type PhoneColorId } from '@/lib/phoneColors';
import { PHONE_NUMBER, RINGTONES, WALLPAPERS, type RingtoneId, type Settings, type WallpaperId } from '@/lib/records';

type Patch = Partial<Settings>;

interface ColorPanelProps {
  current: PhoneColorId;
  onPreview: (color: PhoneColorId | null) => void;
  onSave: (color: PhoneColorId) => void;
  onBack: () => void;
}

export function ColorPanel({ current, onPreview, onSave, onBack }: ColorPanelProps) {
  const [cursor, setCursor] = useState(() => Math.max(0, PHONE_COLORS.findIndex((item) => item.id === current)));
  const focused = PHONE_COLORS[cursor];

  useEffect(() => () => onPreview(null), [onPreview]);

  useAppKeys((key) => {
    if (key === 'back') {
      onBack();
      return true;
    }
    if (key === 'select') {
      onSave(focused.id);
      return true;
    }
    const next = moveCursor(key, cursor, PHONE_COLORS.length);
    if (next === null) return false;
    setCursor(next);
    onPreview(PHONE_COLORS[next].id);
    return true;
  });

  const rows: ListRow[] = PHONE_COLORS.map((item) => ({
    id: item.id,
    primary: item.label,
    right: item.id === current ? 'Saved' : undefined,
  }));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
      <div className="flex items-center gap-2 rounded-[4px] bg-zinc-900 px-2 py-1.5">
        <span
          className="h-5 w-5 shrink-0 rounded-full ring-1 ring-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          style={{ backgroundColor: focused.base }}
        />
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-zinc-100">{focused.label}</p>
          <p className="truncate text-[9px] text-zinc-400">{focused.finish}</p>
        </div>
      </div>
      <ListRows
        rows={rows}
        cursor={cursor}
        visible={3}
      />
      <button
        type="button"
        onPointerDown={() => onSave(focused.id)}
        className="bb-key rounded-[5px] py-1.5 text-xs font-semibold text-zinc-200"
      >
        Save colour
      </button>
      <p className="mt-auto text-[9px] text-zinc-500">Preview on the body. Enter saves | Back cancels.</p>
    </div>
  );
}

const BRIGHTNESS_MIN = 30;
const BRIGHTNESS_MAX = 100;
const BRIGHTNESS_STEP = 10;

interface WallpaperPanelProps {
  current: WallpaperId;
  onSelect: (wallpaper: WallpaperId) => void;
  onBack: () => void;
}

export function WallpaperPanel({ current, onSelect, onBack }: WallpaperPanelProps) {
  const [cursor, setCursor] = useState(() => Math.max(0, WALLPAPERS.findIndex((item) => item.id === current)));

  useAppKeys((key) => {
    if (key === 'back') {
      onBack();
      return true;
    }
    if (key === 'select') {
      onSelect(WALLPAPERS[cursor].id);
      return true;
    }
    const next = moveCursor(key, cursor, WALLPAPERS.length);
    if (next === null) return false;
    setCursor(next);
    return true;
  });

  const rows: ListRow[] = WALLPAPERS.map((item) => ({
    id: item.id,
    primary: item.label,
    right: item.id === current ? 'Current' : undefined,
  }));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
      <div className="relative h-24 shrink-0 overflow-hidden rounded-[4px] border border-white/20">
        <Wallpaper variant={WALLPAPERS[cursor].id} />
      </div>
      <ListRows
        rows={rows}
        cursor={cursor}
        visible={3}
      />
      <p className="text-[9px] text-zinc-500">Up/Down: preview | Enter: apply</p>
    </div>
  );
}

interface DisplayPanelProps {
  brightness: number;
  onChange: (brightness: number) => void;
  onBack: () => void;
}

export function DisplayPanel({ brightness, onChange, onBack }: DisplayPanelProps) {
  const dimmer = () => onChange(Math.max(BRIGHTNESS_MIN, brightness - BRIGHTNESS_STEP));
  const brighter = () => onChange(Math.min(BRIGHTNESS_MAX, brightness + BRIGHTNESS_STEP));

  useAppKeys((key) => {
    if (key === 'back') {
      onBack();
      return true;
    }
    if (key === 'left' || key === 'down') {
      dimmer();
      return true;
    }
    if (key === 'right' || key === 'up') {
      brighter();
      return true;
    }
    return false;
  });

  const percent = ((brightness - BRIGHTNESS_MIN) / (BRIGHTNESS_MAX - BRIGHTNESS_MIN)) * 100;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold text-zinc-100">Screen brightness</span>
        <span className="font-mono text-sm text-[#7ed957]">{brightness}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full bg-[#7ed957] transition-[width] duration-200" style={{ width: `${percent}%` }} />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onPointerDown={dimmer}
          className="bb-key flex-1 rounded-[5px] py-1.5 text-xs font-semibold text-zinc-200"
        >
          Dimmer
        </button>
        <button
          type="button"
          onPointerDown={brighter}
          className="bb-key flex-1 rounded-[5px] py-1.5 text-xs font-semibold text-zinc-200"
        >
          Brighter
        </button>
      </div>
      <p className="mt-auto text-[9px] text-zinc-500">Left/Right: adjust | Back: return</p>
    </div>
  );
}

interface SoundPanelProps {
  ringtone: RingtoneId;
  sound: boolean;
  onChange: (patch: Patch) => void;
  onBack: () => void;
}

export function SoundPanel({ ringtone, sound, onChange, onBack }: SoundPanelProps) {
  const [cursor, setCursor] = useState(0);
  const ringtoneLabel = RINGTONES.find((item) => item.id === ringtone)?.label ?? '';

  const activate = (index: number) => {
    if (index === 0) {
      const currentIndex = RINGTONES.findIndex((item) => item.id === ringtone);
      const next = RINGTONES[(currentIndex + 1) % RINGTONES.length].id;
      onChange({ ringtone: next });
      playRingtone(next, sound);
    } else {
      onChange({ sound: !sound });
    }
  };

  useAppKeys((key) => {
    if (key === 'back') {
      onBack();
      return true;
    }
    if (key === 'select') {
      activate(cursor);
      return true;
    }
    const next = moveCursor(key, cursor, 2);
    if (next === null) return false;
    setCursor(next);
    return true;
  });

  const rows: ListRow[] = [
    { id: 'ringtone', primary: 'Ringtone', right: ringtoneLabel },
    { id: 'sound', primary: 'Keypad and alert sounds', right: sound ? 'On' : 'Off' },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
      <ListRows
        rows={rows}
        cursor={cursor}
        visible={2}
      />
      <p className="text-[9px] text-zinc-500">Enter: change ringtone or toggle sound. Ringtone plays a preview.</p>
    </div>
  );
}

interface SecurityPanelProps {
  pin: string;
  onSave: (pin: string) => void;
  onBack: () => void;
}

export function SecurityPanel({ pin, onSave, onBack }: SecurityPanelProps) {
  const [draft, setDraft] = useState(pin);
  const [error, setError] = useState('');

  return (
    <FormScreen
      fields={[{ id: 'pin', label: 'Lock PIN (4 digits, blank to clear)', value: draft, placeholder: '0000' }]}
      actions={[{ label: 'Save PIN' }]}
      notice={error}
      onChange={(_id, value) => setDraft(value.replace(/\D/g, '').slice(0, 4))}
      onAction={() => {
        if (draft && !/^\d{4}$/.test(draft)) {
          setError('PIN must be 4 digits.');
          return;
        }
        onSave(draft);
        onBack();
      }}
      onBack={onBack}
    />
  );
}

interface DeviceInfoPanelProps {
  finish: string;
  onBack: () => void;
}

export function DeviceInfoPanel({ finish, onBack }: DeviceInfoPanelProps) {
  useAppKeys((key) => {
    if (key !== 'back') return false;
    onBack();
    return true;
  });

  const rows: [string, string][] = [
    ['Phone number', PHONE_NUMBER],
    ['Model', 'BlackBerry Curve 9320'],
    ['Finish', finish],
    ['Software', 'DOOMBERRY OS 7.1'],
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
      <dl className="flex flex-col divide-y divide-white/10 rounded-[4px] bg-zinc-900">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-2 py-1.5">
            <dt className="text-[10px] text-zinc-400">{label}</dt>
            <dd className="text-[11px] text-zinc-100">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center justify-between rounded-[4px] bg-zinc-900 px-2 py-1.5">
        <span className="text-[10px] text-zinc-400">Copy phone number</span>
        <CopyButton text={PHONE_NUMBER} />
      </div>
      <p className="mt-auto text-[9px] text-zinc-500">This number is fictional and only used inside the simulator.</p>
    </div>
  );
}
