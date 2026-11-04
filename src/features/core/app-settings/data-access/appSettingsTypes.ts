import { FeatureFlagValues } from "@/features/core/feature-flags/data-access/featureFlagTypes";

export interface AppSettingsInterface {
  // Server layer of the flag catalog — wins over env and the bundled default.
  feature_flags?: FeatureFlagValues;
  force_update?: {
    // `min_version` is the lowest build the backend still answers; compare the
    // running version against it rather than trusting `is_required` alone.
    is_required: boolean;
    min_version?: string;
    store_url?: string;
    message?: string;
  };
  support?: {
    email?: string;
    phone?: string;
  };
}
