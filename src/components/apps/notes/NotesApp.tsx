import { useState } from 'react';
import AppFrame from '@/components/ui/AppFrame';
import FormScreen from '@/components/ui/FormScreen';
import ListRows, { type ListRow } from '@/components/ui/ListRows';
import { usePersistentState } from '@/hooks/usePersistentState';
import { moveCursor, useAppKeys } from '@/lib/appKeys';
import { NOTES_SEED, STORAGE_KEYS, newId, type Note } from '@/lib/records';
import { formatStamp } from '@/lib/format';

type View = { kind: 'list' } | { kind: 'editor'; id: string };

export default function NotesApp() {
  const [notes, setNotes] = usePersistentState<Note[]>(STORAGE_KEYS.notes, NOTES_SEED);
  const [view, setView] = useState<View>({ kind: 'list' });

  const updateNote = (id: string, patch: Partial<Pick<Note, 'title' | 'body'>>) =>
    setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, ...patch, updated: Date.now() } : note)));

  const createNote = () => {
    const note: Note = { id: newId(), title: '', body: '', updated: Date.now() };
    setNotes((prev) => [note, ...prev]);
    setView({ kind: 'editor', id: note.id });
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    setView({ kind: 'list' });
  };

  const editing = view.kind === 'editor' ? notes.find((note) => note.id === view.id) : undefined;

  if (view.kind === 'editor' && editing) {
    return (
      <AppFrame appId="notes" right="Editing">
        <FormScreen
          fields={[
            { id: 'title', label: 'Title', value: editing.title, placeholder: 'Untitled' },
            { id: 'body', label: 'Note', value: editing.body, placeholder: 'Start typing', multiline: true },
          ]}
          actions={[{ label: 'Delete note', danger: true }]}
          onChange={(id, value) => updateNote(editing.id, id === 'title' ? { title: value } : { body: value })}
          onAction={() => deleteNote(editing.id)}
          onBack={() => {
            if (!editing.title.trim() && !editing.body.trim()) deleteNote(editing.id);
            else setView({ kind: 'list' });
          }}
        />
      </AppFrame>
    );
  }

  return (
    <AppFrame appId="notes" right={`${notes.length} notes`}>
      <NoteList
        notes={notes}
        onOpen={(id) => setView({ kind: 'editor', id })}
        onNew={createNote}
      />
    </AppFrame>
  );
}

interface NoteListProps {
  notes: Note[];
  onOpen: (id: string) => void;
  onNew: () => void;
}

function NoteList({ notes, onOpen, onNew }: NoteListProps) {
  const [cursor, setCursor] = useState(0);
  const sorted = [...notes].sort((a, b) => b.updated - a.updated);

  const rows: ListRow[] = [
    { id: 'new', primary: '+ New note' },
    ...sorted.map((note) => ({
      id: note.id,
      primary: note.title || 'Untitled',
      secondary: note.body.split('\n')[0] || 'Empty note',
      right: formatStamp(note.updated),
    })),
  ];

  const pressRow = (index: number) => {
    if (index === 0) onNew();
    else onOpen(sorted[index - 1].id);
  };

  useAppKeys((key) => {
    if (key === 'select') {
      pressRow(cursor);
      return true;
    }
    const next = moveCursor(key, cursor, rows.length);
    if (next === null) return false;
    setCursor(next);
    return true;
  });

  return (
    <ListRows
      rows={rows}
      cursor={cursor}
      visible={5}
      empty="No notes"
    />
  );
}
