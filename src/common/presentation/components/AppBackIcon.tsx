import { I18nManager } from "react-native";
import { router } from "expo-router";
import { BackIcon } from "@/common/presentation/icons/BackIcon";
import { AppPressable } from "@/common/presentation/components/AppPressable";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { TestIdEnums } from "@/common/business-logic/utils/testIds";

type AppBackIconProps = {
  onPress?: () => void;
  color?: string;
};

export const AppBackIcon = ({ onPress, color }: AppBackIconProps) => {
  const { colors } = useAppTheme();
  return (
    <AppPressable
      enableAnimation
      testID={TestIdEnums.TOOLBAR_BACK}
      onPress={onPress ?? (() => router.back())}
      style={{
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
      }}
    >
      <BackIcon size={24} color={color ?? colors.text.primary} />
    </AppPressable>
  );
};
