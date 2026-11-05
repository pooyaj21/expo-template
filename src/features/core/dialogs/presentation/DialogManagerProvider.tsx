import { ReactNode, useMemo } from "react";
import { useLazyBottomSheet } from "@/common/business-logic/hooks/useLazyBottomSheet";
import {
  DialogManagerContext,
  DialogManagerContextType,
} from "@/features/core/dialogs/business-logic/useDialogManager";
import { ConfirmBottomSheetDialog } from "@/features/core/dialogs/presentation/ConfirmBottomSheetDialog";
import type { ConfirmDialogOptions } from "@/features/core/dialogs/business-logic/dialogTypes";

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

  const value = useMemo<DialogManagerContextType>(
    () => ({
      confirm: { present: confirm.present, dismiss: confirm.dismiss },
    }),
    [confirm.present, confirm.dismiss],
  );

  return (
    <DialogManagerContext.Provider value={value}>
      {children}
      {confirm.node}
    </DialogManagerContext.Provider>
  );
};
