import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";

type PaginationLoadingProps = {
  isVisible?: boolean;
};

export const PaginationLoading = ({ isVisible }: PaginationLoadingProps) => {
  const { colors } = useAppTheme();
  if (!isVisible) return null;
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.primary.main} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingVertical: 16, alignItems: "center" },
});

export default PaginationLoading;
