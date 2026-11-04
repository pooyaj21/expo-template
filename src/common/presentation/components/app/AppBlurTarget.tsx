import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { BlurTargetView } from "expo-blur";
import { useBlurTargetContext } from "@/common/presentation/providers/BlurTargetContext";

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
