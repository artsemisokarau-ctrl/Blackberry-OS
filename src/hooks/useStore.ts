import { usePersistentState } from '@/hooks/usePersistentState';
import type { WalletController } from '@/hooks/useWallet';
import { newId, STORAGE_KEYS } from '@/lib/records';
import { bundlePrice, cartTotal, newOrderNumber, type CartItem, type Order } from '@/lib/store';
import { PRODUCT_BY_ID } from '@/lib/products';

export interface StoreState {
  cart: CartItem[];
  orders: Order[];
  openedOrderIds: string[];
}

export type CheckoutResult = { ok: true; orders: Order[] } | { ok: false; reason: 'empty' | 'funds' };

const INITIAL_STORE: StoreState = {
  cart: [],
  orders: [],
  openedOrderIds: [],
};

export function useStore(wallet: WalletController) {
  const [state, setState] = usePersistentState<StoreState>(STORAGE_KEYS.store, INITIAL_STORE);

  const addToCart = (item: CartItem) => setState((prev) => ({ ...prev, cart: [...prev.cart, item] }));

  const removeFromCart = (index: number) =>
    setState((prev) => ({ ...prev, cart: prev.cart.filter((_, position) => position !== index) }));

  const checkout = (): CheckoutResult => {
    if (state.cart.length === 0) return { ok: false, reason: 'empty' };
    const total = cartTotal(state.cart);
    const count = state.cart.length;
    const label = `Store order (${count} item${count === 1 ? '' : 's'})`;
    if (!wallet.spend(label, total)) return { ok: false, reason: 'funds' };
    const placedAt = Date.now();
    const orders: Order[] = state.cart.map((item) => ({
      ...item,
      id: newId(),
      number: newOrderNumber(),
      total: bundlePrice(PRODUCT_BY_ID[item.productId], item.bundleId),
      placedAt,
    }));
    setState((prev) => ({
      ...prev,
      cart: [],
      orders: [...orders, ...prev.orders],
    }));
    wallet.bump('orders');
    return { ok: true, orders };
  };

  const markOpened = (orderId: string) =>
    setState((prev) =>
      prev.openedOrderIds.includes(orderId) ? prev : { ...prev, openedOrderIds: [...prev.openedOrderIds, orderId] },
    );

  return { state, balance: wallet.state.balance, addToCart, removeFromCart, checkout, markOpened };
}

export type StoreController = ReturnType<typeof useStore>;
