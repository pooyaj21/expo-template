/**
 * The event catalog. A tracked event that is not in here does not exist —
 * that is what stops "sign_in", "signIn" and "Sign In" from all shipping.
 */
export const AnalyticsEvents = {
  APP_OPEN: "app_open",
  SCREEN_VIEW: "screen_view",
  SIGN_IN: "sign_in",
  SIGN_UP: "sign_up",
  SIGN_OUT: "sign_out",
  SOCIAL_LOGIN: "social_login",
  LANGUAGE_CHANGED: "language_changed",
  SEARCH: "search",
  SHARE: "share",
  ERROR: "error",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
