import React, { RefAttributes } from "react";
import {
  FlatList,
  FlatListProps,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";

export interface HorizontalFlatListProps<ItemT>
  extends Omit<FlatListProps<ItemT>, "horizontal" | "inverted">,
    RefAttributes<FlatList<ItemT>> {}

const ROTATED = { transform: [{ scale: -1 }] };
const ROTATE_INSTEAD_OF_INVERT = Platform.OS === "android";

const swapVerticalPadding = (
  style: StyleProp<ViewStyle>,
): StyleProp<ViewStyle> => {
  const flat = StyleSheet.flatten(style);
  if (!flat) return style;
  const { paddingTop, paddingBottom, ...rest } = flat;
  return { ...rest, paddingTop: paddingBottom, paddingBottom: paddingTop };
};

function HorizontalFlatList<ItemT>({
  ref,
  style,
  contentContainerStyle,
  renderItem,
  ...rest
}: HorizontalFlatListProps<ItemT>) {
  const { getDirection } = useLocalization();
  const isRTL = getDirection() === "rtl";
  const rotate = isRTL && ROTATE_INSTEAD_OF_INVERT;

  return (
    <FlatList
      ref={ref}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={5}
      {...rest}
      style={
        rotate
          ? [swapVerticalPadding(style), { direction: "ltr" }, ROTATED]
          : isRTL
            ? [style, { direction: "ltr" }]
            : style
      }
      contentContainerStyle={
        rotate
          ? swapVerticalPadding(contentContainerStyle)
          : contentContainerStyle
      }
      inverted={isRTL && !rotate}
      renderItem={
        isRTL && renderItem
          ? (info) => (
              <View style={[{ direction: "rtl" }, rotate && ROTATED]}>
                {renderItem(info)}
              </View>
            )
          : renderItem
      }
      horizontal
    />
  );
}

export default HorizontalFlatList;
