export type SimpleCallback = () => void;

export enum ActionEnums {
  INTERNAL = "internal",
  EXTERNAL = "external",
}

/** Backend-driven navigation: a payload that tells the app where to go. */
export interface ActionInterface {
  type: ActionEnums;
  target: string;
}

export interface ButtonInterface {
  text?: string;
  action: ActionInterface;
}

export interface ImageInterface {
  url: string;
  blurhash?: string;
}

/** Some endpoints return a bare URL string — normalize before rendering. */
export type ImageType = string | ImageInterface;

export interface PriceInterface {
  sell_price: string;
  compare_at_price?: string;
  currency: string;
}
