import { useEffect, useRef, useState } from 'react';
import AppFrame from '@/components/ui/AppFrame';
import FormScreen from '@/components/ui/FormScreen';
import ListRows, { type ListRow } from '@/components/ui/ListRows';
import ThreadView from '@/components/apps/messages/ThreadView';
import { usePersistentState } from '@/hooks/usePersistentState';
import { moveCursor, useAppKeys } from '@/lib/appKeys';
import { formatStamp, nameForNumber } from '@/lib/format';
import {
  CONTACTS_SEED,
  MESSAGES_SEED,
  STORAGE_KEYS,
  newId,
  type Contact,
  type Message,
} from '@/lib/records';

interface MessagesAppProps {
  initialRecipient?: string;
}

type View = { kind: 'list' } | { kind: 'thread'; number: string } | { kind: 'compose' };
type Folder = 'inbox' | 'sent';

const REPLIES = ['Got it, thanks!', 'Sounds good to me.', 'Can you call me later?', 'Ok :)', 'See you then.'];
const REPLY_DELAY_MS = 1500;

function latestPerNumber(messages: Message[]): Message[] {
  const latest = new Map<string, Message>();
  for (const message of messages) {
    const current = latest.get(message.number);
    if (!current || message.at > current.at) latest.set(message.number, message);
  }
  return [...latest.values()].sort((a, b) => b.at - a.at);
}

export default function MessagesApp({ initialRecipient }: MessagesAppProps) {
  const [messages, setMessages] = usePersistentState<Message[]>(STORAGE_KEYS.messages, MESSAGES_SEED);
  const [contacts] = usePersistentState<Contact[]>(STORAGE_KEYS.contacts, CONTACTS_SEED);
  const [view, setView] = useState<View>(
    initialRecipient ? { kind: 'thread', number: initialRecipient } : { kind: 'list' },
  );
  const [folder, setFolder] = useState<Folder>('inbox');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const sendMessage = (number: string, text: string) => {
    setMessages((prev) => [...prev, { id: newId(), number, direction: 'out', text, at: Date.now() }]);
    const timer = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: newId(), number, direction: 'in', text: REPLIES[prev.length % REPLIES.length], at: Date.now() },
      ]);
    }, REPLY_DELAY_MS);
    timers.current.push(timer);
  };

  const openThread = (number: string) => setView({ kind: 'thread', number });

  if (view.kind === 'thread') {
    const name = nameForNumber(contacts, view.number) ?? view.number;
    return (
      <AppFrame appId="messages" right={name}>
        <ThreadView
          number={view.number}
          name={name}
          messages={messages}
          onSend={(text) => sendMessage(view.number, text)}
          onBack={() => setView({ kind: 'list' })}
        />
      </AppFrame>
    );
  }

  if (view.kind === 'compose') {
    return (
      <AppFrame appId="messages" right="New">
        <ComposeView
          contacts={contacts}
          onSend={(number, text) => {
            sendMessage(number, text);
            openThread(number);
          }}
          onBack={() => setView({ kind: 'list' })}
        />
      </AppFrame>
    );
  }

  return (
    <AppFrame appId="messages" right={folder === 'inbox' ? 'Inbox' : 'Sent'}>
      <InboxList
        messages={messages}
        contacts={contacts}
        folder={folder}
        onFolder={setFolder}
        onOpen={openThread}
        onNew={() => setView({ kind: 'compose' })}
      />
    </AppFrame>
  );
}

interface InboxListProps {
  messages: Message[];
  contacts: Contact[];
  folder: Folder;
  onFolder: (folder: Folder) => void;
  onOpen: (number: string) => void;
  onNew: () => void;
}

function InboxList({ messages, contacts, folder, onFolder, onOpen, onNew }: InboxListProps) {
  const [cursor, setCursor] = useState(0);

  const entries = folder === 'inbox'
    ? latestPerNumber(messages)
    : latestPerNumber(messages.filter((message) => message.direction === 'out'));

  const rows: ListRow[] = entries.map((message) => ({
    id: `${folder}-${message.number}`,
    primary: nameForNumber(contacts, message.number) ?? message.number,
    secondary: `${message.direction === 'out' ? 'You: ' : ''}${message.text}`,
    right: formatStamp(message.at),
  }));

  const pressRow = (index: number) => {
    const entry = entries[index];
    if (entry) onOpen(entry.number);
  };

  useAppKeys((key) => {
    if (key === 'menu') {
      onFolder(folder === 'inbox' ? 'sent' : 'inbox');
      setCursor(0);
      return true;
    }
    if (key === 'select') {
      pressRow(cursor);
      return true;
    }
    if (key === 'n') {
      onNew();
      return true;
    }
    const next = moveCursor(key, cursor, rows.length);
    if (next === null) return false;
    setCursor(next);
    return true;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between px-2 py-1 text-[9px] text-zinc-500">
        <button
          type="button"
          onPointerDown={() => onFolder(folder === 'inbox' ? 'sent' : 'inbox')}
          className="bb-key rounded-[4px] px-2 py-0.5 text-[9px] font-semibold uppercase text-zinc-200"
        >
          Show {folder === 'inbox' ? 'sent' : 'inbox'}
        </button>
        <button
          type="button"
          onPointerDown={onNew}
          className="bb-call rounded-[4px] px-2 py-0.5 text-[9px] font-semibold uppercase text-white"
        >
          New
        </button>
      </div>
      <ListRows
        rows={rows}
        cursor={cursor}
        visible={4}
        empty={folder === 'inbox' ? 'No messages yet' : 'Nothing sent yet'}
      />
      <p className="shrink-0 px-2 pb-1 text-[9px] text-zinc-500">Menu: switch folder | N: new message</p>
    </div>
  );
}

interface ComposeViewProps {
  contacts: Contact[];
  onSend: (number: string, text: string) => void;
  onBack: () => void;
}

function ComposeView({ contacts, onSend, onBack }: ComposeViewProps) {
  const [draft, setDraft] = useState({ to: '', text: '' });
  const [error, setError] = useState('');

  const send = () => {
    const typed = draft.to.trim();
    if (!typed || !draft.text.trim()) {
      setError('Add a recipient and a message.');
      return;
    }
    const match = contacts.find((contact) => contact.name.toLowerCase() === typed.toLowerCase());
    onSend(match ? match.number : typed, draft.text.trim());
  };

  return (
    <FormScreen
      fields={[
        { id: 'to', label: 'To', value: draft.to, placeholder: 'Name or number' },
        { id: 'text', label: 'Message', value: draft.text, placeholder: 'Type your message' },
      ]}
      actions={[{ label: 'Send message' }]}
      notice={error}
      onChange={(id, value) => setDraft((prev) => ({ ...prev, [id]: value }))}
      onAction={send}
      onBack={onBack}
    />
  );
}
