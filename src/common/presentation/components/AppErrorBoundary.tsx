import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LightColors } from "@/common/presentation/theme/AppColor";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { CTouchable } from "@/common/presentation/components/CTouchable";
import { AppConfig } from "@/common/data-access/config/AppConfig";

type State = { error: Error | null };

/**
 * Last line of defence. Deliberately renders without the theme or localization
 * contexts — if one of those is what crashed, a fallback that needs them
 * crashes too and the user sees a blank screen.
 */
export class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Report to a crash reporter here, if the project adds one.
    if (AppConfig.isDevelop) console.error("[boundary]", error);
  }

  retry = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong.</Text>
        {AppConfig.isDevelop && (
          <Text style={styles.detail}>{error.message}</Text>
        )}
        <CTouchable onPress={this.retry} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </CTouchable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: LightColors.background.white,
  },
  title: { fontSize: 18, fontWeight: "600", color: LightColors.text.primary },
  detail: {
    fontSize: 13,
    textAlign: "center",
    color: LightColors.text.secondary,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    backgroundColor: LightColors.primary.main,
  },
  buttonText: { color: LightColors.primary.contrast, fontWeight: "600" },
});
