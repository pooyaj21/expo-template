import { MutationOptions } from "@/common/data-access/type";
import {
  useCreateExampleMutation,
  useInvalidateExampleQueries,
} from "@/features/example/data-access/exampleQueries";
import {
  CreateExamplePayload,
  ExampleInterface,
} from "@/features/example/data-access/exampleTypes";

export const useCreateExample = (
  options?: MutationOptions<ExampleInterface>,
) => {
  const { mutate, isPending } = useCreateExampleMutation();
  const invalidateExampleQueries = useInvalidateExampleQueries();

  const createExample = (payload: CreateExamplePayload) => {
    mutate(payload, {
      ...options,
      onSuccess: async (data) => {
        await invalidateExampleQueries();
        options?.onSuccess?.(data);
      },
    });
  };

  return { createExample, isPending };
};
