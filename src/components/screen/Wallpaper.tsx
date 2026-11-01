import type { WallpaperId } from '@/lib/records';

const PALETTES: Record<WallpaperId, { from: string; to: string; ribbons: [string, string, string] }> = {
  'ribbon-blue': { from: '#0a2540', to: '#1b4f7a', ribbons: ['#f4d93a', '#37d4ec', '#2a6fe0'] },
  'ribbon-green': { from: '#03120c', to: '#0c3324', ribbons: ['#8ff59a', '#22b879', '#4fe3a8'] },
  'ribbon-cyan': { from: '#02090f', to: '#0a3340', ribbons: ['#a6fff3', '#22c7d9', '#7ef0ff'] },
};

const RIBBONS = [
  'M-20 200 C80 150 170 120 340 58 L340 96 C170 160 90 190 -20 236 Z',
  'M-20 150 C90 110 190 70 340 14 L340 30 C190 84 90 126 -20 170 Z',
  'M120 240 C170 170 240 110 340 110 L340 150 C250 150 190 200 160 240 Z',
];

interface WallpaperProps {
  variant: WallpaperId;
}

export default function Wallpaper({ variant }: WallpaperProps) {
  const palette = PALETTES[variant];
  const id = `wallpaper-${variant}`;

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 320 240"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.from} />
          <stop offset="1" stopColor={palette.to} />
        </linearGradient>
        {palette.ribbons.map((color, index) => (
          <linearGradient key={color} id={`${id}-ribbon-${index}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={color} stopOpacity="0" />
            <stop offset="0.4" stopColor={color} stopOpacity="0.9" />
            <stop offset="1" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        ))}
        <radialGradient id={`${id}-vignette`} cx="50%" cy="40%" r="75%">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <rect width="320" height="240" fill={`url(#${id}-bg)`} />
      {RIBBONS.map((d, index) => (
        <g key={d}>
          <path d={d} fill={`url(#${id}-ribbon-${index})`} />
          <path d={d} fill="none" stroke={palette.ribbons[index]} strokeWidth="0.8" opacity="0.6" />
        </g>
      ))}
      <rect width="320" height="240" fill={`url(#${id}-vignette)`} />
    </svg>
  );
}
