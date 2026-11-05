import type { ReactNode } from "react";

export type FirstRunPromptControls = {
  /** User acted on the prompt. Marks it seen permanently. */
  complete: () => void;
  /** User declined/closed. Also marks it seen — prompts never return. */
  dismiss: () => void;
};

/**
 * Registration shape for a one-time prompt. Lower `priority` wins when several
 * eligible prompts compete; only one renders at a time.
 */
export type FirstRunPromptRegistration = {
  id: string;
  /** Lower number wins. Leave gaps (10, 20, …) so new prompts can slot in. */
  priority: number;
  /** Extra eligibility beyond the persisted seen-set. Sync or async. */
  shouldShow: () => boolean | Promise<boolean>;
  render: (controls: FirstRunPromptControls) => ReactNode;
};

export type FirstRunPrompt = {
  isActive: boolean;
  complete: () => void;
  dismiss: () => void;
};
