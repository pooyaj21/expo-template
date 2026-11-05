import { contentLayoutMetrics } from "@/common/business-logic/constants/layout";
import { useDimensions } from "@/common/business-logic/hooks/useDimensions";
import {
  getContentSidePadding,
  getContentWidth,
} from "@/common/business-logic/utils/contentLayout";

export enum DetailPageLayoutKindEnums {
  DEFAULT = "default",
  WIDE = "wide",
}

export const useDetailPageLayout = (
  phoneSideMargin: number,
  kind: DetailPageLayoutKindEnums = DetailPageLayoutKindEnums.DEFAULT,
) => {
  const { width, height, isTablet } = useDimensions();
  const sidePadding = getContentSidePadding(width, isTablet, phoneSideMargin);
  const contentWidth = isTablet ? getContentWidth(width) : width;
  const columnGap =
    kind === DetailPageLayoutKindEnums.WIDE
      ? contentLayoutMetrics.detailWideColumnGap
      : contentLayoutMetrics.detailColumnGap;
  const galleryMaxHeight = Math.max(
    height - contentLayoutMetrics.galleryTopChrome,
    1,
  );

  return {
    isTablet,
    width,
    height,
    sidePadding,
    contentWidth,
    columnGap,
    galleryMaxHeight,
    railGap: isTablet
      ? contentLayoutMetrics.railGap
      : contentLayoutMetrics.phoneRailGap,
    phoneSideMargin,
  };
};
