import {
  ReactNode,
  Ref,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLatestRef } from "@/common/business-logic/hooks/useLatestRef";

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
 * Lazily mounts a bottom-sheet dialog so any hooks inside its body
 * (e.g. `useQuery`) only run after `present()` is called, and unmounts
 * it after the sheet finishes dismissing.
 *
 * - `onClose` (passed to the dialog) requests a dismissal — it triggers
 *   the close animation. Wire it to user-tap "close" actions inside the
 *   dialog body.
 * - `onDismiss` (passed to the dialog) fires after the sheet has fully
 *   closed — at that point we unmount and run `options.onClose`.
 */
export function useLazyBottomSheet<O extends object>(
  render: (params: LazyBottomSheetRenderProps<O>) => ReactNode,
): LazyBottomSheetController<O> {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [options, setOptions] = useState<O>({} as O);
  const pendingPresentRef = useRef(false);

  const present = useCallback((next?: O) => {
    setOptions((next ?? {}) as O);
    pendingPresentRef.current = true;
    setIsMounted(true);
  }, []);

  const dismiss = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  // Layout effect, not a passive one: the sheet is mounted in this commit, so
  // presenting here starts the open animation before the frame is painted
  // instead of a frame later. No dependency list on purpose — `present()` on an
  // already-mounted sheet (re-opening one whose dismiss never settled) does not
  // flip `isMounted`, and the pending flag keeps it to a single call.
  useLayoutEffect(() => {
    if (!isMounted || !pendingPresentRef.current) return;
    pendingPresentRef.current = false;
    sheetRef.current?.present();
  });

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const optionsRef = useLatestRef(options);

  const handleDismiss = useCallback(() => {
    (optionsRef.current as { onClose?: () => void }).onClose?.();
    setIsMounted(false);
  }, [optionsRef]);

  const node = isMounted
    ? render({
        ref: sheetRef,
        options,
        onClose: handleClose,
        onDismiss: handleDismiss,
      })
    : null;

  return { present, dismiss, node };
}
