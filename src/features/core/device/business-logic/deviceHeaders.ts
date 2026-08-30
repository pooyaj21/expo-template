import { registerRequestHeaderProvider } from "@/common/data-access/api/requestHeaders";
import { deviceRef } from "@/features/core/device/business-logic/deviceRef";

/**
 * Side-effect module: attaches `Device-Id`. Imported by `CoreBootstrap`.
 *
 * The device-registration call itself must go out without the header — the
 * server is being asked to mint the id. That exception lives here, in the
 * device slice, not in the API client.
 */
const DEVICE_REGISTER_PATH = "/devices";

registerRequestHeaderProvider("device", (config): Record<string, string> => {
  if (config.url?.startsWith(DEVICE_REGISTER_PATH)) return {};
  return deviceRef.uuid ? { "Device-Id": deviceRef.uuid } : {};
});
