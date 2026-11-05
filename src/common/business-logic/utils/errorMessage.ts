import { AxiosError } from "axios";
import { ValidationErrorType } from "@/common/data-access/type/responseTypes";

type ErrorBody = {
  meta?: {
    message?: string;
    errors?: ValidationErrorType[];
  };
  message?: string;
};

export const backendMessage = (error: unknown): string | undefined => {
  if (!(error instanceof AxiosError)) return undefined;
  const body = error.response?.data as ErrorBody | undefined;
  const message = body?.meta?.message ?? body?.message;
  if (typeof message !== "string") return undefined;
  const trimmed = message.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const validationErrorText = (
  entry: ValidationErrorType | undefined,
): string | undefined => {
  const message = entry?.message ?? entry?.messages?.[0];
  if (typeof message !== "string") return undefined;
  const trimmed = message.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const backendFieldError = (
  error: unknown,
  fields: string | string[],
): string | undefined => {
  if (!(error instanceof AxiosError)) return undefined;
  const body = error.response?.data as ErrorBody | undefined;
  const errors = body?.meta?.errors;
  if (!errors?.length) return undefined;
  const wanted = new Set(Array.isArray(fields) ? fields : [fields]);
  for (const entry of errors) {
    if (!wanted.has(entry.field)) continue;
    const text = validationErrorText(entry);
    if (text) return text;
  }
  return undefined;
};
