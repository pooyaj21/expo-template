export interface ImageInterface {
  url: string;
  blurhash?: string;
}

export interface ResponsiveInterface<T> {
  desktop: T;
  mobile: T;
}

/**
 * A bare URL string is accepted too — some endpoints return `icon` / `image` as a
 * plain string; presentation normalizes it to `{ url }` before rendering.
 */
export type ImageType =
  | string
  | ImageInterface
  | ResponsiveInterface<ImageInterface>;

export interface VideoInterface {
  url: string;
  thumbnail: ImageType;
}
