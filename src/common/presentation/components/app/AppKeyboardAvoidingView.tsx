import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
} from "react-native";

/**
 * Wraps any form screen. The two platforms need different behaviours — iOS
 * moves the whole view with `padding`, Android resizes with `height` — and
 * getting it wrong hides the field being typed into.
 */
export const AppKeyboardAvoidingView = ({
  behavior,
  style,
  ...rest
}: KeyboardAvoidingViewProps) => (
  <KeyboardAvoidingView
    behavior={behavior ?? (Platform.OS === "ios" ? "padding" : "height")}
    style={[{ flex: 1 }, style]}
    {...rest}
  />
);
