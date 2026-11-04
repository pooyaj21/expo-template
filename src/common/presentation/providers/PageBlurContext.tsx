import {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import { BlurTargetView } from "expo-blur";

type PageBlurContextType = {
  blurTarget: RefObject<View | null>;
  setToolbar: (id: string, toolbar: ReactNode) => void;
};

const PageBlurContext = createContext<PageBlurContextType | null>(null);

const EMPTY_TOOLBARS: ReadonlyMap<string, ReactNode> = new Map();

export const PageBlurProvider = ({ children }: { children: ReactNode }) => {
  const blurTarget = useRef<View>(null);
  const [toolbars, setToolbars] = useState(EMPTY_TOOLBARS);

  const setToolbar = useCallback((id: string, toolbar: ReactNode) => {
    setToolbars((current) => {
      if (toolbar == null) {
        if (!current.has(id)) return current;
        const next = new Map(current);
        next.delete(id);
        return next;
      }
      if (current.get(id) === toolbar) return current;
      const next = new Map(current);
      next.set(id, toolbar);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ blurTarget, setToolbar }), [setToolbar]);

  const toolbar = useMemo(() => {
    const published = Array.from(toolbars.values());
    return published.length > 0 ? published[published.length - 1] : null;
  }, [toolbars]);

  return (
    <>
      <PageBlurContext.Provider value={value}>
        <BlurTargetView ref={blurTarget} style={{ flex: 1 }}>
          {children}
        </BlurTargetView>
      </PageBlurContext.Provider>
      {toolbar}
    </>
  );
};

export const usePageBlurContext = () => useContext(PageBlurContext);
