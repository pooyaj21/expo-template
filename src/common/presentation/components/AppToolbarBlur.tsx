import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { AppBlurView } from "@/common/presentation/components/AppBlurView";
import { APP_TOOLBAR_HEIGHT } from "@/common/business-logic/constants/layout";
import { useAppSafeAreaInsets } from "@/common/business-logic/hooks/useAppSafeAreaInsets";

type AppToolbarBlurProps = {
  style?: StyleProp<ViewStyle>;
};

export const AppToolbarBlur = ({ style }: AppToolbarBlurProps) => {
  const insets = useAppSafeAreaInsets();
  return (
    <AppBlurView
      style={[
        styles.blur,
        { height: APP_TOOLBAR_HEIGHT + insets.top, paddingTop: insets.top },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  blur: {
    position: "absolute",
    top: 0,
    start: 0,
    end: 0,
    zIndex: 1,
  },
});
