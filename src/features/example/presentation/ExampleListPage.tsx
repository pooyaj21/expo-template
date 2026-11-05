import { StyleSheet, View } from "react-native";
import { AppList } from "@/common/presentation/components/AppList";
import { AppRefreshControl } from "@/common/presentation/components/AppRefreshControl";
import { AppText } from "@/common/presentation/components/AppText";
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { Skeleton } from "@/common/presentation/components/Skeleton";
import { StateHandler } from "@/common/presentation/components/StateHandler";
import { TestIdEnums } from "@/common/business-logic/utils/testIds";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { useExampleList } from "@/features/example/business-logic/useExampleList";
import { ExampleCard } from "@/features/example/presentation/components/ExampleCard";
import type { ExamplePost } from "@/features/example/business-logic/exampleModels";

const ListSkeleton = () => (
  <View style={styles.skeletonList}>
    {Array.from({ length: 6 }).map((_, index) => (
      <Skeleton key={index} style={styles.skeletonCard} />
    ))}
  </View>
);

export const ExampleListPage = () => {
  const { getString } = useLocalization();
  const { list, isLoading, isRefreshing, isEmpty, error, refetch } =
    useExampleList();

  return (
    <PageContainer>
      <View style={styles.root} testID={TestIdEnums.HOME_SCREEN}>
        <AppText weight="semiBold" size={22} style={styles.title}>
          {getString("example.list.title")}
        </AppText>
        <StateHandler
          data={list}
          error={error}
          isLoading={isLoading}
          isEmpty={isEmpty}
          retry={() => {
            void refetch();
          }}
          loadingComponent={<ListSkeleton />}
          emptyComponent={
            <AppText style={styles.empty}>
              {getString("example.list.empty")}
            </AppText>
          }
        >
          {(items) => (
            <AppList
              testID={TestIdEnums.EXAMPLE_LIST}
              data={items}
              keyExtractor={(item: ExamplePost) => String(item.id)}
              refreshControl={
                <AppRefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => {
                    void refetch();
                  }}
                />
              }
              renderItem={({ item }) => (
                <ExampleCard post={item} testID={`example-card-${item.id}`} />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.listContent}
            />
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
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
  empty: {
    marginTop: 24,
    textAlign: "center",
  },
  skeletonList: {
    gap: 12,
  },
  skeletonCard: {
    height: 110,
    borderRadius: 12,
  },
});
