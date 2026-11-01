import type { KeyLayout, Product } from '@/lib/products';

interface PhoneSketchProps {
  product: Product;
  base: string;
  height?: number;
}

export default function PhoneSketch({ product, base, height = 120 }: PhoneSketchProps) {
  return (
    <div
      className="relative shrink-0 rounded-[14%/7%] shadow-[0_6px_14px_rgba(0,0,0,0.6)] ring-1 ring-white/15"
      style={{
        height,
        aspectRatio: String(product.aspect),
        backgroundColor: base,
        backgroundImage:
          'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,0.35) 100%)',
      }}
    >
      <div
        className={`absolute inset-x-[10%] rounded-[2px] bg-gradient-to-br from-[#1b3c57] to-[#06121b] ring-1 ring-black/70 ${
          product.keys === 'keypad' || product.keys === 'none' ? 'top-[8%] h-[30%]' : 'top-[8%] h-[34%]'
        }`}
      />
      <KeyBlock keys={product.keys} />
    </div>
  );
}

function KeyBlock({ keys }: { keys: KeyLayout }) {
  if (keys === 'none') {
    return <div className="absolute left-1/2 top-[56%] h-[16%] w-[34%] -translate-x-1/2 rounded-full bg-black/40 ring-1 ring-black/50" />;
  }
  if (keys === 'keypad') {
    return (
      <div className="absolute inset-x-[14%] top-[46%] bottom-[7%] grid grid-cols-3 grid-rows-4 gap-[3px]">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} className="rounded-full bg-zinc-800/90 shadow-[0_1px_0_rgba(0,0,0,0.8)]" />
        ))}
      </div>
    );
  }
  const rows = keys === 'qwerty-4' ? 4 : 3;
  return (
    <div className="absolute inset-x-[9%] top-[46%] bottom-[7%] flex flex-col gap-[3px]">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="grid flex-1 grid-cols-10 gap-[2px]">
          {Array.from({ length: 10 }, (_, column) => (
            <span key={column} className="rounded-[1px] bg-zinc-700/90 shadow-[0_1px_0_rgba(0,0,0,0.8)]" />
          ))}
        </div>
      ))}
      <span className="mx-auto h-[12%] w-1/2 rounded-[2px] bg-zinc-700/90" />
    </div>
  );
}
