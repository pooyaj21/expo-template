import { useCallback } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useLatestRef } from "@/common/business-logic/hooks/useLatestRef";

export const useHardwareBackPress = (onBackPress: () => boolean | void) => {
  const handlerRef = useLatestRef(onBackPress);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => handlerRef.current() !== false,
      );

      return () => subscription.remove();
    }, [handlerRef]),
  );
};
