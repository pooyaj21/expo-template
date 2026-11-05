import { ReactNode, useMemo } from "react";
import { useRouter } from "expo-router";
import DeviceInfo from "react-native-device-info";
import {
  DebugMenu,
  DebugMenuProvider,
  DebugPlugin,
  DebugThemeConfig,
} from "@pj21/debug-menu";
import { actionsPlugin } from "@pj21/debug-menu/actions";
import { environmentPlugin } from "@pj21/debug-menu/environment";
import { featureFlagsPlugin } from "@pj21/debug-menu/feature-flags";
import { infoPlugin } from "@pj21/debug-menu/info";
import {
  clearNetworkLogs,
  networkPlugin,
  startNetworkLogging,
} from "@pj21/debug-menu/network";
import { routes } from "@/common/business-logic/routes/paths";
import { useResetApp } from "@/common/business-logic/hooks/useResetApp";
import {
  FLAG_NAMES,
  FlagName,
} from "@/features/core/feature-flags/business-logic/flagCatalog";
import { useFeatureFlagManager } from "@/features/core/feature-flags/business-logic/useFeatureFlag";
import {
  flavor,
  isDevelop,
} from "@/features/core/environment/business-logic/appConfig";
import { EnvironmentIdEnums } from "@/features/core/environment/business-logic/environmentTypes";
import { useEnvironment } from "@/features/core/environment/business-logic/useEnvironment";
import {
  DebugCrashTrigger,
  requestDebugCrash,
} from "@/features/core/debug/presentation/DebugCrashTrigger";

const THEME: DebugThemeConfig = {
  mode: "light",
};

const API_LOG_PLUGIN = networkPlugin({ id: "api", title: "API network log" });

let networkLoggingStarted = false;

const ensureNetworkLogging = () => {
  if (networkLoggingStarted || !isDevelop) return;
  networkLoggingStarted = true;
  startNetworkLogging();
};

type DebugMenuHostProps = {
  isBooting?: boolean;
  children: ReactNode;
};

export const DebugMenuHost = ({
  isBooting = false,
  children,
}: DebugMenuHostProps) => {
  ensureNetworkLogging();

  const router = useRouter();
  const { resetApp } = useResetApp();
  const { environments, selectedEnvironment, selectEnvironment } =
    useEnvironment();
  const { devOverrides, setDevOverride, clearDevOverrides } =
    useFeatureFlagManager();

  const environment = useMemo(
    () =>
      environmentPlugin({
        id: "env",
        list: environments.map((item) => ({
          id: String(item.id),
          label: item.title,
        })),
        current: () => String(selectedEnvironment.id),
        onSelect: async (id) => {
          await selectEnvironment(Number(id) as EnvironmentIdEnums);
          clearNetworkLogs();
          await resetApp();
          DebugMenu.close();
        },
      }),
    [environments, selectedEnvironment, selectEnvironment, resetApp],
  );

  const plugins = useMemo<DebugPlugin[]>(() => {
    if (isBooting) return [API_LOG_PLUGIN, environment];

    return [
      API_LOG_PLUGIN,
      environment,
      infoPlugin({
        items: () => ({
          Version: DeviceInfo.getVersion(),
          Build: DeviceInfo.getBuildNumber(),
          Flavor: flavor,
        }),
      }),
      featureFlagsPlugin({
        flags: FLAG_NAMES.map((key) => ({ key })),
        get: (key) => devOverrides[key as FlagName],
        set: (key, value) => setDevOverride(key as FlagName, value),
        clear: clearDevOverrides,
      }),
      actionsPlugin({
        id: "crash",
        title: "Crash trigger",
        section: "Diagnostics",
        order: 90,
        sections: [
          {
            title: "Error pages",
            actions: [
              {
                label: "Go to Not Found page",
                onPress: () => {
                  DebugMenu.close();
                  router.push(routes.notFound());
                },
              },
              {
                label: "Trigger Internal Error page",
                destructive: true,
                onPress: () => {
                  DebugMenu.close();
                  requestDebugCrash();
                },
              },
            ],
          },
        ],
      }),
    ];
  }, [
    isBooting,
    environment,
    devOverrides,
    setDevOverride,
    clearDevOverrides,
    router,
  ]);

  return (
    <DebugMenuProvider
      enabled={isDevelop}
      plugins={plugins}
      theme={THEME}
      triggers={{ shake: true }}
    >
      {children}
      <DebugCrashTrigger />
    </DebugMenuProvider>
  );
};
