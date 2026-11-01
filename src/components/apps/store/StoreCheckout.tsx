import { useRef, useState } from 'react';
import { ActionList, accessoryNames, describeItem, useCursorKeys, type StoreAction } from '@/components/apps/store/StoreParts';
import type { StoreController } from '@/hooks/useStore';
import { PRODUCT_BY_ID } from '@/lib/products';
import { BUNDLES, bundlePrice, cartTotal, formatDb, type Order } from '@/lib/store';

interface CartViewProps {
  store: StoreController;
  onCheckout: () => void;
  onBack: () => void;
}

export function CartView({ store, onCheckout, onBack }: CartViewProps) {
  const cart = store.state.cart;
  const total = cartTotal(cart);
  const actions: StoreAction[] = [
    ...cart.map((_item, index) => ({ label: `Remove item ${index + 1}`, danger: true })),
    { label: `Checkout ${formatDb(total)}`, disabled: cart.length === 0 },
    { label: 'Back to store' },
  ];

  const press = (index: number) => {
    if (index >= actions.length) return;
    if (index < cart.length) store.removeFromCart(index);
    else if (index === cart.length) {
      if (cart.length > 0) onCheckout();
    } else onBack();
  };

  const [cursor, setCursor] = useCursorKeys(actions.length, press, onBack);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
      {cart.length === 0 ? (
        <p className="text-[11px] text-zinc-300">Your cart is empty.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {cart.map((item, index) => (
            <li key={index} className="rounded-[4px] bg-zinc-900 p-2 text-[10px] text-zinc-300">
              <div className="font-semibold text-zinc-100">{describeItem(item)}</div>
              <div className="mt-0.5 text-[#7ed957]">{formatDb(bundlePrice(PRODUCT_BY_ID[item.productId], item.bundleId))}</div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto">
        <ActionList
          actions={actions}
          cursor={cursor}
          onPress={(index) => {
            setCursor(index);
            press(index);
          }}
        />
      </div>
    </div>
  );
}

interface ConfirmViewProps {
  store: StoreController;
  onPlaced: (orders: Order[]) => void;
  onBack: () => void;
}

export function ConfirmView({ store, onPlaced, onBack }: ConfirmViewProps) {
  const [notice, setNotice] = useState('');
  const submitted = useRef(false);
  const { cart } = store.state;
  const balance = store.balance;
  const total = cartTotal(cart);
  const canPay = cart.length > 0 && balance >= total;
  const actions: StoreAction[] = [
    { label: `Confirm purchase ${formatDb(total)}`, disabled: !canPay },
    { label: 'Cancel' },
  ];

  const confirm = () => {
    if (submitted.current) return;
    submitted.current = true;
    const result = store.checkout();
    if (result.ok) {
      onPlaced(result.orders);
      return;
    }
    submitted.current = false;
    setNotice(result.reason === 'empty' ? 'Your cart is empty.' : 'Not enough DB coins.');
  };

  const press = (index: number) => (index === 0 ? confirm() : onBack());
  const [cursor, setCursor] = useCursorKeys(actions.length, press, onBack);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
      <p className="text-[11px] font-semibold text-zinc-100">Confirm fictional purchase</p>
      <p className="text-[10px] leading-snug text-zinc-400">
        This uses your DOOMBERRY COINS (DB) only. No real money or payment details are involved.
      </p>
      <ul className="flex flex-col gap-1.5">
        {cart.map((item, index) => (
          <li key={index} className="rounded-[4px] bg-zinc-900 p-2 text-[10px] text-zinc-300">
            <div className="font-semibold text-zinc-100">{describeItem(item)}</div>
            <div className="mt-0.5 text-zinc-400">
              {accessoryNames(BUNDLES[item.bundleId].items).join(', ')}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-1 rounded-[4px] bg-zinc-900 p-2 text-[10px] text-zinc-300">
        <div className="flex justify-between">
          <span>Total</span>
          <span className="font-semibold text-zinc-100">{formatDb(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>DB balance</span>
          <span>{formatDb(balance)}</span>
        </div>
      </div>
      {notice && <p className="text-[10px] text-amber-300">{notice}</p>}
      <div className="mt-auto">
        <ActionList
          actions={actions}
          cursor={cursor}
          onPress={(index) => {
            setCursor(index);
            press(index);
          }}
        />
      </div>
    </div>
  );
}

interface PlacedViewProps {
  orders: Order[];
  onTrack: (order: Order) => void;
  onDone: () => void;
}

export function PlacedView({ orders, onTrack, onDone }: PlacedViewProps) {
  const actions: StoreAction[] = [
    ...orders.map((order) => ({ label: `Track ${order.number}` })),
    { label: 'Back to store' },
  ];

  const press = (index: number) => {
    const order = orders[index];
    if (order) onTrack(order);
    else onDone();
  };

  const [cursor, setCursor] = useCursorKeys(actions.length, press, onDone);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
      <p className="text-[11px] font-semibold text-emerald-300">Order confirmed</p>
      <p className="text-[10px] leading-snug text-zinc-400">
        Delivery starts in a few seconds. Keep these numbers for your records.
      </p>
      <ul className="flex flex-col gap-[2px] text-[10px] text-zinc-200">
        {orders.map((order) => (
          <li key={order.id}>
            {order.number} - {describeItem(order)}
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <ActionList
          actions={actions}
          cursor={cursor}
          onPress={(index) => {
            setCursor(index);
            press(index);
          }}
        />
      </div>
    </div>
  );
}
