import { AxiosInstance } from "axios";
import {
  BasePaginationResponse,
  BaseResponseType,
} from "@/common/data-access/type";
import {
  CreateExamplePayload,
  ExampleInterface,
  ExampleListPayload,
  UpdateExamplePayload,
} from "@/features/example/data-access/exampleTypes";

export const exampleService = {
  list: async (
    axios: AxiosInstance,
    params: ExampleListPayload,
  ): Promise<BasePaginationResponse<ExampleInterface>> =>
    (await axios.get("/samples", { params })).data,

  detail: async (
    axios: AxiosInstance,
    id: string | number,
  ): Promise<BaseResponseType<ExampleInterface>> =>
    (await axios.get(`/samples/${id}`)).data,

  create: async (
    axios: AxiosInstance,
    payload: CreateExamplePayload,
  ): Promise<BaseResponseType<ExampleInterface>> =>
    (await axios.post("/samples", payload)).data,

  update: async (
    axios: AxiosInstance,
    id: number,
    payload: UpdateExamplePayload,
  ): Promise<BaseResponseType<ExampleInterface>> =>
    (await axios.put(`/samples/${id}`, payload)).data,

  delete: async (
    axios: AxiosInstance,
    id: number,
  ): Promise<BaseResponseType<null>> =>
    (await axios.delete(`/samples/${id}`)).data,
};
