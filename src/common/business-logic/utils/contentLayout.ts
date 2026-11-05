import { contentLayoutMetrics } from "@/common/business-logic/constants/layout";

export const getContentWidth = (pageWidth: number) => {
  const { contentMaxWidth, tabletSideMargin } = contentLayoutMetrics;
  return Math.min(pageWidth - tabletSideMargin * 2, contentMaxWidth);
};

export const getContentSidePadding = (
  pageWidth: number,
  isTablet: boolean,
  phoneSideMargin: number,
) => {
  if (!isTablet) {
    return phoneSideMargin;
  }
  return (pageWidth - getContentWidth(pageWidth)) / 2;
};
