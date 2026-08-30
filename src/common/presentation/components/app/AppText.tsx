import { Text, TextProps } from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { AppColor } from "@/common/presentation/theme/AppColor";

type FontWeightKey = "light" | "regular" | "medium" | "semiBold" | "bold";
type ColorKey = keyof AppColor["text"];

interface AppTextProps extends TextProps {
  size?: number;
  weight?: FontWeightKey;
  color?: ColorKey | (string & {});
}

/**
 * Text with the theme already applied. Using it means never writing a raw
 * `fontFamily` or hex, and RTL alignment comes along for free via typography.
 */
export const AppText = ({
  size = 14,
  weight = "regular",
  color = "primary",
  style,
  ...rest
}: AppTextProps) => {
  const { typography, colors } = useAppTheme();
  const resolvedColor =
    color in colors.text ? colors.text[color as ColorKey] : (color as string);

  return (
    <Text
      {...rest}
      style={[typography[weight][size], { color: resolvedColor }, style]}
    />
  );
};
