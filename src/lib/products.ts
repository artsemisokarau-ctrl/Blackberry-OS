import { PHONE_COLORS } from '@/lib/phoneColors';

export type ProductId =
  | 'curve-9320'
  | 'passport'
  | 'classic-q20'
  | 'keyone'
  | 'key2'
  | 'nokia-3310-2017'
  | 'nokia-3210-2024'
  | 'nokia-8110-4g'
  | 'titan-2'
  | 'punkt-mp02'
  | 'light-phone-iii'
  | 'sidephone-sp-01';

export type CategoryId = 'all' | 'blackberry' | 'nokia' | 'qwerty' | 'dumbphones' | 'retro';

export type KeyLayout = 'qwerty-3' | 'qwerty-4' | 'keypad' | 'none';

export interface ProductColor {
  id: string;
  label: string;
  base: string;
}

export interface Product {
  id: ProductId;
  name: string;
  brand: string;
  categories: Exclude<CategoryId, 'all'>[];
  summary: string;
  details: string[];
  colors: ProductColor[];
  basePrice: number;
  aspect: number;
  handsetNote: string;
  keys: KeyLayout;
  presentation: 'box' | 'sketch';
}

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'all', label: 'All phones' },
  { id: 'blackberry', label: 'BlackBerry' },
  { id: 'nokia', label: 'Nokia' },
  { id: 'qwerty', label: 'QWERTY Phones' },
  { id: 'dumbphones', label: 'Dumbphones' },
  { id: 'retro', label: 'Modern Retro Phones' },
];

const STANDARD_FINISH: ProductColor[] = [{ id: 'standard', label: 'Standard finish', base: '#3b3e46' }];

export const PRODUCTS: Product[] = [
  {
    id: 'curve-9320',
    name: 'BlackBerry Curve 9320',
    brand: 'BlackBerry',
    categories: ['blackberry', 'qwerty'],
    summary: 'Compact QWERTY smartphone with a navigation trackpad, shipped in its retail box.',
    details: ['2.44 inch display', 'Full QWERTY keyboard and trackpad', 'Removable battery'],
    colors: PHONE_COLORS.map((color) => ({ id: color.id, label: color.label, base: color.base })),
    basePrice: 50,
    aspect: 0.5,
    handsetNote: 'The handset itself, with a full QWERTY keyboard, navigation trackpad and a camera on the back.',
    keys: 'qwerty-4',
    presentation: 'box',
  },
  {
    id: 'passport',
    name: 'BlackBerry Passport',
    brand: 'BlackBerry',
    categories: ['blackberry', 'qwerty'],
    summary: 'Square-screen BlackBerry with a full three-row QWERTY keyboard and a long-lasting battery.',
    details: [
      '4.5 inch square 1440 x 1440 display',
      'Three-row QWERTY keyboard',
      '13 MP rear camera, 2 MP front camera',
      '3450 mAh non-removable battery',
      '128 x 90.3 x 9.3 mm',
      'BlackBerry OS 10.3',
    ],
    colors: [
      { id: 'passport-black', label: 'Black', base: '#15161a' },
      { id: 'passport-white', label: 'White', base: '#e8eaee' },
      { id: 'passport-red', label: 'Red', base: '#7d1420' },
      { id: 'passport-black-gold', label: 'Black & Gold', base: '#22201b' },
      { id: 'passport-silver', label: 'Silver', base: '#b8bec7' },
    ],
    basePrice: 90,
    aspect: 0.706,
    handsetNote: 'The handset itself, with a square display and a three-row QWERTY keyboard.',
    keys: 'qwerty-3',
    presentation: 'sketch',
  },
  {
    id: 'classic-q20',
    name: 'BlackBerry Classic (Q20)',
    brand: 'BlackBerry',
    categories: ['blackberry', 'qwerty'],
    summary: 'Compact BlackBerry with a square 3.5 inch display and a physical QWERTY keyboard.',
    details: [
      '3.5 inch square 720p display',
      'Physical QWERTY keyboard',
      '8 MP rear camera, 2 GB RAM',
      '2525 mAh non-removable battery',
      '131 x 72.5 x 10.2 mm, 177 g',
    ],
    colors: [
      { id: 'classic-black', label: 'Black', base: '#16171b' },
      { id: 'classic-white', label: 'White', base: '#e6e7ea' },
      { id: 'classic-blue', label: 'Blue', base: '#2b4f8a' },
    ],
    basePrice: 75,
    aspect: 0.553,
    handsetNote: 'The handset itself, with a square display and a physical QWERTY keyboard.',
    keys: 'qwerty-3',
    presentation: 'sketch',
  },
  {
    id: 'keyone',
    name: 'BlackBerry KEYone',
    brand: 'BlackBerry',
    categories: ['blackberry', 'qwerty'],
    summary: 'Four-row QWERTY keyboard with a fingerprint sensor in the space bar and a 4.5 inch 3:2 display.',
    details: [
      '4.5 inch 1080 x 1620 display',
      'Four-row QWERTY keyboard that also works as a trackpad',
      '12 MP rear camera',
      '3505 mAh non-removable battery, 18W USB-C charging',
      '3.5 mm headphone jack',
      'Android 7.1 (upgradable to 8.1)',
      '149.1 x 72.4 x 9.4 mm, 180 g',
    ],
    colors: [
      { id: 'keyone-silver', label: 'Silver', base: '#b9bec6' },
      { id: 'keyone-black', label: 'Black Edition', base: '#15161a' },
      { id: 'keyone-bronze', label: 'Bronze Edition', base: '#8a6240' },
    ],
    basePrice: 85,
    aspect: 0.486,
    handsetNote: 'The handset itself, with a four-row QWERTY keyboard and a fingerprint sensor in the space bar.',
    keys: 'qwerty-4',
    presentation: 'sketch',
  },
  {
    id: 'key2',
    name: 'BlackBerry KEY2',
    brand: 'BlackBerry',
    categories: ['blackberry', 'qwerty'],
    summary: 'Four-row QWERTY keyboard with a convenience key and a 4.5 inch 3:2 display.',
    details: [
      '4.5 inch 1080 x 1620 display',
      'Four-row QWERTY keyboard with a convenience key',
      '12 MP rear camera',
      '3500 mAh non-removable battery, USB-C 18W charging',
      '3.5 mm headphone jack',
      'Android 8.1',
      '151.4 x 71.8 x 8.5 mm, 168 g',
    ],
    colors: [
      { id: 'key2-black', label: 'Black', base: '#15161a' },
      { id: 'key2-silver', label: 'Silver', base: '#c2c7cf' },
      { id: 'key2-red', label: 'Red', base: '#8c1a22' },
    ],
    basePrice: 95,
    aspect: 0.474,
    handsetNote: 'The handset itself, with a four-row QWERTY keyboard and a convenience key.',
    keys: 'qwerty-4',
    presentation: 'sketch',
  },
  {
    id: 'nokia-3310-2017',
    name: 'Nokia 3310 (2017)',
    brand: 'Nokia',
    categories: ['nokia', 'dumbphones', 'retro'],
    summary: 'Reissue of the classic Nokia 3310 with a 2.4 inch screen and a removable battery.',
    details: [
      '2.4 inch 240 x 320 display',
      '2 MP rear camera',
      '1200 mAh removable battery',
      'Glass front, plastic back',
      '115.6 x 51 x 12.8 mm, 85 g',
    ],
    colors: [
      { id: 'nokia3310-red', label: 'Warm Red', base: '#b8322c' },
      { id: 'nokia3310-blue', label: 'Dark Blue', base: '#22345c' },
      { id: 'nokia3310-yellow', label: 'Yellow', base: '#e2b72a' },
      { id: 'nokia3310-grey', label: 'Grey', base: '#7b7f86' },
    ],
    basePrice: 35,
    aspect: 0.441,
    handsetNote: 'The handset itself, with a 2.4 inch screen and a classic keypad.',
    keys: 'keypad',
    presentation: 'sketch',
  },
  {
    id: 'nokia-3210-2024',
    name: 'Nokia 3210 (2024)',
    brand: 'Nokia',
    categories: ['nokia', 'dumbphones', 'retro'],
    summary: 'Modern take on the 3210 with a 2.4 inch QVGA screen, a keypad and a removable battery.',
    details: [
      '2.4 inch QVGA display',
      '2 MP rear camera with LED flash',
      '1450 mAh removable battery',
      'USB-C charging, 3.5 mm headphone jack',
      'Bluetooth 5.0, FM radio, Snake',
    ],
    colors: [
      { id: 'nokia3210-black', label: 'Grunge Black', base: '#1d1e21' },
      { id: 'nokia3210-gold', label: 'Y2K Gold', base: '#c99a3e' },
      { id: 'nokia3210-blue', label: 'Subba Blue', base: '#3d6fa6' },
    ],
    basePrice: 30,
    aspect: 0.426,
    handsetNote: 'The handset itself, with a 2.4 inch screen and a keypad.',
    keys: 'keypad',
    presentation: 'sketch',
  },
  {
    id: 'nokia-8110-4g',
    name: 'Nokia 8110 4G',
    brand: 'Nokia',
    categories: ['nokia', 'dumbphones', 'retro'],
    summary: 'Curved slider phone running KaiOS, with a 2.4 inch screen and a removable battery.',
    details: [
      '2.4 inch 240 x 320 display',
      '2 MP rear camera',
      '1500 mAh battery',
      'KaiOS',
      'Micro-USB charging, 3.5 mm headphone jack',
      '133.5 x 49.3 x 14.9 mm, 117 g',
    ],
    colors: [
      { id: 'nokia8110-black', label: 'Traditional Black', base: '#1c1d20' },
      { id: 'nokia8110-yellow', label: 'Banana Yellow', base: '#e8c53a' },
    ],
    basePrice: 45,
    aspect: 0.369,
    handsetNote: 'The handset itself, a curved slider with a keypad.',
    keys: 'keypad',
    presentation: 'sketch',
  },
  {
    id: 'titan-2',
    name: 'Unihertz Titan 2',
    brand: 'Unihertz',
    categories: ['qwerty'],
    summary: 'Android phone with a three-row QWERTY keyboard, a square 4.5 inch display and a 2 inch rear screen.',
    details: [
      '4.5 inch 1440 x 1440 square display',
      '2 inch rear sub-screen',
      'Three-row QWERTY keyboard with touch scrolling',
      '50 MP main and 8 MP telephoto rear cameras, 32 MP front',
      '5050 mAh non-removable battery, USB-C 33W charging',
      'Android 15 (upgradable to Android 16)',
      '137.8 x 88.7 x 10.8 mm, 235 g',
    ],
    colors: [{ id: 'titan2-black', label: 'Black', base: '#17181c' }],
    basePrice: 120,
    aspect: 0.644,
    handsetNote: 'The handset itself, with a three-row QWERTY keyboard and a 2 inch rear screen.',
    keys: 'qwerty-3',
    presentation: 'sketch',
  },
  {
    id: 'punkt-mp02',
    name: 'Punkt MP02',
    brand: 'Punkt',
    categories: ['dumbphones', 'retro'],
    summary: 'Minimal phone with a physical keypad and a small screen, built around calls and messages.',
    details: [
      '2 inch 320 x 240 display',
      'Physical keypad with backlit keys',
      '1280 mAh removable battery',
      'Polycarbonate body with textured coating, IP52 splash-proof',
      '117 x 51.3 x 14.4 mm, 100 g',
    ],
    colors: [
      { id: 'punkt-black', label: 'Black', base: '#1c1d20' },
      { id: 'punkt-light-blue', label: 'Light Blue', base: '#a9c6e0' },
      { id: 'punkt-light-grey', label: 'Light Grey', base: '#c4c7cb' },
    ],
    basePrice: 60,
    aspect: 0.438,
    handsetNote: 'The handset itself, with a physical keypad and a small screen.',
    keys: 'keypad',
    presentation: 'sketch',
  },
  {
    id: 'light-phone-iii',
    name: 'Light Phone III',
    brand: 'The Light Phone',
    categories: ['dumbphones', 'retro'],
    summary: 'Screen-light phone with no keyboard, controlled by a side button and a tactile scroll wheel.',
    details: [
      '3.92 inch 1080 x 1240 AMOLED display',
      'No keyboard: side button and tactile scroll wheel',
      '50 MP rear camera, 8 MP front camera',
      '1800 mAh battery',
      'USB-C 2.0 charging',
      '106 x 71.5 x 12 mm, 124 g',
      'Matte black finish',
    ],
    colors: [{ id: 'light-black', label: 'Matte Black', base: '#131417' }],
    basePrice: 110,
    aspect: 0.675,
    handsetNote: 'The handset itself, with a side button and a tactile scroll wheel instead of a keyboard.',
    keys: 'none',
    presentation: 'sketch',
  },
  {
    id: 'sidephone-sp-01',
    name: 'Sidephone SP-01',
    brand: 'Sidephone',
    categories: ['retro'],
    summary: 'Simple phone with a 2.8 inch touchscreen and interchangeable keypads.',
    details: [
      '2.8 inch 480 x 640 LCD touchscreen',
      'Interchangeable keypads',
      'Recycled polycarbonate exterior',
      '128.5 x 55 x 13.2 mm, 120 g',
    ],
    colors: STANDARD_FINISH,
    basePrice: 130,
    aspect: 0.428,
    handsetNote: 'The handset itself, with a 2.8 inch touchscreen and interchangeable keypads.',
    keys: 'none',
    presentation: 'sketch',
  },
];

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((product) => [product.id, product])) as Record<
  ProductId,
  Product
>;

export function productsInCategory(categoryId: CategoryId): Product[] {
  return categoryId === 'all' ? PRODUCTS : PRODUCTS.filter((product) => product.categories.includes(categoryId));
}

export function productModelName(product: Product): string {
  return product.name.startsWith(product.brand) ? product.name.slice(product.brand.length).trim() : product.name;
}

export function findProductColor(product: Product, colorId: string): ProductColor {
  return product.colors.find((color) => color.id === colorId) ?? product.colors[0];
}
