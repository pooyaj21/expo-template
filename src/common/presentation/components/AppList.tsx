import {
  ComponentType,
  createElement,
  isValidElement,
  Ref,
  useCallback,
  useState,
} from "react";
import { Dimensions, LayoutChangeEvent, View } from "react-native";
import {
  useBottomSheetInternal,
  useBottomSheetScrollableCreator,
} from "@gorhom/bottom-sheet";
import { FlashList, FlashListProps, FlashListRef } from "@shopify/flash-list";

import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { PaginationLoading } from "@/common/presentation/components/PaginationLoading";
import type { InfiniteListPagination } from "@/common/data-access/type/responseTypes";

const END_REACHED_THRESHOLD = 0.5;
const SCROLL_EVENT_THROTTLE = 16;
const DRAW_DISTANCE_VIEWPORTS = 2;
const FALLBACK_DRAW_DISTANCE = Dimensions.get("window").height;

export type AppListProps<T> = Omit<
  FlashListProps<T>,
  "renderScrollComponent" | "drawDistance"
> & {
  inBottomSheet?: boolean;
  showSeparator?: boolean;
  listRef?: Ref<FlashListRef<T>>;
  pagination?: Pick<
    InfiniteListPagination,
    "isFetchingNextPage" | "fetchNextPageIfAvailable"
  >;
};

export function AppList<T>(props: AppListProps<T>) {
  const {
    inBottomSheet,
    showSeparator,
    listRef,
    pagination,
    onLayout,
    onEndReached,
    onEndReachedThreshold,
    ItemSeparatorComponent,
    ListFooterComponent,
    showsVerticalScrollIndicator = false,
    scrollEventThrottle = SCROLL_EVENT_THROTTLE,
    ...rest
  } = props;
  const { colors } = useAppTheme();
  const bottomSheetScrollable = useBottomSheetScrollableCreator();
  const bottomSheet = useBottomSheetInternal(true);

  // gorhom's scrollable only forwards `onScroll` through `runOnJS`, so FlashList
  // sees scroll events batched and late. It derives velocity from `Date.now()`
  // deltas in that callback and projects its render window `velocity *
  // averageRenderTime` ahead, so a batched burst inflates the velocity, the
  // window overshoots the real viewport and the list goes blank mid-fling. The
  // wrapper only buys drag-to-dismiss from the list, so skip it when the sheet
  // has content panning off.
  const usesSheetScrollable =
    inBottomSheet === true &&
    bottomSheet?.enableContentPanningGesture !== false;

  const [viewportHeight, setViewportHeight] = useState(0);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const measured = event.nativeEvent.layout.height;
      setViewportHeight((current) =>
        Math.abs(current - measured) < 1 ? current : measured,
      );
      onLayout?.(event);
    },
    [onLayout],
  );

  const renderSeparator = useCallback(
    () => <View style={{ height: 1, backgroundColor: colors.divider }} />,
    [colors.divider],
  );

  const renderFooter = () => {
    if (!pagination) return ListFooterComponent;
    return (
      <>
        {isValidElement(ListFooterComponent)
          ? ListFooterComponent
          : ListFooterComponent
            ? createElement(ListFooterComponent as ComponentType)
            : null}
        <PaginationLoading isVisible={pagination.isFetchingNextPage} />
      </>
    );
  };

  return (
    <FlashList
      {...rest}
      ref={listRef}
      onLayout={handleLayout}
      drawDistance={
        (viewportHeight > 0 ? viewportHeight : FALLBACK_DRAW_DISTANCE) *
        DRAW_DISTANCE_VIEWPORTS
      }
      renderScrollComponent={
        usesSheetScrollable ? bottomSheetScrollable : undefined
      }
      scrollEventThrottle={scrollEventThrottle}
      ItemSeparatorComponent={
        ItemSeparatorComponent ?? (showSeparator ? renderSeparator : undefined)
      }
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onEndReached={
        pagination ? pagination.fetchNextPageIfAvailable : onEndReached
      }
      onEndReachedThreshold={
        onEndReachedThreshold ??
        (pagination ? END_REACHED_THRESHOLD : undefined)
      }
      ListFooterComponent={renderFooter()}
    />
  );
}

export default AppList; // named export above
