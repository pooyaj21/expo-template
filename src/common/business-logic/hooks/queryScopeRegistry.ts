import { useSyncExternalStore } from "react";

export type QueryScopeSnapshot = {
  environmentId?: number | string;
  language?: string;
};

let snapshot: QueryScopeSnapshot = {};
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

export const setQueryScope = (partial: QueryScopeSnapshot) => {
  const next: QueryScopeSnapshot = {
    ...snapshot,
    ...partial,
  };
  if (
    next.environmentId === snapshot.environmentId &&
    next.language === snapshot.language
  ) {
    return;
  }
  snapshot = next;
  emit();
};

export const getQueryScopeSnapshot = () => snapshot;

export const subscribeQueryScope = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useQueryScopeSnapshot = (): QueryScopeSnapshot =>
  useSyncExternalStore(
    subscribeQueryScope,
    getQueryScopeSnapshot,
    getQueryScopeSnapshot,
  );
