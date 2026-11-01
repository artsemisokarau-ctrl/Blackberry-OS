import { useState } from 'react';
import ListRows, { type ListRow } from '@/components/ui/ListRows';
import { ActionList, accessoryNames, BoxThumb, useCursorKeys, type StoreAction } from '@/components/apps/store/StoreParts';
import PhoneSketch from '@/components/apps/store/PhoneSketch';
import { BUNDLE_ORDER, BUNDLES, bundlePrice, formatDb, type CartItem } from '@/lib/store';
import { CATEGORIES, PRODUCT_BY_ID, productModelName, productsInCategory, type CategoryId, type ProductId } from '@/lib/products';

interface CategoriesViewProps {
  onOpen: (categoryId: CategoryId) => void;
  onBack: () => void;
}

export function CategoriesView({ onOpen, onBack }: CategoriesViewProps) {
  const rows: ListRow[] = CATEGORIES.map((category) => ({
    id: category.id,
    primary: category.label,
    right: String(productsInCategory(category.id).length),
  }));
  const [cursor, setCursor] = useCursorKeys(rows.length, (index) => onOpen(CATEGORIES[index].id), onBack);

  return (
    <ListRows
      rows={rows}
      cursor={cursor}
      visible={4}
      onPress={(index) => {
        setCursor(index);
        onOpen(CATEGORIES[index].id);
      }}
    />
  );
}

interface CategoryViewProps {
  categoryId: CategoryId;
  onOpen: (productId: ProductId) => void;
  onBack: () => void;
}

export function CategoryView({ categoryId, onOpen, onBack }: CategoryViewProps) {
  const products = productsInCategory(categoryId);
  const rows: ListRow[] = products.map((product) => ({
    id: product.id,
    primary: product.name,
    secondary: `${product.brand} - from ${formatDb(product.basePrice)}`,
  }));
  const [cursor, setCursor] = useCursorKeys(rows.length, (index) => onOpen(products[index].id), onBack);

  return (
    <ListRows
      rows={rows}
      cursor={cursor}
      visible={4}
      empty="No phones in this category yet"
      onPress={(index) => {
        setCursor(index);
        onOpen(products[index].id);
      }}
    />
  );
}

interface ProductViewProps {
  productId: ProductId;
  onAdd: (item: CartItem) => void;
  onBack: () => void;
}

export function ProductView({ productId, onAdd, onBack }: ProductViewProps) {
  const product = PRODUCT_BY_ID[productId];
  const [colorIndex, setColorIndex] = useState(0);
  const [bundleIndex, setBundleIndex] = useState(0);
  const color = product.colors[colorIndex];
  const bundle = BUNDLES[BUNDLE_ORDER[bundleIndex]];
  const price = bundlePrice(product, bundle.id);
  const actions: StoreAction[] = [
    { label: `Colour: ${color.label}` },
    { label: `Bundle: ${bundle.label} ${formatDb(price)}` },
    { label: `Add to cart - ${formatDb(price)}` },
    { label: 'Back to store' },
  ];
  const press = (index: number) => {
    if (index === 0) setColorIndex((value) => (value + 1) % product.colors.length);
    else if (index === 1) setBundleIndex((value) => (value + 1) % BUNDLE_ORDER.length);
    else if (index === 2) onAdd({ productId, colorId: color.id, bundleId: bundle.id });
    else onBack();
  };
  const [cursor, setCursor] = useCursorKeys(actions.length, press, onBack);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
      <div className="flex items-center gap-3">
        <div className="flex h-[92px] w-[88px] shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-b from-[#1c2026] to-[#0b0c0f] ring-1 ring-white/10">
          {product.presentation === 'box' ? (
            <BoxThumb brand={product.brand} model={productModelName(product)} large />
          ) : (
            <PhoneSketch product={product} base={color.base} height={80} />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold leading-tight text-zinc-100">{product.name}</div>
          <div className="mt-0.5 text-[10px] text-zinc-400">{product.brand}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white/30" style={{ background: color.base }} />
            {color.label}
          </div>
          <div className="mt-0.5 text-sm font-bold text-[#7ed957]">{formatDb(price)}</div>
        </div>
      </div>
      <p className="text-[10px] leading-snug text-zinc-300">{product.summary}</p>
      <ul className="flex flex-col gap-[2px] text-[9px] text-zinc-400">
        {product.details.map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>
      <div className="rounded-[4px] bg-zinc-900 p-2 text-[9px] text-zinc-400">
        <div className="font-semibold text-zinc-200">{bundle.label} bundle includes</div>
        <div className="mt-0.5">{[`Phone in ${color.label}`, ...accessoryNames(bundle.items)].join(', ')}</div>
      </div>
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
