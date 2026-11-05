import type { AlertInput } from "@/features/core/alerts/data-access/alertTypes";

/**
 * Non-React entry into the alert system — for managers and helpers that have no
 * hook available. Failed requests do NOT come through here: the API client
 * publishes those on `apiErrorChannel` / `apiResponseChannel`, and the queue
 * subscribes. Keep this module free of React.
 */

type AlertListener = (input: AlertInput) => void;

const MAX_BUFFERED = 10;

class AlertChannel {
  private readonly alertListeners = new Set<AlertListener>();
  private readonly bufferedAlerts: AlertInput[] = [];

  /** Raise an alert from outside React. Always shown, like `show`. */
  publish = (input: AlertInput): void => {
    if (this.alertListeners.size === 0) {
      this.buffer(this.bufferedAlerts, input);
      return;
    }
    this.alertListeners.forEach((listener) => listener(input));
  };

  subscribe = (listener: AlertListener): (() => void) => {
    this.alertListeners.add(listener);
    this.flush(this.bufferedAlerts, listener);
    return () => {
      this.alertListeners.delete(listener);
    };
  };

  private buffer = <T>(queue: T[], item: T): void => {
    queue.push(item);
    if (queue.length > MAX_BUFFERED) {
      queue.shift();
    }
  };

  private flush = <T>(queue: T[], listener: (item: T) => void): void => {
    if (queue.length === 0) return;
    queue.splice(0, queue.length).forEach(listener);
  };
}

export const alertChannel = new AlertChannel();
