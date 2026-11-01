interface MenuOverlayProps {
  title: string;
  items: readonly string[];
  selectedIndex: number;
}

export default function MenuOverlay({ title, items, selectedIndex }: MenuOverlayProps) {
  return (
    <div className="bb-fade-in absolute inset-0 flex items-end justify-center bg-black/60 pb-3">
      <div className="w-[180px] overflow-hidden rounded-md border border-zinc-600 bg-zinc-900 shadow-2xl">
        <div className="bg-zinc-800 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
          {title}
        </div>
        {items.map((item, index) => (
          <div
            key={item}
            className={`px-3 py-1.5 text-xs ${index === selectedIndex ? 'bb-select text-white' : 'text-zinc-200'}`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
