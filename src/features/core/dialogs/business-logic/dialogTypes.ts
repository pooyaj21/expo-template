export type ConfirmDialogOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
};

export type DateDialogOptions = {
  title: string;
  selectedDate?: string;
  maxDate?: Date;
  minDate?: Date;
  yearsBack?: number;
  applyTitle?: string;
  cancelTitle?: string;
  onApply?: (date: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
};
