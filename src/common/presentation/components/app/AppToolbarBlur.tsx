import { ReactNode, useId, useLayoutEffect, useMemo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AppToolbar,
  APP_TOOLBAR_HEIGHT,
  AppToolbarProps,
} from "@/common/presentation/components/app/AppToolbar";
import {
  AppBlurView,
  BlurSurfaceEnums,
} from "@/common/presentation/components/app/AppBlurView";
import { usePageBlurContext } from "@/common/presentation/providers/PageBlurContext";

type AppToolbarBlurProps = AppToolbarProps & {
  children?: ReactNode;
};

export const AppToolbarBlur = (props: AppToolbarBlurProps) => {
  const { style, children, ...rest } = props;
  const { top } = useSafeAreaInsets();
  const page = usePageBlurContext();
  const id = useId();
  const setToolbar = page?.setToolbar;
  const blurTarget = page?.blurTarget;

  const toolbar = useMemo(
    () => (
      <AppBlurView
        surface={BlurSurfaceEnums.CHROME}
        blurTarget={blurTarget}
        style={[
          {
            position: "absolute",
            zIndex: 1000,
            top: 0,
            start: 0,
            end: 0,
          },
          style,
        ]}
        overlay={
          <>
            <View style={{ width: "100%", height: top }} />
            <AppToolbar style={{ backgroundColor: "transparent" }} {...rest} />
            {children != null && <View>{children}</View>}
          </>
        }
      />
    ),
    [blurTarget, children, rest, style, top],
  );

  useLayoutEffect(() => {
    setToolbar?.(id, toolbar);
  }, [id, setToolbar, toolbar]);

  useLayoutEffect(() => {
    return () => setToolbar?.(id, null);
  }, [id, setToolbar]);

  return setToolbar == null ? toolbar : null;
};

export const useAppToolbarBlurDimension = () => {
  const { top } = useSafeAreaInsets();
  return { top: top + APP_TOOLBAR_HEIGHT, toolbar: APP_TOOLBAR_HEIGHT };
};
