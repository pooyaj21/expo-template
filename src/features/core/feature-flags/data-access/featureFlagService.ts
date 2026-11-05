import { apiClient } from "@/common/data-access/api/axios";
import { BaseResponseType } from "@/common/data-access/type/responseTypes";
import {
  SERVER_FLAG_NAMES,
  ServerFlagName,
} from "@/features/core/feature-flags/data-access/featureFlagTypes";

type FeatureFlagsPayload = {
  flags?: Partial<Record<string, boolean>>;
} & Partial<Record<string, boolean>>;

/**
 * GET {apiBaseUrl}/feature-flags — soft-fail caller decides defaults.
 * Accepts either `{ data: { flags: { NAME: bool } } }` or a flat map under `data`.
 */
export const fetchFeatureFlags = async (): Promise<
  Partial<Record<ServerFlagName, boolean>>
> => {
  const response =
    await apiClient.get<BaseResponseType<FeatureFlagsPayload>>(
      "/feature-flags",
    );

  const payload = response.data?.data ?? {};
  const raw =
    payload.flags && typeof payload.flags === "object"
      ? payload.flags
      : payload;

  const next: Partial<Record<ServerFlagName, boolean>> = {};

  for (const name of SERVER_FLAG_NAMES) {
    const value = raw[name];
    if (typeof value === "boolean") {
      next[name] = value;
    }
  }

  return next;
};
