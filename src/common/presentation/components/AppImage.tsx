import { memo } from "react";
import { Image, ImageProps } from "expo-image";
import { ImageRequireSource, StyleProp, ImageStyle } from "react-native";

export type AppImageSource =
  | ImageRequireSource
  | string
  | { uri?: string | null; width?: number; height?: number }
  | null
  | undefined;

export type AppImageProps = Omit<ImageProps, "source" | "style"> & {
  image?: AppImageSource;
  style?: StyleProp<ImageStyle>;
};

const resolveSource = (
  image: AppImageSource,
): ImageProps["source"] | undefined => {
  if (image == null) return undefined;
  if (typeof image === "number" || typeof image === "string") return image;
  if (typeof image === "object" && "uri" in image) {
    return image.uri ? { uri: image.uri } : undefined;
  }
  return undefined;
};

export const AppImage = memo(({ image, style, ...rest }: AppImageProps) => {
  const source = resolveSource(image);
  if (source == null) return null;
  return <Image source={source} style={style} {...rest} />;
});

AppImage.displayName = "AppImage";

export default AppImage;
