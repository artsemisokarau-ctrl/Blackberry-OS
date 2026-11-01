import { useState } from 'react';
import { ArrowUp, Check, Scissors, X } from 'lucide-react';
import RetailBox, { type BoxStage, type ItemDrag } from '@/components/unbox/RetailBox';
import { AccessoryVisual, ACCESSORIES, type AccessoryId } from '@/components/unbox/boxContents';
import { BUTTON_CLASS } from '@/components/ui/buttonStyles';
import { productModelName, type Product } from '@/lib/products';

const CUT_TRAVEL = 300;
const HANDSET_ID: AccessoryId = 'handset';
const PREVIEW_MAX_PX = 170;

const STAGE_TEXT: Record<Exclude<BoxStage, 'done'>, string> = {
  sealed: 'Select the unboxing knife, then drag it along the seal to cut it.',
  cut: 'The seal is cut. Lift the lid to open the box.',
  open: 'Drag each item out of the box. The handset comes last.',
};

interface UnboxingOverlayProps {
  product: Product;
  itemIds: AccessoryId[];
  onClose: () => void;
  onComplete: () => void;
}

export default function UnboxingOverlay({ product, itemIds, onClose, onComplete }: UnboxingOverlayProps) {
  const items = ACCESSORIES.filter((accessory) => itemIds.includes(accessory.id)).map((accessory) =>
    accessory.id === HANDSET_ID ? { ...accessory, label: product.name, description: product.handsetNote } : accessory,
  );
  const otherItemCount = items.length - 1;
  const [knifeSelected, setKnifeSelected] = useState(false);
  const [cutDistance, setCutDistance] = useState(0);
  const [lifted, setLifted] = useState(false);
  const [removed, setRemoved] = useState<AccessoryId[]>([]);
  const [selectedId, setSelectedId] = useState<AccessoryId | null>(null);
  const [drag, setDrag] = useState<ItemDrag | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const cut = cutDistance >= CUT_TRAVEL;
  const stage: BoxStage = !cut ? 'sealed' : !lifted ? 'cut' : removed.includes(HANDSET_ID) ? 'done' : 'open';
  const selected = items.find((accessory) => accessory.id === selectedId) ?? null;
  const previewScale = selected
    ? Math.min(1.6, PREVIEW_MAX_PX / selected.slot.width, PREVIEW_MAX_PX / selected.slot.height)
    : 1;

  const handleSealPress = () => setHint('Select the unboxing knife first.');

  const handleCutDelta = (distance: number) => {
    setHint(null);
    setCutDistance((value) => Math.min(CUT_TRAVEL, value + distance));
  };

  const handleLift = () => {
    if (cut) setLifted(true);
  };

  const handleItemPress = (id: AccessoryId) => {
    setSelectedId(id);
    if (id === HANDSET_ID && removed.length < otherItemCount) {
      setHint('Take the other items out first.');
      return;
    }
    setHint(null);
    setDrag({ id, dx: 0, dy: 0 });
  };

  const handleItemDrag = (dx: number, dy: number) => {
    setDrag((current) => (current ? { ...current, dx, dy } : current));
  };

  const handleItemRelease = (id: AccessoryId, release: { moved: boolean; outside: boolean }) => {
    const wasDragging = drag?.id === id;
    setDrag(null);
    if (!release.moved || !wasDragging || !release.outside) return;
    setRemoved((list) => [...list, id]);
    setSelectedId(id);
    setHint(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Unbox the ${product.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-4xl rounded-[28px] bg-zinc-950 p-6 shadow-2xl ring-1 ring-white/10 md:p-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Unboxing</p>
            <h2 className="text-xl font-semibold text-zinc-100">{product.name}</h2>
          </div>
          <button
            type="button"
            aria-label="Close unboxing"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <p className="mt-4 text-sm text-zinc-300">{stage === 'done' ? `Your ${product.name} is out of the box.` : STAGE_TEXT[stage]}</p>
        <p className="mt-2 h-4 text-xs text-amber-300" role="status">
          {hint ?? ''}
        </p>

        <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="flex min-h-[620px] items-end justify-center">
            <RetailBox
              items={items}
              brand={product.brand}
              model={productModelName(product)}
              stage={stage}
              cutProgress={cutDistance / CUT_TRAVEL}
              knifeSelected={knifeSelected}
              selectedId={selectedId}
              removed={removed}
              drag={drag}
              onSealPress={handleSealPress}
              onCutDelta={handleCutDelta}
              onLift={handleLift}
              onItemPress={handleItemPress}
              onItemDrag={handleItemDrag}
              onItemRelease={handleItemRelease}
            />
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl bg-zinc-900/80 p-4 ring-1 ring-white/10">
              {selected ? (
                <>
                  <p className="text-sm font-semibold text-zinc-100">{selected.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{selected.description}</p>
                  <div className="mt-4 flex h-[190px] items-center justify-center rounded-xl bg-[radial-gradient(ellipse_at_50%_30%,#2b3038_0%,#101216_75%)]">
                    <div
                      style={{
                        width: selected.slot.width * previewScale,
                        height: selected.slot.height * previewScale,
                      }}
                    >
                      <AccessoryVisual id={selected.id} />
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-zinc-500">
                    {removed.includes(selected.id) ? 'Out of the box.' : 'Drag it out of the box to take it out.'}
                  </p>
                </>
              ) : (
                <p className="text-xs text-zinc-400">Select an item in the box to inspect it.</p>
              )}
            </div>

            <div className="rounded-2xl bg-zinc-900/60 p-4 ring-1 ring-white/10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                Out of the box ({removed.length}/{items.length})
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {removed.length === 0 && <li className="text-xs text-zinc-500">Nothing yet.</li>}
                {removed.map((id) => {
                  const accessory = items.find((item) => item.id === id);
                  if (!accessory) return null;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(id)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-zinc-200 transition hover:bg-white/5"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        {accessory.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>

        <footer className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {stage === 'sealed' && (
            <button
              type="button"
              aria-pressed={knifeSelected}
              onClick={() => setKnifeSelected((value) => !value)}
              className={`${BUTTON_CLASS} flex items-center gap-2 ${knifeSelected ? 'border-sky-400 text-sky-200' : ''}`}
            >
              <Scissors className="h-3.5 w-3.5" />
              {knifeSelected ? 'Knife selected' : 'Select unboxing knife'}
            </button>
          )}
          {stage === 'cut' && (
            <button type="button" onClick={handleLift} className={`${BUTTON_CLASS} flex items-center gap-2`}>
              <ArrowUp className="h-3.5 w-3.5" />
              Lift the lid
            </button>
          )}
          {stage === 'done' && (
            <button type="button" onClick={onComplete} className={`${BUTTON_CLASS} flex items-center gap-2`}>
              <Check className="h-3.5 w-3.5" />
              Start using your phone
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
