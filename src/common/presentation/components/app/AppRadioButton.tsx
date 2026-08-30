import { StyleProp, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";

export enum RadioModeEnums {
  CIRCLE = "circle",
  CHECKBOX = "checkBox",
}

type AppRadioButtonProps = {
  isChecked: boolean;
  mode?: `${RadioModeEnums}`;
  accentColor?: string;
  uncheckedColor?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * The indicator only — it renders no label and handles no press. Wrap it in the
 * row that owns the tap target, so a whole row stays tappable rather than a
 * 20pt dot.
 */
export const AppRadioButton = ({
  isChecked,
  mode = RadioModeEnums.CIRCLE,
  accentColor,
  uncheckedColor,
  size = 20,
  style,
}: AppRadioButtonProps) => {
  const { colors } = useAppTheme();
  const accent = accentColor ?? colors.primary.main;
  const unchecked = uncheckedColor ?? colors.grey[100];
  const isCircle = mode === RadioModeEnums.CIRCLE;
  const innerSize = Math.round(size * (isCircle ? 0.5 : 0.7));

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: isCircle ? size / 2 : 4,
          borderWidth: 1.5,
          borderColor: isChecked ? accent : unchecked,
          backgroundColor: !isCircle && isChecked ? accent : "transparent",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {isChecked &&
        (isCircle ? (
          <View
            style={{
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: accent,
            }}
          />
        ) : (
          <Ionicons
            name="checkmark"
            size={innerSize}
            color={colors.primary.contrast}
          />
        ))}
    </View>
  );
};
