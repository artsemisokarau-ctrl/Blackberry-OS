import { useRef, type CSSProperties, type PointerEvent } from 'react';
import BlackBerryLogo from '@/components/BlackBerryLogo';
import { AccessoryVisual, type Accessory, type AccessoryId } from '@/components/unbox/boxContents';

export const BOX_WIDTH = 340;
const LID_HEIGHT = 150;
const BODY_HEIGHT = 310;
const SEAL_TOP = LID_HEIGHT - 8;
const DRAG_THRESHOLD_PX = 6;

export type BoxStage = 'sealed' | 'cut' | 'open' | 'done';

export interface ItemDrag {
  id: AccessoryId;
  dx: number;
  dy: number;
}

interface RetailBoxProps {
  items: Accessory[];
  brand: string;
  model: string;
  stage: BoxStage;
  cutProgress: number;
  knifeSelected: boolean;
  selectedId: AccessoryId | null;
  removed: readonly AccessoryId[];
  drag: ItemDrag | null;
  onSealPress: () => void;
  onCutDelta: (distance: number) => void;
  onLift: () => void;
  onItemPress: (id: AccessoryId) => void;
  onItemDrag: (dx: number, dy: number) => void;
  onItemRelease: (id: AccessoryId, release: { moved: boolean; outside: boolean }) => void;
}

const LID_OPEN = 'rotateX(-165deg)';
const LID_TRANSITION = 'transform 1.1s cubic-bezier(0.3, 0.7, 0.2, 1)';
const CARTON = 'bg-gradient-to-b from-[#2a2d33] via-[#1b1d22] to-[#101114]';

const FACE: CSSProperties = { backfaceVisibility: 'hidden' };

function BoxBrand({ brand }: { brand: string }) {
  if (brand === 'BlackBerry') {
    return <BlackBerryLogo label="BlackBerry" tone="light" size="lg" className="justify-center" />;
  }
  return <p className="text-base font-semibold tracking-[0.3em] text-zinc-200">{brand.toUpperCase()}</p>;
}

export default function RetailBox({
  items,
  brand,
  model,
  stage,
  cutProgress,
  knifeSelected,
  selectedId,
  removed,
  drag,
  onSealPress,
  onCutDelta,
  onLift,
  onItemPress,
  onItemDrag,
  onItemRelease,
}: RetailBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const sealLastX = useRef<number | null>(null);
  const itemOrigin = useRef<{ id: AccessoryId; x: number; y: number } | null>(null);
  const lidOpen = stage === 'open' || stage === 'done';
  const sealed = stage === 'sealed';

  const onSealDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!sealed) return;
    if (!knifeSelected) {
      onSealPress();
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    sealLastX.current = event.clientX;
  };

  const onSealMove = (event: PointerEvent<HTMLDivElement>) => {
    if (sealLastX.current === null) return;
    onCutDelta(Math.abs(event.clientX - sealLastX.current));
    sealLastX.current = event.clientX;
  };

  const onSealUp = () => {
    sealLastX.current = null;
  };

  const onItemDown = (id: AccessoryId, event: PointerEvent<HTMLDivElement>) => {
    if (stage !== 'open') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    itemOrigin.current = { id, x: event.clientX, y: event.clientY };
    onItemPress(id);
  };

  const onItemMove = (event: PointerEvent<HTMLDivElement>) => {
    const origin = itemOrigin.current;
    if (!origin) return;
    onItemDrag(event.clientX - origin.x, event.clientY - origin.y);
  };

  const onItemUp = (event: PointerEvent<HTMLDivElement>) => {
    const origin = itemOrigin.current;
    if (!origin) return;
    itemOrigin.current = null;
    const moved = Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > DRAG_THRESHOLD_PX;
    const rect = boxRef.current?.getBoundingClientRect();
    const outside = rect
      ? event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
      : false;
    onItemRelease(origin.id, { moved, outside });
  };

  return (
    <div
      ref={boxRef}
      className="relative select-none"
      style={{ width: BOX_WIDTH, height: LID_HEIGHT + BODY_HEIGHT, perspective: '1400px' }}
    >
      <div
        className="absolute left-0 top-[150px] overflow-hidden rounded-b-[10px] shadow-[0_30px_40px_-14px_rgba(0,0,0,0.9)]"
        style={{ width: BOX_WIDTH, height: BODY_HEIGHT }}
      >
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-3 ${CARTON} ring-1 ring-white/10 transition-opacity duration-700 ${lidOpen ? 'opacity-0' : 'opacity-100'}`}
        >
          <BoxBrand brand={brand} />
          <p className="text-[11px] font-semibold tracking-[0.35em] text-zinc-300">{model.toUpperCase()}</p>
          <span className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-400 to-transparent" />
          <p className="text-[9px] tracking-[0.25em] text-zinc-500">SMARTPHONE</p>
        </div>

        <div
          className={`absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,#3a3f47_0%,#1a1c21_70%)] transition-opacity duration-700 ${lidOpen ? 'opacity-100 delay-300' : 'pointer-events-none opacity-0'}`}
        >
          <div className="absolute inset-x-3 top-3 h-[calc(100%-24px)] rounded-[12px] bg-[#16181c] shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)]" />
          {items.filter((accessory) => !removed.includes(accessory.id)).map((accessory) => {
            const { slot, id } = accessory;
            return (
              <div
                key={`well-${id}`}
                className="absolute rounded-[12px] bg-black/45 shadow-[inset_0_3px_8px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.06)]"
                style={{ left: slot.left - 6, top: slot.top - 6, width: slot.width + 12, height: slot.height + 12 }}
              />
            );
          })}
          {items.filter((accessory) => !removed.includes(accessory.id)).map((accessory) => {
            const { slot, id } = accessory;
            const offset = drag?.id === id ? drag : { dx: 0, dy: 0 };
            const dragging = drag?.id === id;
            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                aria-label={accessory.label}
                onPointerDown={(event) => onItemDown(id, event)}
                onPointerMove={onItemMove}
                onPointerUp={onItemUp}
                onPointerCancel={onItemUp}
                className={`absolute cursor-grab touch-none ${selectedId === id ? 'rounded-[10px] ring-2 ring-sky-400/80' : ''}`}
                style={{
                  left: slot.left,
                  top: slot.top,
                  width: slot.width,
                  height: slot.height,
                  transform: `translate(${offset.dx}px, ${offset.dy}px)`,
                  transition: dragging ? 'none' : 'transform 300ms ease-out',
                  zIndex: dragging ? 20 : 2,
                }}
              >
                <AccessoryVisual id={id} />
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="absolute left-0 top-0 origin-top"
        style={{
          width: BOX_WIDTH,
          height: LID_HEIGHT,
          transformStyle: 'preserve-3d',
          transform: lidOpen ? LID_OPEN : 'rotateX(0deg)',
          transition: LID_TRANSITION,
          zIndex: lidOpen ? 1 : 10,
        }}
        onClick={() => {
          if (stage === 'cut') onLift();
        }}
      >
        <div
          className={`absolute inset-0 rounded-t-[10px] ${CARTON} ring-1 ring-white/10 ${stage === 'cut' ? 'cursor-pointer' : ''}`}
          style={FACE}
        >
          <div className="absolute inset-x-6 bottom-4 h-px bg-gradient-to-r from-transparent via-zinc-500 to-transparent" />
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <BoxBrand brand={brand} />
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-t-[10px] bg-gradient-to-b from-[#c9ccd3] to-[#8e939c] ring-1 ring-black/30"
          style={{ ...FACE, transform: 'rotateX(180deg)' }}
        >
          <div className="flex h-full items-center justify-center">
            <span className="text-[9px] font-semibold tracking-[0.3em] text-zinc-700">INSIDE LID</span>
          </div>
        </div>
      </div>

      <div
        role="button"
        tabIndex={sealed ? 0 : -1}
        aria-label="Box seal"
        onPointerDown={onSealDown}
        onPointerMove={onSealMove}
        onPointerUp={onSealUp}
        onPointerCancel={onSealUp}
        className={`absolute left-0 z-30 touch-none overflow-visible transition-opacity duration-500 ${sealed ? (knifeSelected ? 'cursor-crosshair' : 'cursor-pointer') : 'pointer-events-none opacity-0'}`}
        style={{ top: SEAL_TOP, width: BOX_WIDTH, height: 16 }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[2px] bg-gradient-to-r from-zinc-300/80 via-zinc-100/90 to-zinc-300/80 shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-y-0 left-0 bg-zinc-900/70" style={{ width: `${cutProgress * 100}%` }} />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[7px] font-bold tracking-[0.3em] text-zinc-700">
            OPEN HERE
          </span>
        </div>
        {sealed && knifeSelected && (
          <div
            className="pointer-events-none absolute -top-[18px] h-10 w-16 -translate-x-[24px] transition-[left] duration-150"
            style={{ left: cutProgress * (BOX_WIDTH - 64) }}
          >
            <span className="absolute left-0 top-[14px] h-[10px] w-6 rounded-[3px] bg-gradient-to-b from-[#3d4149] to-[#15171b] ring-1 ring-black" />
            <span
              className="absolute left-6 top-[8px] h-[22px] w-[40px] bg-gradient-to-b from-[#f4f6f9] via-[#b9bec8] to-[#7b818c]"
              style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
