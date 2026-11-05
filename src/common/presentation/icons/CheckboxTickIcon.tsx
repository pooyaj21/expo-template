import React from "react";
import { Path, Svg } from "react-native-svg";
import {
  IconView,
  type CustomIconProps,
} from "@/common/presentation/components/IconView";

export const CheckboxTickIcon = ({
  size = 18,
  color = "#382B70",
}: CustomIconProps) => {
  return (
    <IconView ignoreRtl>
      <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <Path
          d="M16 0H2C0.89 0 0 0.9 0 2V16C0 17.1 0.89 18 2 18H16C17.11 18 18 17.1 18 16V2C18 0.9 17.11 0 16 0ZM7 14L2 9L3.41 7.59L7 11.17L14.59 3.58L16 5L7 14Z"
          fill={color}
        />
      </Svg>
    </IconView>
  );
};

export default CheckboxTickIcon;
