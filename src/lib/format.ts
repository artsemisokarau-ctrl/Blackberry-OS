import type { Contact } from '@/lib/records';

export const pad = (value: number): string => String(value).padStart(2, '0');

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}

export function formatStamp(at: number): string {
  const date = new Date(at);
  if (date.toDateString() === new Date().toDateString()) {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function nameForNumber(contacts: Contact[], number: string): string | undefined {
  const digits = number.replace(/\D/g, '');
  return contacts.find((contact) => contact.number.replace(/\D/g, '') === digits)?.name;
}

export function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseIso(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(iso: string, days: number): string {
  const date = parseIso(iso);
  date.setDate(date.getDate() + days);
  return toIso(date);
}

export function addMonths(iso: string, months: number): string {
  const date = parseIso(iso);
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  return toIso(date);
}

export function dayTitle(iso: string): string {
  return parseIso(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function monthTitle(iso: string): string {
  return parseIso(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
