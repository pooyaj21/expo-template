import { AlertPayload } from "@/features/core/alerts/data-access/alertTypes";

/**
 * Alerts are raised from wherever the outcome is known — a mutation's
 * `onSuccess` in business-logic, a press handler in presentation, the API
 * bridge in data-access. They all publish here and exactly one host renders
 * them, so this module stays free of React.
 */
type AlertListener = (alert: AlertPayload) => void;

const MAX_BUFFERED = 5;

class AlertChannel {
  private readonly listeners = new Set<AlertListener>();
  private readonly buffered: AlertPayload[] = [];

  publish(alert: AlertPayload): void {
    if (this.listeners.size === 0) {
      this.buffered.push(alert);
      if (this.buffered.length > MAX_BUFFERED) this.buffered.shift();
      return;
    }
    this.listeners.forEach((listener) => listener(alert));
  }

  subscribe(listener: AlertListener): () => void {
    this.listeners.add(listener);
    if (this.buffered.length > 0) {
      this.buffered.splice(0, this.buffered.length).forEach(listener);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const alertChannel = new AlertChannel();
