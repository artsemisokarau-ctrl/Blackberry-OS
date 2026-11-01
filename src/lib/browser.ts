export interface SpeedDial {
  label: string;
  url: string;
  color: string;
}

export const SPEED_DIALS: SpeedDial[] = [
  { label: 'Wikipedia', url: 'https://en.wikipedia.org/', color: '#4a5059' },
  { label: 'Example', url: 'https://example.com/', color: '#2f8fe0' },
  { label: 'Gutenberg', url: 'https://www.gutenberg.org/', color: '#8a5a2b' },
  { label: 'Wiktionary', url: 'https://en.wiktionary.org/', color: '#2fa65a' },
];

export type AddressResult = { ok: true; url: string } | { ok: false; error: string };

export function resolveAddress(input: string): AddressResult {
  const text = input.trim();
  if (!text) return { ok: false, error: 'Type a web address or search term.' };

  let candidate: string;
  if (/^https?:\/\//i.test(text)) {
    candidate = text;
  } else if (/^[a-z][a-z0-9+-]*:/i.test(text)) {
    return { ok: false, error: 'Only web addresses can be opened.' };
  } else if (/\s/.test(text) || !text.includes('.')) {
    return {
      ok: true,
      url: `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(text)}`,
    };
  } else {
    candidate = `https://${text}`;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { ok: false, error: 'Only web addresses can be opened.' };
    }
    return { ok: true, url: parsed.toString() };
  } catch {
    return { ok: false, error: 'That address does not look right.' };
  }
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
