export const DEVICES = [
  { id: 'blackberry', label: 'BlackBerry Curve 9320', subtitle: 'QWERTY keyboard, OS 7.1' },
  { id: 'nokia', label: 'Nokia 2660 Flip', subtitle: 'Clamshell keypad, S30+ style' },
  { id: 'clicks', label: 'Clicks Communicator', subtitle: 'Physical QWERTY, Android-style OS' },
] as const;

export type DeviceId = (typeof DEVICES)[number]['id'];
