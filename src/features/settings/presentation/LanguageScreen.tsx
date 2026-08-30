import { ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { AppToolbar } from "@/common/presentation/components/app/AppToolbar";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { useLocalization } from "@/common/business-logic/localization/localizationContext";
import { SettingsRow } from "@/features/settings/presentation/components/SettingsRow";

/**
 * Switching language re-typesets the tree (fonts + direction) and re-scopes the
 * query cache, so no screen has to refetch by hand.
 */
export const LanguageScreen = () => {
  const { getString, languages, activeLanguage, setActiveLanguage } =
    useLocalization();
  const { colors } = useAppTheme();

  return (
    <PageContainer safeEdges="top">
      <AppToolbar title={getString("language_title")} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.md }}>
        {languages.map((language) => (
          <SettingsRow
            key={language.key}
            title={language.nativeTitle}
            onPress={() => setActiveLanguage(language.key)}
            end={
              language.key === activeLanguage.key ? (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={colors.primary.main}
                />
              ) : undefined
            }
          />
        ))}
      </ScrollView>
    </PageContainer>
  );
};
