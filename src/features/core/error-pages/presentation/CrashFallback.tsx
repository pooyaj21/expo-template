import { useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { isDevelop } from "@/features/core/environment/business-logic/appConfig";

export type CrashFallbackProps = {
  error: Error;
  componentStack?: string | null;
  retry: () => void;
};

/**
 * Rendered when a provider itself crashed, so it must not read theme,
 * localization, navigation or toast contexts — every value here is static.
 */
export const CrashFallback = ({
  error,
  componentStack,
  retry,
}: CrashFallbackProps) => {
  const [shared, setShared] = useState(false);

  const shareDebugReport = async () => {
    const report = [
      "App crash report",
      error.message,
      error.stack ?? "",
      componentStack ?? "",
    ].join("\n\n");
    try {
      await Share.share({ message: report });
      setShared(true);
    } catch {
      // User dismissed the sheet.
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.body}>
        The app hit an unexpected error and had to stop.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={retry}
        style={styles.button}
      >
        <Text style={styles.buttonLabel}>Try again</Text>
      </Pressable>
      {isDevelop ? (
        <View style={styles.debug}>
          <Text selectable numberOfLines={6} style={styles.errorText}>
            {error.message}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void shareDebugReport()}
          >
            <Text style={styles.copyLabel}>
              {shared ? "Shared" : "Share debug report"}
            </Text>
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
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  errorText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  copyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});
