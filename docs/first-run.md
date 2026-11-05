# First-run prompts

Show-once priority queue for onboarding surfaces. A prompt fires the first time the user meets **that** prompt — not "first launch of the app".

Code: `src/features/core/first-run/`.

## API

```ts
import { registerFirstRunPrompt } from "@/features/core/first-run/business-logic/firstRunManager";

registerFirstRunPrompt({
  id: "notifications-opt-in",
  priority: 10, // lower wins
  shouldShow: () => /* sync or async */ true,
  render: ({ complete, dismiss }) => (
    <OptInBanner onAccept={complete} onClose={dismiss} />
  ),
});
```

Mount `<FirstRunHost />` once near the root (inside providers). It renders at most one eligible, unseen prompt.

Both `complete` and `dismiss` persist the id into the `firstRunPromptsSeen` set in `appStorage` — prompts never return.

## Notes

- Leave priority gaps (10, 20, …) so new prompts can slot in.
- `useFirstRunPrompt(id)` observes whether an id is active without owning the surface.
- `firstRunManager.reset()` clears marks for QA.
