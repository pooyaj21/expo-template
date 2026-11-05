import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { routes } from "@/common/business-logic/routes/paths";
import { isDevelop } from "@/features/core/environment/business-logic/appConfig";
import { useEnvironment } from "@/features/core/environment/business-logic/useEnvironment";
import type { AppErrorFallbackProps } from "@/features/core/error-pages/presentation/AppErrorBoundary";

/**
 * In-tree error fallback when providers are still alive. Avoids Lane C UI so
 * this lane stays self-contained; Phase 3 can swap in illustrated components.
 */
export const InternalError = ({
  error,
  componentStack,
  retry,
}: AppErrorFallbackProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedEnvironment } = useEnvironment();

  const goHome = () => {
    void retry();
    router.replace(routes.home());
  };

  const shareDebugReport = async () => {
    const report = [
      "App internal error",
      `path: ${pathname}`,
      `environment: ${selectedEnvironment.title}`,
      `baseUrl: ${selectedEnvironment.baseUrl}`,
      error.message,
      error.stack ?? "",
      componentStack ?? "",
    ].join("\n\n");
    try {
      await Share.share({ message: report });
    } catch {
      // User dismissed the sheet.
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.body}>
        An unexpected error stopped this screen. You can go home and keep using
        the app.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={goHome}
        style={styles.button}
      >
        <Text style={styles.buttonLabel}>Go home</Text>
      </Pressable>
      {isDevelop ? (
        <View style={styles.debug}>
          <Text selectable style={styles.errorText}>
            {error.message}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void shareDebugReport()}
          >
            <Text style={styles.link}>Share debug report</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  debug: {
    width: "100%",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  errorText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    paddingVertical: 12,
  },
});
