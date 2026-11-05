import { forwardRef, ReactNode } from "react";
import { View, ViewProps } from "react-native";

type AppBlurTargetProps = ViewProps & {
  children?: ReactNode;
};

export const AppBlurTarget = forwardRef<View, AppBlurTargetProps>(
  function AppBlurTarget({ children, ...rest }, ref) {
    return (
      <View ref={ref} collapsable={false} {...rest}>
        {children}
      </View>
    );
  },
);
