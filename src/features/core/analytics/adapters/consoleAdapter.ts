import { AppConfig } from "@/common/data-access/config/AppConfig";
import { AnalyticsAdapter } from "@/features/core/analytics/data-access/analyticsTypes";

/**
 * The development adapter. It exists so a new event is visible the moment it is
 * written, before any vendor is wired up, and so the template ships with a
 * working analytics path instead of a dead one.
 */
export const consoleAdapter: AnalyticsAdapter = {
  name: "console",
  identify: (identity) => log("identify", identity),
  track: (event, params) => log(`track ${event}`, params),
  screen: (name, params) => log(`screen ${name}`, params),
  reset: () => log("reset"),
};

const log = (label: string, data?: unknown) => {
  if (!AppConfig.isDevelop) return;
  console.log(`[analytics] ${label}`, data ?? "");
};
