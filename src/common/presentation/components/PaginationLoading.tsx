import { ActivityIndicator, StyleProp, View, ViewStyle } from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { spacing } from "@/common/presentation/theme/AppSpacing";

type PaginationLoadingProps = {
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
};

export const PaginationLoading = ({
  isVisible,
  style,
}: PaginationLoadingProps) => {
  const { colors } = useAppTheme();

  if (!isVisible) return null;

  return (
    <View
      style={[
        {
          paddingVertical: spacing.sm,
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      <ActivityIndicator size="small" color={colors.primary.main} />
    </View>
  );
};
