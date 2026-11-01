import { useState } from 'react';
import { editText, useAppKeys } from '@/lib/appKeys';

export interface FormField {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface FormAction {
  label: string;
  danger?: boolean;
}

interface FormScreenProps {
  fields: FormField[];
  actions: FormAction[];
  notice?: string;
  onChange: (id: string, value: string) => void;
  onAction: (index: number) => void;
  onBack: () => void;
}

export default function FormScreen({ fields, actions, notice, onChange, onAction, onBack }: FormScreenProps) {
  const [focus, setFocus] = useState(0);
  const total = fields.length + actions.length;
  const focusedField = focus < fields.length ? fields[focus] : null;

  useAppKeys((key) => {
    if (key === 'up' || key === 'down') {
      setFocus((index) => Math.min(total - 1, Math.max(0, index + (key === 'up' ? -1 : 1))));
      return true;
    }
    if (key === 'back') {
      onBack();
      return true;
    }
    if (focusedField) {
      if (key === 'select') {
        if (focusedField.multiline) onChange(focusedField.id, `${focusedField.value}\n`);
        else setFocus((index) => Math.min(total - 1, index + 1));
        return true;
      }
      const next = editText(focusedField.value, key);
      if (next === null) return false;
      onChange(focusedField.id, next);
      return true;
    }
    if (key === 'select') {
      onAction(focus - fields.length);
      return true;
    }
    return false;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
      {fields.map((field, index) => {
        const active = index === focus;
        return (
          <div
            key={field.id}
            className={`min-h-0 rounded-[4px] border px-2 py-1 ${
              active ? 'border-[#7ed957] bg-[#7ed957]/10' : 'border-zinc-700 bg-zinc-900'
            } ${field.multiline ? 'flex flex-1 flex-col' : ''}`}
          >
            <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">{field.label}</div>
            <div
              className={`mt-0.5 text-[12px] text-zinc-100 ${
                field.multiline
                  ? 'flex min-h-0 flex-1 flex-col justify-end overflow-hidden whitespace-pre-wrap break-words'
                  : 'truncate'
              }`}
            >
              <span>{field.value || <span className="text-zinc-600">{field.placeholder ?? ''}</span>}</span>
              {active && <span className="ml-px animate-pulse text-[#7ed957]">|</span>}
            </div>
          </div>
        );
      })}
      {notice && <p className="text-[10px] text-amber-300">{notice}</p>}
      <div className="mt-auto flex flex-col gap-1">
        {actions.map((action, index) => {
          const absolute = fields.length + index;
          const selected = absolute === focus;
          return (
            <button
              key={action.label}
              type="button"
              className={`rounded-[4px] py-1 text-[11px] font-semibold ${
                selected ? 'bb-select text-white' : action.danger ? 'bg-red-950 text-red-300' : 'bg-zinc-800 text-zinc-200'
              }`}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
