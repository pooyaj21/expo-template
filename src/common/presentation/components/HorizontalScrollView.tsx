import { Platform, ScrollView, ScrollViewProps, View } from "react-native";
import React, { RefAttributes, useImperativeHandle, useRef } from "react";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";

export interface HorizontalScrollViewRef {
  scrollToStart: (animated?: boolean) => void;
  scrollToEnd: (animated?: boolean) => void;
}

export interface HorizontalScrollViewProps
  extends Omit<ScrollViewProps, "horizontal">,
    RefAttributes<HorizontalScrollViewRef> {}

const FLIPPED = { transform: [{ scaleX: -1 }] };
const FLIP_INSTEAD_OF_NATIVE_RTL = Platform.OS === "ios";

export const HorizontalScrollView = ({
  ref,
  style,
  onLayout,
  onContentSizeChange,
  children,
  ...props
}: HorizontalScrollViewProps) => {
  const { getDirection } = useLocalization();
  const isRTL = getDirection() === "rtl";
  const flip = isRTL && FLIP_INSTEAD_OF_NATIVE_RTL;
  const scrollRef = useRef<ScrollView>(null);
  const viewportWidth = useRef(0);
  const contentWidth = useRef(0);

  useImperativeHandle(ref, () => {
    const canScroll = () => contentWidth.current > viewportWidth.current;
    const toOrigin = (animated: boolean) =>
      canScroll() && scrollRef.current?.scrollTo({ x: 0, animated });
    const toFarEnd = (animated: boolean) =>
      canScroll() && scrollRef.current?.scrollToEnd({ animated });
    const originIsEnd = isRTL && !flip;

    return {
      scrollToStart: (animated = true) =>
        originIsEnd ? toFarEnd(animated) : toOrigin(animated),
      scrollToEnd: (animated = true) =>
        originIsEnd ? toOrigin(animated) : toFarEnd(animated),
    };
  }, [isRTL, flip]);

  return (
    <ScrollView
      ref={scrollRef}
      {...props}
      style={flip ? [style, { direction: "ltr" }, FLIPPED] : style}
      horizontal
      onLayout={(event) => {
        viewportWidth.current = event.nativeEvent.layout.width;
        onLayout?.(event);
      }}
      onContentSizeChange={(width, height) => {
        contentWidth.current = width;
        onContentSizeChange?.(width, height);
      }}
    >
      {flip
        ? React.Children.map(children, (child) => (
            <View style={[{ direction: "rtl" }, FLIPPED]}>{child}</View>
          ))
        : children}
    </ScrollView>
  );
};

export default HorizontalScrollView;
