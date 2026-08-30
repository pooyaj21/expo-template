import { AxiosError } from "axios";

/** Every endpoint answers in this envelope. Do not redefine it per feature. */
export interface BaseResponseType<T> {
  data: T;
  meta?: MetaResponseType;
}

export interface BasePaginationResponse<T> {
  data: T[];
  pagination: PaginationResponseType;
  meta?: MetaResponseType;
}

export interface MetaResponseType {
  message?: string;
  /** 422 validation errors arrive as a list, not a field → messages map. */
  errors?: ValidationErrorType[];
}

export interface ValidationErrorType {
  field: string;
  messages: string[];
}

export interface PaginationResponseType {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  has_more: boolean;
}

/** Marker base so payload types read as payloads at a glance. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BasePayload {}

export interface BasePaginationPayload extends BasePayload {
  search?: string;
  page?: number;
  per_page?: number;
}

/**
 * The options a business-logic hook forwards to its caller, so a screen can
 * chain navigation or analytics onto a mutation without owning the mutation.
 */
export interface MutationOptions<T = unknown> {
  onSuccess?: (data: BaseResponseType<T>) => void;
  onError?: (error: AxiosError<BaseResponseType<T>> | unknown) => void;
  onSettled?: () => void;
}

export type ApiError = AxiosError<BaseResponseType<unknown>>;
