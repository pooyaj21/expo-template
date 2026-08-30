import { createContext, ReactNode, useContext, useMemo } from "react";

/**
 * Everything a cache entry is implicitly scoped by — environment, language,
 * signed-in user. Miss one and you serve an Arabic user the English response,
 * or the previous account's data after a switch.
 *
 * Note the direction: the kernel declares the slot and the core slices fill it
 * (see `features/core/CoreProviders`), so `common/` never imports a feature.
 */
const QueryScopeContext = createContext<readonly unknown[]>([]);

export const QueryScopeProvider = ({
  scope,
  children,
}: {
  scope: readonly unknown[];
  children: ReactNode;
}) => {
  const value = useMemo(() => scope, [scope]);
  return (
    <QueryScopeContext.Provider value={value}>
      {children}
    </QueryScopeContext.Provider>
  );
};

/**
 * Wrap EVERY `queryKey` / `mutationKey` in this. Kebab-case string first:
 *
 *   queryKey: useDefaultQueryKey(["product-detail", slug])
 */
export const useDefaultQueryKey = (parts: readonly unknown[]) => {
  const scope = useContext(QueryScopeContext);
  return [...parts, ...scope];
};
