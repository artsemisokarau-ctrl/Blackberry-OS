import type { AppId } from '@/lib/apps';
import type { PhoneColorId } from '@/lib/phoneColors';
import type { Settings } from '@/lib/records';
import PhoneApp from '@/components/apps/phone/PhoneApp';
import MessagesApp from '@/components/apps/messages/MessagesApp';
import ContactsApp from '@/components/apps/contacts/ContactsApp';
import CameraApp from '@/components/apps/camera/CameraApp';
import PicturesApp from '@/components/apps/pictures/PicturesApp';
import MusicApp from '@/components/apps/music/MusicApp';
import RadioApp from '@/components/apps/radio/RadioApp';
import CalendarApp from '@/components/apps/calendar/CalendarApp';
import CalculatorApp from '@/components/apps/calculator/CalculatorApp';
import NotesApp from '@/components/apps/notes/NotesApp';
import ClockApp from '@/components/apps/clock/ClockApp';
import SettingsApp from '@/components/apps/settings/SettingsApp';
import GamesApp from '@/components/apps/games/GamesApp';
import DownloadsApp from '@/components/apps/downloads/DownloadsApp';
import BrowserApp from '@/components/apps/browser/BrowserApp';

interface AppViewProps {
  appId: AppId;
  launchNumber?: string;
  settings: Settings;
  onSettingsChange: (patch: Partial<Settings>) => void;
  onOpenApp: (appId: AppId, number?: string) => void;
  onPhonePreview: (color: PhoneColorId | null) => void;
}

export default function AppView({
  appId,
  launchNumber,
  settings,
  onSettingsChange,
  onOpenApp,
  onPhonePreview,
}: AppViewProps) {
  return (
    <div className="bb-fade-in flex h-full min-h-0 w-full flex-col bg-zinc-950">
      {renderApp(appId, launchNumber, settings, onSettingsChange, onOpenApp, onPhonePreview)}
    </div>
  );
}

function renderApp(
  appId: AppId,
  launchNumber: string | undefined,
  settings: Settings,
  onSettingsChange: (patch: Partial<Settings>) => void,
  onOpenApp: (appId: AppId, number?: string) => void,
  onPhonePreview: (color: PhoneColorId | null) => void,
) {
  switch (appId) {
    case 'phone':
      return <PhoneApp initialNumber={launchNumber} />;
    case 'messages':
      return <MessagesApp initialRecipient={launchNumber} />;
    case 'contacts':
      return (
        <ContactsApp
          onCall={(number) => onOpenApp('phone', number)}
          onMessage={(number) => onOpenApp('messages', number)}
        />
      );
    case 'camera':
      return <CameraApp />;
    case 'pictures':
      return <PicturesApp />;
    case 'music':
      return <MusicApp />;
    case 'radio':
      return <RadioApp />;
    case 'calendar':
      return <CalendarApp />;
    case 'calculator':
      return <CalculatorApp />;
    case 'notes':
      return <NotesApp />;
    case 'clock':
      return <ClockApp settings={settings} />;
    case 'games':
      return <GamesApp />;
    case 'downloads':
      return <DownloadsApp />;
    case 'browser':
      return <BrowserApp />;
    case 'settings':
      return <SettingsApp settings={settings} onChange={onSettingsChange} onPhonePreview={onPhonePreview} />;
  }
}
