import { Pressable, StyleSheet, Text, View } from "react-native";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AppSplashProps = {
  onAnimationFinish: () => void;
  hasError?: boolean;
  isRetrying?: boolean;
  onRetry?: () => void;
};

/**
 * Hard-coded copy only — localization may still be loading or failed when
 * this error block appears.
 */
const FALLBACK = {
  message:
    "We couldn't finish starting the app. Please check your connection and try again.",
  retry: "Try Again",
  retrying: "Retrying…",
};

/**
 * Neutral Lottie splash. Avoids theme/localization providers so it still
 * renders when those slices are mid-boot or failed.
 */
export const AppSplash = ({
  onAnimationFinish,
  hasError,
  isRetrying,
  onRetry,
}: AppSplashProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LottieView
        autoPlay
        loop={false}
        style={styles.lottie}
        source={require("@assets/animation/loader.json")}
        onAnimationFinish={onAnimationFinish}
      />
      {hasError ? (
        <View
          style={[styles.errorBlock, { paddingBottom: insets.bottom + 32 }]}
        >
          <Text style={styles.message}>{FALLBACK.message}</Text>
          {onRetry ? (
            <Pressable
              accessibilityRole="button"
              disabled={isRetrying}
              onPress={onRetry}
              style={[styles.retry, isRetrying && styles.retryDisabled]}
            >
              <Text style={styles.retryLabel}>
                {isRetrying ? FALLBACK.retrying : FALLBACK.retry}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#111827",
  },
  lottie: {
    flex: 1,
    backgroundColor: "#111827",
  },
  errorBlock: {
    position: "absolute",
    start: 0,
    end: 0,
    bottom: 0,
    paddingHorizontal: 24,
    gap: 16,
  },
  message: {
    color: "#F9FAFB",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  retry: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F9FAFB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryDisabled: {
    opacity: 0.6,
  },
  retryLabel: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "600",
  },
});
