import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { AppBlurTarget } from "@/common/presentation/components/AppBlurTarget";
import { BlurTargetProvider } from "@/common/presentation/providers/BlurTargetProvider";

const TabsLayout = () => {
  const { getString } = useLocalization();
  const { colors } = useAppTheme();

  return (
    <BlurTargetProvider>
      <Tabs
        screenLayout={({ route, children }) => (
          <AppBlurTarget targetKey={route.key} style={{ flex: 1 }}>
            {children}
          </AppBlurTarget>
        )}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary.main,
          tabBarInactiveTintColor: colors.text.secondary,
          tabBarStyle: {
            backgroundColor: colors.background.level1,
            borderTopColor: colors.border.default,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: getString("tabs.posts"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: getString("tabs.settings"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </BlurTargetProvider>
  );
};

export default TabsLayout;
