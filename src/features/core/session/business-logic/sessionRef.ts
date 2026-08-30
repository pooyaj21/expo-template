/**
 * The token as seen from outside React. The header provider runs inside an
 * axios interceptor where hooks do not exist, so `useSession` mirrors the store
 * here on every change.
 */
export const sessionRef: { token: string | null } = { token: null };
