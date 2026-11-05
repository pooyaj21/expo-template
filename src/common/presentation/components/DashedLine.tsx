import React from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Line } from "react-native-svg";

interface DashedLineProps {
  color: string;
  thickness?: number;
  dashLength?: number;
  dashGap?: number;
  style?: ViewStyle;
}

export const DashedLine = ({
  color,
  thickness = 1,
  dashLength = 6,
  dashGap = 6,
  style,
}: DashedLineProps) => (
  <View style={style}>
    <Svg height={thickness} width="100%">
      <Line
        x1="0"
        y1={thickness / 2}
        x2="100%"
        y2={thickness / 2}
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={`${dashLength},${dashGap}`}
      />
    </Svg>
  </View>
);

export default DashedLine;
