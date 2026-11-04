import { MutationOptions } from "@/common/data-access/type";
import {
  useInvalidateExampleQueries,
  useUpdateExampleMutation,
} from "@/features/example/data-access/exampleQueries";
import {
  ExampleInterface,
  UpdateExamplePayload,
} from "@/features/example/data-access/exampleTypes";

export const useUpdateExample = (
  options?: MutationOptions<ExampleInterface>,
) => {
  const { mutate, isPending } = useUpdateExampleMutation();
  const invalidateExampleQueries = useInvalidateExampleQueries();

  const updateExample = (id: number, payload: UpdateExamplePayload) => {
    mutate(
      { id, payload },
      {
        ...options,
        onSuccess: async (data) => {
          await invalidateExampleQueries(id);
          options?.onSuccess?.(data);
        },
      },
    );
  };

  return { updateExample, isPending };
};
