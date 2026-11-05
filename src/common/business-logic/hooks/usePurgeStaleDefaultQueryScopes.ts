import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  isOutOfScope,
  useDefaultQueryScope,
} from "@/common/business-logic/hooks/useDefaultQueryKey";

const sameScope = (a: readonly unknown[], b: readonly unknown[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

/**
 * When language / env (or any default query scope segment) changes, drop cache
 * entries that belonged to the **previous** scope only. Mount under
 * `QueryClientProvider` (root layout child).
 */
export const usePurgeStaleDefaultQueryScopes = (): void => {
  const queryClient = useQueryClient();
  const scope = useDefaultQueryScope();
  const previousScopeRef = useRef<readonly unknown[] | null>(null);

  useEffect(() => {
    const previousScope = previousScopeRef.current;
    previousScopeRef.current = scope;

    if (previousScope == null) return;
    if (sameScope(previousScope, scope)) return;

    queryClient.removeQueries({
      predicate: (query) => !isOutOfScope(query.queryKey, previousScope),
    });
  }, [queryClient, scope]);
};
