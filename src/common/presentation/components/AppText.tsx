import { Text, TextProps, StyleProp, TextStyle } from "react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";

export type AppTextProps = TextProps & {
  color?: string;
  size?: number;
  weight?: "regular" | "medium" | "semiBold" | "bold";
  style?: StyleProp<TextStyle>;
};

export const AppText = ({
  color,
  size = 14,
  weight = "regular",
  style,
  children,
  ...rest
}: AppTextProps) => {
  const { colors, typography } = useAppTheme();
  const base = typography[weight]?.[size] ?? typography.regular[14];

  return (
    <Text
      {...rest}
      style={[base, { color: color ?? colors.text.primary }, style]}
    >
      {children}
    </Text>
  );
};
