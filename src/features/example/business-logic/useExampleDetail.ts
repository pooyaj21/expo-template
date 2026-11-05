import { useExampleDetailQuery } from "@/features/example/data-access/exampleQueries";

export const useExampleDetail = (id: string | number) => {
  const query = useExampleDetailQuery(id);

  return {
    post: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isEmpty: !query.isLoading && query.data == null && query.error == null,
  };
};
