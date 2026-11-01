export type AccessoryId =
  | 'manual'
  | 'handset'
  | 'battery'
  | 'spare-battery'
  | 'charger'
  | 'usb-cable'
  | 'earphones'
  | 'case';

export interface Slot {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Accessory {
  id: AccessoryId;
  label: string;
  description: string;
  slot: Slot;
}

export const ACCESSORIES: Accessory[] = [
  {
    id: 'manual',
    label: 'User manual',
    description: 'The full user manual covering setup, messaging, safety information and settings.',
    slot: { left: 12, top: 14, width: 112, height: 120 },
  },
  {
    id: 'case',
    label: 'Protective case',
    description: 'A snap-on protective case that guards the phone against knocks and scratches.',
    slot: { left: 12, top: 146, width: 112, height: 120 },
  },
  {
    id: 'handset',
    label: 'Handset',
    description: 'The handset itself.',
    slot: { left: 136, top: 14, width: 92, height: 150 },
  },
  {
    id: 'battery',
    label: 'Removable battery',
    description: 'A removable lithium-ion battery. Your phone starts fully charged.',
    slot: { left: 136, top: 178, width: 92, height: 54 },
  },
  {
    id: 'spare-battery',
    label: 'Spare battery',
    description: 'A second removable battery. Keep it charged as a spare for longer days.',
    slot: { left: 136, top: 244, width: 92, height: 54 },
  },
  {
    id: 'charger',
    label: 'Wall charger',
    description: 'The wall charger. Plug it into a socket, then connect the cable to the phone.',
    slot: { left: 240, top: 14, width: 88, height: 90 },
  },
  {
    id: 'usb-cable',
    label: 'Charging cable',
    description: 'The charging cable. Connect it between the wall charger and the phone.',
    slot: { left: 240, top: 116, width: 88, height: 70 },
  },
  {
    id: 'earphones',
    label: 'Stereo earphones',
    description: 'Stereo earphones with an inline microphone and call button.',
    slot: { left: 240, top: 198, width: 88, height: 80 },
  },
];

const KEY_INDEXES = Array.from({ length: 10 }, (_, index) => index);

export function AccessoryVisual({ id }: { id: AccessoryId }) {
  switch (id) {
    case 'handset':
      return (
        <div className="relative h-full w-full rounded-[16px] bg-gradient-to-b from-[#2d3036] via-[#17191d] to-[#0b0c0f] shadow-[0_8px_14px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-black">
          <div className="absolute inset-x-[9%] top-[7%] h-[38%] rounded-[4px] bg-gradient-to-br from-[#16324a] to-[#07131c] ring-2 ring-black shadow-inner" />
          <div className="absolute inset-x-[10%] top-[51%] grid grid-cols-5 gap-[3px]">
            {KEY_INDEXES.map((key) => (
              <span key={key} className="h-[9px] rounded-[2px] bg-zinc-700 shadow-[0_1px_0_#000]" />
            ))}
          </div>
          <div className="absolute bottom-[5%] left-1/2 h-[7px] w-[30%] -translate-x-1/2 rounded-full bg-zinc-600/80" />
        </div>
      );
    case 'battery':
    case 'spare-battery':
      return (
        <div className="relative h-full w-full rounded-[7px] bg-gradient-to-b from-[#3a3d44] to-[#17181c] shadow-[0_4px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-black">
          <div className="absolute left-[8%] top-[10%] h-[18%] w-[30%] rounded-[2px] bg-gradient-to-b from-[#e8c77a] to-[#9a7a33]" />
          <div className="absolute inset-x-[10%] bottom-[14%] top-[38%] flex items-center justify-center rounded-[3px] bg-zinc-800/80">
            <span className="text-[8px] font-semibold tracking-[0.2em] text-zinc-300">BATTERY</span>
          </div>
        </div>
      );
    case 'charger':
      return (
        <div className="relative h-full w-full">
          <div className="absolute left-[18%] top-[6%] h-[44%] w-[64%] rounded-[10px] bg-gradient-to-b from-[#fbfbfc] to-[#d6d8dd] shadow-[0_4px_8px_rgba(0,0,0,0.35),inset_0_1px_0_#fff] ring-1 ring-zinc-400">
            <span className="absolute -top-[9px] left-[26%] h-[9px] w-[6px] rounded-t-[2px] bg-zinc-300 ring-1 ring-zinc-400" />
            <span className="absolute -top-[9px] right-[26%] h-[9px] w-[6px] rounded-t-[2px] bg-zinc-300 ring-1 ring-zinc-400" />
          </div>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 88 96" aria-hidden="true">
            <path d="M40 50 C40 78 70 66 74 92" fill="none" stroke="#1f2126" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'usb-cable':
      return (
        <svg className="h-full w-full" viewBox="0 0 88 80" aria-hidden="true">
          <path d="M14 20 C 34 20, 28 62, 48 62 S 70 40, 76 58" fill="none" stroke="#1f2126" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="4" y="12" width="14" height="16" rx="2" fill="#c9ccd2" stroke="#55585f" />
          <rect x="72" y="56" width="14" height="12" rx="3" fill="#2b2e35" />
        </svg>
      );
    case 'earphones':
      return (
        <svg className="h-full w-full" viewBox="0 0 88 80" aria-hidden="true">
          <path d="M44 4 V30 C44 48, 24 46, 22 60 M44 30 C44 48, 64 46, 66 60" fill="none" stroke="#1f2126" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="14" y="56" width="16" height="22" rx="8" fill="#f2f3f5" stroke="#9aa0a8" />
          <rect x="58" y="56" width="16" height="22" rx="8" fill="#f2f3f5" stroke="#9aa0a8" />
        </svg>
      );
    case 'case':
      return (
        <div className="relative h-full w-full rounded-[14px] bg-gradient-to-b from-[#3a4656] to-[#161d27] shadow-[0_8px_14px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-black">
          <div className="absolute inset-[9%] rounded-[10px] border border-white/10 bg-[#1d2631]" />
          <div className="absolute left-1/2 top-[8%] h-[6%] w-[30%] -translate-x-1/2 rounded-full bg-black/50" />
        </div>
      );
    case 'manual':
      return (
        <div className="relative h-full w-full rounded-[4px] bg-[#f4f1ea] shadow-[0_6px_12px_rgba(0,0,0,0.45)] ring-1 ring-black/20">
          <div className="absolute inset-x-0 top-0 flex h-[30%] items-center rounded-t-[4px] bg-zinc-900 px-3">
            <span className="text-[10px] font-bold text-zinc-100">User Manual</span>
          </div>
          <div className="absolute inset-x-[12%] top-[40%] flex flex-col gap-[7px]">
            {KEY_INDEXES.slice(0, 7).map((line) => (
              <span key={line} className="h-[3px] rounded bg-zinc-400/70" />
            ))}
          </div>
        </div>
      );
  }
}
