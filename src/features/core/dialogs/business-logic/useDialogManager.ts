import { createContext, useContext } from "react";
import type { ConfirmDialogOptions } from "@/features/core/dialogs/business-logic/dialogTypes";

export type DialogApi<O> = {
  present: (options?: O) => void;
  dismiss: () => void;
};

export type DialogManagerContextType = {
  confirm: DialogApi<ConfirmDialogOptions>;
};

export const DialogManagerContext =
  createContext<DialogManagerContextType | null>(null);

export const useDialogManager = () => {
  const ctx = useContext(DialogManagerContext);
  if (ctx == null) {
    throw new Error("Can't use useDialogManager outside DialogManagerProvider");
  }
  return ctx;
};

export const useDialogManagerOptional = () => useContext(DialogManagerContext);
