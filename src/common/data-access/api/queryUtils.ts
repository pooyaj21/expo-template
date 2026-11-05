import { InfiniteData } from "@tanstack/query-core";
import {
  BasePaginationResponse,
  InfiniteListPagination,
} from "@/common/data-access/type/responseTypes";

export type { InfiniteListPagination } from "@/common/data-access/type/responseTypes";

export const NO_CACHE_QUERY_OPTIONS = {
  staleTime: 0,
  gcTime: 0,
  refetchOnMount: "always",
} as const;

export const infiniteListMapper = <T>(
  pagedData: InfiniteData<BasePaginationResponse<T>, unknown> | undefined,
): T[] => {
  return pagedData?.pages.flatMap((page) => page.data.items) ?? [];
};

export const infiniteTotalMapper = <T>(
  pagedData: InfiniteData<BasePaginationResponse<T>, unknown> | undefined,
): number | undefined => {
  return pagedData?.pages?.[0]?.data?.pagination?.total;
};

export const infiniteListItemMapper = <T>(
  pagedData: InfiniteData<BasePaginationResponse<T>, unknown> | undefined,
): T[] => {
  return pagedData?.pages.flatMap((page) => page.data.items) ?? [];
};

export type InfiniteListResult<T> = {
  list: T[];
  isLoading: boolean;
  error: Error | null | undefined;
  isEmpty: boolean;
  refetch: () => void;
  pagination: InfiniteListPagination;
};

type InfiniteQueryLike<T> = {
  data: InfiniteData<BasePaginationResponse<T>, unknown> | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  error: Error | null;
  refetch: () => unknown;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
};

export const mapInfiniteListQuery = <T>(
  query: InfiniteQueryLike<T>,
): InfiniteListResult<T> => {
  const list = infiniteListMapper(query.data);
  return {
    list,
    isLoading:
      query.isLoading || (query.isFetching && !query.isFetchingNextPage),
    error: !query.isSuccess || query.error ? query.error : undefined,
    isEmpty: list.length === 0,
    refetch: () => {
      void query.refetch();
    },
    pagination: {
      total: infiniteTotalMapper(query.data),
      isFetchingNextPage: query.isFetchingNextPage,
      fetchNextPageIfAvailable: () => {
        if (query.hasNextPage) query.fetchNextPage();
      },
    },
  };
};
