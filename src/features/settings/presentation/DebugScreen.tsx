import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { AppToolbar } from "@/common/presentation/components/app/AppToolbar";
import { AppText } from "@/common/presentation/components/app/AppText";
import { AppButton } from "@/common/presentation/components/app/AppButton";
import { AppTextInput } from "@/common/presentation/components/app/AppTextInput";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { useEnvironment } from "@/features/core/environment/business-logic/environmentContext";
import { LOCAL_ENVIRONMENT_ID } from "@/features/core/environment/data-access/environmentTypes";
import { useSession } from "@/features/core/session/business-logic/useSession";
import { useAlert } from "@/features/core/alerts/business-logic/useAlert";
import { SettingsRow } from "@/features/settings/presentation/components/SettingsRow";

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
