const LTR_ISOLATE = "⁦";
const POP_DIRECTIONAL_ISOLATE = "⁩";

export const forceLtr = (value?: string | null): string =>
  value ? `${LTR_ISOLATE}${value}${POP_DIRECTIONAL_ISOLATE}` : "";
