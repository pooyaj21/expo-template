import { PageContainer } from "@/common/presentation/components/PageContainer";
import { StateHandler } from "@/common/presentation/components/StateHandler";
import { Spacer } from "@/common/presentation/components/Spacer";
import { AppList } from "@/common/presentation/components/app/AppList";
import { AppToolbar } from "@/common/presentation/components/app/AppToolbar";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { DimensionProvider } from "@/common/business-logic/layout/DimensionProvider";
import { useDimensions } from "@/common/business-logic/hooks/useDimensions";
import { useLocalization } from "@/common/business-logic/localization/localizationContext";
import { useAppRouter } from "@/common/business-logic/hooks/useAppRouter";
import { routes } from "@/common/business-logic/routes/paths";
import {
  TestIdEnums,
  exampleCellTestId,
} from "@/common/business-logic/testIds";
import { useExampleList } from "@/features/example/business-logic/useExampleList";
import { ExampleCell } from "@/features/example/presentation/components/ExampleCell";

export const ExampleListScreen = () => {
  const { getString } = useLocalization();
  const router = useAppRouter();
  const { isTablet } = useDimensions();
  const { list, isLoading, isEmpty, error, refetch, pagination } =
    useExampleList();

  const sideMargin = isTablet
    ? DimensionProvider.example.list.tablet.sideMargin
    : DimensionProvider.example.list.sideMargin;

  return (
    <PageContainer testID={TestIdEnums.EXAMPLE_LIST_SCREEN} safeEdges="top">
      <AppToolbar title={getString("example_title")} showBack />

      <StateHandler
        data={list}
        isLoading={isLoading}
        isEmpty={isEmpty}
        error={error}
        retry={refetch}
      >
        {(items) => (
          <AppList
            testID={TestIdEnums.EXAMPLE_LIST}
            data={items}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: sideMargin }}
            ItemSeparatorComponent={() => <Spacer height={spacing.xs} />}
            pagination={pagination}
            renderItem={({ item }) => (
              <ExampleCell
                testID={exampleCellTestId(item.id)}
                item={item}
                onPress={(selected) =>
                  router.push(routes.exampleDetail(String(selected.id)))
                }
              />
            )}
          />
        )}
      </StateHandler>
    </PageContainer>
  );
};
