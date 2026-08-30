import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";

export const Divider = ({ style }: { style?: StyleProp<ViewStyle> }) => {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider },
        style,
      ]}
    />
  );
};
