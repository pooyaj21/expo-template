import { RefreshControl, RefreshControlProps } from "react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";

export type AppRefreshControlProps = Omit<RefreshControlProps, "colors">;

export const AppRefreshControl = (props: AppRefreshControlProps) => {
  const { colors } = useAppTheme();

  return (
    <RefreshControl
      tintColor={colors.primary.main}
      colors={[colors.primary.main]}
      progressBackgroundColor={colors.background.white}
      {...props}
    />
  );
};
