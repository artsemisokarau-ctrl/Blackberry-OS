import { useEffect, useState } from 'react';
import AppFrame from '@/components/ui/AppFrame';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useNow } from '@/hooks/useNow';
import { playRingtone } from '@/lib/audio';
import { pad } from '@/lib/format';
import { useAppKeys } from '@/lib/appKeys';
import { DEFAULT_ALARM, STORAGE_KEYS, type Alarm, type Settings } from '@/lib/records';

interface ClockAppProps {
  settings: Settings;
}

type Field = 'hour' | 'minute' | 'toggle';
const FIELDS: Field[] = ['hour', 'minute', 'toggle'];

export default function ClockApp({ settings }: ClockAppProps) {
  const now = useNow();
  const [alarm, setAlarm] = usePersistentState<Alarm>(STORAGE_KEYS.alarm, DEFAULT_ALARM);
  const [field, setField] = useState<Field>('hour');
  const [ringing, setRinging] = useState(false);
  const [firedOn, setFiredOn] = useState('');

  const dayKey = now.toDateString();
  const clockTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  useEffect(() => {
    if (!alarm.enabled || clockTime !== alarm.time || firedOn === dayKey) return;
    setFiredOn(dayKey);
    setRinging(true);
    playRingtone(settings.ringtone, settings.sound);
  }, [clockTime, alarm, dayKey, firedOn, settings.ringtone, settings.sound]);

  const [alarmHour, alarmMinute] = alarm.time.split(':').map(Number);

  const shiftField = (delta: number) => {
    if (field === 'hour') {
      setAlarm({ ...alarm, time: `${pad((alarmHour + delta + 24) % 24)}:${pad(alarmMinute)}` });
    } else if (field === 'minute') {
      setAlarm({ ...alarm, time: `${pad(alarmHour)}:${pad((alarmMinute + delta + 60) % 60)}` });
    } else {
      setAlarm({ ...alarm, enabled: !alarm.enabled });
    }
  };

  const cycleField = (delta: number) => {
    const index = FIELDS.indexOf(field);
    setField(FIELDS[(index + delta + FIELDS.length) % FIELDS.length]);
  };

  useAppKeys((key) => {
    if (ringing && (key === 'select' || key === 'back' || key === 'end')) {
      setRinging(false);
      return true;
    }
    if (key === 'left') {
      cycleField(-1);
      return true;
    }
    if (key === 'right') {
      cycleField(1);
      return true;
    }
    if (key === 'up' || key === 'down') {
      shiftField(key === 'up' ? 1 : -1);
      return true;
    }
    if (key === 'select') {
      setAlarm({ ...alarm, enabled: !alarm.enabled });
      return true;
    }
    return false;
  });

  const fieldClass = (target: Field) =>
    field === target ? 'bb-select text-white' : 'bg-zinc-800 text-zinc-100';

  return (
    <AppFrame appId="clock" right={clockTime}>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <div className="flex flex-col items-center gap-0.5 pt-2">
          <div className="flex items-baseline gap-1 font-mono text-4xl font-semibold text-zinc-100">
            <span>{pad(now.getHours())}</span>
            <span className="animate-pulse text-[#7ed957]">:</span>
            <span>{pad(now.getMinutes())}</span>
            <span className="ml-1 text-sm text-zinc-500">{pad(now.getSeconds())}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-400">
            {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        {ringing && (
          <div className="flex flex-col items-center gap-2 rounded-[6px] border border-[#7ed957]/50 bg-[#0b3d1a] p-2">
            <span className="text-xs font-semibold text-[#c8ffb0]">Alarm ringing</span>
            <button
              type="button"
              onPointerDown={() => setRinging(false)}
              className="bb-call w-full rounded-[5px] py-1 text-xs font-semibold text-white"
            >
              Stop alarm
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-[6px] bg-zinc-900 p-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Alarm</span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 font-mono text-2xl">
              <button
                type="button"
                onPointerDown={() => {
                  setField('hour');
                  shiftField(1);
                }}
                className={`rounded-[4px] px-2 ${fieldClass('hour')}`}
              >
                {pad(alarmHour)}
              </button>
              <span className="text-zinc-400">:</span>
              <button
                type="button"
                onPointerDown={() => {
                  setField('minute');
                  shiftField(1);
                }}
                className={`rounded-[4px] px-2 ${fieldClass('minute')}`}
              >
                {pad(alarmMinute)}
              </button>
            </div>
            <button
              type="button"
              onPointerDown={() => {
                setField('toggle');
                shiftField(1);
              }}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${
                alarm.enabled ? 'bb-call text-white' : 'bg-zinc-800 text-zinc-400'
              } ${field === 'toggle' ? 'ring-2 ring-[#7ed957]' : ''}`}
            >
              {alarm.enabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        <p className="mt-auto text-center text-[9px] leading-relaxed text-zinc-500">
          Left/Right: choose | Up/Down: change | Enter: on/off
        </p>
      </div>
    </AppFrame>
  );
}
