import { StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { withAlpha } from "@/common/business-logic/utils/color";

type LoadingProps = {
  background?: string;
};

export const Loading = (props: LoadingProps) => {
  const { colors } = useAppTheme();
  const background =
    props.background ?? withAlpha(colors.background.white, 0.4);

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <LottieView
        source={require("@assets/animation/loader.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 120,
    height: 120,
  },
});

export default Loading;
