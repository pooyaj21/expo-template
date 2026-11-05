import { Animated, Platform, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";

type SkeletonProps = {
  style?: ViewStyle;
};

const SKELETON_BG = "#E1E3E8";
const SKELETON_BG_RGB = "225, 227, 232";
const SHIMMER_HIGHLIGHT =
  Platform.OS === "android"
    ? "rgba(255,255,255,0.22)"
    : "rgba(255,255,255,0.55)";
const SHIMMER_DURATION_MS = 1500;

const shimmerProgress = new Animated.Value(0);
let shimmerAnimation: Animated.CompositeAnimation | null = null;
let shimmerSubscribers = 0;

const acquireShimmer = () => {
  shimmerSubscribers += 1;
  if (shimmerAnimation != null) return;
  shimmerAnimation = Animated.loop(
    Animated.timing(shimmerProgress, {
      toValue: 1,
      duration: SHIMMER_DURATION_MS,
      useNativeDriver: true,
    }),
  );
  shimmerAnimation.start();
};

const releaseShimmer = () => {
  shimmerSubscribers -= 1;
  if (shimmerSubscribers > 0) return;
  shimmerSubscribers = 0;
  shimmerAnimation?.stop();
  shimmerAnimation = null;
  shimmerProgress.setValue(0);
};

export const Skeleton = ({ style }: SkeletonProps) => {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const sweep = useLocalization().getDirection() === "rtl" ? -1 : 1;

  useEffect(() => {
    acquireShimmer();
    return releaseShimmer;
  }, []);

  const translateX = shimmerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-layoutWidth * sweep, layoutWidth * sweep],
  });

  const gradientColors = [
    `rgba(${SKELETON_BG_RGB}, 0)`,
    SHIMMER_HIGHLIGHT,
    `rgba(${SKELETON_BG_RGB}, 0)`,
  ] as const;

  return (
    <View
      onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      style={[styles.container, style]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[...gradientColors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: SKELETON_BG,
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default Skeleton;
