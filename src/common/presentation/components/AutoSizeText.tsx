import {
  LayoutChangeEvent,
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextLayoutEventData,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import React, { useCallback, useMemo, useState } from "react";

const MEASURE_WIDTH = 10000;
const DEFAULT_FONT_SIZE = 14;

export interface AutoSizeTextProps
  extends Omit<TextProps, "style" | "numberOfLines" | "onTextLayout"> {
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  minimumFontScale?: number;
}

export const AutoSizeText = ({
  style,
  containerStyle,
  minimumFontScale = 0.7,
  children,
  ...rest
}: AutoSizeTextProps) => {
  const [availableWidth, setAvailableWidth] = useState(0);
  const [naturalWidth, setNaturalWidth] = useState(0);

  const baseFontSize = StyleSheet.flatten(style)?.fontSize ?? DEFAULT_FONT_SIZE;

  const fontSize = useMemo(() => {
    if (!availableWidth || !naturalWidth || naturalWidth <= availableWidth) {
      return baseFontSize;
    }
    return (
      baseFontSize * Math.max(minimumFontScale, availableWidth / naturalWidth)
    );
  }, [availableWidth, naturalWidth, baseFontSize, minimumFontScale]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setAvailableWidth(Math.floor(event.nativeEvent.layout.width));
  }, []);

  const onTextLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      const line = event.nativeEvent.lines[0];
      if (line) {
        setNaturalWidth(Math.ceil(line.width));
      }
    },
    [],
  );

  return (
    <View style={[styles.container, containerStyle]} onLayout={onLayout}>
      <Text
        {...rest}
        style={[style, { fontSize }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {children}
      </Text>
      <View
        style={styles.measure}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text
          {...rest}
          style={[style, { fontSize: baseFontSize }]}
          onTextLayout={onTextLayout}
        >
          {children}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
  },
  measure: {
    position: "absolute",
    top: 0,
    start: 0,
    width: MEASURE_WIDTH,
    opacity: 0,
  },
});

export default AutoSizeText;
