import { useState } from 'react';
import AppFrame from '@/components/ui/AppFrame';
import FormScreen from '@/components/ui/FormScreen';
import ListRows, { type ListRow } from '@/components/ui/ListRows';
import { usePersistentState } from '@/hooks/usePersistentState';
import { moveCursor, useAppKeys } from '@/lib/appKeys';
import { nameForNumber } from '@/lib/format';
import { CONTACTS_SEED, STORAGE_KEYS, newId, type Contact } from '@/lib/records';

interface ContactsAppProps {
  onCall: (number: string) => void;
  onMessage: (number: string) => void;
}

type View = { kind: 'list' } | { kind: 'detail'; id: string } | { kind: 'form'; id: string | null };

const DETAIL_ACTIONS = ['Call', 'Message', 'Edit', 'Delete'];

function matchesQuery(contact: Contact, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return contact.name.toLowerCase().includes(q) || contact.number.includes(q);
}

export default function ContactsApp({ onCall, onMessage }: ContactsAppProps) {
  const [contacts, setContacts] = usePersistentState<Contact[]>(STORAGE_KEYS.contacts, CONTACTS_SEED);
  const [view, setView] = useState<View>({ kind: 'list' });
  const [query, setQuery] = useState('');

  const detailContact = view.kind === 'detail' ? contacts.find((contact) => contact.id === view.id) : undefined;
  const editingId = view.kind === 'form' ? view.id : null;
  const editingContact = editingId ? contacts.find((contact) => contact.id === editingId) : undefined;

  const saveContact = (name: string, number: string) => {
    if (editingId) {
      setContacts((prev) => prev.map((contact) => (contact.id === editingId ? { ...contact, name, number } : contact)));
      setView({ kind: 'detail', id: editingId });
      return;
    }
    const id = newId();
    setContacts((prev) => [...prev, { id, name, number }]);
    setView({ kind: 'detail', id });
  };

  if (view.kind === 'form') {
    return (
      <AppFrame appId="contacts" right={editingContact ? 'Edit' : 'New'}>
        <ContactEditor
          contact={editingContact}
          onSave={saveContact}
          onBack={() => setView(editingContact ? { kind: 'detail', id: editingContact.id } : { kind: 'list' })}
        />
      </AppFrame>
    );
  }

  if (view.kind === 'detail' && detailContact) {
    return (
      <AppFrame appId="contacts" right="Details">
        <ContactDetail
          contact={detailContact}
          onCall={onCall}
          onMessage={onMessage}
          onEdit={() => setView({ kind: 'form', id: detailContact.id })}
          onDelete={() => {
            setContacts((prev) => prev.filter((contact) => contact.id !== detailContact.id));
            setView({ kind: 'list' });
          }}
          onBack={() => setView({ kind: 'list' })}
        />
      </AppFrame>
    );
  }

  return (
    <AppFrame appId="contacts" right={`${contacts.length} saved`}>
      <ContactList
        contacts={contacts}
        query={query}
        onQuery={setQuery}
        onOpen={(id) => setView({ kind: 'detail', id })}
        onNew={() => setView({ kind: 'form', id: null })}
      />
    </AppFrame>
  );
}

interface ContactListProps {
  contacts: Contact[];
  query: string;
  onQuery: (value: string) => void;
  onOpen: (id: string) => void;
  onNew: () => void;
}

function ContactList({ contacts, query, onQuery, onOpen, onNew }: ContactListProps) {
  const [cursor, setCursor] = useState(0);
  const filtered = contacts
    .filter((contact) => matchesQuery(contact, query))
    .sort((a, b) => a.name.localeCompare(b.name));

  const rows: ListRow[] = [
    { id: 'new', primary: '+ New contact' },
    ...filtered.map((contact) => ({ id: contact.id, primary: contact.name, secondary: contact.number })),
  ];

  const pressRow = (index: number) => {
    if (index === 0) onNew();
    else onOpen(filtered[index - 1].id);
  };

  useAppKeys((key) => {
    if (key === 'back') {
      if (!query) return false;
      onQuery('');
      return true;
    }
    if (key === 'select') {
      pressRow(cursor);
      return true;
    }
    const next = moveCursor(key, cursor, rows.length);
    if (next !== null) {
      setCursor(next);
      return true;
    }
    if (key === 'backspace') {
      onQuery(query.slice(0, -1));
      setCursor(0);
      return true;
    }
    if (key.length === 1) {
      onQuery(query + key);
      setCursor(0);
      return true;
    }
    return false;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-2 mt-2 shrink-0 rounded-[4px] border border-zinc-700 bg-black px-2 py-1 text-[11px] text-zinc-100">
        {query || <span className="text-zinc-600">Type to search</span>}
        <span className="ml-px animate-pulse text-[#7ed957]">|</span>
      </div>
      <ListRows
        rows={rows}
        cursor={cursor}
        visible={4}
      />
    </div>
  );
}

interface ContactDetailProps {
  contact: Contact;
  onCall: (number: string) => void;
  onMessage: (number: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

function ContactDetail({ contact, onCall, onMessage, onEdit, onDelete, onBack }: ContactDetailProps) {
  const [cursor, setCursor] = useState(0);
  const [confirming, setConfirming] = useState(false);

  const runAction = (index: number) => {
    if (index === 0) onCall(contact.number);
    else if (index === 1) onMessage(contact.number);
    else if (index === 2) onEdit();
    else setConfirming(true);
  };

  useAppKeys((key) => {
    if (confirming) {
      if (key === 'select') onDelete();
      else if (key === 'back') setConfirming(false);
      return true;
    }
    if (key === 'back') {
      onBack();
      return true;
    }
    if (key === 'select') {
      runAction(cursor);
      return true;
    }
    const next = moveCursor(key, cursor, DETAIL_ACTIONS.length);
    if (next === null) return false;
    setCursor(next);
    return true;
  });

  const initials = contact.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#5be05b] to-[#1f8f25] text-xs font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-100">{contact.name}</div>
          <div className="text-[11px] text-zinc-400">{contact.number}</div>
        </div>
      </div>
      {confirming ? (
        <div className="mt-2 flex flex-1 flex-col gap-2 rounded-[4px] border border-red-900 bg-red-950/40 p-2">
          <p className="text-[11px] text-red-200">Delete {contact.name}? Enter confirms, Back cancels.</p>
          <button
            type="button"
            onPointerDown={onDelete}
            className="rounded-[4px] bg-red-900 py-1 text-[11px] font-semibold text-white"
          >
            Yes, delete contact
          </button>
          <button
            type="button"
            onPointerDown={() => setConfirming(false)}
            className="rounded-[4px] bg-zinc-800 py-1 text-[11px] font-semibold text-zinc-200"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-[3px]">
          {DETAIL_ACTIONS.map((action, index) => (
            <button
              key={action}
              type="button"
              onPointerDown={() => {
                setCursor(index);
                runAction(index);
              }}
              className={`rounded-[4px] px-2 py-1.5 text-left text-[11px] font-semibold ${
                index === cursor ? 'bb-select text-white' : 'bg-zinc-900 text-zinc-200'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ContactEditorProps {
  contact?: Contact;
  onSave: (name: string, number: string) => void;
  onBack: () => void;
}

function ContactEditor({ contact, onSave, onBack }: ContactEditorProps) {
  const [draft, setDraft] = useState({ name: contact?.name ?? '', number: contact?.number ?? '' });
  const [error, setError] = useState('');

  const save = () => {
    const name = draft.name.trim();
    const number = draft.number.trim();
    if (!name) {
      setError('Enter a name.');
      return;
    }
    if (number.replace(/\D/g, '').length < 3) {
      setError('Enter a valid number.');
      return;
    }
    onSave(name, number);
  };

  return (
    <FormScreen
      fields={[
        { id: 'name', label: 'Name', value: draft.name, placeholder: 'Full name' },
        { id: 'number', label: 'Mobile number', value: draft.number, placeholder: '+34 600 000 000' },
      ]}
      actions={[{ label: 'Save contact' }]}
      notice={error}
      onChange={(id, value) => setDraft((prev) => ({ ...prev, [id]: value }))}
      onAction={save}
      onBack={onBack}
    />
  );
}
