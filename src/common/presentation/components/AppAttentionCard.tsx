import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import type { NoteBox } from "@/common/business-logic/types/noteBox";
import { AppText } from "@/common/presentation/components/AppText";
import { AttentionIcon } from "@/common/presentation/icons/AttentionIcon";

type AppAttentionCardProps = {
  info?: NoteBox | string | null;
  style?: StyleProp<ViewStyle>;
};

export const AppAttentionCard = ({ info, style }: AppAttentionCardProps) => {
  const { colors } = useAppTheme();
  const { getString } = useLocalization();

  const detail: Partial<NoteBox> | null | undefined =
    typeof info === "string" ? { message: info } : info;
  const message = detail?.message?.trim() ?? "";

  if (detail == null || message.length === 0) return null;

  const contentColor = detail.color ?? colors.text.primary;

  return (
    <View
      style={[
        {
          backgroundColor: detail.background_color ?? colors.background.level2,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: detail.border_color ?? colors.divider,
          padding: 16,
          gap: 12,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <AttentionIcon size={24} color={contentColor} />
        <AppText color={contentColor} size={16} weight="medium">
          {getString("common.attention.title")}
        </AppText>
      </View>
      <AppText color={contentColor} size={14}>
        {message}
      </AppText>
    </View>
  );
};
