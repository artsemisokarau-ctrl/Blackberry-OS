import { useState } from 'react';
import { Phone } from 'lucide-react';
import AppFrame from '@/components/ui/AppFrame';
import CopyButton from '@/components/ui/CopyButton';
import ListRows, { type ListRow } from '@/components/ui/ListRows';
import CallScreen from '@/components/apps/phone/CallScreen';
import { usePersistentState } from '@/hooks/usePersistentState';
import { moveCursor, useAppKeys } from '@/lib/appKeys';
import { formatDuration, formatStamp, nameForNumber } from '@/lib/format';
import {
  CALLS_SEED,
  CONTACTS_SEED,
  PHONE_NUMBER,
  STORAGE_KEYS,
  newId,
  type CallEntry,
  type Contact,
} from '@/lib/records';

interface PhoneAppProps {
  initialNumber?: string;
}

type Tab = 'dial' | 'recent';

const MAX_CALL_LOG = 50;
const DIRECTION_LABEL = { in: 'Incoming', out: 'Outgoing', missed: 'Missed' } as const;

export default function PhoneApp({ initialNumber }: PhoneAppProps) {
  const [tab, setTab] = useState<Tab>('dial');
  const [dialed, setDialed] = useState(initialNumber ?? '');
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [calls, setCalls] = usePersistentState<CallEntry[]>(STORAGE_KEYS.calls, CALLS_SEED);
  const [contacts] = usePersistentState<Contact[]>(STORAGE_KEYS.contacts, CONTACTS_SEED);

  const toggleTab = () => setTab((current) => (current === 'dial' ? 'recent' : 'dial'));

  const endCall = (duration: number) => {
    if (!activeCall) return;
    const entry: CallEntry = { id: newId(), number: activeCall, direction: 'out', at: Date.now(), duration };
    setCalls((prev) => [entry, ...prev].slice(0, MAX_CALL_LOG));
    setActiveCall(null);
    setDialed('');
  };

  if (activeCall) {
    return (
      <AppFrame appId="phone" right="In call">
        <CallScreen number={activeCall} name={nameForNumber(contacts, activeCall)} onEnd={endCall} />
      </AppFrame>
    );
  }

  return (
    <AppFrame appId="phone" right={tab === 'dial' ? 'Dial' : 'Recent'}>
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-2 py-1 text-[10px] text-zinc-400">
        <span>
          My number <span className="text-zinc-100">{PHONE_NUMBER}</span>
        </span>
        <CopyButton text={PHONE_NUMBER} />
      </div>
      <div className="flex shrink-0 gap-1 p-1.5">
        {(['dial', 'recent'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onPointerDown={() => setTab(value)}
            className={`flex-1 rounded-[4px] py-1 text-[10px] font-semibold uppercase ${
              tab === value ? 'bb-select text-white' : 'bb-key text-zinc-300'
            }`}
          >
            {value === 'dial' ? 'Dial' : 'Recent'}
          </button>
        ))}
      </div>
      {tab === 'dial' ? (
        <DialView
          number={dialed}
          name={nameForNumber(contacts, dialed)}
          onNumber={setDialed}
          onCall={() => setActiveCall(dialed)}
          onTab={toggleTab}
        />
      ) : (
        <RecentView calls={calls} contacts={contacts} onCall={setActiveCall} onTab={toggleTab} />
      )}
    </AppFrame>
  );
}

interface DialViewProps {
  number: string;
  name?: string;
  onNumber: (value: string) => void;
  onCall: () => void;
  onTab: () => void;
}

function DialView({ number, name, onNumber, onCall, onTab }: DialViewProps) {
  useAppKeys((key) => {
    if (key === 'select' || key === 'call') {
      if (number) onCall();
      return true;
    }
    if (key === 'backspace') {
      onNumber(number.slice(0, -1));
      return true;
    }
    if (key === 'menu') {
      onTab();
      return true;
    }
    if (/^[0-9+*#]$/.test(key) && number.length < 20) {
      onNumber(number + key);
      return true;
    }
    return false;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-between gap-2 p-2">
      <div className="flex min-h-[44px] w-full flex-col items-center justify-center">
        <span className="font-mono text-xl tracking-wide text-zinc-100">
          {number || <span className="text-sm text-zinc-600">Enter a number</span>}
        </span>
        {name && <span className="text-[10px] text-[#7ed957]">{name}</span>}
      </div>
      <div className="flex w-full gap-1.5">
        <button
          type="button"
          onPointerDown={() => number && onCall()}
          className="bb-call flex h-8 flex-1 items-center justify-center gap-1 rounded-[5px] text-xs font-semibold text-white"
        >
          <Phone className="h-3.5 w-3.5" />
          Call
        </button>
        <button
          type="button"
          onPointerDown={() => onNumber(number.slice(0, -1))}
          className="bb-key h-8 w-16 rounded-[5px] text-xs font-semibold text-zinc-200"
        >
          Delete
        </button>
      </div>
      <p className="text-center text-[9px] text-zinc-500">Simulated calls only. No real number is contacted.</p>
    </div>
  );
}

interface RecentViewProps {
  calls: CallEntry[];
  contacts: Contact[];
  onCall: (number: string) => void;
  onTab: () => void;
}

function RecentView({ calls, contacts, onCall, onTab }: RecentViewProps) {
  const [cursor, setCursor] = useState(0);

  const rows: ListRow[] = calls.map((call) => ({
    id: call.id,
    primary: nameForNumber(contacts, call.number) ?? call.number,
    secondary: `${DIRECTION_LABEL[call.direction]}${call.duration ? ` | ${formatDuration(call.duration)}` : ''}`,
    right: formatStamp(call.at),
  }));

  const pressRow = (index: number) => {
    const call = calls[index];
    if (call) onCall(call.number);
  };

  useAppKeys((key) => {
    if (key === 'menu') {
      onTab();
      return true;
    }
    if (key === 'select') {
      pressRow(cursor);
      return true;
    }
    const next = moveCursor(key, cursor, calls.length);
    if (next === null) return false;
    setCursor(next);
    return true;
  });

  return (
    <ListRows
      rows={rows}
      cursor={cursor}
      empty="No recent calls"
    />
  );
}
