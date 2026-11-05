import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
} from "react-native";

type Props = KeyboardAvoidingViewProps;

export const AppKeyboardAvoidingView = ({ behavior, ...rest }: Props) => {
  const [behaviour, setBehaviour] = useState<"height" | undefined>("height");

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () => {
      setBehaviour("height");
    });
    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setBehaviour(undefined);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={behavior ?? (Platform.OS === "android" ? behaviour : "padding")}
      {...rest}
    />
  );
};
