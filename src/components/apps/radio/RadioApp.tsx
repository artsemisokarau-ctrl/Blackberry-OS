import { useEffect, useRef, useState } from 'react';
import AppFrame from '@/components/ui/AppFrame';
import { useSettings } from '@/hooks/useSettings';
import { useAppKeys } from '@/lib/appKeys';
import { createNoiseBuffer } from '@/lib/audio';

interface RadioNodes {
  ctx: AudioContext;
  master: GainNode;
  hiss: GainNode;
  tone: GainNode;
  oscillator: OscillatorNode;
}

const STATIONS = [
  { name: 'Ritmo FM', freq: 92.4 },
  { name: 'Onda Verde', freq: 95.7 },
  { name: 'Costa Sol', freq: 98.2 },
  { name: 'Rock Nova', freq: 101.5 },
  { name: 'Jazz Vista', freq: 104.3 },
  { name: 'Noticias 24', freq: 106.9 },
];

const MIN_FREQ = 87.5;
const MAX_FREQ = 108;
const LOCK_WIDTH = 0.3;

function nearestStation(freq: number): { index: number; distance: number } {
  return STATIONS.reduce(
    (best, station, index) => {
      const distance = Math.abs(station.freq - freq);
      return distance < best.distance ? { index, distance } : best;
    },
    { index: 0, distance: Number.POSITIVE_INFINITY },
  );
}

export default function RadioApp() {
  const { settings } = useSettings();
  const [freq, setFreq] = useState(STATIONS[0].freq);
  const [on, setOn] = useState(false);
  const nodes = useRef<RadioNodes | null>(null);

  useEffect(() => {
    if (!on) return;
    const ctx = new AudioContext();
    void ctx.resume();
    const master = ctx.createGain();
    master.connect(ctx.destination);

    const hiss = ctx.createGain();
    hiss.connect(master);
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx);
    noise.loop = true;
    noise.connect(hiss);
    noise.start();

    const tone = ctx.createGain();
    tone.connect(master);
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.connect(tone);
    oscillator.start();

    nodes.current = { ctx, master, hiss, tone, oscillator };
    return () => {
      nodes.current = null;
      void ctx.close();
    };
  }, [on]);

  useEffect(() => {
    const current = nodes.current;
    if (!current) return;
    const { index, distance } = nearestStation(freq);
    const lock = Math.max(0, 1 - distance / LOCK_WIDTH);
    const time = current.ctx.currentTime;
    current.master.gain.setTargetAtTime(settings.sound ? 0.5 : 0, time, 0.05);
    current.hiss.gain.setTargetAtTime(0.3 * (1 - lock), time, 0.05);
    current.tone.gain.setTargetAtTime(0.4 * lock, time, 0.05);
    current.oscillator.frequency.setTargetAtTime(220 + index * 55, time, 0.05);
  }, [freq, on, settings.sound]);

  const tune = (value: number) => {
    const clamped = Math.min(MAX_FREQ, Math.max(MIN_FREQ, value));
    setFreq(Math.round(clamped * 10) / 10);
  };

  useAppKeys((key) => {
    if (key === 'left') {
      tune(freq - 0.1);
      return true;
    }
    if (key === 'right') {
      tune(freq + 0.1);
      return true;
    }
    if (key === 'up') {
      tune(freq + 1);
      return true;
    }
    if (key === 'down') {
      tune(freq - 1);
      return true;
    }
    if (key === 'select') {
      setOn((value) => !value);
      return true;
    }
    if (/^[1-6]$/.test(key)) {
      tune(STATIONS[Number(key) - 1].freq);
      return true;
    }
    return false;
  });

  const tuned = nearestStation(freq);
  const locked = Math.max(0, 1 - tuned.distance / LOCK_WIDTH) > 0.5;
  const scalePosition = ((freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100;

  return (
    <AppFrame appId="radio" right={on ? 'On' : 'Off'}>
      <div className="flex shrink-0 flex-col items-center gap-0.5 pt-2">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-3xl font-semibold text-[#7ed957]">{freq.toFixed(1)}</span>
          <span className="text-[10px] uppercase text-zinc-400">MHz</span>
        </div>
        <span className="text-[11px] text-zinc-200">{locked ? STATIONS[tuned.index].name : 'Searching...'}</span>
      </div>
      <div className="relative mx-3 mt-2 h-4 shrink-0 rounded bg-zinc-900">
        <div className="absolute inset-y-0 w-[2px] bg-[#7ed957]" style={{ left: `${scalePosition}%` }} />
        <div className="absolute inset-x-1 bottom-0 flex justify-between text-[7px] text-zinc-600">
          <span>87.5</span>
          <span>108</span>
        </div>
      </div>
      <div className="grid shrink-0 grid-cols-3 gap-1 p-2">
        {STATIONS.map((station, index) => {
          const active = locked && tuned.index === index;
          return (
            <button
              key={station.name}
              type="button"
              onPointerDown={() => tune(station.freq)}
              className={`rounded-[4px] px-1 py-1 text-left text-[9px] ${
                active ? 'bb-select text-white' : 'bb-key text-zinc-200'
              }`}
            >
              <span className="font-semibold">{index + 1}</span> {station.name}
              <div className="text-[8px] opacity-70">{station.freq.toFixed(1)}</div>
            </button>
          );
        })}
      </div>
      <div className="mt-auto flex shrink-0 items-center justify-between gap-2 p-2">
        <button
          type="button"
          onPointerDown={() => setOn((value) => !value)}
          className={`h-8 flex-1 rounded-[5px] text-xs font-semibold ${on ? 'bb-end text-white' : 'bb-call text-white'}`}
        >
          {on ? 'Power off' : 'Power on'}
        </button>
        <p className="text-right text-[8px] leading-tight text-zinc-500">
          Left/Right: 0.1 MHz
          <br />
          Up/Down: 1 MHz | 1-6: presets
        </p>
      </div>
    </AppFrame>
  );
}
