import { ReactNode, Ref, useCallback, useEffect, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

export type LazyBottomSheetRenderProps<O> = {
  ref: Ref<BottomSheetModal>;
  options: O;
  onClose: () => void;
  onDismiss: () => void;
};

export type LazyBottomSheetController<O> = {
  present: (options?: O) => void;
  dismiss: () => void;
  node: ReactNode;
};

/**
 * Mounts a bottom-sheet dialog only once `present()` is called, and unmounts it
 * after the sheet finishes closing.
 *
 * That laziness is the whole point: a dialog body containing a `useQuery` would
 * otherwise fetch on every screen that merely *can* open it.
 *
 * The sheet instance is held in state behind a **callback ref**, not a
 * `useRef` — presenting has to wait for the modal to exist, and only a state
 * update re-runs the effect once it does.
 *
 * - `onClose` requests dismissal (runs the close animation) — wire it to the X.
 * - `onDismiss` fires after the sheet is fully closed; that is when we unmount.
 */
export function useLazyBottomSheet<O extends object>(
  render: (params: LazyBottomSheetRenderProps<O>) => ReactNode,
): LazyBottomSheetController<O> {
  const [sheet, setSheet] = useState<BottomSheetModal | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [options, setOptions] = useState<O>({} as O);

  const present = useCallback((next?: O) => {
    setOptions((next ?? {}) as O);
    setIsMounted(true);
  }, []);

  const dismiss = useCallback(() => sheet?.dismiss(), [sheet]);

  useEffect(() => {
    if (isMounted && sheet) sheet.present();
  }, [isMounted, sheet]);

  const handleDismiss = useCallback(() => {
    (options as { onClose?: () => void }).onClose?.();
    setIsMounted(false);
  }, [options]);

  const node = isMounted
    ? render({
        ref: setSheet,
        options,
        onClose: dismiss,
        onDismiss: handleDismiss,
      })
    : null;

  return { present, dismiss, node };
}
