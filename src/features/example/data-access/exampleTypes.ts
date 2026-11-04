import {
  BasePaginationPayload,
  BasePayload,
  ImageType,
} from "@/common/data-access/type";

export interface ExampleInterface {
  id: number;
  title: string;
  subtitle?: string;
  image?: ImageType;
  created_at: string;
}

export interface ExampleListPayload extends BasePaginationPayload {
  // Add filters here — search, sort and page come from BasePaginationPayload.
  sort?: string;
}

export interface CreateExamplePayload extends BasePayload {
  title: string;
  subtitle?: string;
}

export type UpdateExamplePayload = CreateExamplePayload;
