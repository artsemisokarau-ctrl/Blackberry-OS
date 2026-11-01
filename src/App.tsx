import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import ClicksBody from '@/components/clicks/ClicksBody';
import ClicksScreen, { ClicksBootScreen } from '@/components/clicks/ClicksScreen';
import MyPhones from '@/components/MyPhones';
import PhoneBody from '@/components/PhoneBody';
import BlackBerryToolbar from '@/components/BlackBerryToolbar';
import UnboxingOverlay from '@/components/unbox/UnboxingOverlay';
import ComputerOverlay from '@/components/computer/ComputerOverlay';
import WelcomeScreen from '@/components/screen/WelcomeScreen';
import { BUNDLES } from '@/lib/store';
import { PRODUCT_BY_ID } from '@/lib/products';
import { BUTTON_CLASS } from '@/components/ui/buttonStyles';
import NokiaBody from '@/components/nokia/NokiaBody';
import NokiaScreen, { NokiaBootScreen, NokiaClosedDisplay } from '@/components/nokia/NokiaScreen';
import AppView from '@/components/screen/AppView';
import BootScreen from '@/components/screen/BootScreen';
import HomeScreen from '@/components/screen/HomeScreen';
import MenuOverlay from '@/components/screen/MenuOverlay';
import VolumeOsd from '@/components/screen/VolumeOsd';
import { useBattery } from '@/hooks/useBattery';
import { useStore } from '@/hooks/useStore';
import { useWallet } from '@/hooks/useWallet';
import { usePersistentState } from '@/hooks/usePersistentState';
import { usePhonePose } from '@/hooks/usePhonePose';
import { useSettings } from '@/hooks/useSettings';
import { APPS, DOCK_SIZE, type AppId } from '@/lib/apps';
import { BatteryContext } from '@/lib/battery';
import { AppKeysContext, type KeyHandler, type RegisterKeys } from '@/lib/appKeys';
import { mapPhysicalKey, type KeyInput } from '@/lib/keys';
import { type DeviceId } from '@/lib/devices';
import { findPhoneColor, type PhoneColorId } from '@/lib/phoneColors';
import { STORAGE_KEYS } from '@/lib/records';

type PowerState = 'off' | 'booting' | 'on' | 'shutting';

const BOOT_MS = 3800;
const SHUTDOWN_MS = 900;
const GRID_COLUMNS = 4;
const VOLUME_MAX = 10;
const VOLUME_OSD_MS = 1400;
const PHONE_WIDTH = 380;
const PHONE_HEIGHT = 740;
const POWER_MENU_ITEMS = ['Restart', 'Shut Down'];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function App() {
  const [power, setPower] = useState<PowerState>('off');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [volume, setVolume] = useState(6);
  const [volumeOsdVisible, setVolumeOsdVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const [launchNumber, setLaunchNumber] = useState<string | undefined>(undefined);
  const [unboxingOrderId, setUnboxingOrderId] = useState<string | null>(null);
  const [computerOpen, setComputerOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [previewColor, setPreviewColor] = useState<PhoneColorId | null>(null);
  const [device, setDevice] = usePersistentState<DeviceId>(STORAGE_KEYS.device, 'blackberry');
  const [showPhones, setShowPhones] = useState(false);
  const [flipOpen, setFlipOpen] = useState(true);
  const keyHandlers = useRef<KeyHandler[]>([]);
  const { settings, updateSettings } = useSettings();
  const wallet = useWallet();
  const store = useStore(wallet);
  const unboxingOrder = store.state.orders.find((order) => order.id === unboxingOrderId) ?? null;
  const bodyColor = findPhoneColor(previewColor ?? settings.phoneColor);

  useEffect(() => {
    if (power !== 'booting' && power !== 'shutting') return;
    const timer = setTimeout(
      () => setPower(power === 'booting' ? 'on' : 'off'),
      power === 'booting' ? BOOT_MS : SHUTDOWN_MS,
    );
    return () => clearTimeout(timer);
  }, [power]);

  useEffect(() => {
    if (!volumeOsdVisible) return;
    const timer = setTimeout(() => setVolumeOsdVisible(false), VOLUME_OSD_MS);
    return () => clearTimeout(timer);
  }, [volumeOsdVisible, volume]);

  useEffect(() => {
    const fit = () =>
      setScale(Math.min(1, (window.innerHeight - 32) / PHONE_HEIGHT, (window.innerWidth - 32) / PHONE_WIDTH));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const resetSession = () => {
    setActiveApp(null);
    setMenuIndex(null);
    setDrawerOpen(false);
  };

  const restart = () => {
    resetSession();
    setPower('booting');
  };

  const shutDown = () => {
    resetSession();
    setPower('shutting');
  };

  const pose = usePhonePose();
  const battery = useBattery(power === 'on' && device === 'blackberry', shutDown);

  const togglePower = () => {
    if (power === 'off') setPower('booting');
    else if (power === 'on') shutDown();
  };

  const chooseDevice = (next: DeviceId) => {
    if (next !== device) {
      setPower('off');
      resetSession();
      setDevice(next);
    }
    pose.reset();
    setShowPhones(false);
  };

  const changeVolume = (delta: number) => {
    setVolume((level) => clamp(level + delta, 0, VOLUME_MAX));
    setVolumeOsdVisible(true);
  };

  const showDock = () => {
    setDrawerOpen(false);
    setSelectedIndex((index) => clamp(index, 0, DOCK_SIZE - 1));
  };

  const openApp = (appId: AppId, number?: string) => {
    setLaunchNumber(number);
    setActiveApp(appId);
    showDock();
  };

  const jumpToLetter = (letter: string) => {
    const target = letter.toLowerCase();
    const matches = APPS.flatMap((app, index) => (app.label.toLowerCase().startsWith(target) ? [index] : []));
    if (matches.length === 0) return;
    setSelectedIndex(matches.find((index) => index > selectedIndex) ?? matches[0]);
  };

  const registerKeys = useCallback<RegisterKeys>((handler) => {
    keyHandlers.current = [...keyHandlers.current, handler];
    return () => {
      keyHandlers.current = keyHandlers.current.filter((item) => item !== handler);
    };
  }, []);

  const dispatchToApp = (key: KeyInput): boolean => {
    const handlers = keyHandlers.current;
    for (let index = handlers.length - 1; index >= 0; index--) {
      if (handlers[index](key)) return true;
    }
    return false;
  };

  const handleKey = (key: KeyInput) => {
    if (power !== 'on') return;

    if (menuIndex !== null) {
      switch (key) {
        case 'up':
          setMenuIndex(clamp(menuIndex - 1, 0, POWER_MENU_ITEMS.length - 1));
          return;
        case 'down':
          setMenuIndex(clamp(menuIndex + 1, 0, POWER_MENU_ITEMS.length - 1));
          return;
        case 'select':
          if (menuIndex === 0) restart();
          else shutDown();
          return;
        case 'back':
        case 'menu':
        case 'end':
          setMenuIndex(null);
          return;
        default:
          return;
      }
    }

    if (dispatchToApp(key)) return;
    if (device !== 'blackberry') return;

    if (activeApp) {
      if (key === 'back' || key === 'end') setActiveApp(null);
      return;
    }

    if (drawerOpen) {
      switch (key) {
        case 'left':
          setSelectedIndex((index) => clamp(index - 1, 0, APPS.length - 1));
          return;
        case 'right':
          setSelectedIndex((index) => clamp(index + 1, 0, APPS.length - 1));
          return;
        case 'up':
          setSelectedIndex((index) => clamp(index - GRID_COLUMNS, 0, APPS.length - 1));
          return;
        case 'down':
          setSelectedIndex((index) => clamp(index + GRID_COLUMNS, 0, APPS.length - 1));
          return;
        case 'select':
          openApp(APPS[selectedIndex].id);
          return;
        case 'back':
        case 'end':
          showDock();
          return;
        default:
          if (/^[a-z0-9]$/i.test(key)) jumpToLetter(key);
          return;
      }
    }

    switch (key) {
      case 'left':
        setSelectedIndex((index) => clamp(index - 1, 0, DOCK_SIZE - 1));
        return;
      case 'right':
        setSelectedIndex((index) => clamp(index + 1, 0, DOCK_SIZE - 1));
        return;
      case 'down':
        setDrawerOpen(true);
        return;
      case 'select':
        openApp(APPS[selectedIndex].id);
        return;
      case 'call':
        openApp('phone');
        return;
      case 'menu':
        setMenuIndex(0);
        return;
      default:
        return;
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (computerOpen) return;
      const key = mapPhysicalKey(event);
      if (key === null) return;
      event.preventDefault();
      handleKey(key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  let screen: ReactNode = null;
  if (power === 'booting') {
    screen = device === 'nokia' ? <NokiaBootScreen /> : device === 'clicks' ? <ClicksBootScreen /> : <BootScreen />;
  } else if (power === 'on' || power === 'shutting') {
    screen = (
      <>
        {device === 'nokia' ? (
          <NokiaScreen />
        ) : device === 'clicks' ? (
          <ClicksScreen />
        ) : activeApp ? (
          <AppView
            appId={activeApp}
            launchNumber={launchNumber}
            settings={settings}
            onSettingsChange={updateSettings}
            onOpenApp={openApp}
            onPhonePreview={setPreviewColor}
          />
        ) : (
          <HomeScreen
            selectedIndex={selectedIndex}
            wallpaper={settings.wallpaper}
            drawerOpen={drawerOpen}
          />
        )}
        {power === 'on' && (
          <div
            className="pointer-events-none absolute inset-0 bg-black"
            style={{ opacity: ((100 - settings.brightness) / 100) * 0.7 }}
          />
        )}
        {menuIndex !== null && (
          <MenuOverlay title="Menu" items={POWER_MENU_ITEMS} selectedIndex={menuIndex} />
        )}
        {power === 'on' && device === 'blackberry' && volumeOsdVisible && (
          <VolumeOsd level={volume} max={VOLUME_MAX} />
        )}
        {power === 'shutting' && <div className="bb-fade-in absolute inset-0 bg-black" />}
      </>
    );
  }

  if (!entered) {
    return (
      <WelcomeScreen
        onEnter={() => {
          setEntered(true);
          setComputerOpen(true);
        }}
      />
    );
  }

  return (
    <AppKeysContext.Provider value={registerKeys}>
    <BatteryContext.Provider value={battery}>
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_30%,#262a31_0%,#0a0b0d_70%)] p-4">
        <div style={{ zoom: scale }} className="flex flex-col items-center gap-5">
          {showPhones ? (
            <MyPhones current={device} onSelect={chooseDevice} />
          ) : device === 'nokia' ? (
            <NokiaBody
              screen={screen}
              closedDisplay={power === 'on' ? <NokiaClosedDisplay /> : null}
              open={flipOpen}
              onToggleOpen={() => setFlipOpen((value) => !value)}
              onKey={handleKey}
              onPower={togglePower}
            />
          ) : device === 'clicks' ? (
            <ClicksBody screen={screen} onKey={handleKey} onPower={togglePower} />
          ) : (
            <PhoneBody
              screen={screen}
              onKey={handleKey}
              onPower={togglePower}
              onVolume={changeVolume}
              color={bodyColor}
              pose={pose.pose}
              dragging={pose.dragging}
              inspecting={pose.inspecting}
              bindings={pose.bindings}
            />
          )}
          {!showPhones && device === 'blackberry' && (
            <BlackBerryToolbar pose={pose} battery={battery} />
          )}
          <div className="flex items-center gap-3">
            {!showPhones && device === 'nokia' && (
              <button type="button" onClick={() => setFlipOpen((value) => !value)} className={BUTTON_CLASS}>
                {flipOpen ? 'Close flip' : 'Open flip'}
              </button>
            )}
            <button type="button" onClick={() => setShowPhones((value) => !value)} className={BUTTON_CLASS}>
              {showPhones ? 'Back to phone' : 'My Phones'}
            </button>
            <button type="button" onClick={() => setComputerOpen(true)} className={BUTTON_CLASS}>
              computer
            </button>
          </div>
        </div>
      </div>
    {computerOpen && (
      <ComputerOverlay
        store={store}
        wallet={wallet}
        canClose={store.state.orders.length > 0}
        onUnbox={setUnboxingOrderId}
        onClose={() => setComputerOpen(false)}
      />
    )}
    {unboxingOrder && (
      <UnboxingOverlay
        product={PRODUCT_BY_ID[unboxingOrder.productId]}
        itemIds={BUNDLES[unboxingOrder.bundleId].items}
        onClose={() => setUnboxingOrderId(null)}
        onComplete={() => {
          store.markOpened(unboxingOrder.id);
          wallet.recordUnbox(unboxingOrder.productId);
          setUnboxingOrderId(null);
        }}
      />
    )}
    </BatteryContext.Provider>
    </AppKeysContext.Provider>
  );
}
