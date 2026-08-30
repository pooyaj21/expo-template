/**
 * Side-effect imports. Each module registers an API header provider, an
 * analytics adapter, or a channel listener; importing it here is what makes
 * that happen, once, before any component can fire a request.
 *
 * Add a line when you add a core concern the kernel must not know about.
 */
import "@/common/business-logic/localization/localizationHeaders";
import "@/features/core/session/business-logic/sessionHeaders";
import "@/features/core/device/business-logic/deviceHeaders";
import "@/features/core/analytics/business-logic/analyticsBootstrap";

import { startAlertBridge } from "@/features/core/alerts/business-logic/alertBridge";

startAlertBridge();

export const coreBootstrapped = true;
