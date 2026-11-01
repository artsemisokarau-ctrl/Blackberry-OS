import type { CSSProperties } from 'react';
import type { PhoneColor } from '@/lib/phoneColors';

export const PHONE_WIDTH = 380;
export const PHONE_DEPTH = 80;
const SIDE_INSET = 44;

const CHROME = '#8a9099';

const faceShade = (color: string, angle = 90): CSSProperties['background'] =>
  `linear-gradient(${angle}deg, ${CHROME} 0%, ${color} 7%, ${color} 93%, ${CHROME} 100%)`;

const faceBase: CSSProperties = {
  backfaceVisibility: 'hidden',
  transition: 'background 0.6s ease',
};

interface PhoneSidesProps {
  color: PhoneColor;
}

export default function PhoneSides({ color }: PhoneSidesProps) {
  const shade = faceShade(color.base);
  const edgeShade = faceShade(color.base, 180);
  return (
    <>
      <div
        className="absolute cursor-grab"
        style={{
          ...faceBase,
          background: shade,
          top: SIDE_INSET,
          bottom: SIDE_INSET,
          left: '50%',
          width: PHONE_DEPTH,
          marginLeft: -PHONE_DEPTH / 2,
          transform: `rotateY(-90deg) translateZ(${PHONE_WIDTH / 2}px)`,
        }}
      >
        <span className="absolute left-1/2 top-[28%] h-10 w-[7px] -translate-x-1/2 rounded-[3px] bg-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
        <span className="absolute left-1/2 top-[calc(28%+52px)] h-10 w-[7px] -translate-x-1/2 rounded-[3px] bg-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
      </div>

      <div
        className="absolute cursor-grab"
        style={{
          ...faceBase,
          background: shade,
          top: SIDE_INSET,
          bottom: SIDE_INSET,
          left: '50%',
          width: PHONE_DEPTH,
          marginLeft: -PHONE_DEPTH / 2,
          transform: `rotateY(90deg) translateZ(${PHONE_WIDTH / 2}px)`,
        }}
      />

      <div
        className="absolute cursor-grab"
        style={{
          ...faceBase,
          background: edgeShade,
          left: SIDE_INSET,
          right: SIDE_INSET,
          top: 0,
          height: PHONE_DEPTH,
          marginTop: -PHONE_DEPTH / 2,
          transform: 'rotateX(90deg)',
        }}
      >
        <span className="absolute left-[18%] top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-black/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.9)]" />
        <span className="absolute right-[18%] top-1/2 h-[9px] w-12 -translate-y-1/2 rounded-full bg-black/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]" />
      </div>

      <div
        className="absolute cursor-grab"
        style={{
          ...faceBase,
          background: edgeShade,
          left: SIDE_INSET,
          right: SIDE_INSET,
          bottom: 0,
          height: PHONE_DEPTH,
          marginBottom: -PHONE_DEPTH / 2,
          transform: 'rotateX(-90deg)',
        }}
      >
        <span className="absolute left-1/2 top-1/2 h-[10px] w-[34px] -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.12)]" />
      </div>
    </>
  );
}
