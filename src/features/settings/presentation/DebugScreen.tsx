import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { AppToolbar } from "@/common/presentation/components/app/AppToolbar";
import { AppText } from "@/common/presentation/components/app/AppText";
import { AppButton } from "@/common/presentation/components/app/AppButton";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";
import { AppTextInput } from "@/common/presentation/components/app/AppTextInput";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { radius, spacing } from "@/common/presentation/theme/AppSpacing";
import { useEnvironment } from "@/features/core/environment/business-logic/environmentContext";
import { LOCAL_ENVIRONMENT_ID } from "@/features/core/environment/data-access/environmentTypes";
import { useSession } from "@/features/core/session/business-logic/useSession";
import { useAlert } from "@/features/core/alerts/business-logic/useAlert";
import {
  FEATURE_FLAG_LIST,
  FeatureFlagSourceEnums,
} from "@/features/core/feature-flags/data-access/featureFlagTypes";
import { useFeatureFlagManager } from "@/features/core/feature-flags/business-logic/useFeatureFlagManager";
import { SettingsRow } from "@/features/settings/presentation/components/SettingsRow";

const SOURCE_LABELS: Record<FeatureFlagSourceEnums, string> = {
  [FeatureFlagSourceEnums.DEV_OVERRIDE]: "debug override",
  [FeatureFlagSourceEnums.SERVER]: "server (/app/settings)",
  [FeatureFlagSourceEnums.ENV]: "env (EXPO_PUBLIC_FLAG_*)",
  [FeatureFlagSourceEnums.DEFAULT]: "catalog default",
};

const OVERRIDE_CHOICES: { label: string; value?: boolean }[] = [
  { label: "Auto", value: undefined },
  { label: "On", value: true },
  { label: "Off", value: false },
];

const layerValue = (value?: boolean) => {
  if (value === undefined) return "—";
  return value ? "on" : "off";
};

/**
 * Dev-only. Registered behind `Stack.Protected guard={AppConfig.isDevelop}`, so
 * it does not exist in a production build.
 */
export const DebugScreen = () => {
  const { colors } = useAppTheme();
  const {
    environments,
    selectedEnvironment,
    selectEnvironment,
    localUrl,
    setLocalUrl,
  } = useEnvironment();
  const { isAuthenticated, signOut } = useSession();
  const { showSuccess, showError, showWarning, showInfo } = useAlert();
  const { flags, setDevOverride, clearDevOverrides } = useFeatureFlagManager();
  const [draftUrl, setDraftUrl] = useState(localUrl ?? "");

  return (
    <PageContainer safeEdges="top">
      <AppToolbar title="Debug" />

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}
      >
        <View>
          <AppText size={12} weight="medium" color="secondary">
            Environment
          </AppText>
          {environments.map((environment) => (
            <SettingsRow
              key={environment.id}
              title={environment.title}
              value={environment.baseUrl || undefined}
              onPress={() => selectEnvironment(environment.id)}
              end={
                environment.id === selectedEnvironment.id ? (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={colors.primary.main}
                  />
                ) : undefined
              }
            />
          ))}
        </View>

        {selectedEnvironment.id === LOCAL_ENVIRONMENT_ID && (
          <View style={{ gap: spacing.xs }}>
            <AppTextInput
              label="Local API URL"
              placeholder="http://192.168.1.10:8000/v1"
              autoCapitalize="none"
              value={draftUrl}
              onChangeText={setDraftUrl}
            />
            <AppButton
              title="Save local URL"
              buttonType="outlined"
              onPress={() => setLocalUrl(draftUrl.trim() || undefined)}
            />
          </View>
        )}

        <View style={{ gap: spacing.xs }}>
          <AppText size={12} weight="medium" color="secondary">
            Alerts
          </AppText>
          <AppButton
            title="Success"
            buttonType="outlined"
            onPress={() => showSuccess({ message: "Saved." })}
          />
          <AppButton
            title="Error"
            buttonType="outlined"
            onPress={() => showError({ message: "That did not work." })}
          />
          <AppButton
            title="Warning"
            buttonType="outlined"
            onPress={() => showWarning({ message: "Check this first." })}
          />
          <AppButton
            title="Info"
            buttonType="outlined"
            onPress={() => showInfo({ message: "Just so you know." })}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <AppText size={12} weight="medium" color="secondary">
            Feature flags
          </AppText>
          <AppText size={12} color="secondary">
            Resolution: debug override → server → env → catalog default.
            Overrides are dev/stage only and survive a restart.
          </AppText>
          {FEATURE_FLAG_LIST.map((flag) => {
            const state = flags[flag];
            return (
              <View
                key={flag}
                style={{
                  gap: spacing.xxs,
                  padding: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: colors.background.level1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <AppText size={14} weight="semiBold">
                    {flag}
                  </AppText>
                  <AppText
                    size={13}
                    weight="bold"
                    color={
                      state.isEnabled ? colors.success.main : colors.error.main
                    }
                  >
                    {state.isEnabled ? "ON" : "OFF"}
                  </AppText>
                </View>
                <AppText size={12} color="secondary">
                  via {SOURCE_LABELS[state.source]}
                </AppText>
                <AppText size={12} color="secondary">
                  override {layerValue(state.devOverride)} · server{" "}
                  {layerValue(state.serverValue)} · env{" "}
                  {layerValue(state.envValue)}
                </AppText>
                <View style={{ flexDirection: "row", gap: spacing.xs }}>
                  {OVERRIDE_CHOICES.map((choice) => {
                    const isSelected = state.devOverride === choice.value;
                    return (
                      <AppPressable
                        key={choice.label}
                        onPress={() => setDevOverride(flag, choice.value)}
                        style={{
                          flex: 1,
                          paddingVertical: spacing.xs,
                          borderRadius: radius.sm,
                          borderWidth: 1,
                          borderColor: isSelected
                            ? colors.text.primary
                            : colors.border.default,
                          backgroundColor: isSelected
                            ? colors.text.primary
                            : colors.background.white,
                        }}
                      >
                        <AppText
                          size={13}
                          style={{
                            textAlign: "center",
                            color: isSelected
                              ? colors.background.white
                              : colors.text.primary,
                          }}
                        >
                          {choice.label}
                        </AppText>
                      </AppPressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
          <AppButton
            title="Clear all overrides"
            buttonType="outlined"
            onPress={clearDevOverrides}
          />
        </View>

        <View style={{ gap: spacing.xs }}>
          <AppText size={12} weight="medium" color="secondary">
            Session
          </AppText>
          <AppText size={13}>
            {isAuthenticated ? "Signed in" : "Signed out"}
          </AppText>
          <AppButton
            title="Sign out"
            buttonStyle="secondary"
            isEnabled={isAuthenticated}
            onPress={() => void signOut()}
          />
        </View>
      </ScrollView>
    </PageContainer>
  );
};
