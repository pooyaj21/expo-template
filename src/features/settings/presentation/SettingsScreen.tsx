import Constants from "expo-constants";
import { ScrollView, View } from "react-native";
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { AppToolbar } from "@/common/presentation/components/app/AppToolbar";
import { AppText } from "@/common/presentation/components/app/AppText";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { useLocalization } from "@/common/business-logic/localization/localizationContext";
import { useAppRouter } from "@/common/business-logic/hooks/useAppRouter";
import { routes } from "@/common/business-logic/routes/paths";
import { TestIdEnums } from "@/common/business-logic/testIds";
import { AppConfig } from "@/common/data-access/config/AppConfig";
import { useEnvironment } from "@/features/core/environment/business-logic/environmentContext";
import { SettingsRow } from "@/features/settings/presentation/components/SettingsRow";

export const SettingsScreen = () => {
  const { getString, activeLanguage } = useLocalization();
  const { selectedEnvironment } = useEnvironment();
  const router = useAppRouter();

  return (
    <PageContainer testID={TestIdEnums.SETTINGS_SCREEN} safeEdges="top">
      <AppToolbar title={getString("settings_title")} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.md }}>
        <AppText
          size={12}
          weight="medium"
          color="secondary"
          style={{ marginTop: spacing.md }}
        >
          {getString("settings_section_general")}
        </AppText>

        <View>
          <SettingsRow
            testID={TestIdEnums.SETTINGS_LANGUAGE}
            title={getString("settings_row_language")}
            value={activeLanguage.nativeTitle}
            onPress={() => router.push(routes.language())}
          />

          {AppConfig.isDevelop && (
            <SettingsRow
              title={getString("settings_row_environment")}
              value={selectedEnvironment.title}
              onPress={() => router.push(routes.debug())}
            />
          )}
        </View>

        <AppText
          size={12}
          color="placeholder"
          style={{ marginTop: spacing.xl }}
        >
          {getString("settings_version").replace(
            "p0",
            Constants.expoConfig?.version ?? "1.0.0",
          )}
        </AppText>
      </ScrollView>
    </PageContainer>
  );
};
