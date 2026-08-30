import { useWindowDimensions } from "react-native";

const TABLET_BREAKPOINT = 768;

/** Window size plus the one breakpoint the app actually branches on. */
export const useDimensions = () => {
  const window = useWindowDimensions();
  return {
    ...window,
    isMobile: window.width < TABLET_BREAKPOINT,
    isTablet: window.width >= TABLET_BREAKPOINT,
  };
};
