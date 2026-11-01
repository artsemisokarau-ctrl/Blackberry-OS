export const PHONE_COLORS = [
  { id: 'piano-black', label: 'Piano Black', base: '#17171b', logoTone: 'light', finish: 'Glossy black plastic' },
  { id: 'pure-white', label: 'Pure White', base: '#e6e8ec', logoTone: 'dark', finish: 'Glossy white plastic' },
  { id: 'silver', label: 'Silver', base: '#9ea4ad', logoTone: 'dark', finish: 'Metallic silver' },
  { id: 'classic-deep-red', label: 'Classic Deep Red', base: '#5e1118', logoTone: 'light', finish: 'Solid deep red' },
  { id: 'dark-navy-blue', label: 'Dark Navy Blue', base: '#16264a', logoTone: 'light', finish: 'Deep navy' },
] as const;

export type PhoneColorId = (typeof PHONE_COLORS)[number]['id'];
export type PhoneColor = (typeof PHONE_COLORS)[number];

export function findPhoneColor(id: PhoneColorId): PhoneColor {
  return PHONE_COLORS.find((color) => color.id === id) ?? PHONE_COLORS[0];
}
