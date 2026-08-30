import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";
import { useAppRouter } from "@/common/business-logic/hooks/useAppRouter";

type AppToolbarProps = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  end?: ReactNode;
};

export const AppToolbar = ({
  title,
  showBack = true,
  onBack,
  end,
}: AppToolbarProps) => {
  const { colors, typography, isRtl } = useAppTheme();
  const router = useAppRouter();

  const canGoBack = showBack && (onBack != null || router.canGoBack());

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {canGoBack && (
          <AppPressable
            enableAnimation
            onPress={onBack ?? router.back}
            hitSlop={12}
          >
            {/* The chevron points the way "back" reads in the active script. */}
            <Ionicons
              name={isRtl ? "chevron-forward" : "chevron-back"}
              size={24}
              color={colors.text.primary}
            />
          </AppPressable>
        )}
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  side: { width: 40, justifyContent: "center" },
});
