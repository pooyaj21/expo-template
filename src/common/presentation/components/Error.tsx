import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { AppButton } from "@/common/presentation/components/AppButton";

type ErrorProps = {
  title: string;
  onRetry?: () => void;
};

export const Error = ({ title, onRetry }: ErrorProps) => {
  const { colors, typography } = useAppTheme();
  const { getString } = useLocalization();

  return (
    <View style={styles.container}>
      <Text
        style={[
          typography.regular[14],
          { color: colors.text.primary, textAlign: "center" },
        ]}
      >
        {title}
      </Text>
      {onRetry ? (
        <AppButton
          title={getString("common.retry")}
          onPress={onRetry}
          buttonType="outlined"
          style={{ marginTop: 16, alignSelf: "center", minWidth: 140 }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});

export default Error;
