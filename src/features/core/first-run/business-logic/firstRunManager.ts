import { appStorage } from "@/common/business-logic/interfaces/storageInterface";
import type { FirstRunPromptRegistration } from "@/features/core/first-run/data-access/firstRunTypes";

const STORAGE_KEY = "firstRunPromptsSeen";

/**
 * Show-once priority queue. Persists the seen-set in `appStorage`. Prompt
 * definitions are registered via {@link registerFirstRunPrompt}; the host
 * component evaluates `shouldShow` and renders at most one at a time.
 */
class FirstRunManagerClass {
  private readonly registry = new Map<string, FirstRunPromptRegistration>();
  private seen = new Set<string>();
  private hydrated = false;
  private hydratePromise: Promise<void> | null = null;
  private listeners = new Set<() => void>();
  private activeId: string | null = null;
  private eligibility = new Map<string, boolean>();

  register = (prompt: FirstRunPromptRegistration): (() => void) => {
    this.registry.set(prompt.id, prompt);
    this.notify();
    return () => {
      this.registry.delete(prompt.id);
      this.eligibility.delete(prompt.id);
      this.notify();
    };
  };

  getRegistered = (): FirstRunPromptRegistration[] =>
    Array.from(this.registry.values()).sort(
      (left, right) => left.priority - right.priority,
    );

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): string | null => this.activeId;

  isHydrated = (): boolean => this.hydrated;

  hasSeen = (id: string): boolean => this.seen.has(id);

  markSeen = async (id: string): Promise<void> => {
    if (this.seen.has(id)) return;
    this.seen.add(id);
    await this.persistSeen();
    this.recomputeActive();
    this.notify();
  };

  reset = async (): Promise<void> => {
    this.seen.clear();
    await this.persistSeen();
    this.recomputeActive();
    this.notify();
  };

  ensureHydrated = async (): Promise<void> => {
    if (this.hydrated) return;
    if (this.hydratePromise) return this.hydratePromise;

    this.hydratePromise = (async () => {
      try {
        const raw = await appStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.seen = new Set(
              parsed.filter((id): id is string => typeof id === "string"),
            );
          }
        }
      } catch {
        this.seen = new Set();
      } finally {
        this.hydrated = true;
        this.hydratePromise = null;
        this.recomputeActive();
        this.notify();
      }
    })();

    return this.hydratePromise;
  };

  /**
   * Refresh async `shouldShow` verdicts, then pick the winning unseen id.
   * Called by `FirstRunHost` on mount and whenever the registry changes.
   */
  refreshEligibility = async (): Promise<void> => {
    await this.ensureHydrated();
    const prompts = this.getRegistered();
    await Promise.all(
      prompts.map(async (prompt) => {
        if (this.seen.has(prompt.id)) {
          this.eligibility.set(prompt.id, false);
          return;
        }
        try {
          this.eligibility.set(prompt.id, await prompt.shouldShow());
        } catch {
          this.eligibility.set(prompt.id, false);
        }
      }),
    );
    this.recomputeActive();
    this.notify();
  };

  private recomputeActive = (): void => {
    let winner: FirstRunPromptRegistration | null = null;
    for (const prompt of this.getRegistered()) {
      if (this.seen.has(prompt.id)) continue;
      if (!this.eligibility.get(prompt.id)) continue;
      if (winner == null || prompt.priority < winner.priority) {
        winner = prompt;
      }
    }
    this.activeId = winner?.id ?? null;
  };

  private persistSeen = async (): Promise<void> => {
    try {
      await appStorage.setItem(STORAGE_KEY, JSON.stringify([...this.seen]));
    } catch {
      // Best-effort: prompt still closes for this session.
    }
  };

  private notify = (): void => {
    this.listeners.forEach((listener) => listener());
  };
}

export const firstRunManager = new FirstRunManagerClass();

export const registerFirstRunPrompt = (
  prompt: FirstRunPromptRegistration,
): (() => void) => firstRunManager.register(prompt);
