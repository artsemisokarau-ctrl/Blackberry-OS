import { useState } from 'react';
import { editText, useAppKeys } from '@/lib/appKeys';
import { formatStamp } from '@/lib/format';
import type { Message } from '@/lib/records';

interface ThreadViewProps {
  number: string;
  name: string;
  messages: Message[];
  onSend: (text: string) => void;
  onBack: () => void;
}

const VISIBLE_BUBBLES = 4;

export default function ThreadView({ number, name, messages, onSend, onBack }: ThreadViewProps) {
  const thread = messages.filter((message) => message.number === number);
  const [draft, setDraft] = useState('');
  const [scroll, setScroll] = useState(0);

  useAppKeys((key) => {
    if (key === 'back') {
      onBack();
      return true;
    }
    if (key === 'select') {
      const text = draft.trim();
      if (text) {
        onSend(text);
        setDraft('');
      }
      return true;
    }
    if (key === 'up') {
      setScroll((value) => Math.min(Math.max(0, thread.length - VISIBLE_BUBBLES), value + 1));
      return true;
    }
    if (key === 'down') {
      setScroll((value) => Math.max(0, value - 1));
      return true;
    }
    const next = editText(draft, key);
    if (next === null) return false;
    setDraft(next);
    return true;
  });

  const end = thread.length - scroll;
  const shown = thread.slice(Math.max(0, end - VISIBLE_BUBBLES), end);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-1.5 overflow-hidden p-2">
        {shown.length === 0 && <p className="text-center text-[10px] text-zinc-500">No messages with {name}</p>}
        {shown.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-[6px] px-2 py-1 text-[11px] ${
              message.direction === 'out' ? 'bb-select self-end text-white' : 'self-start bg-zinc-800 text-zinc-100'
            }`}
          >
            <div>{message.text}</div>
            <div className="text-right text-[8px] text-white/60">{formatStamp(message.at)}</div>
          </div>
        ))}
      </div>
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-900 p-1.5">
        <div className="min-h-[24px] rounded-[4px] border border-zinc-700 bg-black px-2 py-1 text-[11px] text-zinc-100">
          {draft || <span className="text-zinc-600">Type a reply</span>}
          <span className="ml-px animate-pulse text-[#7ed957]">|</span>
        </div>
        <p className="mt-1 text-[9px] text-zinc-500">Enter: send | Up/Down: scroll | Back: inbox</p>
      </div>
    </div>
  );
}
