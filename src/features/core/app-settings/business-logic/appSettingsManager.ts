import { appStorage } from "@/common/business-logic/interfaces/storageInterface";
import {
  getQueryScopeSnapshot,
  subscribeQueryScope,
} from "@/common/business-logic/hooks/queryScopeRegistry";
import { prettyLog } from "@/common/data-access/log/prettyLog";
import { registerBootStep } from "@/features/core/app-boot/business-logic/bootRegistry";
import { fetchAppSettings } from "@/features/core/app-settings/data-access/appSettingsService";
import {
  DEFAULT_APP_SETTINGS,
  normalizeAppSettings,
} from "@/features/core/app-settings/data-access/appSettingsDefaults";
import type {
  AppSettingsCache,
  AppSettingsData,
} from "@/features/core/app-settings/data-access/appSettingsTypes";

const APP_SETTINGS_STORAGE_KEY = "app_settings";
const TTL_MS = 5 * 60 * 1000;

export const APP_SETTINGS_CHANGED_EVENT = "app-settings-changed";

type Listener = () => void;

/**
 * Boot-warmed remote settings cache with TTL in `appStorage`.
 * Invalidates when env/language scope changes (`queryScopeRegistry`).
 */
class AppSettingsManagerClass {
  private cache: AppSettingsCache | null = null;
  private ensurePromise: Promise<AppSettingsData> | null = null;
  private generation = 0;
  private readonly listeners = new Set<Listener>();

  constructor() {
    subscribeQueryScope(() => {
      this.invalidate();
      void this.ensure();
    });
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getCached = (): AppSettingsData | null => {
    if (!this.isValid(this.cache)) return null;
    return this.cache.data;
  };

  getSettings = (): AppSettingsData =>
    this.getCached() ?? this.cache?.data ?? DEFAULT_APP_SETTINGS;

  invalidate = (): void => {
    this.generation += 1;
    this.cache = null;
    this.ensurePromise = null;
    void appStorage.removeItem(APP_SETTINGS_STORAGE_KEY);
    this.notify();
  };

  /**
   * Returns valid cached settings, or fetches and persists a fresh copy.
   * Concurrent callers share one in-flight promise. Soft-fails to defaults.
   */
  ensure = async (): Promise<AppSettingsData> => {
    const valid = this.getCached();
    if (valid) return valid;
    if (this.ensurePromise) return this.ensurePromise;

    const pending = this.fetchAndPersist();
    this.ensurePromise = pending;
    try {
      return await pending;
    } finally {
      if (this.ensurePromise === pending) {
        this.ensurePromise = null;
      }
    }
  };

  hydrateFromStorage = async (): Promise<void> => {
    try {
      const raw = await appStorage.getItem(APP_SETTINGS_STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!this.isCacheShape(parsed)) return;
      this.cache = {
        ...parsed,
        data: normalizeAppSettings(parsed.data),
      };
      this.notify();
    } catch (error) {
      prettyLog("⚠️ App settings cache unreadable", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  private fetchAndPersist = async (): Promise<AppSettingsData> => {
    const generation = this.generation;
    const scope = getQueryScopeSnapshot();
    const environmentId = scope.environmentId ?? "default";
    const language = scope.language ?? "en";

    try {
      const data = await fetchAppSettings();
      if (generation !== this.generation) {
        return this.getSettings();
      }

      const next: AppSettingsCache = {
        fetchedAt: Date.now(),
        environmentId,
        language,
        data,
      };
      this.cache = next;
      await appStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(next));
      this.notify();
      return next.data;
    } catch (error) {
      prettyLog("⚠️ App settings refresh failed — keeping defaults/stale", {
        message: error instanceof Error ? error.message : String(error),
      });
      if (generation !== this.generation) return this.getSettings();
      return this.getSettings();
    }
  };

  private isValid = (
    cache: AppSettingsCache | null,
  ): cache is AppSettingsCache => {
    if (!cache) return false;
    if (Date.now() - cache.fetchedAt > TTL_MS) return false;
    const scope = getQueryScopeSnapshot();
    if ((scope.environmentId ?? "default") !== cache.environmentId) {
      return false;
    }
    if ((scope.language ?? "en") !== cache.language) return false;
    return true;
  };

  private isCacheShape = (value: unknown): value is AppSettingsCache => {
    if (value == null || typeof value !== "object") return false;
    const cache = value as Partial<AppSettingsCache>;
    return (
      typeof cache.fetchedAt === "number" &&
      cache.environmentId != null &&
      typeof cache.language === "string" &&
      cache.data != null
    );
  };

  private notify = (): void => {
    this.listeners.forEach((listener) => listener());
  };
}

export const appSettingsManager = new AppSettingsManagerClass();

registerBootStep({
  id: "app-settings",
  soft: true,
  run: async () => {
    await appSettingsManager.hydrateFromStorage();
    await appSettingsManager.ensure();
  },
});
