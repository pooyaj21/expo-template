import { forwardRef, ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { radius, spacing } from "@/common/presentation/theme/AppSpacing";

interface AppTextInputProps extends TextInputProps {
  label?: string;
  /** Validation copy. Its presence, not a separate flag, drives the error look. */
  error?: string;
  start?: ReactNode;
  end?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  ({ label, error, start, end, containerStyle, style, ...rest }, ref) => {
    const { colors, typography } = useAppTheme();

    return (
      <View style={[{ gap: spacing.xxs }, containerStyle]}>
        {label != null && (
          <Text
            style={[typography.medium[13], { color: colors.text.secondary }]}
          >
            {label}
          </Text>
        )}

        <View
          style={[
            styles.field,
            {
              borderColor: error ? colors.error.main : colors.border.default,
              backgroundColor: colors.background.level1,
            },
          ]}
        >
          {start}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.text.placeholder}
            style={[
              typography.regular[14],
              styles.input,
              { color: colors.text.primary },
              // Latin-only content (email, URL, phone) reads wrong right-aligned
              // in Arabic — pass `textAlign="left"` on those fields.
              style,
            ]}
            {...rest}
          />
          {end}
        </View>

        {error != null && (
          <Text style={[typography.regular[12], { color: colors.error.main }]}>
            {error}
          </Text>
        )}
      </View>
    );
  },
);

AppTextInput.displayName = "AppTextInput";

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, paddingVertical: spacing.sm },
});
