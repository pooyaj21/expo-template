import React from "react";
import { Path, Svg } from "react-native-svg";
import {
  IconView,
  type CustomIconProps,
} from "@/common/presentation/components/IconView";

export const ChevronRight: React.FC<CustomIconProps> = ({
  size = 24,
  color = "#382B70",
}) => {
  return (
    <IconView>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18"
          stroke={color}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </Svg>
    </IconView>
  );
};
