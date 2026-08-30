import { View } from "react-native";

type SpacerProps = {
  width?: number;
  height?: number;
};

/** Explicit gap where `gap` on the parent is not available or not wanted. */
export const Spacer = ({ width, height }: SpacerProps) => (
  <View style={{ width, height }} />
);
