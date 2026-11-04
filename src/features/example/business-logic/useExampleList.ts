import {
  infiniteListMapper,
  infiniteTotalMapper,
} from "@/common/data-access/api/pagination";
import { useExampleListQuery } from "@/features/example/data-access/exampleQueries";
import { ExampleListPayload } from "@/features/example/data-access/exampleTypes";

export const useExampleList = (params: ExampleListPayload = {}) => {
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useExampleListQuery(params);

  const list = infiniteListMapper(data);

  return {
    list,
    total: infiniteTotalMapper(data),
    isLoading: isLoading || (isFetching && !isFetchingNextPage),
    isEmpty: !isLoading && list.length === 0,
    error: error ?? undefined,
    refetch,
    pagination: {
      isFetchingNextPage,
      fetchNextPageIfAvailable: () => {
        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
      },
    },
  };
};
