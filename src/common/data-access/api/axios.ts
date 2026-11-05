import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { apiErrorChannel } from "@/common/data-access/api/apiErrorChannel";
import { apiResponseChannel } from "@/common/data-access/api/apiResponseChannel";
import { resolveRequestHeaders } from "@/common/data-access/api/requestHeaders";
import {
  MetaResponseType,
  MetaTypeEnums,
} from "@/common/data-access/type/responseTypes";

export const DEFAULT_TIMEOUT_MS = 30_000;

const hasMeta = (value: unknown): value is { meta: MetaResponseType } =>
  typeof value === "object" &&
  value !== null &&
  "meta" in value &&
  typeof (value as { meta: unknown }).meta === "object" &&
  (value as { meta: unknown }).meta !== null;

const publishToastFromMeta = (
  data: unknown,
  fallback: MetaTypeEnums,
  response?: AxiosResponse,
) => {
  if (!hasMeta(data) || !data.meta.message || !data.meta.type) return;
  const key = String(data.meta.type).toLowerCase() as MetaTypeEnums;
  apiResponseChannel.publish({
    message: data.meta.message,
    type: Object.values(MetaTypeEnums).includes(key) ? key : fallback,
    response,
  });
};

const attachInterceptors = (api: AxiosInstance): AxiosInstance => {
  api.interceptors.request.use(async (config) => {
    const headers = await resolveRequestHeaders();
    Object.assign(config.headers, headers);
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      publishToastFromMeta(response.data, MetaTypeEnums.SUCCESS, response);
      return response;
    },
    (error: AxiosError) => {
      publishToastFromMeta(error.response?.data, MetaTypeEnums.ERROR);

      if (error.response?.status === 401) {
        apiErrorChannel.publish(error);
      }

      return Promise.reject(error);
    },
  );

  return api;
};

export const createAxiosInstance = (baseURL: string): AxiosInstance =>
  attachInterceptors(
    axios.create({
      baseURL,
      timeout: DEFAULT_TIMEOUT_MS,
    }),
  );

/** Shared client — base URL is swapped at runtime via `setApiBaseUrl`. */
export const apiClient = createAxiosInstance(
  process.env.EXPO_PUBLIC_API_DEV_URL ?? "https://jsonplaceholder.typicode.com",
);

export const setApiBaseUrl = (url: string): void => {
  apiClient.defaults.baseURL = url;
};
