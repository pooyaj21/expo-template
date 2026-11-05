import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { AppPressable } from "@/common/presentation/components/AppPressable";

type AppToolbarButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const AppToolbarButton = ({
  children,
  onPress,
  style,
  testID,
}: AppToolbarButtonProps) => (
  <AppPressable
    enableAnimation
    testID={testID}
    onPress={onPress}
    style={[
      {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
      },
      style,
    ]}
  >
    {children}
  </AppPressable>
);
