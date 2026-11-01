import { createContext, useContext, useEffect, useRef } from 'react';
import type { KeyInput } from '@/lib/keys';

export type KeyHandler = (key: KeyInput) => boolean;
export type RegisterKeys = (handler: KeyHandler) => () => void;

export const AppKeysContext = createContext<RegisterKeys>(() => () => undefined);

export function useAppKeys(handler: KeyHandler): void {
  const register = useContext(AppKeysContext);
  const latest = useRef(handler);

  useEffect(() => {
    latest.current = handler;
  });

  useEffect(() => register((key) => latest.current(key)), [register]);
}

export function moveCursor(key: KeyInput, index: number, count: number, columns = 1): number | null {
  if (count === 0) return null;
  let next: number;
  switch (key) {
    case 'up':
      next = index - columns;
      break;
    case 'down':
      next = index + columns;
      break;
    case 'left':
      next = index - 1;
      break;
    case 'right':
      next = index + 1;
      break;
    default:
      return null;
  }
  return Math.min(count - 1, Math.max(0, next));
}

export function editText(value: string, key: KeyInput): string | null {
  if (key === 'backspace') return value.slice(0, -1);
  if (key.length === 1) return value + key;
  return null;
}
