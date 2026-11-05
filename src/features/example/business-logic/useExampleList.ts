import { useCallback, useMemo } from "react";
import { useExampleListQuery } from "@/features/example/data-access/exampleQueries";

export const useExampleList = () => {
  const query = useExampleListQuery();
  const list = useMemo(() => query.data ?? [], [query.data]);

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return {
    list,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching && !query.isLoading,
    isEmpty: !query.isLoading && list.length === 0,
    error: query.error,
    refetch: refresh,
  };
};
