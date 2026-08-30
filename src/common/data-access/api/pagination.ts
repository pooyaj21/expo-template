import { InfiniteData } from "@tanstack/react-query";
import { BasePaginationResponse } from "@/common/data-access/type";

/** Flatten an infinite query's pages into the list a screen actually renders. */
export const infiniteListMapper = <T>(
  pagedData: InfiniteData<BasePaginationResponse<T>> | undefined,
): T[] => pagedData?.pages.flatMap((page) => page.data) ?? [];

export const infiniteTotalMapper = <T>(
  pagedData: InfiniteData<BasePaginationResponse<T>> | undefined,
): number | undefined => pagedData?.pages?.[0]?.pagination?.total;

/** The `getNextPageParam` every paginated list uses. */
export const nextPageParam = <T>(
  lastPage: BasePaginationResponse<T>,
): number | undefined =>
  lastPage.pagination.has_more
    ? lastPage.pagination.current_page + 1
    : undefined;
