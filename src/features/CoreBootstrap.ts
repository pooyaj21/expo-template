/**
 * Side-effect bootstrap for core kernel slices. Import once from the root
 * layout so header providers and boot steps register before the first request.
 */
import { registerDeviceHeaderProvider } from "@/features/core/device/business-logic/deviceHeaders";
import { registerBootStep } from "@/features/core/app-boot/business-logic/bootRegistry";
import { fetchFeatureFlags } from "@/features/core/feature-flags/data-access/featureFlagService";
import { useAppStore } from "@/common/business-logic/store/app-state";
import { prettyLog } from "@/common/data-access/log/prettyLog";
// Side-effect: registers soft `app-settings` boot step + scope invalidation.
import "@/features/core/app-settings/business-logic/appSettingsManager";

registerDeviceHeaderProvider();

registerBootStep({
  id: "feature-flags",
  soft: true,
  run: async () => {
    try {
      const flags = await fetchFeatureFlags();
      useAppStore.getState().updateServerFeatureFlags(flags);
    } catch (error) {
      // Soft: keep catalog defaults. The axios interceptor already logged the
      // request failure; this only records the fallback.
      prettyLog("⚠️ Feature flags unavailable — using catalog defaults", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  },
});
