import { ReactNode, RefObject, useMemo, useRef } from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import { BlurTargetView, BlurTint, BlurView } from "expo-blur";
import { isAndroid, isIOS } from "@/common/data-access/platform";
import {
  AppTheme,
  useAppTheme,
} from "@/common/presentation/providers/ThemeProvider";
import { withAlpha } from "@/common/presentation/theme/AppColor";

export enum BlurSurfaceEnums {
  CHROME = "CHROME",
  OVERLAY = "OVERLAY",
  VEIL = "VEIL",
}

export const BLUR_SCRIM_ALPHA = isIOS ? 0.6 : 0.75;

export type BlurSurfacePreset = {
  iosIntensity: number;
  androidIntensity: number;
  blurReductionFactor: number;
  scrimColor: string;
  tint: BlurTint;
  allowAndroidBlur: boolean;
};

const getBlurPresets = ({
  colors,
}: AppTheme): Record<BlurSurfaceEnums, BlurSurfacePreset> => ({
  [BlurSurfaceEnums.CHROME]: {
    iosIntensity: 60,
    androidIntensity: 75,
    blurReductionFactor: 4,
    scrimColor: withAlpha(colors.background.white, BLUR_SCRIM_ALPHA),
    tint: "light",
    allowAndroidBlur: true,
  },
  [BlurSurfaceEnums.OVERLAY]: {
    iosIntensity: 60,
    androidIntensity: 75,
    blurReductionFactor: 4,
    scrimColor: "transparent",
    tint: isIOS ? "light" : "systemChromeMaterialLight",
    allowAndroidBlur: true,
  },
  [BlurSurfaceEnums.VEIL]: {
    iosIntensity: 10,
    androidIntensity: 20,
    blurReductionFactor: 5,
    scrimColor: "transparent",
    tint: "light",
    allowAndroidBlur: true,
  },
});

export const useBlurSurfacePreset = (surface: BlurSurfaceEnums) => {
  const theme = useAppTheme();
  return useMemo(() => getBlurPresets(theme)[surface], [theme, surface]);
};

export const canBlurOnAndroid = (
  preset: BlurSurfacePreset,
  hasBlurTarget: boolean,
) =>
  isAndroid &&
  Number(Platform.Version) >= 31 &&
  preset.allowAndroidBlur &&
  hasBlurTarget;

const TINT_SCRIM: Record<
  BlurTint,
  { rgb: [number, number, number]; opacity: number }
> = {
  light: { rgb: [249, 249, 249], opacity: 0.78 },
  extraLight: { rgb: [249, 249, 249], opacity: 0.78 },
  systemMaterialLight: { rgb: [249, 249, 249], opacity: 0.78 },
  systemUltraThinMaterialLight: { rgb: [249, 249, 249], opacity: 0.78 },
  systemThickMaterialLight: { rgb: [249, 249, 249], opacity: 0.78 },
  default: { rgb: [255, 255, 255], opacity: 0.44 },
  prominent: { rgb: [255, 255, 255], opacity: 0.44 },
  systemMaterial: { rgb: [255, 255, 255], opacity: 0.44 },
  dark: { rgb: [25, 25, 25], opacity: 0.69 },
  systemMaterialDark: { rgb: [25, 25, 25], opacity: 0.69 },
  regular: { rgb: [179, 179, 179], opacity: 0.82 },
  systemThinMaterial: { rgb: [199, 199, 199], opacity: 0.97 },
  systemThinMaterialLight: { rgb: [199, 199, 199], opacity: 0.78 },
  systemThinMaterialDark: { rgb: [37, 37, 37], opacity: 0.7 },
  systemThickMaterial: { rgb: [153, 153, 153], opacity: 0.97 },
  systemThickMaterialDark: { rgb: [37, 37, 37], opacity: 0.9 },
  systemUltraThinMaterial: { rgb: [191, 191, 191], opacity: 0.44 },
  systemUltraThinMaterialDark: { rgb: [37, 37, 37], opacity: 0.55 },
  systemChromeMaterial: { rgb: [255, 255, 255], opacity: 0.75 },
  systemChromeMaterialLight: { rgb: [255, 255, 255], opacity: 0.97 },
  systemChromeMaterialDark: { rgb: [0, 0, 0], opacity: 0.75 },
};

const getTintScrimColor = (tint: BlurTint, intensity: number) => {
  const { rgb, opacity } = TINT_SCRIM[tint];
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${(intensity / 100) * opacity})`;
};

type AppBlurViewProps = {
  surface: BlurSurfaceEnums;
  children?: ReactNode;
  overlay?: ReactNode;
  blurTarget?: RefObject<View | null>;
  intensity?: number;
  blurReductionFactor?: number;
  tint?: BlurTint;
  scrimColor?: string;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: ViewProps["pointerEvents"];
};

/** The only blur primitive — never import expo-blur `BlurView` in a screen. */
export const AppBlurView = ({
  surface,
  children,
  overlay,
  blurTarget,
  intensity,
  blurReductionFactor,
  tint,
  scrimColor,
  style,
  pointerEvents,
}: AppBlurViewProps) => {
  const preset = useBlurSurfacePreset(surface);
  const selfTarget = useRef<View>(null);

  const hasChildren = children != null && children !== false;
  const resolvedTarget = hasChildren ? selfTarget : blurTarget;

  const androidBlur = canBlurOnAndroid(preset, resolvedTarget != null);
  const usesNativeBlur = isIOS || androidBlur;

  const resolvedIntensity =
    intensity ?? (isIOS ? preset.iosIntensity : preset.androidIntensity);
  const resolvedScrim = scrimColor ?? preset.scrimColor;
  const resolvedTint = tint ?? preset.tint;

  const renderBlurLayer = (layerStyle: StyleProp<ViewStyle>) =>
    usesNativeBlur ? (
      <BlurView
        pointerEvents={pointerEvents}
        tint={resolvedTint}
        intensity={resolvedIntensity}
        blurReductionFactor={blurReductionFactor ?? preset.blurReductionFactor}
        blurTarget={androidBlur ? resolvedTarget : undefined}
        blurMethod={androidBlur ? "dimezisBlurViewSdk31Plus" : undefined}
        style={layerStyle}
      >
        {overlay}
      </BlurView>
    ) : (
      <View pointerEvents={pointerEvents} style={layerStyle}>
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: getTintScrimColor(
                resolvedTint,
                resolvedIntensity,
              ),
            },
          ]}
        />
        {overlay}
      </View>
    );

  if (!hasChildren) {
    return renderBlurLayer([
      { overflow: "hidden", backgroundColor: resolvedScrim },
      style,
    ]);
  }

  return (
    <View style={[{ overflow: "hidden" }, style]}>
      <BlurTargetView ref={selfTarget} style={{ flexGrow: 1 }}>
        {children}
      </BlurTargetView>
      {renderBlurLayer([
        StyleSheet.absoluteFill,
        { backgroundColor: resolvedScrim },
      ])}
    </View>
  );
};
