import { useCallback } from "react";
import { useSharedValue } from "react-native-reanimated";

const REVERSAL_DISTANCE = 12;
const REVERSAL_COOLDOWN_MS = 120;

export type CollapsibleHeaderHandle = {
  onScroll: (offsetY: number) => void;
  syncScroll: (offsetY: number) => void;
};

type CollapsibleHeaderOptions = {
  getCollapseRange: () => number;
  onCollapseRangeChange?: (range: number) => void;
};

export const useCollapsibleHeader = ({
  getCollapseRange,
  onCollapseRangeChange,
}: CollapsibleHeaderOptions) => {
  const collapseProgress = useSharedValue(0);
  const reportedRange = useSharedValue(0);
  const lastOffsetY = useSharedValue(0);
  const lastDirection = useSharedValue<0 | 1 | -1>(0);
  const lastUpdateAt = useSharedValue(0);

  const reportCollapseRange = useCallback(() => {
    const range = Math.max(0, getCollapseRange());
    if (range > 0 && reportedRange.value !== range) {
      reportedRange.value = range;
      onCollapseRangeChange?.(range);
    }
    return range;
  }, [getCollapseRange, onCollapseRangeChange, reportedRange]);

  const onScroll = useCallback(
    (offsetY: number) => {
      const range = reportCollapseRange();
      if (range <= 0) return;
      const delta = offsetY - lastOffsetY.value;
      if (delta === 0) return;
      const direction: 1 | -1 = delta > 0 ? 1 : -1;
      const now = Date.now();
      const isReversal =
        lastDirection.value !== 0 && direction !== lastDirection.value;
      if (isReversal) {
        const timeSinceLastUpdate = now - lastUpdateAt.value;
        if (
          Math.abs(delta) < REVERSAL_DISTANCE ||
          timeSinceLastUpdate < REVERSAL_COOLDOWN_MS
        ) {
          return;
        }
      }
      lastOffsetY.value = offsetY;
      lastDirection.value = direction;
      lastUpdateAt.value = now;
      collapseProgress.value = Math.min(1, Math.max(0, offsetY / range));
    },
    [
      collapseProgress,
      lastDirection,
      lastOffsetY,
      lastUpdateAt,
      reportCollapseRange,
    ],
  );

  const syncScroll = useCallback(
    (offsetY: number) => {
      const range = reportCollapseRange();
      lastOffsetY.value = offsetY;
      lastDirection.value = 0;
      lastUpdateAt.value = 0;
      collapseProgress.value =
        range <= 0 ? 0 : Math.min(1, Math.max(0, offsetY / range));
    },
    [
      collapseProgress,
      lastDirection,
      lastOffsetY,
      lastUpdateAt,
      reportCollapseRange,
    ],
  );

  return { collapseProgress, onScroll, syncScroll, reportCollapseRange };
};
