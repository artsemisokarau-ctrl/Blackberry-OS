import { useState } from 'react';
import AppFrame from '@/components/ui/AppFrame';
import FormScreen from '@/components/ui/FormScreen';
import ListRows, { type ListRow } from '@/components/ui/ListRows';
import MonthView from '@/components/apps/calendar/MonthView';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useAppKeys } from '@/lib/appKeys';
import { dayTitle, toIso } from '@/lib/format';
import { STORAGE_KEYS, newId, type CalendarEvent } from '@/lib/records';

type View = { kind: 'month' } | { kind: 'day' } | { kind: 'event'; id: string | null };

export default function CalendarApp() {
  const [events, setEvents] = usePersistentState<CalendarEvent[]>(STORAGE_KEYS.events, []);
  const [cursor, setCursor] = useState(() => toIso(new Date()));
  const [view, setView] = useState<View>({ kind: 'month' });

  const dayEvents = events
    .filter((event) => event.date === cursor)
    .sort((a, b) => a.time.localeCompare(b.time));

  const saveEvent = (id: string | null, data: { title: string; time: string }) => {
    if (id) {
      setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, ...data } : event)));
    } else {
      setEvents((prev) => [...prev, { id: newId(), date: cursor, ...data }]);
    }
    setView({ kind: 'day' });
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
    setView({ kind: 'day' });
  };

  if (view.kind === 'event') {
    const existing = events.find((event) => event.id === view.id);
    return (
      <AppFrame appId="calendar" right={dayTitle(cursor)}>
        <EventEditor
          event={existing}
          onSave={(data) => saveEvent(view.id, data)}
          onDelete={() => view.id && deleteEvent(view.id)}
          onBack={() => setView({ kind: 'day' })}
        />
      </AppFrame>
    );
  }

  if (view.kind === 'day') {
    return (
      <AppFrame appId="calendar" right={dayTitle(cursor)}>
        <DayView
          events={dayEvents}
          onOpen={(id) => setView({ kind: 'event', id })}
          onBack={() => setView({ kind: 'month' })}
        />
      </AppFrame>
    );
  }

  return (
    <AppFrame appId="calendar" right="Month">
      <MonthView
        cursor={cursor}
        eventDates={new Set(events.map((event) => event.date))}
        onCursor={setCursor}
        onOpenDay={() => setView({ kind: 'day' })}
      />
    </AppFrame>
  );
}

interface DayViewProps {
  events: CalendarEvent[];
  onOpen: (id: string | null) => void;
  onBack: () => void;
}

function DayView({ events, onOpen, onBack }: DayViewProps) {
  const [cursor, setCursor] = useState(0);
  const rows: ListRow[] = [
    ...events.map((event) => ({
      id: event.id,
      primary: event.title,
      right: event.time || 'All day',
    })),
    { id: 'new', primary: '+ New event' },
  ];

  const pressRow = (index: number) => {
    if (index >= events.length) onOpen(null);
    else onOpen(events[index].id);
  };

  useAppKeys((key) => {
    if (key === 'back') {
      onBack();
      return true;
    }
    if (key === 'select') {
      pressRow(cursor);
      return true;
    }
    if (key === 'up' || key === 'down') {
      setCursor((value) => Math.min(rows.length - 1, Math.max(0, value + (key === 'up' ? -1 : 1))));
      return true;
    }
    return false;
  });

  return (
    <ListRows
      rows={rows}
      cursor={cursor}
      visible={5}
    />
  );
}

interface EventEditorProps {
  event?: CalendarEvent;
  onSave: (data: { title: string; time: string }) => void;
  onDelete: () => void;
  onBack: () => void;
}

function EventEditor({ event, onSave, onDelete, onBack }: EventEditorProps) {
  const [draft, setDraft] = useState({ title: event?.title ?? '', time: event?.time ?? '' });
  const [error, setError] = useState('');

  const actions = event ? [{ label: 'Save event' }, { label: 'Delete event', danger: true }] : [{ label: 'Save event' }];

  return (
    <FormScreen
      fields={[
        { id: 'title', label: 'Title', value: draft.title, placeholder: 'Meeting, reminder...' },
        { id: 'time', label: 'Time', value: draft.time, placeholder: 'HH:MM (optional)' },
      ]}
      actions={actions}
      notice={error}
      onChange={(id, value) => setDraft((prev) => ({ ...prev, [id]: value }))}
      onAction={(index) => {
        if (index === 1) {
          onDelete();
          return;
        }
        if (!draft.title.trim()) {
          setError('Enter a title.');
          return;
        }
        onSave({ title: draft.title.trim(), time: draft.time.trim() });
      }}
      onBack={onBack}
    />
  );
}
