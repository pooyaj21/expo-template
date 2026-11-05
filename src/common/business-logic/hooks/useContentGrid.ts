import { useDimensions } from "@/common/business-logic/hooks/useDimensions";
import { CellDimension } from "@/common/business-logic/utils/cellDimension";
import { getContentSidePadding } from "@/common/business-logic/utils/contentLayout";

const TABLET_MIN_COLUMNS = 2;

export const contentGrid = (
  width: number,
  isTablet: boolean,
  cellWidth: number,
  sideMargin: number,
  spacing: number,
) => {
  const sidePadding = getContentSidePadding(width, isTablet, sideMargin);
  const { cols } = CellDimension.fixedHeight(cellWidth, spacing, 0).dimensions(
    width - sidePadding * 2,
    isTablet ? TABLET_MIN_COLUMNS : 1,
  );

  return { sidePadding, numColumns: cols };
};

export const useContentGrid = (
  cellWidth: number,
  sideMargin: number,
  spacing: number,
) => {
  const { width, isTablet } = useDimensions();
  return contentGrid(width, isTablet, cellWidth, sideMargin, spacing);
};
