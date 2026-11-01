import { Check, Package, Truck } from 'lucide-react';
import { ActionList, useCursorKeys } from '@/components/apps/store/StoreParts';
import { useNow } from '@/hooks/useNow';
import { CONFIRMED_MS, deliveryProgress, orderStatusAt, STATUS_LABEL, type Order, type OrderStatus } from '@/lib/store';

interface StoreTrackingProps {
  order: Order;
  onBack: () => void;
}

const BACK_ACTIONS = [{ label: 'Back to orders' }];

const STEPS: { status: OrderStatus | 'placed'; label: string }[] = [
  { status: 'placed', label: 'ORDER PLACED' },
  { status: 'confirmed', label: STATUS_LABEL.confirmed },
  { status: 'preparing', label: STATUS_LABEL.preparing },
  { status: 'outForDelivery', label: STATUS_LABEL.outForDelivery },
  { status: 'delivered', label: STATUS_LABEL.delivered },
];

export default function StoreTracking({ order, onBack }: StoreTrackingProps) {
  const now = useNow(250).getTime();
  const status = orderStatusAt(order.placedAt, now);
  const progress = deliveryProgress(order.placedAt, now);
  const remaining = Math.max(0, Math.ceil((order.placedAt + CONFIRMED_MS - now) / 1000));
  const delivered = status === 'delivered';
  const currentStep = STEPS.findIndex((step) => step.status === status);
  const [cursor, setCursor] = useCursorKeys(BACK_ACTIONS.length, onBack, onBack);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-400">{order.number}</span>
        <span className={`text-[10px] font-bold tracking-wider ${delivered ? 'text-emerald-300' : 'text-sky-300'}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      <ol className="flex flex-col gap-1 rounded-[4px] bg-zinc-900 p-2">
        {STEPS.map((step, index) => {
          const done = index <= currentStep;
          return (
            <li key={step.status} className={`flex items-center gap-2 text-[10px] ${done ? 'text-zinc-100' : 'text-zinc-600'}`}>
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${done ? 'bg-[#7ed957] text-black' : 'bg-zinc-800'}`}
              >
                {done && <Check className="h-2.5 w-2.5" />}
              </span>
              {step.label}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col items-center gap-2 rounded-[4px] bg-zinc-900 px-3 py-3">
        <div className="relative h-[3px] w-full rounded-full bg-zinc-700">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#7ed957] transition-[width] duration-200"
            style={{ width: `${progress * 100}%` }}
          />
          <Truck
            aria-hidden="true"
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            style={{ left: `${progress * 100}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
        <Package
          aria-hidden="true"
          className={`h-7 w-7 ${delivered ? 'text-emerald-300' : 'text-zinc-400'} ${status === 'outForDelivery' ? 'animate-bounce' : ''}`}
        />
        <p className="text-center text-[10px] leading-snug text-zinc-300">
          {status === 'confirmed' && `Your order is confirmed. Preparing starts in ${remaining}s.`}
          {status === 'preparing' && 'Packing your phone and accessories.'}
          {status === 'outForDelivery' && 'Out for delivery to your virtual address.'}
          {status === 'delivered' && 'Delivered. Open it from My packages.'}
        </p>
      </div>

      <div className="mt-auto">
        <ActionList actions={BACK_ACTIONS} cursor={cursor} onPress={() => { setCursor(0); onBack(); }} />
      </div>
    </div>
  );
}
