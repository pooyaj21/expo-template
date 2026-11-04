import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { radius, spacing } from "@/common/presentation/theme/AppSpacing";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";
import { AppText } from "@/common/presentation/components/app/AppText";
import { ExampleInterface } from "@/features/example/data-access/exampleTypes";

type ExampleCellProps = {
  item: ExampleInterface;
  onPress: (item: ExampleInterface) => void;
  testID?: string;
};

export const ExampleCell = ({ item, onPress, testID }: ExampleCellProps) => {
  const { colors } = useAppTheme();

  return (
    <AppPressable
      testID={testID}
      enableAnimation
      onPress={() => onPress(item)}
      style={[styles.container, { backgroundColor: colors.background.level1 }]}
    >
      <View style={styles.copy}>
        <AppText size={14} weight="semiBold" numberOfLines={1}>
          {item.title}
        </AppText>
        {item.subtitle != null && item.subtitle.length > 0 && (
          <AppText size={13} color="secondary" numberOfLines={2}>
            {item.subtitle}
          </AppText>
        )}
      </View>
    </AppPressable>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.md, borderRadius: radius.md },
  copy: { gap: spacing.xxs },
});
