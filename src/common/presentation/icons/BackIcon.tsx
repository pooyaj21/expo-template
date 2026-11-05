import React from "react";
import { Path, Svg } from "react-native-svg";
import {
  IconView,
  type CustomIconProps,
} from "@/common/presentation/components/IconView";

export const BackIcon = ({ size = 24, color = "black" }: CustomIconProps) => {
  return (
    <IconView>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M5 12H19"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10 7L5 12"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10 17L5 12"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </IconView>
  );
};

export default BackIcon;
