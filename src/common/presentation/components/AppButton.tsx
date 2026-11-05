import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { AppPressable } from "@/common/presentation/components/AppPressable";

type AppButtonType = "contained" | "outlined" | "text";
type AppButtonStyle = "primary" | "secondary";

export type AppButtonProps = {
  title: string;
  onPress: () => void;
  buttonType?: AppButtonType;
  buttonStyle?: AppButtonStyle;
  buttonBaseColor?: string;
  isEnabled?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
  start?: React.ReactNode;
  end?: React.ReactNode;
  testID?: string;
};

export const AppButton = (props: AppButtonProps) => {
  const theme = useAppTheme();
  const { colors, typography } = theme;

  const buttonType = props.buttonType ?? "contained";
  const buttonStyle = props.buttonStyle ?? "primary";
  const isEnabled = props.isEnabled ?? true;

  let mainColor =
    buttonStyle === "secondary"
      ? isEnabled
        ? colors.button.secondary.main
        : colors.button.secondary.disabled
      : isEnabled
        ? colors.button.primary.main
        : colors.button.primary.disabled;

  if (props.buttonBaseColor) {
    mainColor = isEnabled
      ? props.buttonBaseColor
      : colors.button.primary.disabled;
  }

  const contentColor = isEnabled
    ? buttonType !== "contained"
      ? mainColor
      : colors.text.contrast
    : colors.text.disabled;

  const styles = StyleSheet.create({
    button: {
      borderRadius: 16,
      padding: 12,
      alignItems: "center",
    },
    contained: { backgroundColor: mainColor },
    outlined: {
      backgroundColor: colors.background.white,
      borderWidth: 1,
      borderColor: mainColor,
    },
    text: { backgroundColor: "transparent" },
  });

  return (
    <AppPressable
      enableAnimation
      testID={props.testID}
      onPress={isEnabled && !props.isLoading ? props.onPress : undefined}
      style={[
        styles.button,
        buttonType === "text"
          ? styles.text
          : buttonType === "outlined"
            ? styles.outlined
            : styles.contained,
        props.style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "100%",
        }}
      >
        {props.start}
        <Text
          numberOfLines={props.numberOfLines}
          style={[
            typography.regular[16],
            { color: contentColor, flexShrink: 1 },
            props.textStyle,
          ]}
        >
          {props.title}
        </Text>
        {props.end}
        {props.isLoading && (
          <ActivityIndicator size="small" color={contentColor} />
        )}
      </View>
    </AppPressable>
  );
};
