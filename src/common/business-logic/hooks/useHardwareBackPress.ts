import { useCallback, useEffect, useRef } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect } from "expo-router";

/**
 * Intercept Android's back gesture while a screen is focused. Return `false` to
 * let the default pop happen, anything else to swallow it (an open sheet, an
 * unsaved-changes prompt).
 *
 * The handler is held in a ref so a fresh closure each render does not
 * re-subscribe on every frame.
 */
export const useHardwareBackPress = (onBackPress: () => boolean | void) => {
  const handlerRef = useRef(onBackPress);
  // The ref is written in an effect, not during render: React may render a
  // component more than once before committing, and a render-phase write is
  // not guaranteed to survive.
  useEffect(() => {
    handlerRef.current = onBackPress;
  });

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => handlerRef.current() !== false,
      );
      return () => subscription.remove();
    }, []),
  );
};
