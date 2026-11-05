/**
 * Central `routes` lookup. Pure functions — usable from screens, menus, and
 * redirects. Never hardcode path strings at call sites; add a function here
 * (or bind a feature-owned builder) instead.
 */
import { Href } from "expo-router";

export const routes = {
  home: (): Href => "/",
  tabs: (): Href => "/(tabs)",
  exampleDetail: (id: string | number): Href =>
    `/example/${encodeURIComponent(String(id))}` as Href,
  notFound: (): Href => "/+not-found",
} as const;
