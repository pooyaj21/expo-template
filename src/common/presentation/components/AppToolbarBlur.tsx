import { useId, useLayoutEffect, useMemo, type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import {
  AppBlurView,
  BlurSurfaceEnums,
} from "@/common/presentation/components/AppBlurView";
import {
  AppToolbar,
  type AppToolbarProps,
} from "@/common/presentation/components/AppToolbar";
import { APP_TOOLBAR_HEIGHT } from "@/common/business-logic/constants/layout";
import { useAppSafeAreaInsets } from "@/common/business-logic/hooks/useAppSafeAreaInsets";
import { usePageBlurContext } from "@/common/business-logic/hooks/usePageBlurContext";

type AppToolbarBlurProps = AppToolbarProps & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const AppToolbarBlur = (props: AppToolbarBlurProps) => {
  const { style, children, title, backIcon, onBackPress, start, end, center } =
    props;
  const { top } = useAppSafeAreaInsets();
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
            <AppToolbar
              style={{
                backgroundColor: "transparent",
              }}
              title={title}
              backIcon={backIcon}
              onBackPress={onBackPress}
              start={start}
              end={end}
              center={center}
            />
            {children ? <View>{children}</View> : null}
          </>
        }
      />
    ),
    [
      backIcon,
      blurTarget,
      center,
      children,
      end,
      onBackPress,
      start,
      style,
      title,
      top,
    ],
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
  const { top } = useAppSafeAreaInsets();
  return { top: top + APP_TOOLBAR_HEIGHT, toolbar: APP_TOOLBAR_HEIGHT };
};
