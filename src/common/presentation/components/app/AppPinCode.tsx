import { useEffect, useRef, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { radius, spacing } from "@/common/presentation/theme/AppSpacing";
import { AppText } from "@/common/presentation/components/app/AppText";

type AppPinCodeProps = {
  length?: number;
  value: string;
  onChangeText: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * OTP entry. One real (hidden) input behind a row of boxes — per-box inputs
 * fight the keyboard over focus and break paste and SMS autofill, which is how
 * most users actually enter a code.
 */
export const AppPinCode = ({
  length = 6,
  value,
  onChangeText,
  onComplete,
  error,
  autoFocus = true,
  style,
}: AppPinCodeProps) => {
  const { colors, typography } = useAppTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value.length === length) onComplete?.(value);
  }, [value, length, onComplete]);

  const handleChange = (next: string) => {
    onChangeText(next.replace(/\D/g, "").slice(0, length));
  };

  return (
    <View style={[{ gap: spacing.xxs }, style]}>
      <View
        style={styles.row}
        onStartShouldSetResponder={() => {
          inputRef.current?.focus();
          return true;
        }}
      >
        {Array.from({ length }).map((_, index) => {
          const filled = index < value.length;
          const active = isFocused && index === value.length;

          return (
            <View
              key={index}
              style={[
                styles.box,
                {
                  borderColor: error
                    ? colors.error.main
                    : active
                      ? colors.primary.main
                      : colors.border.default,
                  backgroundColor: colors.background.level1,
                },
              ]}
            >
              <AppText size={20} weight="semiBold">
                {filled ? value[index] : ""}
              </AppText>
            </View>
          );
        })}
      </View>

      {error != null && (
        <AppText size={12} color={colors.error.main}>
          {error}
        </AppText>
      )}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        style={[styles.hiddenInput, typography.regular[16]]}
        caretHidden
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.xs, justifyContent: "center" },
  box: {
    flex: 1,
    maxWidth: 56,
    aspectRatio: 0.85,
    borderWidth: 1.5,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  // Off-screen rather than `display: none`, which would make it unfocusable.
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 1,
    width: 1,
  },
});
