import { registerRequestHeaderProvider } from "@/common/data-access/api/requestHeaders";
import { sessionRef } from "@/features/core/session/business-logic/sessionRef";

/** Side-effect module: attaches the bearer token. Imported by `CoreBootstrap`. */
registerRequestHeaderProvider("session", (): Record<string, string> =>
  sessionRef.token ? { Authorization: `Bearer ${sessionRef.token}` } : {},
);
