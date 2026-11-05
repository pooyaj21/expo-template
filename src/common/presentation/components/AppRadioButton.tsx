import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";

import { CheckboxTickIcon } from "@/common/presentation/icons/CheckboxTickIcon";

type AppRadioButtonMode = "checkBox" | "circle";

type AppRadioButtonProps = {
  isChecked: boolean;
  mode?: AppRadioButtonMode;
  accentColor?: string;
  size?: number;
  uncheckedColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function AppRadioButton({
  isChecked,
  mode = "circle",
  accentColor,
  size = 20,
  uncheckedColor,
  style,
}: AppRadioButtonProps) {
  const { colors } = useAppTheme();
  const resolvedAccent = accentColor ?? colors.primary.main;
  const resolvedUncheckedColor = uncheckedColor ?? colors.grey[300];

  if (mode === "checkBox" && isChecked) {
    return (
      <View style={[{ width: size, height: size }, style]}>
        <CheckboxTickIcon size={size} color={resolvedAccent} />
      </View>
    );
  }

  const borderRadius = mode === "circle" ? size / 2 : size / 9;
  const innerSize = Math.round(size * 0.5);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          borderWidth: 1.5,
          borderColor: isChecked ? resolvedAccent : resolvedUncheckedColor,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {isChecked && (
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: resolvedAccent,
          }}
        />
      )}
    </View>
  );
}

export default AppRadioButton;
