import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { AppBackIcon } from "@/common/presentation/components/app/AppBackIcon";
import { useAppRouter } from "@/common/business-logic/hooks/useAppRouter";

export const APP_TOOLBAR_HEIGHT = 56;

export type AppToolbarProps = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  end?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const AppToolbar = ({
  title,
  showBack = true,
  onBack,
  end,
  style,
}: AppToolbarProps) => {
  const { colors, typography } = useAppTheme();
  const router = useAppRouter();
  const canGoBack = showBack && (onBack != null || router.canGoBack());

  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>
        {canGoBack && <AppBackIcon onPress={onBack} />}
      </View>

      <Text
        numberOfLines={1}
        style={[
          typography.semiBold[16],
          { color: colors.text.primary, flex: 1, textAlign: "center" },
        ]}
      >
        {title}
      </Text>

      <View style={[styles.side, { alignItems: "flex-end" }]}>{end}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: APP_TOOLBAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  side: { width: 40, justifyContent: "center" },
});
