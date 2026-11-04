import { StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { useAppRouter } from "@/common/business-logic/hooks/useAppRouter";
import { TestIdEnums } from "@/common/business-logic/testIds";

type AppBackIconProps = {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export const AppBackIcon = ({ style, onPress }: AppBackIconProps) => {
  const router = useAppRouter();
  const { colors, isRtl } = useAppTheme();

  return (
    <AppPressable
      testID={TestIdEnums.TOOLBAR_BACK}
      style={style}
      enableAnimation
      hitSlop={12}
      onPress={() => {
        if (onPress) onPress();
        else router.back();
      }}
    >
      <Ionicons
        name={isRtl ? "chevron-forward" : "chevron-back"}
        size={24}
        color={colors.text.primary}
      />
    </AppPressable>
  );
};
