import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppKeys } from '@/lib/appKeys';
import { addDays, addMonths, monthTitle, parseIso, toIso } from '@/lib/format';

interface MonthViewProps {
  cursor: string;
  eventDates: Set<string>;
  onCursor: (iso: string) => void;
  onOpenDay: () => void;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function buildCells(cursor: string): (string | null)[] {
  const first = parseIso(cursor);
  first.setDate(1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toIso(new Date(first.getFullYear(), first.getMonth(), day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function MonthView({ cursor, eventDates, onCursor, onOpenDay }: MonthViewProps) {
  const cells = buildCells(cursor);
  const todayIso = toIso(new Date());

  useAppKeys((key) => {
    if (key === 'select') {
      onOpenDay();
      return true;
    }
    const steps: Record<string, number> = { left: -1, right: 1, up: -7, down: 7 };
    const step = steps[key];
    if (step === undefined) return false;
    onCursor(addDays(cursor, step));
    return true;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1 p-2">
      <div className="flex shrink-0 items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onPointerDown={() => onCursor(addMonths(cursor, -1))}
          className="bb-key flex h-6 w-6 items-center justify-center rounded-[4px] text-zinc-200"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-[11px] font-semibold text-zinc-100">{monthTitle(cursor)}</span>
        <button
          type="button"
          aria-label="Next month"
          onPointerDown={() => onCursor(addMonths(cursor, 1))}
          className="bb-key flex h-6 w-6 items-center justify-center rounded-[4px] text-zinc-200"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid shrink-0 grid-cols-7 text-center text-[8px] font-semibold uppercase text-zinc-500">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-[2px]">
        {cells.map((iso, index) => {
          if (!iso) return <span key={`blank-${index}`} />;
          const selected = iso === cursor;
          const isToday = iso === todayIso;
          return (
            <button
              key={iso}
              type="button"
              onPointerDown={() => {
                onCursor(iso);
                onOpenDay();
              }}
              className={`relative flex flex-col items-center justify-center rounded-[3px] text-[10px] ${
                selected ? 'bb-select font-bold text-white' : 'text-zinc-200 hover:bg-zinc-800'
              } ${isToday && !selected ? 'ring-1 ring-[#7ed957]/60' : ''}`}
            >
              {parseIso(iso).getDate()}
              {eventDates.has(iso) && (
                <span className={`absolute bottom-[2px] h-[3px] w-[3px] rounded-full ${selected ? 'bg-white' : 'bg-[#7ed957]'}`} />
              )}
            </button>
          );
        })}
      </div>
      <p className="shrink-0 text-center text-[9px] text-zinc-500">Arrows: move | Enter: open day</p>
    </div>
  );
}
