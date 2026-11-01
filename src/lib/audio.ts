import type { RingtoneId } from '@/lib/records';

// [frequency in Hz (0 = rest), length in beats]
export type Melody = [number, number][];

export function melodySeconds(melody: Melody, bpm: number): number {
  return melody.reduce((total, [, beats]) => total + beats, 0) * (60 / bpm);
}

export function scheduleMelody(
  ctx: AudioContext,
  destination: AudioNode,
  melody: Melody,
  bpm: number,
  startAt: number,
  wave: OscillatorType = 'triangle',
): void {
  const beat = 60 / bpm;
  let time = startAt;
  for (const [frequency, beats] of melody) {
    const length = beats * beat;
    if (frequency > 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.6, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + length * 0.9);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(time);
      osc.stop(time + length);
    }
    time += length;
  }
}

export function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

const RINGTONE_PATTERNS: Record<RingtoneId, { melody: Melody; bpm: number; wave: OscillatorType }> = {
  classic: {
    bpm: 140,
    wave: 'square',
    melody: [
      [659, 1],
      [0, 0.5],
      [659, 1],
      [0, 0.5],
      [784, 2],
    ],
  },
  pulse: {
    bpm: 180,
    wave: 'sine',
    melody: [
      [523, 0.5],
      [659, 0.5],
      [784, 0.5],
      [1046, 1],
      [0, 1],
    ],
  },
  chime: {
    bpm: 100,
    wave: 'sine',
    melody: [
      [1046, 2],
      [784, 2],
      [880, 2],
      [659, 4],
    ],
  },
};

export function playRingtone(ringtone: RingtoneId, sound: boolean): void {
  if (!sound) return;
  const { melody, bpm, wave } = RINGTONE_PATTERNS[ringtone];
  const ctx = new AudioContext();
  const gain = ctx.createGain();
  gain.gain.value = 0.5;
  gain.connect(ctx.destination);
  const single = melodySeconds(melody, bpm);
  const repeats = 3;
  for (let i = 0; i < repeats; i++) {
    scheduleMelody(ctx, gain, melody, bpm, ctx.currentTime + 0.05 + i * single, wave);
  }
  window.setTimeout(() => void ctx.close(), (single * repeats + 0.5) * 1000);
}
