import { useMemo } from "react";
import { useQueryScopeSnapshot } from "@/common/business-logic/hooks/queryScopeRegistry";

/**
 * Stable scope segments appended to every default query key (env, language, …).
 * EnvironmentProvider / LocalizationProvider publish via `setQueryScope`.
 */
export const useDefaultQueryScope = (): unknown[] => {
  const { environmentId, language } = useQueryScopeSnapshot();
  return useMemo(
    () => [environmentId, language].filter((value) => value != null),
    [environmentId, language],
  );
};

export const useDefaultQueryKey = (data: unknown[]): unknown[] => [
  ...data,
  ...useDefaultQueryScope(),
];

export const isOutOfScope = (
  queryKey: readonly unknown[],
  scope: readonly unknown[],
) =>
  scope.some(
    (value, index) =>
      queryKey[queryKey.length - scope.length + index] !== value,
  );
