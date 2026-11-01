export type ControlKey = 'up' | 'down' | 'left' | 'right' | 'select' | 'back' | 'menu' | 'call' | 'end' | 'backspace';

// A KeyInput is either a control action or a single typed character.
export type KeyInput = ControlKey | string;

export function mapPhysicalKey(event: KeyboardEvent): KeyInput | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;

  switch (event.key) {
    case 'ArrowUp':
      return 'up';
    case 'ArrowDown':
      return 'down';
    case 'ArrowLeft':
      return 'left';
    case 'ArrowRight':
      return 'right';
    case 'Enter':
      return 'select';
    case 'Escape':
      return 'back';
    case 'Backspace':
      return 'backspace';
    case 'Tab':
      return 'menu';
    case 'F1':
      return 'call';
    case 'End':
      return 'end';
    default:
      return event.key.length === 1 ? event.key : null;
  }
}
