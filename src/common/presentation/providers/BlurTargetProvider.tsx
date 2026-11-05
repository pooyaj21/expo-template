import { useRef, type ReactNode, type RefObject } from "react";
import type { View } from "react-native";
import {
  BlurTargetContext,
  type BlurTargetContextType,
} from "@/common/business-logic/hooks/useBlurTargetContext";

export const BlurTargetProvider = ({ children }: { children: ReactNode }) => {
  const targets = useRef(new Map<string, RefObject<View | null>>());
  const value = useRef<BlurTargetContextType>({
    getTarget: (key) => {
      const existing = targets.current.get(key);
      if (existing != null) return existing;

      const created: RefObject<View | null> = { current: null };
      targets.current.set(key, created);

      return created;
    },
  });

  return (
    <BlurTargetContext.Provider value={value.current}>
      {children}
    </BlurTargetContext.Provider>
  );
};
