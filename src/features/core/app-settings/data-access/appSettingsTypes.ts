/**
 * Brand-free remote settings payload for `GET /app/settings`.
 * Extend fields as the backend grows; keep defaults in `appSettingsDefaults`.
 */

export interface AppSettingsStaticPages {
  terms_and_conditions: string;
  privacy_policy: string;
  return_policy: string;
}

/** `data` payload of `GET /app/settings`. */
export interface AppSettingsData {
  static_pages: AppSettingsStaticPages;
  /** Free-form extras the backend may send; consumers opt in by key. */
  extras?: Record<string, unknown>;
}

/** Storage envelope — TTL + env/language scope for cache validity. */
export interface AppSettingsCache {
  fetchedAt: number;
  environmentId: string | number;
  language: string;
  data: AppSettingsData;
}
