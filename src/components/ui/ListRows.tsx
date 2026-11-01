export interface ListRow {
  id: string;
  primary: string;
  secondary?: string;
  right?: string;
}

interface ListRowsProps {
  rows: ListRow[];
  cursor: number;
  visible?: number;
  empty?: string;
  onPress?: (index: number) => void;
}

export default function ListRows({ rows, cursor, visible = 5, empty = 'Nothing here yet', onPress }: ListRowsProps) {
  if (rows.length === 0) {
    return <div className="flex flex-1 items-center justify-center text-xs text-zinc-500">{empty}</div>;
  }

  const start = Math.min(Math.max(0, cursor - Math.floor(visible / 2)), Math.max(0, rows.length - visible));
  const shown = rows.slice(start, start + visible);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[2px] overflow-hidden p-1.5">
      {shown.map((row, offset) => {
        const index = start + offset;
        const selected = index === cursor;
        return (
          <div
            key={row.id}
            role="button"
            tabIndex={-1}
            onPointerDown={() => onPress?.(index)}
            className={`flex items-center justify-between rounded-[4px] px-2 py-1 transition-colors duration-150 ${
              selected ? 'bb-select text-white' : 'text-zinc-200 hover:bg-white/5'
            }`}
          >
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold">{row.primary}</div>
              {row.secondary && (
                <div className={`truncate text-[9px] ${selected ? 'text-white/80' : 'text-zinc-500'}`}>
                  {row.secondary}
                </div>
              )}
            </div>
            {row.right && <span className="ml-2 shrink-0 text-[9px] text-zinc-400">{row.right}</span>}
          </div>
        );
      })}
    </div>
  );
}
