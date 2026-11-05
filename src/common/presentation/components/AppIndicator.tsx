import { StyleSheet, View } from "react-native";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";

type AppIndicatorBaseProps = {
  style?: StyleProp<ViewStyle>;
  items: readonly unknown[];
};

type StaticAppIndicatorProps = AppIndicatorBaseProps & {
  selectedIndex: number;
};

type ProgressAppIndicatorProps = AppIndicatorBaseProps & {
  progress: SharedValue<number>;
};

type AppIndicatorProps = StaticAppIndicatorProps | ProgressAppIndicatorProps;

type ProgressIndicatorDotProps = {
  progress: SharedValue<number>;
  index: number;
  count: number;
  activeColor: string;
  inActiveColor: string;
  style: StyleProp<ViewStyle>;
};

const ProgressIndicatorDot = (props: ProgressIndicatorDotProps) => {
  const { progress, index, count, activeColor, inActiveColor, style } = props;

  const animatedStyle = useAnimatedStyle(() => {
    const current = ((Math.round(progress.value) % count) + count) % count;

    return {
      backgroundColor: current === index ? activeColor : inActiveColor,
    };
  });

  return <Animated.View style={[style, animatedStyle]} />;
};

export const AppIndicator = (props: AppIndicatorProps) => {
  const { style, items } = props;

  const theme = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View style={style}>
      {items.length > 1 && (
        <View style={styles.indicatorContainer}>
          {items.map((_, index) =>
            "progress" in props ? (
              <ProgressIndicatorDot
                key={index}
                progress={props.progress}
                index={index}
                count={items.length}
                activeColor={theme.colors.primary.main}
                inActiveColor={theme.colors.border.default}
                style={styles.indicator}
              />
            ) : (
              <View
                key={index}
                style={
                  props.selectedIndex === index
                    ? styles.activeIndicator
                    : styles.inActiveIndicator
                }
              />
            ),
          )}
        </View>
      )}
    </View>
  );
};

export default AppIndicator;

const getStyles = ({ colors }: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    indicatorContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 100,
    },
    activeIndicator: {
      width: 8,
      height: 8,
      backgroundColor: colors.primary.main,
      borderRadius: 100,
    },
    inActiveIndicator: {
      width: 8,
      height: 8,
      backgroundColor: colors.border.default,
      borderRadius: 100,
    },
  });
