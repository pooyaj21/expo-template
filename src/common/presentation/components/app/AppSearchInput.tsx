import { TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { AppTextInput } from "@/common/presentation/components/app/AppTextInput";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";

type AppSearchInputProps = Omit<
  TextInputProps,
  "value" | "onChangeText" | "style"
> & {
  value: string;
  onChangeText: (text: string) => void;
  /** Defaults to clearing the field. Override to also reset a query. */
  onClear?: () => void;
};

export const AppSearchInput = ({
  value,
  onChangeText,
  onClear,
  returnKeyType,
  ...rest
}: AppSearchInputProps) => {
  const { colors } = useAppTheme();

  return (
    <AppTextInput
      {...rest}
      value={value}
      onChangeText={onChangeText}
      returnKeyType={returnKeyType ?? "search"}
      autoCapitalize="none"
      autoCorrect={false}
      start={
        <Ionicons name="search" size={20} color={colors.text.placeholder} />
      }
      end={
        value.length > 0 ? (
          <AppPressable
            hitSlop={8}
            onPress={() => (onClear ? onClear() : onChangeText(""))}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.text.placeholder}
            />
          </AppPressable>
        ) : undefined
      }
    />
  );
};
