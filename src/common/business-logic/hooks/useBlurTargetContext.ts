import { createContext, useContext, type RefObject } from "react";
import type { View } from "react-native";

export type BlurTargetContextType = {
  getTarget: (key: string) => RefObject<View | null>;
};

export const BlurTargetContext = createContext<BlurTargetContextType | null>(
  null,
);

export const useBlurTargetContext = () => {
  const context = useContext(BlurTargetContext);
  if (context == null) {
    throw new Error(
      "Can't use useBlurTargetContext outside BlurTargetProvider",
    );
  }
  return context;
};
