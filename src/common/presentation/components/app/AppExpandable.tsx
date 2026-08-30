import { ReactNode, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";

type AppExpandableProps = {
  title: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  style?: StyleProp<ViewStyle>;
};

const ANIM_DURATION = 250;

/** Accordion row — FAQ sections, order details, filter groups. */
export const AppExpandable = ({
  title,
  children,
  defaultExpanded = false,
  style,
}: AppExpandableProps) => {
  const { colors, isRtl } = useAppTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 90 : 0);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    rotation.value = withTiming(next ? 90 : 0, { duration: ANIM_DURATION });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${isRtl ? -rotation.value : rotation.value}deg` }],
  }));

  return (
    <Animated.View
      layout={LinearTransition.duration(ANIM_DURATION)}
      style={[{ overflow: "hidden" }, style]}
    >
      <AppPressable
        onPress={toggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>{title}</View>
        <Animated.View style={chevronStyle}>
          <Ionicons
            name={isRtl ? "chevron-back" : "chevron-forward"}
            size={18}
            color={colors.text.primary}
          />
        </Animated.View>
      </AppPressable>

      {expanded && (
        <Animated.View
          entering={FadeIn.duration(ANIM_DURATION).delay(ANIM_DURATION / 2)}
          exiting={FadeOut.duration(ANIM_DURATION / 2)}
        >
          <View style={{ paddingBottom: spacing.sm }}>{children}</View>
        </Animated.View>
      )}
    </Animated.View>
  );
};
