import { forwardRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { AppBaseBottomSheetDialog } from "@/features/core/dialogs/presentation/AppBaseBottomSheetDialog";
import { AppButton } from "@/common/presentation/components/AppButton";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { TestIdEnums } from "@/common/business-logic/utils/testIds";
import type { ConfirmDialogOptions } from "@/features/core/dialogs/business-logic/dialogTypes";

export type { ConfirmDialogOptions } from "@/features/core/dialogs/business-logic/dialogTypes";

type ConfirmBottomSheetDialogProps = ConfirmDialogOptions & {
  onClose: () => void;
  onDismiss: () => void;
};

export const ConfirmBottomSheetDialog = forwardRef<
  BottomSheetModal,
  ConfirmBottomSheetDialogProps
>(function ConfirmBottomSheetDialog(
  {
    title,
    message,
    confirmLabel,
    cancelLabel,
    destructive,
    onConfirm,
    onCancel,
    onClose,
    onDismiss,
  },
  ref,
) {
  const { colors, typography } = useAppTheme();
  const { getString } = useLocalization();

  return (
    <AppBaseBottomSheetDialog
      ref={ref}
      title={title}
      onDismiss={onDismiss}
      onClose={onClose}
      contentContainerStyle={styles.content}
      footer={
        <View style={styles.actions}>
          <AppButton
            testID={TestIdEnums.DIALOG_CANCEL}
            title={cancelLabel ?? getString("common.cancel")}
            buttonType="outlined"
            buttonStyle="secondary"
            onPress={() => {
              onCancel?.();
              onClose();
            }}
            style={{ flex: 1 }}
          />
          <AppButton
            testID={TestIdEnums.DIALOG_CONFIRM}
            title={confirmLabel ?? getString("common.confirm")}
            buttonBaseColor={destructive ? colors.error.main : undefined}
            onPress={() => {
              onConfirm?.();
              onClose();
            }}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <Text style={{ ...typography.regular[14], color: colors.text.secondary }}>
        {message}
      </Text>
    </AppBaseBottomSheetDialog>
  );
});

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 8 },
  actions: { flexDirection: "row", gap: 12 },
});
