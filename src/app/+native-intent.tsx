/**
 * Single deep-link parse point (see `.ai/rules/deeplinks.md`).
 * Normalize / remap inbound system paths here, then land on routes that
 * `useAppRouter` already catalogs. Returning null keeps Expo Router defaults.
 */
export const redirectSystemPath = () => null;
