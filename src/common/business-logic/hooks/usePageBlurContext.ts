import {
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
} from "react";
import type { View } from "react-native";

export type PageBlurContextType = {
  blurTarget: RefObject<View | null>;
  setToolbar: (id: string, toolbar: ReactNode) => void;
};

export const PageBlurContext = createContext<PageBlurContextType | null>(null);

export const usePageBlurContext = () => useContext(PageBlurContext);
