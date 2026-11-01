import { useState } from 'react';
import { copyText } from '@/lib/clipboard';

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleCopy = async () => {
    const ok = await copyText(text);
    setStatus(ok ? 'copied' : 'failed');
    window.setTimeout(() => setStatus('idle'), 1500);
  };

  return (
    <button
      type="button"
      onPointerDown={handleCopy}
      className="bb-key rounded-[4px] px-2 py-0.5 text-[9px] font-semibold uppercase text-zinc-100"
    >
      {status === 'copied' ? 'Copied' : status === 'failed' ? 'Failed' : 'Copy'}
    </button>
  );
}
