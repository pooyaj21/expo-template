import { Platform } from "react-native";
import Constants from "expo-constants";
import axios, { AxiosInstance } from "axios";
import { AppConfig } from "@/common/data-access/config/AppConfig";
import { apiErrorChannel } from "@/common/data-access/api/apiErrorChannel";
import { resolveRequestHeaders } from "@/common/data-access/api/requestHeaders";
import { ApiError } from "@/common/data-access/type";

const REQUEST_TIMEOUT_MS = 15000;

/**
 * Builds the app's single axios instance for a given base URL.
 *
 * Notice what it does NOT import: no session, no country, no device, no toast.
 * Per-request headers arrive from the header registry and failures leave via
 * the error channel, which is what keeps this file usable from anywhere.
 */
export const createApiClient = (baseURL: string): AxiosInstance => {
  // eslint-disable-next-line import/no-named-as-default-member
  const client = axios.create({ baseURL, timeout: REQUEST_TIMEOUT_MS });

  const buildNumber =
    Platform.OS === "ios"
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode?.toString();
  const version = Constants.expoConfig?.version;

  client.interceptors.request.use(async (config) => {
    config.headers.set("Accept", "application/json");
    config.headers.set("os", Platform.OS);
    if (version) config.headers.set("version", version);
    if (buildNumber) config.headers.set("build_number", buildNumber);

    const registered = await resolveRequestHeaders(config);
    Object.entries(registered).forEach(([key, value]) =>
      config.headers.set(key, value),
    );

    devLog("📤 request", {
      method: config.method,
      url: `${config.baseURL ?? ""}${config.url ?? ""}`,
      params: config.params,
      data: config.data,
    });
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      devLog("📥 response", {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
      return response;
    },
    (error: ApiError) => {
      devLog("❌ response error", {
        url: error.config?.url,
        status: error.response?.status,
        message: resolveErrorMessage(error),
      });
      // Announce, don't act. Listeners decide whether to toast, log, or sign out.
      apiErrorChannel.publish(error);
      return Promise.reject(error);
    },
  );

  return client;
};

/**
 * The message a human should read: the backend's own (already localized by the
 * `language` header) when there is one, a transport explanation otherwise.
 */
export const resolveErrorMessage = (error: ApiError): string | undefined => {
  const backendMessage = error.response?.data?.meta?.message;
  if (backendMessage) return backendMessage;
  if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
    return "Unable to reach the server.";
  }
  return undefined;
};

const devLog = (label: string, data: unknown) => {
  if (!AppConfig.isDevelop) return;
  console.log(`[api] ${label}`, JSON.stringify(data, null, 2));
};
