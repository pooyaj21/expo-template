import { memo } from "react";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ImageType } from "@/common/data-access/type";
import { AppImage } from "@/common/presentation/components/app/AppImage";
import { AppRadioButton } from "@/common/presentation/components/app/AppRadioButton";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";
import { AppText } from "@/common/presentation/components/app/AppText";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";

export enum SelectionAccessoryEnums {
  RADIO = "radio",
  CHEVRON = "chevron",
  NONE = "none",
}

export enum SelectionAccessoryPositionEnums {
  START = "start",
  END = "end",
}

export const SELECTION_ROW_HEIGHT = 48;
export const SELECTION_ROW_HEIGHT_WITH_SUBTITLE = 66;

export type AppSelectionRowProps = {
  title: string;
  subtitle?: string;
  image?: ImageType;
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
  const { colors, isRtl } = useAppTheme();

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
      <Ionicons
        name={isRtl ? "chevron-back" : "chevron-forward"}
        size={20}
        color={colors.grey[200]}
      />
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
        <AppText size={14} numberOfLines={1} style={titleStyle}>
          {title}
        </AppText>
        {subtitle != null && (
          <AppText size={12} color="secondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        )}
      </View>
      {accessoryPosition === SelectionAccessoryPositionEnums.END &&
        accessoryNode}
    </AppPressable>
  );
});
