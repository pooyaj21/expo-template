import { registerRequestHeaderProvider } from "@/common/data-access/api/requestHeaders";
import { languageRef } from "@/common/business-logic/localization/localizationContext";

/**
 * Side-effect module: teaches the API client to send `language` without the
 * client ever hearing about localization. Imported by `CoreBootstrap`.
 */
registerRequestHeaderProvider("localization", () => ({
  language: languageRef.current,
}));
