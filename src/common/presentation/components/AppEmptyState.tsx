import React, { ReactNode } from "react";
import { ImageRequireSource, Text, View } from "react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { AppButton } from "@/common/presentation/components/AppButton";
import {
  AppImage,
  AppImageSource,
} from "@/common/presentation/components/AppImage";

type AppEmptyStateProps = {
  image?: AppImageSource | ImageRequireSource;
  title: string;
  description: string;
  buttonTitle?: string;
  buttonIcon?: ReactNode;
  onButtonPress?: () => void;
};

export const AppEmptyState = ({
  image,
  title,
  description,
  buttonTitle,
  buttonIcon,
  onButtonPress,
}: AppEmptyStateProps) => {
  const { colors, typography } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {image != null ? (
        <AppImage
          image={image}
          style={{ width: 160, height: 160, marginBottom: 16 }}
        />
      ) : null}
      <Text
        style={{
          ...typography.medium[18],
          color: colors.text.primary,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          ...typography.regular[14],
          color: colors.text.secondary,
          textAlign: "center",
          marginTop: 8,
        }}
      >
        {description}
      </Text>
      {buttonTitle && onButtonPress ? (
        <AppButton
          title={buttonTitle}
          onPress={onButtonPress}
          start={buttonIcon}
          style={{ marginTop: 20, minWidth: 160 }}
        />
      ) : null}
    </View>
  );
};
