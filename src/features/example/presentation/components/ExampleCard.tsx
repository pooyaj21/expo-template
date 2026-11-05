import { StyleSheet, View } from "react-native";
import { AppPressable } from "@/common/presentation/components/AppPressable";
import { AppText } from "@/common/presentation/components/AppText";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { useFeatureFlag } from "@/features/core/feature-flags/business-logic/useFeatureFlag";
import { useAppRouter } from "@/features/core/navigation/business-logic/useAppRouter";
import type { ExamplePost } from "@/features/example/business-logic/exampleModels";
import { useExampleFavoriteToggle } from "@/features/example/business-logic/useExampleFavoriteToggle";

type ExampleCardProps = {
  post: ExamplePost;
  testID?: string;
};

export const ExampleCard = ({ post, testID }: ExampleCardProps) => {
  const { colors } = useAppTheme();
  const { getString } = useLocalization();
  const { navigateTo } = useAppRouter();
  const detailEnabled = useFeatureFlag("EXAMPLE_DETAIL");
  const favoritesEnabled = useFeatureFlag("EXAMPLE_FAVORITES");
  const { isFavorite, toggle } = useExampleFavoriteToggle(post.id);

  const openDetail = () => {
    navigateTo.exampleDetail({ id: post.id });
  };

  return (
    <AppPressable
      testID={testID}
      onPress={openDetail}
      disabled={!detailEnabled}
      style={[
        styles.card,
        {
          backgroundColor: colors.background.level1,
          borderColor: colors.border.default,
        },
      ]}
    >
      <View style={styles.header}>
        <AppText weight="semiBold" size={16} style={styles.title}>
          {post.title}
        </AppText>
        {favoritesEnabled ? (
          <AppPressable
            testID={`example-favorite-${post.id}`}
            onPress={toggle}
            hitSlop={8}
            style={styles.favoriteButton}
          >
            <AppText
              size={12}
              weight="medium"
              color={isFavorite ? colors.error.main : colors.primary.main}
            >
              {isFavorite
                ? getString("example.favorites.remove")
                : getString("example.favorites.add")}
            </AppText>
          </AppPressable>
        ) : null}
      </View>
      <AppText size={14} color={colors.text.secondary} numberOfLines={3}>
        {post.body}
      </AppText>
    </AppPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  header: {
    gap: 8,
  },
  title: {
    flexShrink: 1,
  },
  favoriteButton: {
    alignSelf: "flex-start",
  },
});
