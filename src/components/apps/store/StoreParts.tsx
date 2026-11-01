import { useState } from 'react';
import { ACCESSORIES } from '@/components/unbox/boxContents';
import { moveCursor, useAppKeys } from '@/lib/appKeys';
import { BUNDLES, type CartItem } from '@/lib/store';
import { findProductColor, PRODUCT_BY_ID } from '@/lib/products';

export function accessoryNames(itemIds: readonly string[]): string[] {
  return ACCESSORIES.filter((accessory) => accessory.id !== 'handset' && itemIds.includes(accessory.id)).map(
    (accessory) => accessory.label,
  );
}

export function describeItem(item: CartItem): string {
  const product = PRODUCT_BY_ID[item.productId];
  return `${product.name} - ${findProductColor(product, item.colorId).label} - ${BUNDLES[item.bundleId].label}`;
}

export interface StoreAction {
  label: string;
  disabled?: boolean;
  danger?: boolean;
}

interface ActionListProps {
  actions: StoreAction[];
  cursor: number;
  onPress: (index: number) => void;
}

export function ActionList({ actions, cursor, onPress }: ActionListProps) {
  return (
    <div className="flex flex-col gap-[3px]">
      {actions.map((action, index) => {
        const selected = index === cursor;
        return (
          <button
            key={`${index}-${action.label}`}
            type="button"
            disabled={action.disabled}
            onPointerDown={() => onPress(index)}
            className={`rounded-[4px] px-2 py-1.5 text-left text-[11px] font-semibold disabled:opacity-40 ${
              selected ? 'bb-select text-white' : action.danger ? 'bg-red-950 text-red-300' : 'bg-zinc-900 text-zinc-200'
            }`}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

export function BoxThumb({ brand, model, large = false }: { brand: string; model: string; large?: boolean }) {
  return (
    <div
      className={`flex shrink-0 flex-col items-center justify-center rounded-[4px] bg-gradient-to-b from-[#2a2d33] via-[#111215] to-[#050506] ring-1 ring-white/15 shadow-[0_3px_6px_rgba(0,0,0,0.6)] ${
        large ? 'h-[52px] w-[44px]' : 'h-9 w-7'
      }`}
    >
      <span className={`font-bold tracking-tight text-zinc-200 ${large ? 'text-[8px]' : 'text-[5px]'}`}>{brand}</span>
      <span className={`mt-px text-zinc-500 ${large ? 'text-[6px]' : 'text-[4px]'}`}>{model.toUpperCase()}</span>
    </div>
  );
}

export function useCursorKeys(
  length: number,
  onSelect: (index: number) => void,
  onBack?: () => void,
): [number, (cursor: number) => void] {
  const [cursor, setCursor] = useState(0);

  useAppKeys((key) => {
    if (key === 'back' && onBack) {
      onBack();
      return true;
    }
    if (key === 'select') {
      onSelect(cursor);
      return true;
    }
    const next = moveCursor(key, cursor, length);
    if (next === null) return false;
    setCursor(next);
    return true;
  });

  return [cursor, setCursor];
}
