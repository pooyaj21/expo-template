import { apiClient } from "@/common/data-access/api/axios";
import type { ExamplePost } from "@/features/example/data-access/exampleTypes";

export const exampleService = {
  listPosts: async (): Promise<ExamplePost[]> => {
    const response = await apiClient.get<ExamplePost[]>("/posts");
    return response.data;
  },
  getPost: async (id: string | number): Promise<ExamplePost> => {
    const response = await apiClient.get<ExamplePost>(`/posts/${id}`);
    return response.data;
  },
};
