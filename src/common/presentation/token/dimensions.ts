import {
  BOTTOM_SHEET_TABLET_MAX_WIDTH,
  contentLayoutMetrics,
  TABLET_MIN_ASPECT_RATIO as TABLET_MIN_ASPECT_RATIO_VALUE,
  TABLET_MIN_WIDTH as TABLET_MIN_WIDTH_VALUE,
} from "@/common/business-logic/constants/layout";

export const TABLET_MIN_WIDTH = TABLET_MIN_WIDTH_VALUE;
export const TABLET_MIN_ASPECT_RATIO = TABLET_MIN_ASPECT_RATIO_VALUE;

export const dimensions = {
  layout: {
    contentMaxWidth: contentLayoutMetrics.contentMaxWidth,
    tabletSideMargin: contentLayoutMetrics.tabletSideMargin,
    columnMaxWidth: contentLayoutMetrics.columnMaxWidth,
    columnSideMargin: contentLayoutMetrics.columnSideMargin,
    railGap: contentLayoutMetrics.railGap,
    phoneRailGap: contentLayoutMetrics.phoneRailGap,
  },
  bottomSheet: {
    tablet: {
      maxWidth: BOTTOM_SHEET_TABLET_MAX_WIDTH,
    },
  },
  list: {
    sideMargin: 20,
    spacing: 12,
    tablet: {
      spacing: 20,
      cellWidth: 200,
    },
  },
  toolbar: {
    height: 56,
    sideMargin: 16,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export type AppDimensions = typeof dimensions;
