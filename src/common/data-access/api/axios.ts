import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { apiErrorChannel } from "@/common/data-access/api/apiErrorChannel";
import { apiResponseChannel } from "@/common/data-access/api/apiResponseChannel";
import {
  markAuthRetry,
  runAuthRefreshSingleFlight,
  shouldAttemptAuthRefresh,
} from "@/common/data-access/api/authRefresh";
import { resolveRequestHeaders } from "@/common/data-access/api/requestHeaders";
import { prettyLog } from "@/common/data-access/log/prettyLog";
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

const responseErrorMessage = (error: AxiosError): string => {
  const data = error.response?.data as
    | { meta?: { message?: string }; message?: string }
    | undefined;
  if (data?.meta?.message) return data.meta.message;
  if (data?.message) return data.message;
  if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
    return "Unable to reach the server";
  }
  return error.message || "Unknown error";
};

const attachInterceptors = (api: AxiosInstance): AxiosInstance => {
  api.interceptors.request.use(async (config) => {
    const headers = await resolveRequestHeaders();
    Object.assign(config.headers, headers);
    prettyLog("📤 Request", {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      params: config.params,
      headers: config.headers,
      data: config.data,
    });
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      prettyLog("📥 Response", {
        baseURL: response.config.baseURL,
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
      publishToastFromMeta(response.data, MetaTypeEnums.SUCCESS, response);
      return response;
    },
    async (error: AxiosError) => {
      prettyLog("❌ Response Error", {
        url: error.config?.url,
        code: error.code,
        status: error.response?.status,
        message: responseErrorMessage(error),
        // The only place the native iOS/Android networking error survives —
        // axios collapses every transport failure into a bare ERR_NETWORK.
        native: (error.request as { _response?: unknown } | undefined)
          ?._response,
      });
      publishToastFromMeta(error.response?.data, MetaTypeEnums.ERROR);

      if (shouldAttemptAuthRefresh(error)) {
        const refreshed = await runAuthRefreshSingleFlight();
        if (refreshed) {
          return api.request(markAuthRetry(error.config));
        }
      }

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
