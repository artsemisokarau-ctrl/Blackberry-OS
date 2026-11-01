import type { CSSProperties, ReactNode } from 'react';
import BlackBerryLogo from '@/components/BlackBerryLogo';
import CameraLens from '@/components/CameraLens';
import ChargerCable from '@/components/ChargerCable';
import ControlPad from '@/components/ControlPad';
import Keyboard from '@/components/Keyboard';
import PhoneSides, { PHONE_DEPTH } from '@/components/PhoneSides';
import { useBatteryStatus } from '@/lib/battery';
import type { PhoneColor } from '@/lib/phoneColors';
import type { KeyInput } from '@/lib/keys';
import type { PhonePose, PoseBindings } from '@/hooks/usePhonePose';

interface PhoneBodyProps {
  screen: ReactNode;
  onKey: (key: KeyInput) => void;
  onPower: () => void;
  onVolume: (delta: number) => void;
  color: PhoneColor;
  pose: PhonePose;
  dragging: boolean;
  inspecting: boolean;
  bindings: PoseBindings;
}

const CHROME_EDGE =
  'linear-gradient(180deg, #e4e7ec 0%, #7d828b 50%, #2c2f35 100%)';

const FACE_FRAME: CSSProperties = { background: CHROME_EDGE, backfaceVisibility: 'hidden' };

function ChargeLed() {
  const { charging, plugged } = useBatteryStatus();
  const tone = charging
    ? 'bg-amber-300 shadow-[0_0_6px_2px_rgba(252,211,77,0.7)] animate-pulse'
    : plugged
      ? 'bg-emerald-400 shadow-[0_0_5px_1px_rgba(52,211,153,0.6)]'
      : 'bg-zinc-800 shadow-[inset_0_1px_1px_rgba(0,0,0,0.9)]';
  return <span aria-label="Charging light" role="img" className={`h-[5px] w-[5px] rounded-full ${tone}`} />;
}

export default function PhoneBody({
  screen,
  onKey,
  onPower,
  onVolume,
  color,
  pose,
  dragging,
  inspecting,
  bindings,
}: PhoneBodyProps) {
  const shellStyle: CSSProperties = {
    backgroundColor: color.base,
    transition: 'background-color 0.6s ease',
  };

  const inspectShield = inspecting ? (
    <div className="absolute inset-0 z-30 cursor-grab rounded-[62px]" aria-hidden="true" />
  ) : null;

  return (
    <div
      className="relative w-[380px] select-none"
      style={{ perspective: '1400px', filter: 'drop-shadow(0 36px 40px rgba(0,0,0,0.55))' }}
    >
      <div
        className="relative"
        {...bindings}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${pose.rotX}deg) rotateY(${pose.rotY}deg) scale(${pose.zoom})`,
          transition: dragging ? 'none' : 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
          touchAction: 'none',
          cursor: inspecting ? (dragging ? 'grabbing' : 'grab') : undefined,
        }}
      >
        <div
          className="relative rounded-[62px] p-[3px]"
          style={{ ...FACE_FRAME, transform: `translateZ(${PHONE_DEPTH / 2}px)` }}
        >
          <div
            className="bb-body relative flex flex-col items-center rounded-[59px] px-5 pb-5 pt-4"
            style={shellStyle}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[59px] bb-gloss" />

            <button
              type="button"
              aria-label="Power"
              onPointerDown={onPower}
              className="bb-side absolute -top-[3px] right-24 h-[7px] w-12 rounded-t-[4px]"
            />
            <div className="absolute -left-[3px] top-28 flex flex-col gap-3">
              <button
                type="button"
                aria-label="Volume up"
                onPointerDown={() => onVolume(1)}
                className="bb-side h-10 w-[7px] rounded-l-[4px]"
              />
              <button
                type="button"
                aria-label="Volume down"
                onPointerDown={() => onVolume(-1)}
                className="bb-side h-10 w-[7px] rounded-l-[4px]"
              />
            </div>

            <div className="relative flex h-4 items-center justify-center gap-3">
              <div className="h-[4px] w-[72px] rounded-full bg-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.95)] ring-1 ring-zinc-800" />
              <div className="absolute left-[calc(50%-58px)] top-1/2 -translate-y-1/2">
                <ChargeLed />
              </div>
              <div className="absolute left-[calc(50%+58px)] top-1/2 -translate-y-1/2">
                <CameraLens size={12} label="Front camera" />
              </div>
            </div>

            <BlackBerryLogo label="BlackBerry" tone={color.logoTone} className="mt-2 justify-center" />

            <div className="relative mt-2 rounded-[14px] bg-black p-2.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_0_0_1px_#0a0a0b]">
              <div className="relative h-[240px] w-[320px] overflow-hidden rounded-[3px] bg-black">
                {screen}
                <div className="pointer-events-none absolute inset-0 bb-glass" />
              </div>
            </div>

            <div className="mt-3 w-full">
              <ControlPad onKey={onKey} />
            </div>

            <div className="mt-3 w-full">
              <Keyboard onKey={onKey} />
            </div>

            <span
              aria-hidden="true"
              className="absolute bottom-0 left-1/2 h-[6px] w-[14px] -translate-x-1/2 rounded-b-[3px] bg-black ring-1 ring-zinc-800"
            />
          </div>
          {inspectShield}
        </div>

        <div
          className="absolute inset-0 rounded-[62px] p-[3px]"
          style={{ ...FACE_FRAME, transform: `rotateY(180deg) translateZ(${PHONE_DEPTH / 2}px)` }}
        >
          <div className="bb-body relative h-full rounded-[59px] px-5 pb-5 pt-4" style={shellStyle}>
            <div className="pointer-events-none absolute inset-0 rounded-[59px] bb-gloss" />
            <div className="pointer-events-none absolute inset-x-7 bottom-[88px] top-[120px] rounded-[30px] ring-1 ring-black/30 shadow-[inset_0_2px_6px_rgba(0,0,0,0.25),0_1px_0_rgba(255,255,255,0.08)]" />

            <div className="relative mt-10 flex items-center justify-center gap-5">
              <CameraLens size={30} label="Rear camera" />
              <div
                aria-label="LED flash"
                role="img"
                className="h-[9px] w-[9px] rounded-full bg-[radial-gradient(circle_at_40%_35%,#f7f3e6_0%,#c9c2ad_45%,#5d5a50_100%)] shadow-[0_1px_1px_rgba(0,0,0,0.7),inset_0_0_1px_rgba(0,0,0,0.6)] ring-1 ring-black/60"
              />
            </div>

            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <BlackBerryLogo label="BlackBerry" tone={color.logoTone} size="lg" className="justify-center" />
            </div>
          </div>
          {inspectShield}
        </div>

        <PhoneSides color={color} />
      </div>

      <ChargerCable />
    </div>
  );
}
