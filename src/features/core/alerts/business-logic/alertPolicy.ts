import type { AlertSeverity } from "@/features/core/alerts/data-access/alertTypes";

/**
 * Behavioural defaults for the alert queue — how long an alert lives, how many
 * stack up, how aggressively repeats collapse.
 */

export const DEFAULT_DURATIONS: Record<AlertSeverity, number | null> = {
  info: 4000,
  success: 4000,
  warning: 6000,
  error: 6000,
};

export const DEFAULT_SEVERITY: AlertSeverity = "info";

/** Alerts on screen at once; the oldest drops to make room. */
export const DEFAULT_MAX_VISIBLE = 3;

/** A repeat of the same alert inside this window is dropped. */
export const DEDUPE_WINDOW_MS = 4000;
