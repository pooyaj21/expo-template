import { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";
import { AppText } from "@/common/presentation/components/app/AppText";

type SettingsRowProps = {
  title: string;
  value?: string;
  onPress?: () => void;
  end?: ReactNode;
  testID?: string;
};

export const SettingsRow = ({
  title,
  value,
  onPress,
  end,
  testID,
}: SettingsRowProps) => {
  const { colors, isRtl } = useAppTheme();

  return (
    <AppPressable
      testID={testID}
      onPress={onPress}
      style={[styles.row, { borderBottomColor: colors.divider }]}
    >
      <AppText size={14} style={{ flex: 1 }}>
        {title}
      </AppText>
      {value != null && (
        <AppText size={13} color="secondary">
          {value}
        </AppText>
      )}
      {end}
      {onPress != null && end == null && (
        <Ionicons
          name={isRtl ? "chevron-back" : "chevron-forward"}
          size={18}
          color={colors.text.placeholder}
        />
      )}
    </AppPressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
