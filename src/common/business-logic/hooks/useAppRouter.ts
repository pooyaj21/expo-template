import { useCallback } from "react";
import { Linking } from "react-native";
import { useRouter } from "expo-router";
import { ActionEnums, ActionInterface } from "@/common/data-access/type";

/**
 * The navigation surface screens use. Wrapping expo-router gives one place to
 * add analytics, guards, or deep-link translation later, and one place that
 * knows how to follow a backend-driven `ActionInterface`.
 */
export const useAppRouter = () => {
  const router = useRouter();

  const openExternal = useCallback(async (url: string) => {
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  }, []);

  const handleAction = useCallback(
    (action?: ActionInterface) => {
      if (!action?.target) return;
      if (action.type === ActionEnums.EXTERNAL) {
        void openExternal(action.target);
        return;
      }
      router.push(action.target as never);
    },
    [router, openExternal],
  );

  return {
    push: (path: string) => router.push(path as never),
    replace: (path: string) => router.replace(path as never),
    back: () => router.back(),
    canGoBack: () => router.canGoBack(),
    dismissTo: (path: string) => router.dismissTo(path as never),
    openExternal,
    handleAction,
  };
};
