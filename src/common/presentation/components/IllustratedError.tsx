import { ReactNode } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { AppButton } from "@/common/presentation/components/AppButton";

export enum IllustratedErrorTypeEnums {
  NOT_FOUND = "notFound",
  SERVER_ERROR = "serverError",
}

type IllustratedErrorButton = {
  title: string;
  onPress: () => void;
};

type IllustratedErrorProps = {
  type: IllustratedErrorTypeEnums;
  subtitle?: string;
  button?: IllustratedErrorButton;
  style?: ViewStyle;
  children?: ReactNode;
};

export const IllustratedError = ({
  type,
  subtitle,
  button,
  style,
  children,
}: IllustratedErrorProps) => {
  const { colors, typography } = useAppTheme();
  const { getString } = useLocalization();
  const isNotFound = type === IllustratedErrorTypeEnums.NOT_FOUND;
  const title = isNotFound
    ? getString("common.notFound.title")
    : getString("common.serverError.title");

  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name={isNotFound ? "search-outline" : "cloud-offline-outline"}
        size={64}
        color={colors.text.secondary}
      />
      <Text
        style={[
          typography.medium[18],
          { color: colors.text.primary, marginTop: 16 },
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            typography.regular[14],
            { color: colors.text.secondary, textAlign: "center", marginTop: 8 },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
      {button ? (
        <AppButton
          title={button.title}
          onPress={button.onPress}
          style={{ marginTop: 24, minWidth: 160 }}
        />
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});

export default IllustratedError;
