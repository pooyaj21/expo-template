import { Text } from "react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { AppPressable } from "@/common/presentation/components/AppPressable";
import { ChevronRight } from "@/common/presentation/icons/ChevronRight";
import { withAlpha } from "@/common/business-logic/utils/color";

type AppSeeAllProps = {
  title?: string;
  accentColor?: string;
  onPress?: () => void;
  testID?: string;
};

export const AppSeeAll = (props: AppSeeAllProps) => {
  const { colors, typography } = useAppTheme();
  const { getString } = useLocalization();
  const accentColor = props.accentColor ?? colors.primary.main;

  return (
    <AppPressable
      testID={props.testID}
      enableAnimation
      onPress={props.onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 999,
        backgroundColor: withAlpha(accentColor, 0.08),
      }}
    >
      <Text style={{ ...typography.medium[12], color: accentColor }}>
        {props.title ?? getString("common.seeAll")}
      </Text>
      <ChevronRight size={14} color={accentColor} />
    </AppPressable>
  );
};
