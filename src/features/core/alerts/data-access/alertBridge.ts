import { AxiosError, AxiosResponse } from "axios";
import type { ApiToastPayload } from "@/common/data-access/api/apiResponseChannel";
import { BaseResponseType } from "@/common/data-access/type/responseTypes";
import type {
  AlertSeverity,
  ApiAlertDescriptor,
} from "@/features/core/alerts/data-access/alertTypes";

/**
 * Interprets API traffic for the alert system: failed requests (off
 * `apiErrorChannel`) and meta-bearing responses (off `apiResponseChannel`).
 *
 * Stays free of React. Per-request override is read off axios config:
 *
 *   apiClient.post('/x', body, { alert: false })
 *   apiClient.post('/x', body, { alert: true })
 *   apiClient.post('/x', body, { alert: { title: 'Upload failed' } })
 *
 * Applies to **untyped** responses only. A non-null `meta.type` outranks it.
 */

export type AlertIntent =
  | boolean
  | { severity?: AlertSeverity; title?: string };

declare module "axios" {
  interface AxiosRequestConfig {
    /** Opt this request in or out of automatic error alerts. */
    alert?: AlertIntent;
  }
}

let fallbackMessages = {
  network: "Unable to reach the server. Check your connection and try again.",
  server: "Something went wrong on our end. Please try again.",
  generic: "Something went wrong. Please try again.",
};

export const registerApiAlertMessages = (
  messages: Partial<typeof fallbackMessages>,
): void => {
  fallbackMessages = { ...fallbackMessages, ...messages };
};

const asAxiosError = (
  error: unknown,
): AxiosError<BaseResponseType<unknown>> | undefined =>
  error instanceof AxiosError
    ? (error as AxiosError<BaseResponseType<unknown>>)
    : undefined;

const SEVERITY_BY_TYPE: Record<string, AlertSeverity> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

const readBackendSeverity = (type: unknown): AlertSeverity | undefined => {
  if (typeof type !== "string") return undefined;
  const normalized = type.trim().toLowerCase();
  if (!normalized) return undefined;
  return SEVERITY_BY_TYPE[normalized] ?? "error";
};

const readIntent = (
  config: { alert?: AlertIntent } | undefined,
): {
  intent: AlertIntent | undefined;
  override: { severity?: AlertSeverity; title?: string } | undefined;
  forced: boolean;
} => {
  const intent = config?.alert;
  const override =
    typeof intent === "object" && intent !== null ? intent : undefined;
  const forced = intent === true || override !== undefined;
  return { intent, override, forced };
};

/**
 * Normalize a rejected request into an alert descriptor, or `null` when the
 * request opted out entirely.
 */
export const describeApiError = (error: unknown): ApiAlertDescriptor | null => {
  const axiosError = asAxiosError(error);
  if (!axiosError) return null;

  const { intent, override, forced } = readIntent(axiosError.config);
  const status = axiosError.response?.status;
  const meta = axiosError.response?.data?.meta;
  const backendMessage = meta?.message;
  const backendSeverity = readBackendSeverity(meta?.type);
  const typedByBackend = Boolean(backendSeverity && backendMessage);

  if (intent === false && !typedByBackend) return null;

  let message: string;
  let userFacing: boolean;

  if (!axiosError.response) {
    message = fallbackMessages.network;
    userFacing = true;
  } else if (backendSeverity && backendMessage) {
    message = backendMessage;
    userFacing = true;
  } else if (status === 401 || status === 422 || status === 428) {
    message = backendMessage ?? fallbackMessages.generic;
    userFacing = false;
  } else if (status !== undefined && status >= 500) {
    message = backendMessage ?? fallbackMessages.server;
    userFacing = true;
  } else {
    message = backendMessage ?? fallbackMessages.generic;
    userFacing = false;
  }

  return {
    message,
    title: override?.title,
    severity: backendSeverity ?? override?.severity ?? "error",
    userFacing: forced || userFacing,
    status,
    dedupeKey: `api:${status ?? "offline"}:${message}`,
  };
};

/**
 * Normalize a channel payload (or raw axios response) into an alert descriptor.
 * Untyped 2xx never alerts — `all` mode is about swallowed *failures*.
 */
export const describeApiResponse = (
  response: unknown,
): ApiAlertDescriptor | null => {
  // Template channel shape: { message, type, response? }
  const toastPayload = response as ApiToastPayload | undefined;
  if (
    toastPayload &&
    typeof toastPayload === "object" &&
    typeof toastPayload.message === "string" &&
    toastPayload.type != null &&
    !(
      "data" in toastPayload &&
      "status" in toastPayload &&
      "config" in toastPayload
    )
  ) {
    const severity = readBackendSeverity(toastPayload.type);
    if (!severity || !toastPayload.message) return null;

    const { override } = readIntent(toastPayload.response?.config);
    return {
      message: toastPayload.message,
      title: override?.title,
      severity,
      userFacing: true,
      status: toastPayload.response?.status,
      dedupeKey: `api:${toastPayload.response?.status ?? "ok"}:${toastPayload.message}`,
    };
  }

  const typed = response as
    | AxiosResponse<BaseResponseType<unknown>>
    | undefined;
  const meta = typed?.data?.meta;
  const message = meta?.message;
  const severity = readBackendSeverity(meta?.type);
  if (!severity || !message) return null;

  const { override } = readIntent(typed?.config);
  return {
    message,
    title: override?.title,
    severity,
    userFacing: true,
    status: typed?.status,
    dedupeKey: `api:${typed?.status ?? "ok"}:${message}`,
  };
};
