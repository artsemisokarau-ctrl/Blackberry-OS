import type { AccessoryId } from '@/components/unbox/boxContents';
import { PRODUCT_BY_ID, type Product, type ProductId } from '@/lib/products';
export type BundleId = 'normal' | 'premium';

export interface Bundle {
  id: BundleId;
  label: string;
  priceMultiplier: number;
  items: AccessoryId[];
}

export const BUNDLES: Record<BundleId, Bundle> = {
  normal: {
    id: 'normal',
    label: 'Normal',
    priceMultiplier: 1,
    items: ['handset', 'battery', 'charger', 'usb-cable', 'manual'],
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    priceMultiplier: 4,
    items: ['handset', 'battery', 'spare-battery', 'charger', 'usb-cable', 'earphones', 'case', 'manual'],
  },
};

export const BUNDLE_ORDER: BundleId[] = ['normal', 'premium'];

export function bundlePrice(product: Product, bundleId: BundleId): number {
  return product.basePrice * BUNDLES[bundleId].priceMultiplier;
}

export interface CartItem {
  productId: ProductId;
  colorId: string;
  bundleId: BundleId;
}

export interface Order extends CartItem {
  id: string;
  number: string;
  total: number;
  placedAt: number;
}

export const CONFIRMED_MS = 5_000;
export const PREPARING_MS = 1_500;
export const DELIVERY_MS = 1_800;

export type OrderStatus = 'confirmed' | 'preparing' | 'outForDelivery' | 'delivered';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  confirmed: 'ORDER CONFIRMED',
  preparing: 'PREPARING PACKAGE',
  outForDelivery: 'OUT FOR DELIVERY',
  delivered: 'DELIVERED',
};

export function orderStatusAt(placedAt: number, now: number): OrderStatus {
  const elapsed = now - placedAt;
  if (elapsed >= CONFIRMED_MS + PREPARING_MS + DELIVERY_MS) return 'delivered';
  if (elapsed >= CONFIRMED_MS + PREPARING_MS) return 'outForDelivery';
  if (elapsed >= CONFIRMED_MS) return 'preparing';
  return 'confirmed';
}

export function deliveryProgress(placedAt: number, now: number): number {
  const progress = (now - placedAt - CONFIRMED_MS - PREPARING_MS) / DELIVERY_MS;
  return Math.min(1, Math.max(0, progress));
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + bundlePrice(PRODUCT_BY_ID[item.productId], item.bundleId), 0);
}

export function formatDb(amount: number): string {
  return `${amount} DB`;
}

export function newOrderNumber(): string {
  return `DM-${Math.floor(100000 + Math.random() * 900000)}`;
}
