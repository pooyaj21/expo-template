import { AppConfig } from "@/common/data-access/config/AppConfig";
import {
  AnalyticsAdapter,
  AnalyticsIdentity,
  AnalyticsParams,
} from "@/features/core/analytics/data-access/analyticsTypes";

/**
 * Fans one call out to every registered vendor. React-free, so a plain module
 * or an interceptor can track without reaching for a hook.
 *
 * An adapter that throws is skipped — a broken vendor SDK must not take a
 * screen down with it.
 */
class AnalyticsRegistry {
  private readonly adapters: AnalyticsAdapter[] = [];

  register(adapter: AnalyticsAdapter) {
    if (this.adapters.some((item) => item.name === adapter.name)) return;
    this.adapters.push(adapter);
  }

  async init() {
    await Promise.all(
      this.adapters.map((a) => this.guard(a, () => a.init?.())),
    );
  }

  identify(identity: AnalyticsIdentity) {
    this.adapters.forEach((a) => this.guard(a, () => a.identify?.(identity)));
  }

  track(event: string, params?: AnalyticsParams) {
    this.adapters.forEach((a) => this.guard(a, () => a.track(event, params)));
  }

  screen(name: string, params?: AnalyticsParams) {
    this.adapters.forEach((a) => this.guard(a, () => a.screen?.(name, params)));
  }

  reset() {
    this.adapters.forEach((a) => this.guard(a, () => a.reset?.()));
  }

  private guard(adapter: AnalyticsAdapter, run: () => unknown) {
    try {
      return run();
    } catch (error) {
      if (AppConfig.isDevelop) {
        console.warn(`[analytics] "${adapter.name}" failed:`, error);
      }
    }
  }
}

export const analyticsRegistry = new AnalyticsRegistry();
