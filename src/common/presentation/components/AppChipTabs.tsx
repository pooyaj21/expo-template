import React from "react";
import { Text } from "react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { AppPressable } from "@/common/presentation/components/AppPressable";
import { HorizontalScrollView } from "@/common/presentation/components/HorizontalScrollView";

export interface AppChipTabInterface<T extends string> {
  key: T;
  label: string;
}

interface AppChipTabsProps<T extends string> {
  tabs: AppChipTabInterface<T>[];
  selected: T | undefined;
  onSelect: (key: T) => void;
  sidePadding?: number;
  testIDForTab?: (key: T) => string;
}

export const AppChipTabs = <T extends string>({
  tabs,
  selected,
  onSelect,
  sidePadding = 20,
  testIDForTab,
}: AppChipTabsProps<T>) => {
  const { colors, typography } = useAppTheme();

  return (
    <HorizontalScrollView
      style={{ flexGrow: 0 }}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: sidePadding,
        paddingVertical: 12,
        gap: 24,
        alignItems: "center",
      }}
    >
      {tabs.map((tab) => {
        const isSelected = tab.key === selected;
        return (
          <AppPressable
            key={tab.key}
            enableAnimation
            testID={testIDForTab?.(tab.key)}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            onPress={() => onSelect(tab.key)}
            style={{
              minWidth: 94,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isSelected ? colors.primary.main : colors.divider,
              backgroundColor: isSelected
                ? colors.primary[50]
                : colors.background.white,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text
              style={[
                typography.regular[14],
                {
                  textAlign: "center",
                  color: isSelected
                    ? colors.primary.main
                    : colors.text.secondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </AppPressable>
        );
      })}
    </HorizontalScrollView>
  );
};

export default AppChipTabs;
