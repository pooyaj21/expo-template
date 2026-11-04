import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { StateHandler } from "@/common/presentation/components/StateHandler";
import { AppToolbar } from "@/common/presentation/components/app/AppToolbar";
import { AppImage } from "@/common/presentation/components/app/AppImage";
import { AppText } from "@/common/presentation/components/app/AppText";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { useLocalization } from "@/common/business-logic/localization/localizationContext";
import { formatDate } from "@/common/business-logic/utils/format";
import { TestIdEnums } from "@/common/business-logic/testIds";
import { useExampleDetail } from "@/features/example/business-logic/useExampleDetail";

type ExampleDetailScreenProps = {
  id: string;
};

export const ExampleDetailScreen = ({ id }: ExampleDetailScreenProps) => {
  const { getString, activeLanguage } = useLocalization();
  const { bottom } = useSafeAreaInsets();
  const { example, isLoading, error, refetch } = useExampleDetail(id);

  return (
    <PageContainer testID={TestIdEnums.EXAMPLE_DETAIL_SCREEN} safeEdges="top">
      <AppToolbar
        title={example?.title ?? getString("example_detail_title")}
        showBack
      />
      <StateHandler
        data={example}
        isLoading={isLoading}
        error={error}
        retry={refetch}
      >
        {(item) => (
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingBottom: bottom + spacing.md },
            ]}
          >
            {item.image != null && (
              <AppImage style={styles.image} image={item.image} />
            )}
            <AppText size={24} weight="medium">
              {item.title}
            </AppText>
            {item.subtitle != null && item.subtitle.length > 0 && (
              <AppText size={14} color="secondary">
                {item.subtitle}
              </AppText>
            )}
            <AppText size={12} color="secondary">
              {formatDate(item.created_at, activeLanguage.key, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </AppText>
          </ScrollView>
        )}
      </StateHandler>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
});
