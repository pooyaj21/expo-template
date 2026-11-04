import { DimensionProvider } from "@/common/business-logic/layout/DimensionProvider";

export const getContentWidth = (pageWidth: number) => {
  const { contentMaxWidth, tabletSideMargin } = DimensionProvider.layout;
  return Math.min(pageWidth - tabletSideMargin * 2, contentMaxWidth);
};

export const getContentSidePadding = (
  pageWidth: number,
  isTablet: boolean,
  phoneSideMargin: number,
) => {
  if (!isTablet) return phoneSideMargin;
  return (pageWidth - getContentWidth(pageWidth)) / 2;
};
