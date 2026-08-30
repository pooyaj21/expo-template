export type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;

export type AnalyticsIdentity = {
  userId?: string;
  email?: string;
  language?: string;
  country?: string;
};

/**
 * One vendor = one adapter. Adding Mixpanel, Firebase, Adjust or Meta means
 * writing an adapter and registering it — no call site changes, and no vendor
 * SDK imported from feature code.
 */
export interface AnalyticsAdapter {
  readonly name: string;
  init?: () => Promise<void> | void;
  identify?: (identity: AnalyticsIdentity) => void;
  track: (event: string, params?: AnalyticsParams) => void;
  screen?: (name: string, params?: AnalyticsParams) => void;
  reset?: () => void;
}
