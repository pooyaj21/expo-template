import { useEffect, useSyncExternalStore } from "react";
import { firstRunManager } from "@/features/core/first-run/business-logic/firstRunManager";

/**
 * Renders the single active first-run prompt (lowest priority among eligible,
 * unseen registrations). Mount once near the root layout inside providers.
 */
export const FirstRunHost = () => {
  const activeId = useSyncExternalStore(
    firstRunManager.subscribe,
    firstRunManager.getSnapshot,
    () => null,
  );

  const registryVersion = useSyncExternalStore(
    firstRunManager.subscribe,
    () =>
      firstRunManager
        .getRegistered()
        .map((p) => p.id)
        .join("|"),
    () => "",
  );

  useEffect(() => {
    void firstRunManager.refreshEligibility();
  }, [registryVersion]);

  const active =
    activeId == null
      ? null
      : (firstRunManager
          .getRegistered()
          .find((prompt) => prompt.id === activeId) ?? null);

  if (active == null) return null;

  return (
    <>
      {active.render({
        complete: () => {
          void firstRunManager.markSeen(active.id);
        },
        dismiss: () => {
          void firstRunManager.markSeen(active.id);
        },
      })}
    </>
  );
};
