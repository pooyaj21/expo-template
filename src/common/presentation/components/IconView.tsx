import { ReactNode } from "react";
import { I18nManager, StyleProp, View, ViewStyle } from "react-native";

export type CustomIconProps = {
  size?: number;
  color?: string;
};

type IconViewProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  ignoreRtl?: boolean;
};

export const IconView = ({ children, style, ignoreRtl }: IconViewProps) => (
  <View
    style={[
      ignoreRtl && I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : null,
      style,
    ]}
  >
    {children}
  </View>
);

export default IconView;
