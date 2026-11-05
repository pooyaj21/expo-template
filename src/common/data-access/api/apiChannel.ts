/**
 * Tiny pub/sub shared by `apiErrorChannel` and `apiResponseChannel`.
 * Keep free of React and domain vocabulary.
 */

type ApiChannelListener<T> = (payload: T) => void;

const MAX_BUFFERED = 10;

export class ApiChannel<T> {
  private readonly listeners = new Set<ApiChannelListener<T>>();
  private readonly buffered: T[] = [];

  publish = (payload: T): void => {
    if (this.listeners.size === 0) {
      this.buffered.push(payload);
      if (this.buffered.length > MAX_BUFFERED) this.buffered.shift();
      return;
    }
    this.listeners.forEach((listener) => listener(payload));
  };

  subscribe = (listener: ApiChannelListener<T>): (() => void) => {
    this.listeners.add(listener);
    if (this.buffered.length > 0) {
      this.buffered.splice(0, this.buffered.length).forEach(listener);
    }
    return () => {
      this.listeners.delete(listener);
    };
  };
}
