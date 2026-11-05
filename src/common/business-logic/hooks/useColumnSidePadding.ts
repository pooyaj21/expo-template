import { contentLayoutMetrics } from "@/common/business-logic/constants/layout";
import { useDimensions } from "@/common/business-logic/hooks/useDimensions";

export const useColumnSidePadding = (
  columnMaxWidth: number = contentLayoutMetrics.columnMaxWidth,
) => {
  const { width, isTablet } = useDimensions();
  const { columnSideMargin, tabletSideMargin } = contentLayoutMetrics;
  if (!isTablet) return columnSideMargin;
  return Math.max(tabletSideMargin, (width - columnMaxWidth) / 2);
};
