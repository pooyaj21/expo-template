import { ApiChannel } from "@/common/data-access/api/apiChannel";

/**
 * Announces failed API requests (notably 401). Owned by the API client;
 * feature slices subscribe — the client never imports them.
 */
export const apiErrorChannel = new ApiChannel<unknown>();
