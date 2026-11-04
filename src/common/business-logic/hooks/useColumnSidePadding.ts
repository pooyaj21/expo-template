import { useDimensions } from "@/common/business-logic/hooks/useDimensions";
import { DimensionProvider } from "@/common/business-logic/layout/DimensionProvider";

/** Centers a single column on tablet; returns the phone gutter otherwise. */
export const useColumnSidePadding = (
  columnMaxWidth: number = DimensionProvider.layout.columnMaxWidth,
) => {
  const { width, isTablet } = useDimensions();
  const { columnSideMargin, tabletSideMargin } = DimensionProvider.layout;
  if (!isTablet) return columnSideMargin;
  return Math.max(tabletSideMargin, (width - columnMaxWidth) / 2);
};
