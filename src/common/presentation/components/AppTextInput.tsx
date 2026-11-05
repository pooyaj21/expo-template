import { TextInputProps } from "react-native/Libraries/Components/TextInput/TextInput";
import { StyleSheet, TextInput, View, ViewStyle, Text } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { AppPressable } from "@/common/presentation/components/AppPressable";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { withAlpha } from "@/common/business-logic/utils/color";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import {
  AutofillFieldEnums,
  getAutofillFieldProps,
} from "@/common/business-logic/utils/autofill";

export type AppTextInputProps = TextInputProps & {
  style?: ViewStyle;
  isEnabled?: boolean;
  error?: string;
  validation?: () => string | undefined;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  hint?: string;
  variant?: "floating" | "plain";
  contentPadding?: number;
  ref?: React.Ref<TextInput>;
  // Set when the input renders inside a bottom sheet — a plain TextInput
  // isn't tracked by the sheet's keyboard handling, so the sheet expands to
  // full screen and misplaces the field when the keyboard opens.
  bottomSheet?: boolean;
  forceLtr?: boolean;
  autofillField?: AutofillFieldEnums;
};

export const AppTextInput = (props: AppTextInputProps) => {
  const { forceLtr = false, autofillField, ...inputProps } = props;
  const {
    value,
    validation,
    placeholder,
    startIcon,
    contentPadding,
    multiline,
    numberOfLines,
    bottomSheet,
  } = props;
  const variant = props.variant ?? "floating";
  const isFloating = variant === "floating";
  const theme = useAppTheme();
  const isRtl = useLocalization().getDirection() === "rtl";
  const [validationError, setValidationError] = useState<string | undefined>(
    undefined,
  );
  const error = props.error ?? validationError;
  const isError = !!error;
  const isEnabled = props.isEnabled === undefined ? true : props.isEnabled;
  const styles = getStyles(
    theme,
    isError,
    isEnabled,
    isFloating && !!placeholder,
    contentPadding,
    multiline ? (numberOfLines ?? 1) : 1,
    forceLtr,
    isRtl,
  );
  const { colors, typography } = theme;
  const InputComponent = bottomSheet ? BottomSheetTextInput : TextInput;
  const [isFocused, setIsFocused] = useState(false);
  // with a start icon the label can't sit inside the input area, keep it floated
  const hasStartIcon = !!startIcon;
  const labelProgress = useSharedValue(hasStartIcon || value ? 1 : 0);

  const forwardedRef = props.ref;
  const inputRef = useRef<TextInput | null>(null);
  const assignRef = useCallback(
    (node: TextInput | null | undefined) => {
      const input = node ?? null;
      inputRef.current = input;
      if (typeof forwardedRef === "function") forwardedRef(input);
      else if (forwardedRef)
        (forwardedRef as React.RefObject<TextInput | null>).current = input;
    },
    [forwardedRef],
  );

  // the input itself is only one line tall inside a 66pt row, so taps on the
  // padding and the floated label would otherwise land on nothing
  const focusInput = () => {
    if (!isEnabled) return;
    inputRef.current?.focus();
  };

  // once invalid, re-validate while typing so the error clears as soon as fixed
  useEffect(() => {
    if (validation && validationError !== undefined) {
      setValidationError(validation());
    }
  }, [value, validation, validationError]);

  useEffect(() => {
    labelProgress.value = withTiming(
      hasStartIcon || isFocused || value ? 1 : 0,
      { duration: 150 },
    );
  }, [isFocused, value, hasStartIcon, labelProgress]);

  const animatedLabelStyle = useAnimatedStyle(() => ({
    top: interpolate(labelProgress.value, [0, 1], [18, 9]),
    fontSize: interpolate(labelProgress.value, [0, 1], [14, 12]),
  }));

  const labelStyle = {
    position: "absolute",
    start: 12,
    ...typography.regular[14],
    color: isError
      ? colors.error.main
      : (props.placeholderTextColor ?? colors.text.placeholder),
    paddingHorizontal: 4,
  } as const;

  return (
    <View style={props.style}>
      <AppPressable
        accessible={false}
        throttleEnabled={false}
        style={styles.containerStyle}
        onPress={focusInput}
      >
        {isFloating && placeholder && (
          <Animated.Text
            pointerEvents="none"
            style={[labelStyle, animatedLabelStyle]}
          >
            {placeholder}
          </Animated.Text>
        )}
        {startIcon && <View style={styles.startIconStyle}>{startIcon}</View>}
        <InputComponent
          {...(autofillField ? getAutofillFieldProps(autofillField) : null)}
          {...inputProps}
          value={value}
          ref={assignRef}
          editable={isEnabled}
          placeholder={
            isFloating
              ? hasStartIcon || isFocused
                ? props.hint
                : undefined
              : placeholder
          }
          placeholderTextColor={
            props.placeholderTextColor ?? colors.text.placeholder
          }
          allowFontScaling={false}
          style={styles.inputStyle}
          onFocus={(e) => {
            if (!isEnabled) return;
            props.onFocus?.(e);
            setIsFocused(true);
          }}
          onBlur={(e) => {
            props.onBlur?.(e);
            setIsFocused(false);
            setValidationError(validation?.());
          }}
          cursorColor={props.cursorColor ?? colors.primary.main}
        />
        {props.endIcon}
        <View style={{ width: 0, height: 24 }} />
      </AppPressable>
      {error && <Text style={styles.errorStyle}>{error}</Text>}
    </View>
  );
};

export default AppTextInput;

const getStyles = (
  { colors, typography }: ReturnType<typeof useAppTheme>,
  isError: boolean,
  isEnabled: boolean,
  isFloating: boolean,
  contentPadding?: number,
  minLines: number = 1,
  forceLtr: boolean = false,
  isRtl: boolean = false,
) => {
  const inputTypography = typography.regular[14];
  const {
    lineHeight: _inputLineHeight,
    writingDirection: _inputWritingDirection,
    ...inputTypographyNoLineHeight
  } = inputTypography;
  return StyleSheet.create({
    containerStyle: {
      flexDirection: "row",
      borderRadius: 16,
      backgroundColor: !isEnabled
        ? colors.grey[50]
        : isError
          ? withAlpha(colors.error.main, 0.1)
          : colors.background.level2,
      padding: contentPadding ?? 16,
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
      ...(forceLtr && { direction: "ltr" as const }),
    },
    // match the input's offset so the icon clears the floated label
    startIconStyle: {
      marginTop: isFloating ? 15 : 0,
    },
    inputStyle: {
      flex: 1,
      maxWidth: "100%",
      ...inputTypographyNoLineHeight,
      borderColor: colors.border.default,
      color: isEnabled ? colors.text.primary : colors.grey[200],
      padding: 0,
      marginTop: isFloating ? 12 : 0,
      minHeight: (inputTypography.lineHeight ?? 0) * minLines,
      // numberOfLines alone doesn't reserve height on iOS
      textAlignVertical: minLines > 1 ? "top" : "auto",
      textAlign: !forceLtr && isRtl ? ("right" as const) : ("left" as const),
      ...(forceLtr && { writingDirection: "ltr" as const }),
    },
    errorStyle: {
      ...typography.regular[12],
      color: colors.error.main,
      marginTop: 4,
      marginStart: 12,
    },
  });
};
