/**
 * JTravel design tokens — shared across all reusable components.
 * Keep colors/spacing/typography here so screens stay declarative.
 */
export const colors = {
  primary: '#0B7285',
  primaryDark: '#095866',
  accent: '#F76707',
  bg: '#FFFFFF',
  surface: '#F8F9FA',
  border: '#E9ECEF',
  text: '#212529',
  textMuted: '#868E96',
  star: '#F59F00',
  success: '#2F9E44',
  danger: '#E03131',
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 26, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  title: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};

/** Emoji glyphs used as lightweight category icons in the MVP. */
export const categoryIcon: Record<string, string> = {
  restaurant: '🍜',
  cafe: '☕',
  lodging: '🏨',
  attraction: '📍',
  shopping: '🛍️',
  transport: '🚉',
};
