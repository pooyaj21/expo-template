import { forwardRef } from "react";
import { View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { AppBottomSheet } from "@/common/presentation/components/app/AppBottomSheet";
import { AppText } from "@/common/presentation/components/app/AppText";
import { AppButton } from "@/common/presentation/components/app/AppButton";
import { spacing } from "@/common/presentation/theme/AppSpacing";
import { useLocalization } from "@/common/business-logic/localization/localizationContext";

export type ConfirmDialogProps = {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
  onDismiss?: () => void;
};

/**
 * The generic "are you sure". Every destructive confirmation goes through it
 * instead of a hand-rolled `Alert.alert`, which cannot be themed or localized
 * consistently and looks different on each platform.
 */
export const ConfirmDialog = forwardRef<BottomSheetModal, ConfirmDialogProps>(
  function ConfirmDialog(
    {
      title,
      message,
      confirmLabel,
      cancelLabel,
      destructive,
      onConfirm,
      onClose,
      onDismiss,
    },
    ref,
  ) {
    const { getString } = useLocalization();

    return (
      <AppBottomSheet
        ref={ref}
        title={title}
        onClose={onClose}
        onDismiss={onDismiss}
      >
        <View style={{ gap: spacing.lg }}>
          {message != null && (
            <AppText size={14} color="secondary">
              {message}
            </AppText>
          )}

          <View style={{ flexDirection: "row", gap: spacing.xs }}>
            <AppButton
              title={cancelLabel ?? getString("shared_cancel")}
              buttonType="outlined"
              onPress={() => onClose?.()}
              style={{ flex: 1 }}
            />
            <AppButton
              title={confirmLabel ?? getString("shared_confirm")}
              buttonStyle={destructive ? "secondary" : "primary"}
              onPress={() => {
                onConfirm?.();
                onClose?.();
              }}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </AppBottomSheet>
    );
  },
);
