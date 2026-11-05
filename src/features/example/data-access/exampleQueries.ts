import { useQuery } from "@tanstack/react-query";
import { useDefaultQueryKey } from "@/common/business-logic/hooks/useDefaultQueryKey";
import { exampleService } from "@/features/example/data-access/exampleService";

export const useExampleListQuery = () =>
  useQuery({
    queryKey: useDefaultQueryKey(["example-posts"]),
    queryFn: () => exampleService.listPosts(),
  });

export const useExampleDetailQuery = (id: string | number) =>
  useQuery({
    queryKey: useDefaultQueryKey(["example-post", String(id)]),
    queryFn: () => exampleService.getPost(id),
    enabled: id !== "" && id != null,
  });
