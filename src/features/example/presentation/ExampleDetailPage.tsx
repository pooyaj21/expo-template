import { StyleSheet, View } from "react-native";
import { AppText } from "@/common/presentation/components/AppText";
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { StateHandler } from "@/common/presentation/components/StateHandler";
import { TestIdEnums } from "@/common/business-logic/utils/testIds";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { useFeatureFlag } from "@/features/core/feature-flags/business-logic/useFeatureFlag";
import { useExampleDetail } from "@/features/example/business-logic/useExampleDetail";
import {
  useIsExampleFavorite,
  useToggleExampleFavorite,
} from "@/features/example/business-logic/store/exampleFavoritesSelectors";
import { AppPressable } from "@/common/presentation/components/AppPressable";

type ExampleDetailPageProps = {
  id: string;
};

export const ExampleDetailPage = ({ id }: ExampleDetailPageProps) => {
  const { getString } = useLocalization();
  const { colors } = useAppTheme();
  const { post, isLoading, error, refetch } = useExampleDetail(id);
  const favoritesEnabled = useFeatureFlag("EXAMPLE_FAVORITES");
  const numericId = Number(id);
  const isFavorite = useIsExampleFavorite(
    Number.isFinite(numericId) ? numericId : -1,
  );
  const toggleFavorite = useToggleExampleFavorite();

  return (
    <PageContainer>
      <View style={styles.root} testID={TestIdEnums.EXAMPLE_DETAIL}>
        <AppText weight="semiBold" size={22} style={styles.title}>
          {getString("example.detail.title")}
        </AppText>
        <StateHandler
          data={post}
          error={error}
          isLoading={isLoading}
          retry={() => {
            void refetch();
          }}
          emptyComponent={
            <AppText>{getString("example.detail.notFound")}</AppText>
          }
        >
          {(item) => (
            <View style={styles.content}>
              <AppText weight="semiBold" size={18}>
                {item.title}
              </AppText>
              <AppText size={14} color={colors.text.secondary}>
                {item.body}
              </AppText>
              {favoritesEnabled ? (
                <AppPressable
                  testID="example-detail-favorite"
                  onPress={() => toggleFavorite(item.id)}
                  style={[
                    styles.favorite,
                    { borderColor: colors.border.default },
                  ]}
                >
                  <AppText
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
          )}
        </StateHandler>
      </View>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    marginBottom: 16,
  },
  content: {
    gap: 12,
  },
  favorite: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
});
