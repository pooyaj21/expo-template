import { isAxiosError } from "axios";

export enum HttpStatusEnums {
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  PRECONDITION_REQUIRED = 428,
  INTERNAL_SERVER_ERROR = 500,
}

export const httpStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;
