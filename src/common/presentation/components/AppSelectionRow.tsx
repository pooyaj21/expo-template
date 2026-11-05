import { memo } from "react";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";

import { AppImage } from "@/common/presentation/components/AppImage";
import { AppRadioButton } from "@/common/presentation/components/AppRadioButton";
import { AppPressable } from "@/common/presentation/components/AppPressable";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { ChevronRight } from "@/common/presentation/icons/ChevronRight";

export enum SelectionAccessoryEnums {
  RADIO = "radio",
  CHEVRON = "chevron",
  NONE = "none",
}

export enum SelectionAccessoryPositionEnums {
  START = "start",
  END = "end",
}

const SELECTION_ROW_HEIGHT = 48;
const SELECTION_ROW_HEIGHT_WITH_SUBTITLE = 66;

export type AppSelectionRowProps = {
  title: string;
  subtitle?: string;
  image?: string | number | { uri?: string | null };
  height?: number;
  isSelected?: boolean;
  accessory?: SelectionAccessoryEnums;
  accessoryPosition?: SelectionAccessoryPositionEnums;
  enableAnimation?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  testID?: string;
};

export const AppSelectionRow = memo(function AppSelectionRow(
  props: AppSelectionRowProps,
) {
  const {
    title,
    subtitle,
    image,
    height,
    isSelected = false,
    accessory = SelectionAccessoryEnums.RADIO,
    accessoryPosition = SelectionAccessoryPositionEnums.END,
    enableAnimation,
    onPress,
    style,
    titleStyle,
    testID,
  } = props;
  const { colors, typography } = useAppTheme();

  const rowHeight =
    height ??
    (subtitle == null
      ? SELECTION_ROW_HEIGHT
      : SELECTION_ROW_HEIGHT_WITH_SUBTITLE);

  const accessoryNode =
    accessory === SelectionAccessoryEnums.RADIO ? (
      <AppRadioButton
        isChecked={isSelected}
        mode="circle"
        size={24}
        accentColor={colors.primary.main}
        uncheckedColor={colors.grey[100]}
      />
    ) : accessory === SelectionAccessoryEnums.CHEVRON ? (
      <ChevronRight size={20} color={colors.grey[200]} />
    ) : null;

  return (
    <AppPressable
      testID={testID}
      enableAnimation={enableAnimation}
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={[
        {
          height: rowHeight,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
        style,
      ]}
    >
      {accessoryPosition === SelectionAccessoryPositionEnums.START &&
        accessoryNode}
      {image != null && (
        <AppImage
          style={{
            width: 24,
            height: 24,
            borderRadius: 240,
            backgroundColor: colors.grey[100],
          }}
          image={image}
          contentFit="fill"
        />
      )}
      <View style={{ flex: 1, gap: subtitle == null ? 0 : 2 }}>
        <Text
          numberOfLines={1}
          style={[
            typography.regular[14],
            { color: colors.text.primary },
            titleStyle,
          ]}
        >
          {title}
        </Text>
        {subtitle != null && (
          <Text
            numberOfLines={1}
            style={[typography.regular[12], { color: colors.text.secondary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {accessoryPosition === SelectionAccessoryPositionEnums.END &&
        accessoryNode}
    </AppPressable>
  );
});

export default AppSelectionRow;
