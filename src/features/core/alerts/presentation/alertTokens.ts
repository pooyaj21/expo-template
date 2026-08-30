import { AlertSeverityEnums } from "@/features/core/alerts/data-access/alertTypes";

type AlertVisual = {
  background: string;
  border: string;
  text: string;
  icon:
    | "checkmark-circle-outline"
    | "warning-outline"
    | "information-circle-outline";
};

/**
 * Design-system constants, deliberately not the semantic palette — the alert
 * washes and glyph colours differ from `colors.error.main` and friends.
 */
export const ALERT_VISUALS: Record<AlertSeverityEnums, AlertVisual> = {
  [AlertSeverityEnums.SUCCESS]: {
    background: "#EDF7ED",
    border: "#2E7D32",
    text: "#1D542A",
    icon: "checkmark-circle-outline",
  },
  [AlertSeverityEnums.ERROR]: {
    background: "#FDEDED",
    border: "#D32F2F",
    text: "#5F2120",
    icon: "warning-outline",
  },
  [AlertSeverityEnums.WARNING]: {
    background: "#FFF4E5",
    border: "#ED6C02",
    text: "#663C00",
    icon: "information-circle-outline",
  },
  [AlertSeverityEnums.INFO]: {
    background: "#E5F6FD",
    border: "#0288D1",
    text: "#014361",
    icon: "information-circle-outline",
  },
};

export const DEFAULT_ALERT_DURATION_MS = 3000;
