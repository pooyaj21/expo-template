import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/features/core/api/data-access/apiClientContext";
import { useDefaultQueryKey } from "@/common/data-access/api/queryScope";
import { appSettingsService } from "@/features/core/app-settings/data-access/appSettingsService";

export function useAppSettingsQuery(options?: { enabled?: boolean }) {
  const axios = useApiClient();

  return useQuery({
    queryKey: useDefaultQueryKey(["app-settings"]),
    queryFn: () => appSettingsService.get(axios),
    enabled: options?.enabled,
    retry: false,
  });
}
