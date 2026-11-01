import { useState, type ReactNode } from 'react';
import ListRows, { type ListRow } from '@/components/ui/ListRows';
import { useCursorKeys } from '@/components/apps/store/StoreParts';
import { CategoriesView, CategoryView, ProductView } from '@/components/apps/store/StoreCatalogue';
import { CartView, ConfirmView, PlacedView } from '@/components/apps/store/StoreCheckout';
import StoreTracking from '@/components/apps/store/StoreTracking';
import { AccessoriesView, OrdersView, PackagesView, PhonesView } from '@/components/apps/store/StoreAccount';
import type { StoreController } from '@/hooks/useStore';
import { CATEGORIES, PRODUCTS, type CategoryId, type ProductId } from '@/lib/products';
import { formatDb, type Order } from '@/lib/store';

export type StoreView =
  | { kind: 'menu' }
  | { kind: 'categories' }
  | { kind: 'category'; id: CategoryId }
  | { kind: 'product'; id: ProductId; from: CategoryId }
  | { kind: 'cart' }
  | { kind: 'confirm' }
  | { kind: 'placed'; orders: Order[] }
  | { kind: 'tracking'; order: Order }
  | { kind: 'orders' }
  | { kind: 'packages' }
  | { kind: 'accessories' }
  | { kind: 'phones' };

interface StoreSiteProps {
  store: StoreController;
  onUnbox: (orderId: string) => void;
}

export default function StoreSite({ store, onUnbox }: StoreSiteProps) {
  const [view, setView] = useState<StoreView>({ kind: 'menu' });

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="text-[11px] font-bold tracking-[0.2em]">DOOMBERRY STORE</span>
        <span className="text-[10px] text-zinc-400">Balance {formatDb(store.balance)}</span>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{renderView(view, store, setView, onUnbox)}</div>
    </div>
  );
}

function renderView(
  view: StoreView,
  store: StoreController,
  navigate: (next: StoreView) => void,
  onUnbox: (orderId: string) => void,
): ReactNode {
  const toMenu = () => navigate({ kind: 'menu' });

  switch (view.kind) {
    case 'menu':
      return <MenuView store={store} onOpen={navigate} />;
    case 'categories':
      return <CategoriesView onOpen={(id) => navigate({ kind: 'category', id })} onBack={toMenu} />;
    case 'category':
      return (
        <CategoryView
          categoryId={view.id}
          onOpen={(id) => navigate({ kind: 'product', id, from: view.id })}
          onBack={() => navigate({ kind: 'categories' })}
        />
      );
    case 'product':
      return (
        <ProductView
          productId={view.id}
          onAdd={(item) => {
            store.addToCart(item);
            navigate({ kind: 'cart' });
          }}
          onBack={() => navigate({ kind: 'category', id: view.from })}
        />
      );
    case 'cart':
      return <CartView store={store} onCheckout={() => navigate({ kind: 'confirm' })} onBack={toMenu} />;
    case 'confirm':
      return (
        <ConfirmView
          store={store}
          onPlaced={(orders) => navigate({ kind: 'placed', orders })}
          onBack={() => navigate({ kind: 'cart' })}
        />
      );
    case 'placed':
      return (
        <PlacedView
          orders={view.orders}
          onTrack={(order) => navigate({ kind: 'tracking', order })}
          onDone={toMenu}
        />
      );
    case 'tracking':
      return <StoreTracking order={view.order} onBack={() => navigate({ kind: 'orders' })} />;
    case 'orders':
      return <OrdersView store={store} onOpen={(order) => navigate({ kind: 'tracking', order })} onBack={toMenu} />;
    case 'packages':
      return <PackagesView store={store} onUnbox={onUnbox} onBack={toMenu} />;
    case 'accessories':
      return <AccessoriesView store={store} onBack={toMenu} />;
    case 'phones':
      return <PhonesView store={store} onBack={toMenu} />;
  }
}

interface MenuViewProps {
  store: StoreController;
  onOpen: (next: StoreView) => void;
}

function MenuView({ store, onOpen }: MenuViewProps) {
  const { cart, orders, openedOrderIds } = store.state;
  const targets: StoreView[] = [
    { kind: 'categories' },
    { kind: 'cart' },
    { kind: 'orders' },
    { kind: 'packages' },
    { kind: 'accessories' },
    { kind: 'phones' },
  ];
  const rows: ListRow[] = [
    {
      id: 'shop',
      primary: 'Shop phones',
      secondary: `${PRODUCTS.length} phones in ${CATEGORIES.length - 1} categories`,
    },
    { id: 'cart', primary: 'My cart', right: String(cart.length) },
    { id: 'orders', primary: 'My orders', right: String(orders.length) },
    { id: 'packages', primary: 'My packages' },
    { id: 'accessories', primary: 'My accessories' },
    { id: 'phones', primary: 'My phones', right: String(openedOrderIds.length) },
  ];

  const [cursor, setCursor] = useCursorKeys(rows.length, (index) => onOpen(targets[index]));

  return (
    <ListRows
      rows={rows}
      cursor={cursor}
      visible={4}
      onPress={(index) => {
        setCursor(index);
        onOpen(targets[index]);
      }}
    />
  );
}
