export const STORAGE_KEYS = {
  settings: 'doomberry.settings',
  contacts: 'doomberry.contacts',
  messages: 'doomberry.messages',
  calls: 'doomberry.calls',
  notes: 'doomberry.notes',
  events: 'doomberry.events',
  photos: 'doomberry.photos',
  alarm: 'doomberry.alarm',
  device: 'doomberry.device',
  battery: 'doomberry.battery',
  store: 'doomberry.store.v2',
  wallet: 'doomberry.wallet.v1',
  downloads: 'doomberry.downloads.v1',
} as const;

import type { PhoneColorId } from '@/lib/phoneColors';

export const PHONE_NUMBER = '+34 600 123 932';
export const MAX_PHOTOS = 40;

export const WALLPAPERS = [
  { id: 'ribbon-blue', label: 'Ribbon Blue' },
  { id: 'ribbon-green', label: 'Ribbon Green' },
  { id: 'ribbon-cyan', label: 'Ribbon Cyan' },
] as const;
export type WallpaperId = (typeof WALLPAPERS)[number]['id'];

export const RINGTONES = [
  { id: 'classic', label: 'Classic' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'chime', label: 'Chime' },
] as const;
export type RingtoneId = (typeof RINGTONES)[number]['id'];

export interface Settings {
  wallpaper: WallpaperId;
  brightness: number;
  ringtone: RingtoneId;
  sound: boolean;
  pin: string;
  phoneColor: PhoneColorId;
}

export const DEFAULT_SETTINGS: Settings = {
  wallpaper: 'ribbon-blue',
  brightness: 100,
  ringtone: 'classic',
  sound: true,
  pin: '',
  phoneColor: 'piano-black',
};

export interface Contact {
  id: string;
  name: string;
  number: string;
}

export interface Message {
  id: string;
  number: string;
  direction: 'in' | 'out';
  text: string;
  at: number;
}

export interface CallEntry {
  id: string;
  number: string;
  direction: 'in' | 'out' | 'missed';
  at: number;
  duration: number;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  updated: number;
}

export interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  title: string;
}

export interface Photo {
  id: string;
  dataUrl: string;
  createdAt: number;
}

export interface Alarm {
  time: string;
  enabled: boolean;
}

export const DEFAULT_ALARM: Alarm = { time: '07:00', enabled: false };

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const bootTime = Date.now();

export const CONTACTS_SEED: Contact[] = [
  { id: 'c1', name: 'Ana Garcia', number: '+34 600 555 101' },
  { id: 'c2', name: 'Marco Rossi', number: '+34 600 555 102' },
  { id: 'c3', name: 'Lucia Fernandez', number: '+34 600 555 103' },
  { id: 'c4', name: 'Office Reception', number: '+34 910 555 200' },
];

export const MESSAGES_SEED: Message[] = [
  { id: 'm1', number: '+34 600 555 101', direction: 'in', text: 'Are we still on for dinner tonight?', at: bootTime - 90 * MINUTE },
  { id: 'm2', number: '+34 600 555 101', direction: 'out', text: 'Yes! See you at nine.', at: bootTime - 80 * MINUTE },
  { id: 'm3', number: '+34 600 555 102', direction: 'in', text: 'Did you get the files I sent?', at: bootTime - 30 * MINUTE },
];

export const CALLS_SEED: CallEntry[] = [
  { id: 'h1', number: '+34 600 555 102', direction: 'in', at: bootTime - 45 * MINUTE, duration: 124 },
  { id: 'h2', number: '+34 910 555 200', direction: 'missed', at: bootTime - 3 * HOUR, duration: 0 },
  { id: 'h3', number: '+34 600 555 101', direction: 'out', at: bootTime - 5 * HOUR, duration: 37 },
];

export const NOTES_SEED: Note[] = [
  { id: 'n1', title: 'Welcome', body: 'Select a note to edit it. Changes are saved automatically.', updated: bootTime },
];
