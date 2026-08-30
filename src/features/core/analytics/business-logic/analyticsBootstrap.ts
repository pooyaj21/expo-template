import { analyticsRegistry } from "@/features/core/analytics/data-access/analyticsRegistry";
import { consoleAdapter } from "@/features/core/analytics/adapters/consoleAdapter";

/**
 * Side-effect module: registers every vendor adapter, once. Imported by
 * `CoreBootstrap`. Add a line per vendor — see `../adapters/README.md`.
 */
analyticsRegistry.register(consoleAdapter);
