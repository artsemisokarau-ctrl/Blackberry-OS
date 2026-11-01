import ListRows, { type ListRow } from '@/components/ui/ListRows';
import { accessoryNames, describeItem, useCursorKeys } from '@/components/apps/store/StoreParts';
import { useNow } from '@/hooks/useNow';
import type { StoreController } from '@/hooks/useStore';
import { findProductColor, PRODUCT_BY_ID } from '@/lib/products';
import { BUNDLES, orderStatusAt, STATUS_LABEL, type Order } from '@/lib/store';

interface OrdersViewProps {
  store: StoreController;
  onOpen: (order: Order) => void;
  onBack: () => void;
}

export function OrdersView({ store, onOpen, onBack }: OrdersViewProps) {
  const now = useNow(1000).getTime();
  const orders = store.state.orders;
  const rows: ListRow[] = orders.map((order) => ({
    id: order.id,
    primary: order.number,
    secondary: describeItem(order),
    right: STATUS_LABEL[orderStatusAt(order.placedAt, now)],
  }));
  const [cursor, setCursor] = useCursorKeys(orders.length, (index) => onOpen(orders[index]), onBack);

  return (
    <ListRows
      rows={rows}
      cursor={cursor}
      visible={4}
      empty="No orders yet"
      onPress={(index) => {
        setCursor(index);
        onOpen(orders[index]);
      }}
    />
  );
}

interface PackagesViewProps {
  store: StoreController;
  onUnbox: (orderId: string) => void;
  onBack: () => void;
}

export function PackagesView({ store, onUnbox, onBack }: PackagesViewProps) {
  const now = useNow(1000).getTime();
  const { orders, openedOrderIds } = store.state;
  const delivered = orders.filter((order) => orderStatusAt(order.placedAt, now) === 'delivered');
  const rows: ListRow[] = delivered.map((order) => ({
    id: order.id,
    primary: PRODUCT_BY_ID[order.productId].name,
    secondary: `${BUNDLES[order.bundleId].label} bundle - ${order.number}`,
    right: openedOrderIds.includes(order.id) ? 'Opened' : 'Unbox',
  }));
  const press = (index: number) => {
    const order = delivered[index];
    if (order && !openedOrderIds.includes(order.id)) onUnbox(order.id);
  };
  const [cursor, setCursor] = useCursorKeys(delivered.length, press, onBack);

  return (
    <ListRows
      rows={rows}
      cursor={cursor}
      visible={4}
      empty="No delivered packages"
      onPress={(index) => {
        setCursor(index);
        press(index);
      }}
    />
  );
}

interface AccessoriesViewProps {
  store: StoreController;
  onBack: () => void;
}

export function AccessoriesView({ store, onBack }: AccessoriesViewProps) {
  const { orders, openedOrderIds } = store.state;
  const rows: ListRow[] = orders
    .filter((order) => openedOrderIds.includes(order.id))
    .flatMap((order) =>
      accessoryNames(BUNDLES[order.bundleId].items).map((label) => ({
        id: `${order.id}-${label}`,
        primary: label,
        secondary: describeItem(order),
      })),
    );
  const [cursor, setCursor] = useCursorKeys(rows.length, () => undefined, onBack);

  return (
    <ListRows
      rows={rows}
      cursor={cursor}
      visible={4}
      empty="No accessories yet. Unbox a package to add them."
      onPress={setCursor}
    />
  );
}

interface PhonesViewProps {
  store: StoreController;
  onBack: () => void;
}

export function PhonesView({ store, onBack }: PhonesViewProps) {
  const { orders, openedOrderIds } = store.state;
  const phones = orders.filter((order) => openedOrderIds.includes(order.id));
  const rows: ListRow[] = phones.map((order) => ({
    id: order.id,
    primary: PRODUCT_BY_ID[order.productId].name,
    secondary: `${findProductColor(PRODUCT_BY_ID[order.productId], order.colorId).label} - ${order.number}`,
  }));
  const [cursor, setCursor] = useCursorKeys(phones.length, () => undefined, onBack);

  return (
    <ListRows
      rows={rows}
      cursor={cursor}
      visible={4}
      empty="No phones yet. Unbox a delivered package to take one out."
      onPress={setCursor}
    />
  );
}
