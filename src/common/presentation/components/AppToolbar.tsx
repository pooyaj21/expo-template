import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { AppBackIcon } from "@/common/presentation/components/AppBackIcon";
import { Toolbar } from "@/common/presentation/components/Toolbar";
import { APP_TOOLBAR_HEIGHT } from "@/common/business-logic/constants/layout";

export { APP_TOOLBAR_HEIGHT };

export type AppToolbarProps = {
  style?: StyleProp<ViewStyle>;
  title?: string;
  backIcon?: boolean;
  onBackPress?: () => void;
  start?: ReactNode;
  end?: ReactNode;
  center?: ReactNode;
};

export const AppToolbar = ({
  style,
  title,
  backIcon = false,
  onBackPress,
  start,
  end,
  center,
}: AppToolbarProps) => {
  const { colors, typography } = useAppTheme();

  const startNode =
    start ??
    (backIcon ? (
      <AppBackIcon onPress={onBackPress} />
    ) : (
      <View style={{ width: 48 }} />
    ));

  const centerNode =
    center ??
    (title ? (
      <Text
        numberOfLines={1}
        style={{ ...typography.medium[16], color: colors.text.primary }}
      >
        {title}
      </Text>
    ) : null);

  return (
    <View
      style={[styles.wrap, { backgroundColor: colors.background.white }, style]}
    >
      <Toolbar start={startNode} center={centerNode} end={end} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    height: APP_TOOLBAR_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
});
