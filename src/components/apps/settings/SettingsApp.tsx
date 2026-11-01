import { useState } from 'react';
import AppFrame from '@/components/ui/AppFrame';
import ListRows, { type ListRow } from '@/components/ui/ListRows';
import {
  ColorPanel,
  DeviceInfoPanel,
  DisplayPanel,
  SecurityPanel,
  SoundPanel,
  WallpaperPanel,
} from '@/components/apps/settings/SettingsPanels';
import { moveCursor, useAppKeys } from '@/lib/appKeys';
import { findPhoneColor, type PhoneColorId } from '@/lib/phoneColors';
import { PHONE_NUMBER, RINGTONES, WALLPAPERS, type Settings } from '@/lib/records';

type Panel = 'wallpaper' | 'color' | 'display' | 'sound' | 'security' | 'device';

const PANELS: Panel[] = ['wallpaper', 'color', 'display', 'sound', 'security', 'device'];

const PANEL_TITLES: Record<Panel, string> = {
  wallpaper: 'Wallpaper',
  color: 'Phone Color',
  display: 'Display',
  sound: 'Sounds',
  security: 'Security',
  device: 'Device Information',
};

interface SettingsAppProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onPhonePreview: (color: PhoneColorId | null) => void;
}

function summarize(settings: Settings): Record<Panel, string> {
  return {
    wallpaper: WALLPAPERS.find((item) => item.id === settings.wallpaper)?.label ?? '',
    color: findPhoneColor(settings.phoneColor).label,
    display: `${settings.brightness}%`,
    sound: `${RINGTONES.find((item) => item.id === settings.ringtone)?.label ?? ''} | ${settings.sound ? 'On' : 'Off'}`,
    security: settings.pin ? 'PIN set' : 'No PIN',
    device: PHONE_NUMBER,
  };
}

export default function SettingsApp({ settings, onChange, onPhonePreview }: SettingsAppProps) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [cursor, setCursor] = useState(0);

  if (panel) {
    return (
      <AppFrame appId="settings" right={PANEL_TITLES[panel]}>
        <PanelBody
          panel={panel}
          settings={settings}
          onChange={onChange}
          onPhonePreview={onPhonePreview}
          onBack={() => setPanel(null)}
        />
      </AppFrame>
    );
  }

  const summary = summarize(settings);
  const rows: ListRow[] = PANELS.map((item) => ({
    id: item,
    primary: PANEL_TITLES[item],
    right: summary[item],
  }));

  return (
    <AppFrame appId="settings" right="Options">
      <MenuList
        rows={rows}
        cursor={cursor}
        onCursor={setCursor}
        onOpen={(index) => setPanel(PANELS[index])}
      />
    </AppFrame>
  );
}

interface MenuListProps {
  rows: ListRow[];
  cursor: number;
  onCursor: (index: number) => void;
  onOpen: (index: number) => void;
}

function MenuList({ rows, cursor, onCursor, onOpen }: MenuListProps) {
  useAppKeys((key) => {
    if (key === 'select') {
      onOpen(cursor);
      return true;
    }
    const next = moveCursor(key, cursor, rows.length);
    if (next === null) return false;
    onCursor(next);
    return true;
  });

  return (
    <ListRows
      rows={rows}
      cursor={cursor}
      visible={5}
    />
  );
}

interface PanelBodyProps {
  panel: Panel;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onPhonePreview: (color: PhoneColorId | null) => void;
  onBack: () => void;
}

function PanelBody({ panel, settings, onChange, onPhonePreview, onBack }: PanelBodyProps) {
  switch (panel) {
    case 'wallpaper':
      return (
        <WallpaperPanel current={settings.wallpaper} onSelect={(wallpaper) => onChange({ wallpaper })} onBack={onBack} />
      );
    case 'color':
      return (
        <ColorPanel
          current={settings.phoneColor}
          onPreview={onPhonePreview}
          onSave={(phoneColor) => {
            onChange({ phoneColor });
            onBack();
          }}
          onBack={onBack}
        />
      );
    case 'display':
      return (
        <DisplayPanel brightness={settings.brightness} onChange={(brightness) => onChange({ brightness })} onBack={onBack} />
      );
    case 'sound':
      return (
        <SoundPanel
          ringtone={settings.ringtone}
          sound={settings.sound}
          onChange={onChange}
          onBack={onBack}
        />
      );
    case 'security':
      return <SecurityPanel pin={settings.pin} onSave={(pin) => onChange({ pin })} onBack={onBack} />;
    case 'device':
      return <DeviceInfoPanel finish={findPhoneColor(settings.phoneColor).finish} onBack={onBack} />;
  }
}
