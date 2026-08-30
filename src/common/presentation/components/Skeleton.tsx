import { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { radius } from "@/common/presentation/theme/AppSpacing";

type SkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

const SKELETON_BG = "#E1E3E8";
const SKELETON_BG_RGB = "225, 227, 232";
// Android's blend makes the same alpha read far brighter than on iOS.
const SHIMMER_HIGHLIGHT =
  Platform.OS === "android"
    ? "rgba(255,255,255,0.22)"
    : "rgba(255,255,255,0.55)";

/**
 * A shimmering block. Compose these into a `<FeatureSkeleton />` that mirrors
 * the real screen's layout, and pass it to `StateHandler`'s `loadingComponent`
 * — a spinner tells the user to wait, a skeleton tells them what is coming.
 */
export const Skeleton = ({ style }: SkeletonProps) => {
  // useMemo, not useRef: an Animated.Value is read during render to build
  // the interpolation, which a ref may not be.
  const progress = useMemo(() => new Animated.Value(0), []);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress]);

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.container, style]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-width, width],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            `rgba(${SKELETON_BG_RGB}, 0)`,
            SHIMMER_HIGHLIGHT,
            `rgba(${SKELETON_BG_RGB}, 0)`,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

/** Placeholder rows for a skeleton list: `getEmptyList(6).map(...)`. */
export const getEmptyList = (size: number): string[] =>
  Array.from({ length: size }, (_, index) => index.toString());

const styles = StyleSheet.create({
  container: {
    backgroundColor: SKELETON_BG,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
});
