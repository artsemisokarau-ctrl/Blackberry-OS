import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import AppFrame from '@/components/ui/AppFrame';
import ListRows, { type ListRow } from '@/components/ui/ListRows';
import { useSettings } from '@/hooks/useSettings';
import { moveCursor, useAppKeys } from '@/lib/appKeys';
import { melodySeconds, scheduleMelody, type Melody } from '@/lib/audio';
import { formatDuration } from '@/lib/format';

interface Track {
  title: string;
  bpm: number;
  melody: Melody;
  seconds: number;
}

interface MusicEngine {
  ctx: AudioContext;
  master: GainNode;
  trackGain: GainNode | null;
  startedAt: number;
  base: number;
}

function makeTrack(title: string, bpm: number, phrase: Melody, repeat: number): Track {
  const melody: Melody = [];
  for (let i = 0; i < repeat; i++) melody.push(...phrase);
  return { title, bpm, melody, seconds: melodySeconds(melody, bpm) };
}

const TRACKS: Track[] = [
  makeTrack(
    'Night Drive',
    96,
    [
      [262, 1], [311, 1], [392, 1], [311, 1], [262, 1], [311, 1], [392, 1], [466, 1],
      [349, 1], [415, 1], [523, 1], [415, 1], [349, 1], [415, 1], [523, 1], [622, 1],
    ],
    2,
  ),
  makeTrack(
    'Sunrise Lane',
    120,
    [
      [392, 0.5], [440, 0.5], [523, 0.5], [587, 0.5], [523, 1], [440, 1],
      [392, 0.5], [349, 0.5], [330, 1], [392, 1], [0, 1],
    ],
    3,
  ),
  makeTrack(
    'Blue Hour',
    80,
    [[220, 2], [262, 2], [330, 2], [294, 2], [262, 2], [220, 2], [196, 2], [247, 2]],
    2,
  ),
];

const gainFor = (volume: number, sound: boolean) => (sound ? (volume / 10) * 0.6 : 0);

export default function MusicApp() {
  const { settings } = useSettings();
  const [selected, setSelected] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(6);
  const engine = useRef<MusicEngine | null>(null);

  useEffect(() => {
    return () => {
      void engine.current?.ctx.close();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    const eng = engine.current;
    if (!eng) return;
    eng.master.gain.setTargetAtTime(gainFor(volume, settings.sound), eng.ctx.currentTime, 0.05);
  }, [volume, settings.sound]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const eng = engine.current;
      if (!eng) return;
      const position = eng.base + (eng.ctx.currentTime - eng.startedAt);
      if (position >= TRACKS[current].seconds) {
        playTrack((current + 1) % TRACKS.length);
        return;
      }
      setElapsed(Math.max(0, position));
    }, 250);
    return () => window.clearInterval(timer);
  }, [playing, current]);

  const ensureEngine = (): MusicEngine => {
    if (engine.current) return engine.current;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = gainFor(volume, settings.sound);
    master.connect(ctx.destination);
    engine.current = { ctx, master, trackGain: null, startedAt: 0, base: 0 };
    return engine.current;
  };

  const playTrack = (index: number) => {
    const eng = ensureEngine();
    eng.trackGain?.disconnect();
    const gain = eng.ctx.createGain();
    gain.connect(eng.master);
    const track = TRACKS[index];
    const start = eng.ctx.currentTime + 0.05;
    scheduleMelody(eng.ctx, gain, track.melody, track.bpm, start, 'triangle');
    eng.trackGain = gain;
    eng.startedAt = start;
    eng.base = 0;
    void eng.ctx.resume();
    setCurrent(index);
    setSelected(index);
    setElapsed(0);
    setPlaying(true);
  };

  const togglePlay = () => {
    const eng = engine.current;
    if (!eng || selected !== current) {
      playTrack(selected);
      return;
    }
    if (playing) {
      eng.base += eng.ctx.currentTime - eng.startedAt;
      void eng.ctx.suspend();
      setPlaying(false);
    } else {
      eng.startedAt = eng.ctx.currentTime;
      void eng.ctx.resume();
      setPlaying(true);
    }
  };

  const stepTrack = (delta: number) => {
    const index = (current + delta + TRACKS.length) % TRACKS.length;
    playTrack(index);
  };

  const adjustVolume = (delta: number) => setVolume((value) => Math.min(10, Math.max(0, value + delta)));

  useAppKeys((key) => {
    if (key === 'up' || key === 'down') {
      setSelected(moveCursor(key, selected, TRACKS.length) ?? selected);
      return true;
    }
    if (key === 'left') {
      adjustVolume(-1);
      return true;
    }
    if (key === 'right') {
      adjustVolume(1);
      return true;
    }
    if (key === 'select') {
      togglePlay();
      return true;
    }
    return false;
  });

  const track = TRACKS[current];
  const rows: ListRow[] = TRACKS.map((item) => ({
    id: item.title,
    primary: item.title,
    secondary: 'Demo Synth',
    right: formatDuration(item.seconds),
  }));
  const progress = Math.min(100, (elapsed / track.seconds) * 100);

  return (
    <AppFrame appId="music" right={playing ? 'Playing' : 'Paused'}>
      <div className="flex shrink-0 gap-2 p-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-br from-[#2fd6ff] to-[#0a2f7a]">
          <Volume2 className="h-5 w-5 text-white/90" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <span className="truncate text-xs font-semibold text-zinc-100">{track.title}</span>
          <span className="text-[10px] text-zinc-400">
            {formatDuration(elapsed)} / {formatDuration(track.seconds)}
          </span>
          <div className="mt-1 h-1 w-full overflow-hidden rounded bg-zinc-800">
            <div className="h-full bg-[#7ed957] transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between px-2 pb-1">
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="Previous track"
            onPointerDown={() => stepTrack(-1)}
            className="bb-key flex h-7 w-8 items-center justify-center rounded-[5px] text-zinc-200"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={playing ? 'Pause' : 'Play'}
            onPointerDown={togglePlay}
            className="bb-call flex h-7 w-10 items-center justify-center rounded-[5px] text-white"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            aria-label="Next track"
            onPointerDown={() => stepTrack(1)}
            className="bb-key flex h-7 w-8 items-center justify-center rounded-[5px] text-zinc-200"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-zinc-400">
          <button
            type="button"
            aria-label="Volume down"
            onPointerDown={() => adjustVolume(-1)}
            className="bb-key h-6 w-6 rounded-[4px] text-zinc-200"
          >
            -
          </button>
          <span className="w-6 text-center text-zinc-200">{volume}</span>
          <button
            type="button"
            aria-label="Volume up"
            onPointerDown={() => adjustVolume(1)}
            className="bb-key h-6 w-6 rounded-[4px] text-zinc-200"
          >
            +
          </button>
        </div>
      </div>
      <ListRows
        rows={rows}
        cursor={selected}
        visible={3}
      />
      <p className="shrink-0 bg-zinc-900 px-2 py-1 text-[9px] text-zinc-500">
        Up/Down: track | Enter: play/pause | Left/Right: volume
      </p>
    </AppFrame>
  );
}
