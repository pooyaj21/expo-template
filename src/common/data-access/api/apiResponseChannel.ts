import { AxiosResponse } from "axios";
import { ApiChannel } from "@/common/data-access/api/apiChannel";
import { MetaResponseType } from "@/common/data-access/type/responseTypes";

export type ApiToastPayload = {
  message: string;
  type: NonNullable<MetaResponseType["type"]>;
  response?: AxiosResponse;
};

/**
 * Announces successful (and meta-bearing error) responses so UI can toast from
 * `meta.message` / `meta.type` without the client importing a toast feature.
 */
export const apiResponseChannel = new ApiChannel<ApiToastPayload>();
