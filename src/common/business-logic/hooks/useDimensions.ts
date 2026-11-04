import { createContext, useContext } from "react";
import { ScaledSize, useWindowDimensions } from "react-native";
import { DimensionProvider } from "@/common/business-logic/layout/DimensionProvider";

export const TABLET_MIN_WIDTH = 600;
const TABLET_MIN_ASPECT_RATIO = 0.8;

const SheetWidthContext = createContext<number | undefined>(undefined);

export const SheetWidthProvider = SheetWidthContext.Provider;

const resolveDimensions = (window: ScaledSize, width: number) => {
  const { height } = window;
  const isTablet =
    width >= TABLET_MIN_WIDTH &&
    height > 0 &&
    width / height >= TABLET_MIN_ASPECT_RATIO;

  return { ...window, width, isMobile: !isTablet, isTablet };
};

const getSheetWidth = (window: ScaledSize) =>
  resolveDimensions(window, window.width).isTablet
    ? Math.min(window.width, DimensionProvider.bottomSheet.tablet.maxWidth)
    : undefined;

export const useSheetWidth = () => getSheetWidth(useWindowDimensions());

export const useSheetDimensions = () => {
  const window = useWindowDimensions();
  return resolveDimensions(window, getSheetWidth(window) ?? window.width);
};

/** Window size plus the tablet switch (600 + aspect ≥ 0.8). */
export const useDimensions = () => {
  const window = useWindowDimensions();
  const sheetWidth = useContext(SheetWidthContext);
  return resolveDimensions(window, sheetWidth ?? window.width);
};
