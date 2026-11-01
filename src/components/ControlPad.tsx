import { useRef, type PointerEvent, type ReactNode } from 'react';
import { CornerUpLeft, Menu, Phone, PhoneOff } from 'lucide-react';
import type { KeyInput } from '@/lib/keys';

const TRACKPAD_STEP = 14;

interface ControlPadProps {
  onKey: (key: KeyInput) => void;
}

interface DragState {
  x: number;
  y: number;
  moved: boolean;
}

export default function ControlPad({ onKey }: ControlPadProps) {
  const drag = useRef<DragState | null>(null);

  const handleTrackpadDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, moved: false };
  };

  const handleTrackpadMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    if (Math.abs(dx) >= TRACKPAD_STEP) {
      onKey(dx > 0 ? 'right' : 'left');
      state.x = event.clientX;
      state.moved = true;
    }
    if (Math.abs(dy) >= TRACKPAD_STEP) {
      onKey(dy > 0 ? 'down' : 'up');
      state.y = event.clientY;
      state.moved = true;
    }
  };

  const handleTrackpadUp = () => {
    const state = drag.current;
    drag.current = null;
    if (state && !state.moved) onKey('select');
  };

  const handleTrackpadCancel = () => {
    drag.current = null;
  };

  const handleWheel = (event: { deltaY: number }) => {
    if (Math.abs(event.deltaY) < 4) return;
    onKey(event.deltaY > 0 ? 'down' : 'up');
  };

  return (
    <div className="flex w-full items-center justify-between">
      <NavButton label="Call" className="bb-call text-white" onPress={() => onKey('call')}>
        <Phone className="h-4 w-4" strokeWidth={2.2} />
      </NavButton>
      <NavButton label="Menu" className="bb-key text-zinc-100" onPress={() => onKey('menu')}>
        <Menu className="h-4 w-4" strokeWidth={2} />
      </NavButton>
      <div
        role="button"
        aria-label="Trackpad"
        tabIndex={-1}
        data-no-rotate
        className="bb-trackpad relative h-[52px] w-[64px] touch-none rounded-[14px] ring-1 ring-white/20"
        onPointerDown={handleTrackpadDown}
        onPointerMove={handleTrackpadMove}
        onPointerUp={handleTrackpadUp}
        onPointerCancel={handleTrackpadCancel}
        onWheel={handleWheel}
      >
        <div className="pointer-events-none absolute inset-[8px] rounded-[9px] bg-gradient-to-b from-white/10 to-transparent" />
      </div>
      <NavButton label="Back" className="bb-key text-zinc-100" onPress={() => onKey('back')}>
        <CornerUpLeft className="h-4 w-4" strokeWidth={2} />
      </NavButton>
      <NavButton label="End" className="bb-end text-white" onPress={() => onKey('end')}>
        <PhoneOff className="h-4 w-4" strokeWidth={2.2} />
      </NavButton>
    </div>
  );
}

interface NavButtonProps {
  label: string;
  className: string;
  onPress: () => void;
  children: ReactNode;
}

function NavButton({ label, className, onPress, children }: NavButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={onPress}
      className={`${className} flex h-9 w-[52px] items-center justify-center rounded-[6px]`}
    >
      {children}
    </button>
  );
}
