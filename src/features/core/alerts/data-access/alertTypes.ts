import type { MessageKey } from "@/common/business-logic/localization/localizationTypes";

/** The four alert states. */
export type AlertSeverity = "info" | "success" | "warning" | "error";

export interface AlertAction {
  label: string;
  onPress: () => void;
}

/**
 * What a caller passes to `useAlerts().show`. Prefer `messageKey` for copy that
 * lives in en/ar catalogs; pass `message` for already-localized API text.
 */
export interface AlertShowInput {
  /** Defaults to `info`. */
  severity?: AlertSeverity;
  title?: string;
  titleKey?: MessageKey;
  message?: string;
  messageKey?: MessageKey;
  action?: AlertAction;
  undo?: AlertAction;
  /**
   * Auto-dismiss delay in ms; `null` keeps the alert until dismissed.
   * Defaults per severity — see `DEFAULT_DURATIONS`.
   */
  duration?: number | null;
  /**
   * Collapses repeats within `DEDUPE_WINDOW_MS`. Defaults to
   * severity + title + message.
   */
  dedupeKey?: string;
}

/** Resolved input once message/title keys have been turned into strings. */
export interface AlertInput {
  severity?: AlertSeverity;
  title?: string;
  message: string;
  action?: AlertAction;
  undo?: AlertAction;
  duration?: number | null;
  dedupeKey?: string;
}

/** An alert once the queue has accepted it. */
export interface AlertRecord extends AlertInput {
  id: string;
  severity: AlertSeverity;
  dedupeKey: string;
  createdAt: number;
}

/**
 * How channel-fed alerts are filtered. Alerts raised through `useAlerts()` are
 * never filtered — this governs the channel only.
 *
 * - `selective` — show only what the bridge marked user-facing.
 * - `all` — show every failure (dev/QA).
 */
export type AlertErrorMode = "selective" | "all";

/**
 * What `alertBridge` publishes conceptually for a failed / typed request.
 * Honouring `userFacing` is the queue's job via {@link AlertErrorMode}.
 */
export interface ApiAlertDescriptor {
  message: string;
  title?: string;
  /** Defaults to `error`. */
  severity?: AlertSeverity;
  /** True when the message is fit to put in front of a user. */
  userFacing: boolean;
  /** HTTP status when there was a response. Diagnostic only. */
  status?: number;
  dedupeKey?: string;
}
