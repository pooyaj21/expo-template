import React, { useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ChevronRight } from "@/common/presentation/icons/ChevronRight";
import { AppPressable } from "@/common/presentation/components/AppPressable";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";

type ExpandableProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const APP_EXPANDABLE_ANIM_DURATION = 250;

export const AppExpandable = ({
  title,
  children,
  defaultExpanded = false,
  style,
}: ExpandableProps) => {
  const theme = useAppTheme();
  const { colors } = theme;
  const openAngle = useLocalization().getDirection() === "rtl" ? -90 : 90;

  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? openAngle : 0);

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    rotation.value = withTiming(next ? openAngle : 0, {
      duration: APP_EXPANDABLE_ANIM_DURATION,
    });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      layout={LinearTransition.duration(APP_EXPANDABLE_ANIM_DURATION)}
      style={[{ overflow: "hidden" }, style]}
    >
      <AppPressable
        onPress={handleToggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 16,
        }}
      >
        <View style={{ flex: 1 }}>{title}</View>
        <Animated.View style={chevronStyle}>
          <ChevronRight size={16} color={colors.text.primary} />
        </Animated.View>
      </AppPressable>

      {expanded && (
        <Animated.View
          entering={FadeIn.duration(APP_EXPANDABLE_ANIM_DURATION)}
          exiting={FadeOut.duration(APP_EXPANDABLE_ANIM_DURATION)}
        >
          <View
            style={{
              paddingBottom: 12,
            }}
          >
            {children}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};
