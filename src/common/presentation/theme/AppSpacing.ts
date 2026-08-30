/**
 * A 4pt grid. Use the token, not the number — `spacing.md` survives a density
 * change; a hard-coded `16` does not.
 */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Standard screen gutter. Match neighbouring screens before inventing a new one. */
export const SCREEN_PADDING = spacing.md;
