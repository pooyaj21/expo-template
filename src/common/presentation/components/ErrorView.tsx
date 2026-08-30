import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { useLocalization } from "@/common/business-logic/localization/localizationContext";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { AppButton } from "@/common/presentation/components/app/AppButton";
import { SimpleCallback } from "@/common/data-access/type";

type ErrorViewProps = {
  title?: string;
  onRetry?: SimpleCallback;
};

export const ErrorView = ({ title, onRetry }: ErrorViewProps) => {
  const { colors, typography } = useAppTheme();
  const { getString } = useLocalization();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.white }]}
    >
      <Text
        style={[
          typography.regular[14],
          { color: colors.text.secondary, textAlign: "center" },
        ]}
      >
        {title ?? getString("shared_error_generic")}
      </Text>
      {onRetry && (
        <AppButton
          title={getString("shared_retry")}
          buttonType="outlined"
          onPress={onRetry}
          style={{ minWidth: 140 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
});
