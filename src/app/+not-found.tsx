import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  IllustratedError,
  IllustratedErrorTypeEnums,
} from "@/common/presentation/components/IllustratedError";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { routes } from "@/common/business-logic/routes/paths";

const NotFoundScreen = () => {
  const { getString } = useLocalization();

  return (
    <View style={styles.root}>
      <IllustratedError
        type={IllustratedErrorTypeEnums.NOT_FOUND}
        subtitle={getString("common.notFound.message")}
        button={{
          title: getString("common.notFound.home"),
          onPress: () => router.replace(routes.home()),
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default NotFoundScreen;
