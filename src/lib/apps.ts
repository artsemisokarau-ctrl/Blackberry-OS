import {
  CalendarDays,
  Calculator,
  Camera,
  Clock,
  Download,
  Gamepad2,
  Globe,
  Image,
  MessageSquare,
  Music,
  Phone,
  Radio,
  Settings,
  StickyNote,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type AppId =
  | 'phone'
  | 'messages'
  | 'contacts'
  | 'camera'
  | 'pictures'
  | 'music'
  | 'radio'
  | 'calendar'
  | 'calculator'
  | 'notes'
  | 'clock'
  | 'games'
  | 'downloads'
  | 'browser'
  | 'settings';

export interface AppDefinition {
  id: AppId;
  label: string;
  icon: LucideIcon;
  tint: string;
}

export const APPS: AppDefinition[] = [
  { id: 'phone', label: 'Phone', icon: Phone, tint: '#2fa65a' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, tint: '#2f8fe0' },
  { id: 'contacts', label: 'Contacts', icon: Users, tint: '#3b6fb8' },
  { id: 'camera', label: 'Camera', icon: Camera, tint: '#5b6470' },
  { id: 'pictures', label: 'Pictures', icon: Image, tint: '#1f9aa8' },
  { id: 'music', label: 'Music', icon: Music, tint: '#d9486a' },
  { id: 'radio', label: 'FM Radio', icon: Radio, tint: '#e0802f' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, tint: '#d8453a' },
  { id: 'calculator', label: 'Calculator', icon: Calculator, tint: '#4a5059' },
  { id: 'notes', label: 'Notes', icon: StickyNote, tint: '#e3b72e' },
  { id: 'clock', label: 'Clock', icon: Clock, tint: '#23272e' },
  { id: 'games', label: 'Games', icon: Gamepad2, tint: '#6aa83a' },
  { id: 'downloads', label: 'Downloads', icon: Download, tint: '#2f8fe0' },
  { id: 'browser', label: 'Opera Mini', icon: Globe, tint: '#d7261e' },
  { id: 'settings', label: 'Settings', icon: Settings, tint: '#6b7280' },
];

export const DOCK_SIZE = 4;

export const APP_BY_ID = Object.fromEntries(APPS.map((app) => [app.id, app])) as Record<AppId, AppDefinition>;
