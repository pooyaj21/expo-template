/**
 * Announces failed API requests. Owned by the API client, consumed by whoever
 * cares — today the alert slice, tomorrow logging or crash reporting.
 *
 * The point is dependency direction: the interceptor must not import a feature
 * to tell it something went wrong. It publishes here; listeners subscribe.
 * Keep this module free of React and of any domain vocabulary.
 */
import { ApiError } from "@/common/data-access/type";

type ApiErrorListener = (error: ApiError) => void;

/**
 * Failures published before a listener attaches are held briefly, so an error
 * during first paint is not lost. Capped — with no listener they would
 * otherwise accumulate for the life of the process.
 */
const MAX_BUFFERED = 10;

class ApiErrorChannel {
  private readonly listeners = new Set<ApiErrorListener>();
  private readonly buffered: ApiError[] = [];

  /** Called by the response interceptor for every rejected request. */
  publish(error: ApiError): void {
    if (this.listeners.size === 0) {
      this.buffered.push(error);
      if (this.buffered.length > MAX_BUFFERED) this.buffered.shift();
      return;
    }
    this.listeners.forEach((listener) => listener(error));
  }

  subscribe(listener: ApiErrorListener): () => void {
    this.listeners.add(listener);
    if (this.buffered.length > 0) {
      this.buffered.splice(0, this.buffered.length).forEach(listener);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const apiErrorChannel = new ApiErrorChannel();
