export type DeepLinkResolver = (url: URL) => string | undefined;

/**
 * Universal links arrive with the marketing domain's paths, which rarely match
 * the app's routes one-for-one. Resolvers translate; unknown links fall through
 * to expo-router's own matching rather than 404-ing in our code.
 */
export const deepLinkResolvers: DeepLinkResolver[] = [
  // Example — `https://example.com/p/blue-shirt` → `/example/blue-shirt`
  (url) => {
    const match = url.pathname.match(/^\/p\/([^/]+)$/);
    return match ? `/example/${match[1]}` : undefined;
  },
];

export const resolveDeepLink = (rawUrl: string): string | undefined => {
  try {
    const url = new URL(rawUrl);
    for (const resolve of deepLinkResolvers) {
      const route = resolve(url);
      if (route) return route;
    }
    return undefined;
  } catch {
    return undefined;
  }
};
