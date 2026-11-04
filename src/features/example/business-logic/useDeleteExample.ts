import { MutationOptions } from "@/common/data-access/type";
import {
  useDeleteExampleMutation,
  useInvalidateExampleQueries,
} from "@/features/example/data-access/exampleQueries";

export const useDeleteExample = (options?: MutationOptions<null>) => {
  const { mutate, isPending } = useDeleteExampleMutation();
  const invalidateExampleQueries = useInvalidateExampleQueries();

  const deleteExample = (id: number) => {
    mutate(id, {
      ...options,
      onSuccess: async (data) => {
        await invalidateExampleQueries();
        options?.onSuccess?.(data);
      },
    });
  };

  return { deleteExample, isPending };
};
