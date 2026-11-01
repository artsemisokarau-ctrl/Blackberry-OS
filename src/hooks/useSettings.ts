import { usePersistentState } from '@/hooks/usePersistentState';
import { DEFAULT_SETTINGS, STORAGE_KEYS, type Settings } from '@/lib/records';

export function useSettings() {
  const [stored, setStored] = usePersistentState<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  const settings: Settings = { ...DEFAULT_SETTINGS, ...stored };
  const updateSettings = (patch: Partial<Settings>) =>
    setStored((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...patch }));
  return { settings, updateSettings };
}
