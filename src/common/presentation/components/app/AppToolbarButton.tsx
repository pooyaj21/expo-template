import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { haptics } from "@/common/business-logic/utils/haptics";

type AppToolbarButtonProps = {
  children: ReactNode;
  onPress: () => void;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityRole?: "button";
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  testID?: string;
};

/** The only way to put a button in a toolbar — owns 40×40 + selection haptic. */
export const AppToolbarButton = ({
  children,
  onPress,
  accentColor,
  style,
  ...rest
}: AppToolbarButtonProps) => {
  const { colors } = useAppTheme();

  return (
    <AppPressable
      {...rest}
      style={[
        {
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 12,
          backgroundColor: accentColor
            ? "transparent"
            : colors.background.level1,
        },
        style,
      ]}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
    >
      {children}
    </AppPressable>
  );
};
