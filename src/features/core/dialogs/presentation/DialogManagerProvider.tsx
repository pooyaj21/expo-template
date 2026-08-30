import { createContext, ReactNode, useContext, useMemo } from "react";
import { useLazyBottomSheet } from "@/features/core/dialogs/business-logic/useLazyBottomSheet";
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "@/features/core/dialogs/presentation/ConfirmDialog";

type DialogApi<O> = {
  present: (options?: O) => void;
  dismiss: () => void;
};

type DialogManagerContextType = {
  confirm: DialogApi<ConfirmDialogProps>;
};

const DialogManagerContext = createContext<DialogManagerContextType | null>(
  null,
);

export function useDialogManager() {
  const context = useContext(DialogManagerContext);
  if (context == null) {
    throw new Error(
      "useDialogManager must be used inside DialogManagerProvider",
    );
  }
  return context;
}

/**
 * App-wide dialogs, mounted once at the root and opened from anywhere:
 *
 *   const { confirm } = useDialogManager();
 *   confirm.present({ title, message, destructive: true, onConfirm: signOut });
 *
 * Each entry is a `useLazyBottomSheet`, so a dialog's body — and any query
 * inside it — only mounts when it is actually presented. Add a dialog by adding
 * one controller and one line to the value and the node list.
 *
 * This lives in `presentation` rather than `business-logic` because it holds
 * rendered nodes. A business-logic hook that needs to raise a dialog should go
 * through a channel, the way alerts do.
 */
export const DialogManagerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const confirm = useLazyBottomSheet<ConfirmDialogProps>(
    ({ ref, options, onClose, onDismiss }) => (
      <ConfirmDialog
        ref={ref}
        {...options}
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
