import { ReactNode } from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { radius, spacing } from "@/common/presentation/theme/AppSpacing";
import { StyleTypography } from "@/common/presentation/theme/AppTypography";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";
import { ButtonInterface } from "@/common/data-access/type";
import { useAppRouter } from "@/common/business-logic/hooks/useAppRouter";

export enum AppButtonTypeEnums {
  CONTAINED = "contained",
  OUTLINED = "outlined",
  TEXT = "text",
}

export enum AppButtonStyleEnums {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

type BaseButtonProps = {
  buttonType?: `${AppButtonTypeEnums}`;
  buttonStyle?: `${AppButtonStyleEnums}`;
  /** Overrides the palette entirely — for API-driven colours only. */
  baseColor?: string;
  isEnabled?: boolean;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleTypography;
  start?: ReactNode;
  end?: ReactNode;
};

type ManualButtonProps = BaseButtonProps & {
  title: string;
  onPress: () => void;
};

/** A button the backend describes, label and destination included. */
type ResponseButtonProps = BaseButtonProps & {
  response: ButtonInterface;
};

export type AppButtonProps = ManualButtonProps | ResponseButtonProps;

export const AppButton = (props: AppButtonProps) => {
  const { colors, typography } = useAppTheme();
  const { handleAction } = useAppRouter();

  const {
    buttonType = AppButtonTypeEnums.CONTAINED,
    buttonStyle = AppButtonStyleEnums.PRIMARY,
    isEnabled = true,
    isLoading,
    baseColor,
    style,
    start,
    end,
    textStyle,
  } = props;

  const palette =
    buttonStyle === AppButtonStyleEnums.SECONDARY
      ? colors.button.secondary
      : colors.button.primary;

  const mainColor = isEnabled ? (baseColor ?? palette.main) : palette.disabled;

  const contentColor = !isEnabled
    ? colors.text.disabled
    : buttonType === AppButtonTypeEnums.CONTAINED
      ? colors.text.contrast
      : mainColor;

  const isResponse = "response" in props;
  const title = isResponse ? (props.response.text ?? "") : props.title;
  const onPress = isResponse
    ? () => handleAction(props.response.action)
    : props.onPress;

  return (
    <AppPressable
      enableAnimation
      onPress={isEnabled && !isLoading ? onPress : undefined}
      style={[
        styles.button,
        buttonType === AppButtonTypeEnums.CONTAINED && {
          backgroundColor: mainColor,
        },
        buttonType === AppButtonTypeEnums.OUTLINED && {
          borderWidth: 1,
          borderColor: mainColor,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {start}
        <Text
          style={[
            textStyle ?? typography.semiBold[16],
            { color: contentColor },
          ]}
        >
          {title}
        </Text>
        {end}
        {isLoading && <ActivityIndicator size="small" color={contentColor} />}
      </View>
    </AppPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
