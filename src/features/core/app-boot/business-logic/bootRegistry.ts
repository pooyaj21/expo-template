export type BootStep = {
  id: string;
  run: () => Promise<void>;
  /**
   * Soft steps log failures and continue; hard steps surface retry UI.
   * Defaults to soft so optional network hydration never blocks the app.
   */
  soft?: boolean;
};

const steps = new Map<string, BootStep>();

/**
 * Register a boot dependency that `AppBootProvider` runs after env / language /
 * theme / store hydration. Returns an unregister function.
 */
export const registerBootStep = (step: BootStep): (() => void) => {
  steps.set(step.id, { soft: true, ...step });
  return () => {
    steps.delete(step.id);
  };
};

export const getRegisteredBootSteps = (): BootStep[] =>
  Array.from(steps.values());
