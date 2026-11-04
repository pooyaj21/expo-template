import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useMemo,
  useRef,
} from "react";
import { View } from "react-native";

type BlurTargetContextType = {
  getTarget: (key: string) => RefObject<View | null>;
};

const BlurTargetContext = createContext<BlurTargetContextType | null>(null);

export const BlurTargetProvider = ({ children }: { children: ReactNode }) => {
  const targets = useRef(new Map<string, RefObject<View | null>>());
  const value = useMemo<BlurTargetContextType>(
    () => ({
      getTarget: (key) => {
        const existing = targets.current.get(key);
        if (existing != null) return existing;

        const created: RefObject<View | null> = { current: null };
        targets.current.set(key, created);

        return created;
      },
    }),
    [],
  );

  return (
    <BlurTargetContext.Provider value={value}>
      {children}
    </BlurTargetContext.Provider>
  );
};

export const useBlurTargetContext = () => {
  const context = useContext(BlurTargetContext);
  if (context == null) {
    throw new Error(
      "Can't use useBlurTargetContext outside BlurTargetProvider",
    );
  }
  return context;
};
