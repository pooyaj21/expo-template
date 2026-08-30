# Analytics adapters

One file per vendor, each exporting an `AnalyticsAdapter`. Register it in
`features/core/analytics/business-logic/analyticsBootstrap.ts`.

```ts
import { Mixpanel } from "mixpanel-react-native";

const mixpanel = new Mixpanel(TOKEN, true);

export const mixpanelAdapter: AnalyticsAdapter = {
  name: "mixpanel",
  init: () => mixpanel.init(),
  identify: ({ userId }) => userId && mixpanel.identify(userId),
  track: (event, params) => mixpanel.track(event, params),
  reset: () => mixpanel.reset(),
};
```

The vendor SDK is imported **here and nowhere else**. Feature code calls
`track(AnalyticsEvents.SIGN_IN, …)` and never learns which vendors exist —
which is what makes swapping or adding one a single-file change.

Adapters must not throw at a call site; the registry already guards them, but
keep network work off the calling thread.
