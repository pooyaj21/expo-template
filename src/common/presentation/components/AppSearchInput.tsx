import React from "react";
import { ViewStyle } from "react-native";
import { TextInputProps } from "react-native/Libraries/Components/TextInput/TextInput";
import { AppTextInput } from "@/common/presentation/components/AppTextInput";
import { AppPressable } from "@/common/presentation/components/AppPressable";
import { SearchIcon } from "@/common/presentation/icons/SearchIcon";
import { CloseCircleIcon } from "@/common/presentation/icons/CloseCircleIcon";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";

type AppSearchInputProps = Omit<TextInputProps, "value" | "onChangeText"> & {
  style?: ViewStyle;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  compact?: boolean;
};

export const AppSearchInput = (props: AppSearchInputProps) => {
  const { value, onChangeText, onClear, returnKeyType, compact, ...rest } =
    props;
  const { colors } = useAppTheme();

  const handleClear = () => {
    if (onClear) onClear();
    else onChangeText("");
  };

  return (
    <AppTextInput
      {...rest}
      variant="plain"
      contentPadding={compact ? 10 : undefined}
      value={value}
      onChangeText={onChangeText}
      returnKeyType={returnKeyType ?? "search"}
      startIcon={<SearchIcon size={24} color={colors.grey[500]} />}
      endIcon={
        value.length > 0 ? (
          <AppPressable hitSlop={12} onPress={handleClear}>
            <CloseCircleIcon size={24} color={colors.grey[200]} />
          </AppPressable>
        ) : undefined
      }
    />
  );
};

export default AppSearchInput;
