import { createContext, useContext } from 'react';

export interface BatteryState {
  level: number;
  plugged: boolean;
}

export interface BatteryStatus extends BatteryState {
  charging: boolean;
  setPlugged: (plugged: boolean) => void;
}

export const TICK_MS = 1000;
const FULL_DRAIN_MS = 5 * 60_000;
const FULL_CHARGE_MS = 2 * 60_000;
const DRAIN_PER_MS = 100 / FULL_DRAIN_MS;
const CHARGE_PER_MS = 100 / FULL_CHARGE_MS;

export const INITIAL_BATTERY: BatteryState = { level: 100, plugged: false };

export function advanceBattery(prev: BatteryState, elapsedMs: number, active: boolean): BatteryState {
  const gain = prev.plugged ? elapsedMs * CHARGE_PER_MS : 0;
  const loss = active ? elapsedMs * DRAIN_PER_MS : 0;
  const level = Math.min(100, Math.max(0, prev.level + gain - loss));
  return level === prev.level ? prev : { ...prev, level };
}

export const BatteryContext = createContext<BatteryStatus>({
  level: INITIAL_BATTERY.level,
  plugged: INITIAL_BATTERY.plugged,
  charging: false,
  setPlugged: () => undefined,
});

export function useBatteryStatus(): BatteryStatus {
  return useContext(BatteryContext);
}
