import { useCallback } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useApiClient } from "@/features/core/api/data-access/apiClientContext";
import { useDefaultQueryKey } from "@/common/data-access/api/queryScope";
import { nextPageParam } from "@/common/data-access/api/pagination";
import { exampleService } from "@/features/example/data-access/exampleService";
import {
  CreateExamplePayload,
  ExampleListPayload,
  UpdateExamplePayload,
} from "@/features/example/data-access/exampleTypes";

export const EXAMPLE_LIST_QUERY_PREFIX = ["example-list"] as const;
export const EXAMPLE_DETAIL_QUERY_PREFIX = ["example-detail"] as const;

export const useInvalidateExampleQueries = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (id?: number) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: EXAMPLE_LIST_QUERY_PREFIX }),
        queryClient.invalidateQueries({
          queryKey:
            id == null
              ? EXAMPLE_DETAIL_QUERY_PREFIX
              : [...EXAMPLE_DETAIL_QUERY_PREFIX, String(id)],
        }),
      ]),
    [queryClient],
  );
};

export function useExampleListQuery(params: ExampleListPayload = {}) {
  const axios = useApiClient();

  return useInfiniteQuery({
    queryKey: useDefaultQueryKey([...EXAMPLE_LIST_QUERY_PREFIX, params]),
    queryFn: ({ pageParam }) =>
      exampleService.list(axios, { ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
  });
}

export function useExampleDetailQuery(id: string) {
  const axios = useApiClient();

  return useQuery({
    queryKey: useDefaultQueryKey([...EXAMPLE_DETAIL_QUERY_PREFIX, id]),
    queryFn: () => exampleService.detail(axios, id),
    enabled: Boolean(id),
  });
}

export function useCreateExampleMutation() {
  const axios = useApiClient();

  return useMutation({
    mutationKey: useDefaultQueryKey(["create-example"]),
    mutationFn: (payload: CreateExamplePayload) =>
      exampleService.create(axios, payload),
  });
}

export function useUpdateExampleMutation() {
  const axios = useApiClient();

  return useMutation({
    mutationKey: useDefaultQueryKey(["update-example"]),
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateExamplePayload;
    }) => exampleService.update(axios, id, payload),
  });
}

export function useDeleteExampleMutation() {
  const axios = useApiClient();

  return useMutation({
    mutationKey: useDefaultQueryKey(["delete-example"]),
    mutationFn: (id: number) => exampleService.delete(axios, id),
  });
}
