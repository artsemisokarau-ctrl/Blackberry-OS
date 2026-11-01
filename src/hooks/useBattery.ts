import { useEffect, useRef } from 'react';
import { advanceBattery, INITIAL_BATTERY, TICK_MS, type BatteryState, type BatteryStatus } from '@/lib/battery';
import { usePersistentState } from '@/hooks/usePersistentState';
import { STORAGE_KEYS } from '@/lib/records';

export function useBattery(active: boolean, onDepleted: () => void): BatteryStatus {
  const [state, setState] = usePersistentState<BatteryState>(STORAGE_KEYS.battery, INITIAL_BATTERY);
  const onDepletedRef = useRef(onDepleted);

  useEffect(() => {
    onDepletedRef.current = onDepleted;
  }, [onDepleted]);

  useEffect(() => {
    let last = Date.now();
    const timer = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - last;
      last = now;
      setState((prev) => advanceBattery(prev, elapsed, active));
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [active, setState]);

  const depleted = active && state.level <= 0 && !state.plugged;
  useEffect(() => {
    if (depleted) onDepletedRef.current();
  }, [depleted]);

  return {
    level: state.level,
    plugged: state.plugged,
    charging: state.plugged && state.level < 100,
    setPlugged: (plugged) => setState((prev) => ({ ...prev, plugged })),
  };
}
