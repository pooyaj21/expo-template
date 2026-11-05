/**
 * Side-effect bootstrap for core kernel slices. Import once from the root
 * layout so header providers and boot steps register before the first request.
 */
import { registerDeviceHeaderProvider } from "@/features/core/device/business-logic/deviceHeaders";
import { registerBootStep } from "@/features/core/app-boot/business-logic/bootRegistry";
import { fetchFeatureFlags } from "@/features/core/feature-flags/data-access/featureFlagService";
import { useAppStore } from "@/common/business-logic/store/app-state";
import { reportError } from "@/common/business-logic/observability/errorReporter";

registerDeviceHeaderProvider();

registerBootStep({
  id: "feature-flags",
  soft: true,
  run: async () => {
    try {
      const flags = await fetchFeatureFlags();
      useAppStore.getState().updateServerFeatureFlags(flags);
    } catch (error) {
      // Soft: keep catalog defaults. Surface in logs for develop builds.
      reportError(error, { bootStep: "feature-flags", soft: true });
    }
  },
});
