import { AxiosError } from "axios";

// `BaseResponseType<Foo[]>` types `data` as this error string, so assigning a
// list payload fails. Use `BaseListResponse<Foo>` (or a pagination wrapper).
type NonArray<T> = T extends readonly unknown[]
  ? "BaseResponseType forbids array T. Use BaseListResponse<Item>."
  : T;

export interface BaseResponseType<T> {
  data: NonArray<T>;
  meta?: MetaResponseType;
}

export interface BaseListResponse<T> {
  data: {
    items: T[];
  };
  meta?: MetaResponseType;
}

export interface BasePaginationResponse<T> {
  data: {
    items: T[];
    pagination: PaginationResponseType;
  };
  meta?: MetaResponseType;
}

export interface MutationOptions<T = unknown> {
  onSuccess?: (data: BaseResponseType<T>) => void;
  onError?: (error: AxiosError<BaseResponseType<T>> | unknown) => void;
  onSettled?: () => void;
}

export enum MetaTypeEnums {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export interface MetaResponseType {
  message?: string;
  // 422 validation errors arrive as a list, not a field → messages map
  errors?: ValidationErrorType[];
  type?: MetaTypeEnums | null;
}

export interface ValidationErrorType {
  field: string;
  message?: string;
  messages?: string[];
}

export interface PaginationResponseType {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  has_more: boolean;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export type BasePayload = Record<string, never>;

export interface BasePaginationPayload {
  search?: string;
  page?: number;
  per_page?: number;
}

export type InfiniteListPagination = {
  total: number | undefined;
  isFetchingNextPage: boolean;
  fetchNextPageIfAvailable: () => void;
};
