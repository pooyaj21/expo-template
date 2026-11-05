import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type ToolbarProps = {
  start?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Toolbar = ({ start, center, end, style }: ToolbarProps) => (
  <View style={[styles.row, style]}>
    <View style={styles.side}>{start}</View>
    <View style={styles.center}>{center}</View>
    <View style={[styles.side, styles.end]}>{end}</View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
  },
  side: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 48,
  },
  end: {
    justifyContent: "flex-end",
    marginStart: "auto",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Toolbar;
