import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { BlurTargetView } from "expo-blur";
import { useBlurTargetContext } from "@/common/business-logic/hooks/useBlurTargetContext";

type AppBlurTargetProps = {
  targetKey: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const AppBlurTarget = ({
  targetKey,
  children,
  style,
}: AppBlurTargetProps) => {
  const { getTarget } = useBlurTargetContext();

  return (
    <BlurTargetView ref={getTarget(targetKey)} style={style}>
      {children}
    </BlurTargetView>
  );
};
