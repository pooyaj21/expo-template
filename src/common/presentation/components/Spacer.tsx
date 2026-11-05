import { View } from "react-native";

type SpacerProps = {
  width?: number;
  height?: number;
};

export const Spacer = (props: SpacerProps) => (
  <View style={{ width: props.width, height: props.height }} />
);
