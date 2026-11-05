import { createContext, useContext } from "react";
import { useWindowDimensions, type ScaledSize } from "react-native";
import {
  dimensions,
  TABLET_MIN_ASPECT_RATIO,
  TABLET_MIN_WIDTH,
} from "@/common/presentation/token/dimensions";

export type AppWindowDimensions = ScaledSize & {
  isMobile: boolean;
  isTablet: boolean;
};

const SheetWidthContext = createContext<number | undefined>(undefined);

export const SheetWidthProvider = SheetWidthContext.Provider;

const resolveDimensions = (
  window: ScaledSize,
  width: number,
): AppWindowDimensions => {
  const { height } = window;
  const isTablet =
    width >= TABLET_MIN_WIDTH &&
    height > 0 &&
    width / height >= TABLET_MIN_ASPECT_RATIO;

  return { ...window, width, isMobile: !isTablet, isTablet };
};

const getSheetWidth = (window: ScaledSize) =>
  resolveDimensions(window, window.width).isTablet
    ? Math.min(window.width, dimensions.bottomSheet.tablet.maxWidth)
    : undefined;

export const useSheetWidth = () => getSheetWidth(useWindowDimensions());

export const useSheetDimensions = () => {
  const window = useWindowDimensions();
  return resolveDimensions(window, getSheetWidth(window) ?? window.width);
};

export const useDimensions = (): AppWindowDimensions => {
  const window = useWindowDimensions();
  const sheetWidth = useContext(SheetWidthContext);
  return resolveDimensions(window, sheetWidth ?? window.width);
};
