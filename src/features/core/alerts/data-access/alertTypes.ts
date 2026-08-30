export enum AlertSeverityEnums {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export type AlertPayload = {
  severity: AlertSeverityEnums;
  message: string;
  title?: string;
  durationMs?: number;
};
