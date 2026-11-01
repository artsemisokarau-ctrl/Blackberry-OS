import type { GameId } from '@/components/apps/games/GamePlayer';

export interface DownloadedGame {
  id: string;
  title: string;
  fileName: string;
  size: number;
  importedAt: number;
  playsAs: GameId | null;
  dataUrl: string;
}

export const ACCEPTED_GAME_EXTENSIONS = ['.jar', '.jad'];
export const MAX_GAME_BYTES = 512 * 1024;
const STORAGE_BUDGET_CHARS = 4_000_000;

const KEYWORD_GAMES: { pattern: RegExp; game: GameId }[] = [
  { pattern: /snake/i, game: 'snake' },
  { pattern: /tetris/i, game: 'tetris' },
  { pattern: /brick/i, game: 'brick' },
  { pattern: /mole/i, game: 'mole' },
];

export function isGameFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ACCEPTED_GAME_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export function titleFor(fileName: string, jadText: string | null): string {
  const declared = jadText?.match(/^MIDlet-Name:\s*(.+)$/m)?.[1]?.trim();
  return declared || fileName.replace(/\.(jar|jad)$/i, '');
}

export function simulatorGameFor(title: string): GameId | null {
  return KEYWORD_GAMES.find((entry) => entry.pattern.test(title))?.game ?? null;
}

export function fitsStorage(games: DownloadedGame[], next: DownloadedGame): boolean {
  return JSON.stringify([...games, next]).length <= STORAGE_BUDGET_CHARS;
}

export function readAsDataUrl(file: File, onProgress: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('The file could not be read'));
    reader.readAsDataURL(file);
  });
}
