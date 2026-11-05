import { ReactNode, useMemo } from "react";
import { useLazyBottomSheet } from "@/common/business-logic/hooks/useLazyBottomSheet";
import {
  DialogManagerContext,
  DialogManagerContextType,
} from "@/features/core/dialogs/business-logic/useDialogManager";
import { ConfirmBottomSheetDialog } from "@/features/core/dialogs/presentation/ConfirmBottomSheetDialog";
import { AppDateBottomSheetDialog } from "@/features/core/dialogs/presentation/AppDateBottomSheetDialog";
import type {
  ConfirmDialogOptions,
  DateDialogOptions,
} from "@/features/core/dialogs/business-logic/dialogTypes";

export const DialogManagerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const confirm = useLazyBottomSheet<ConfirmDialogOptions>(
    ({ ref, options, onClose, onDismiss }) => (
      <ConfirmBottomSheetDialog
        ref={ref}
        {...options}
        message={options.message ?? ""}
        onClose={onClose}
        onDismiss={onDismiss}
      />
    ),
  );

  const date = useLazyBottomSheet<DateDialogOptions>(
    ({ ref, options, onClose, onDismiss }) => (
      <AppDateBottomSheetDialog
        ref={ref}
        title={options.title ?? ""}
        selectedDate={options.selectedDate}
        maxDate={options.maxDate}
        minDate={options.minDate}
        yearsBack={options.yearsBack}
        applyTitle={options.applyTitle}
        cancelTitle={options.cancelTitle}
        onApply={(value) => {
          options.onApply?.(value);
          onClose();
        }}
        onCancel={
          options.onCancel != null || options.cancelTitle != null
            ? () => {
                options.onCancel?.();
                onClose();
              }
            : undefined
        }
        onClose={onClose}
        onDismiss={onDismiss}
      />
    ),
  );

  const value = useMemo<DialogManagerContextType>(
    () => ({
      confirm: { present: confirm.present, dismiss: confirm.dismiss },
      date: { present: date.present, dismiss: date.dismiss },
    }),
    [confirm.present, confirm.dismiss, date.present, date.dismiss],
  );

  return (
    <DialogManagerContext.Provider value={value}>
      {children}
      {confirm.node}
      {date.node}
    </DialogManagerContext.Provider>
  );
};
