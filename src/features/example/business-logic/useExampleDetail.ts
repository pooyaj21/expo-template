import { useExampleDetailQuery } from "@/features/example/data-access/exampleQueries";

export const useExampleDetail = (id: string) => {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useExampleDetailQuery(id);

  return {
    example: data?.data,
    isLoading: isLoading || (isFetching && data == null),
    error: isError ? (error ?? undefined) : undefined,
    refetch,
  };
};
