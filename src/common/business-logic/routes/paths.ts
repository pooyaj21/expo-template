/**
 * Every internal URL in the app, built here and nowhere else.
 *
 * A path written at its call site is a path that silently rots when the route
 * moves. Add a function here, then navigate with `useAppRouter()` or `<Link>`.
 */
export const routes = {
  home: () => "/",
  settings: () => "/settings",
  language: () => "/settings/language",
  debug: () => "/debug",

  // Example feature — delete with the feature
  example: () => "/example",
  exampleDetail: (id: string) => `/example/${id}`,
} as const;

export type AppRoute = ReturnType<(typeof routes)[keyof typeof routes]>;
