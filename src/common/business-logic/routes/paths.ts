/**
 * Central `routes` lookup. Pure functions — usable from screens, menus, and
 * redirects. Never hardcode path strings at call sites; add a function here
 * (or bind a feature-owned builder) instead.
 */
export const routes = {
  home: () => "/",
  tabs: () => "/(tabs)",
  exampleDetail: (id: string | number) =>
    `/example/${encodeURIComponent(String(id))}`,
  notFound: () => "/+not-found",
} as const;
