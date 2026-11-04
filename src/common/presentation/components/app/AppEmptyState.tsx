import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { ImageType } from "@/common/data-access/type";
import { useLocalization } from "@/common/business-logic/localization/localizationContext";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { AppButton } from "@/common/presentation/components/app/AppButton";
import { AppImage } from "@/common/presentation/components/app/AppImage";
import { AppText } from "@/common/presentation/components/app/AppText";

type AppEmptyStateProps = {
  image?: ImageType;
  title?: string;
  description?: string;
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
  const { getString } = useLocalization();

  return (
    <View style={styles.container}>
      {image != null && (
        <AppImage style={styles.image} image={image} contentFit="contain" />
      )}
      <AppText size={24} weight="medium" style={styles.title}>
        {title ?? getString("shared_empty_title")}
      </AppText>
      {description != null && (
        <AppText size={14} color="secondary" style={styles.description}>
          {description}
        </AppText>
      )}
      {buttonTitle != null && onButtonPress != null && (
        <AppButton
          style={styles.button}
          start={buttonIcon}
          title={buttonTitle}
          onPress={onButtonPress}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  image: { width: 220, height: 220 },
  title: { marginTop: spacing.md, textAlign: "center" },
  description: { marginTop: spacing.xs, textAlign: "center" },
  button: { marginTop: spacing.md, paddingHorizontal: spacing.xl },
});
