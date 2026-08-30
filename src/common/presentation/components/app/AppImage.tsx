import { Image, ImageProps } from "expo-image";
import { ImageType } from "@/common/data-access/type";

interface AppImageProps extends Omit<ImageProps, "source" | "placeholder"> {
  image?: ImageType;
}

/**
 * Normalizes the several shapes an image arrives in and hands expo-image the
 * blurhash when there is one, so a list scrolls without grey holes.
 */
export const AppImage = ({ image, ...rest }: AppImageProps) => {
  const url = typeof image === "string" ? image : image?.url;
  const blurhash = typeof image === "string" ? undefined : image?.blurhash;

  return (
    <Image
      source={url ? { uri: url } : undefined}
      placeholder={blurhash ? { blurhash } : undefined}
      contentFit="cover"
      transition={200}
      {...rest}
    />
  );
};
