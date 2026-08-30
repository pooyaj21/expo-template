import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";

type IconViewProps = {
  children: ReactNode;
  /** Directional glyphs (arrows, chevrons) mirror in RTL; logos must not. */
  ignoreRtl?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const IconView = ({ children, ignoreRtl, style }: IconViewProps) => {
  const { isRtl } = useAppTheme();
  const shouldMirror = isRtl && !ignoreRtl;

  return (
    <View style={[shouldMirror && { transform: [{ scaleX: -1 }] }, style]}>
      {children}
    </View>
  );
};
