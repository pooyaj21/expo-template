import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import type { NoteBox } from "@/common/business-logic/types/noteBox";
import { AppText } from "@/common/presentation/components/AppText";
import { AttentionIcon } from "@/common/presentation/icons/AttentionIcon";

type AppNoteBannerProps = {
  info?: NoteBox | null;
  style?: StyleProp<ViewStyle>;
};

export const AppNoteBanner = ({ info, style }: AppNoteBannerProps) => {
  const { colors } = useAppTheme();
  const message = info?.message?.trim() ?? "";

  if (info == null || message.length === 0) return null;

  const contentColor = info.color || colors.text.primary;

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: info.background_color || colors.background.level2,
          borderColor: info.border_color || colors.divider,
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        style,
      ]}
    >
      <AttentionIcon size={24} color={contentColor} />
      <View style={{ flexShrink: 1 }}>
        <AppText color={contentColor} size={14}>
          {message}
        </AppText>
      </View>
    </View>
  );
};
