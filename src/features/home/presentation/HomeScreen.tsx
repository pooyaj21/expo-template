import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { AppText } from "@/common/presentation/components/app/AppText";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { radius, spacing } from "@/common/presentation/theme/AppSpacing";
import { useLocalization } from "@/common/business-logic/localization/localizationContext";
import { useAppRouter } from "@/common/business-logic/hooks/useAppRouter";
import { routes } from "@/common/business-logic/routes/paths";
import { AppConfig } from "@/common/data-access/config/AppConfig";

const LAYERS = [
  {
    name: "data-access",
    detail: "Services, React Query bindings, types. Knows nothing above it.",
  },
  {
    name: "business-logic",
    detail: "Hooks, stores, rules. Never imports presentation.",
  },
  {
    name: "presentation",
    detail: "Screens and components. Reads business-logic hooks only.",
  },
];

export const HomeScreen = () => {
  const { getString } = useLocalization();
  const { colors, typography } = useAppTheme();
  const router = useAppRouter();

  return (
    <PageContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1, gap: spacing.xxs }}>
            <AppText size={28} weight="bold">
              {getString("home_title")}
            </AppText>
            <AppText size={14} color="secondary">
              {getString("home_subtitle")}
            </AppText>
          </View>
          <AppPressable
            enableAnimation
            hitSlop={12}
            onPress={() => router.push(routes.settings())}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.text.primary}
            />
          </AppPressable>
        </View>

        <View style={{ gap: spacing.xs }}>
          {LAYERS.map((layer, index) => (
            <View
              key={layer.name}
              style={[
                styles.card,
                { backgroundColor: colors.background.level1 },
              ]}
            >
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.primary.light },
                ]}
              >
                <AppText size={13} weight="bold" color={colors.primary.dark}>
                  {index + 1}
                </AppText>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText size={14} weight="semiBold">
                  {layer.name}
                </AppText>
                <AppText size={12} color="secondary">
                  {layer.detail}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        {AppConfig.isDevelop && (
          <AppText
            size={12}
            color="placeholder"
            style={typography.regular[12]}
            onPress={() => router.push(routes.debug())}
          >
            {`${AppConfig.environment} · tap for debug`}
          </AppText>
        )}
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.xl },
  header: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
