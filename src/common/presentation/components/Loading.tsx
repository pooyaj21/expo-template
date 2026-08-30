import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";

type LoadingProps = {
  background?: string;
  size?: "small" | "large";
};

/**
 * Page and section loading. Swap the indicator for a Lottie here and every
 * loading state in the app changes at once.
 */
export const Loading = ({ background, size = "large" }: LoadingProps) => {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: background ?? colors.background.white },
      ]}
    >
      <ActivityIndicator size={size} color={colors.primary.main} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
