// Functions cannot survive JSON.stringify / JSON.parse, which is how nav params
// are passed across Expo Router screens. This module lets a caller stash a
// callback under a token, ride only the token through nav params, and look it
// up on the receiving screen.

const store = new Map<string, Function>();

export const putCallback = <Fn extends Function>(fn: Fn): string => {
  const token = `cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  store.set(token, fn);
  return token;
};

export const getCallback = <Fn extends Function>(
  token: string | undefined,
): Fn | undefined => {
  if (!token) return undefined;
  return store.get(token) as Fn | undefined;
};

export const releaseCallback = (token: string | undefined): void => {
  if (!token) return;
  store.delete(token);
};
