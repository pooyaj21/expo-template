import { StyleSheet, View } from "react-native";
import { AppPressable } from "@/common/presentation/components/AppPressable";
import { AppText } from "@/common/presentation/components/AppText";
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { TestIdEnums } from "@/common/business-logic/utils/testIds";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { useEnvironment } from "@/features/core/environment/business-logic/useEnvironment";
import type { AppLanguage } from "@/common/business-logic/localization/localizationTypes";

export const ExampleSettingsPage = () => {
  const { colors } = useAppTheme();
  const { language, setLanguage, getString, isRTL } = useLocalization();
  const { flavor, selectedEnvironment } = useEnvironment();
  const { isDark } = useAppTheme();

  const setLang = (next: AppLanguage) => {
    void setLanguage(next);
  };

  return (
    <PageContainer>
      <View style={styles.root} testID="settings-screen">
        <AppText weight="semiBold" size={22} style={styles.title}>
          {getString("settings.title")}
        </AppText>

        <View style={styles.section}>
          <AppText weight="medium" size={14} color={colors.text.secondary}>
            {getString("settings.language")}
          </AppText>
          <View style={styles.row}>
            <AppPressable
              testID={TestIdEnums.LANGUAGE_EN}
              onPress={() => setLang("en")}
              style={[
                styles.chip,
                {
                  borderColor: colors.border.default,
                  backgroundColor:
                    language === "en"
                      ? colors.primary.main
                      : colors.background.level1,
                },
              ]}
            >
              <AppText
                weight="medium"
                color={
                  language === "en" ? colors.text.contrast : colors.text.primary
                }
              >
                {getString("settings.language.en")}
              </AppText>
            </AppPressable>
            <AppPressable
              testID={TestIdEnums.LANGUAGE_AR}
              onPress={() => setLang("ar")}
              style={[
                styles.chip,
                {
                  borderColor: colors.border.default,
                  backgroundColor:
                    language === "ar"
                      ? colors.primary.main
                      : colors.background.level1,
                },
              ]}
            >
              <AppText
                weight="medium"
                color={
                  language === "ar" ? colors.text.contrast : colors.text.primary
                }
              >
                {getString("settings.language.ar")}
              </AppText>
            </AppPressable>
          </View>
        </View>

        <View style={styles.section}>
          <AppText weight="medium" size={14} color={colors.text.secondary}>
            {getString("settings.theme")}
          </AppText>
          <AppText>
            {isDark ? "dark" : "light"}
            {isRTL ? " · rtl" : " · ltr"}
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText weight="medium" size={14} color={colors.text.secondary}>
            {getString("settings.flavor")}
          </AppText>
          <AppText>
            {flavor} · {selectedEnvironment.title}
          </AppText>
        </View>
      </View>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 24,
  },
  title: {
    marginBottom: 4,
  },
  section: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
