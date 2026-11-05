import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BackHandler,
  Keyboard,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop";
import type { BottomSheetFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter";
import { useAppSafeAreaInsets } from "@/common/business-logic/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { Toolbar } from "@/common/presentation/components/Toolbar";
import { AppPressable } from "@/common/presentation/components/AppPressable";
import { CloseCircleIcon } from "@/common/presentation/icons/CloseCircleIcon";
import { TestIdEnums } from "@/common/business-logic/utils/testIds";
import { BOTTOM_SHEET_HANDLE_HEIGHT } from "@/common/business-logic/constants/layout";

export { BOTTOM_SHEET_HANDLE_HEIGHT };

type SnapPoint = string | number;

export type AppBaseBottomSheetDialogProps = Omit<
  BottomSheetModalProps,
  "children" | "snapPoints"
> & {
  title?: string;
  snapPoints?: SnapPoint[];
  dynamicSizing?: boolean;
  scrollable?: boolean;
  showCloseButton?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onHeaderLayout?: (height: number) => void;
  enableOnBackClose?: boolean;
  onClose?: () => void;
  children?: ReactNode;
};

export const AppBaseBottomSheetDialog = forwardRef<
  BottomSheetModal,
  AppBaseBottomSheetDialogProps
>(function AppBaseBottomSheetDialog(props, ref) {
  const {
    title,
    snapPoints,
    dynamicSizing,
    scrollable = false,
    showCloseButton = true,
    header,
    footer,
    contentContainerStyle,
    onHeaderLayout,
    enableOnBackClose = true,
    onClose: _onClose,
    onChange,
    onDismiss,
    backgroundStyle,
    keyboardBehavior = "interactive",
    keyboardBlurBehavior = "restore",
    android_keyboardInputMode = "adjustPan",
    style,
    children,
    ...rest
  } = props;

  const { colors, typography } = useAppTheme();
  const insets = useAppSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(
    ref,
    () =>
      new Proxy({} as BottomSheetModal, {
        get(_target, prop, receiver) {
          const sheet = sheetRef.current;
          if (prop === "present") {
            return (...args: Parameters<BottomSheetModal["present"]>) => {
              Keyboard.dismiss();
              return sheet?.present(...args);
            };
          }
          if (sheet == null) return undefined;
          const value = Reflect.get(sheet, prop, receiver);
          return typeof value === "function" ? value.bind(sheet) : value;
        },
      }),
    [],
  );

  const usesDynamicSizing = dynamicSizing ?? snapPoints == null;
  const resolvedSnapPoints = useMemo<SnapPoint[] | undefined>(() => {
    if (usesDynamicSizing) return undefined;
    return snapPoints ?? ["50%", "80%"];
  }, [usesDynamicSizing, snapPoints]);

  useEffect(() => {
    if (!enableOnBackClose || !isOpen) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      sheetRef.current?.dismiss();
      return true;
    });
    return () => sub.remove();
  }, [enableOnBackClose, isOpen]);

  const handleChange = useCallback(
    (index: number, position: number, type: number) => {
      setIsOpen(index >= 0);
      onChange?.(index, position, type);
    },
    [onChange],
  );

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    onDismiss?.();
  }, [onDismiss]);

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        opacity={0.3}
        appearsOnIndex={0}
        disappearsOnIndex={-0.99}
        pressBehavior="close"
      />
    ),
    [],
  );

  const renderFooter = useMemo(() => {
    if (footer == null) return undefined;
    const Footer = (footerProps: BottomSheetFooterProps) => (
      <BottomSheetFooter {...footerProps}>
        <View style={styles.footer}>{footer}</View>
      </BottomSheetFooter>
    );
    Footer.displayName = "AppBaseBottomSheetDialogFooter";
    return Footer;
  }, [footer]);

  const resolvedBackgroundStyle = useMemo(
    () => [
      {
        backgroundColor: colors.background.white,
        elevation: 20,
        shadowColor: colors.divider,
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      backgroundStyle,
    ],
    [colors.background.white, colors.divider, backgroundStyle],
  );

  const showHeader = header !== undefined || !!title || showCloseButton;
  const handleHeaderLayout = useCallback(
    (e: LayoutChangeEvent) => onHeaderLayout?.(e.nativeEvent.layout.height),
    [onHeaderLayout],
  );

  const renderedHeader = useMemo(() => {
    if (!showHeader) return null;
    if (header !== undefined) {
      return onHeaderLayout == null ? (
        header
      ) : (
        <View onLayout={handleHeaderLayout}>{header}</View>
      );
    }
    return (
      <View
        onLayout={handleHeaderLayout}
        style={{ backgroundColor: colors.background.white }}
      >
        <Toolbar
          style={styles.toolbar}
          start={
            title ? (
              <Text
                style={{
                  ...typography.medium[18],
                  color: colors.text.primary,
                  flex: 1,
                }}
              >
                {title}
              </Text>
            ) : undefined
          }
          end={
            showCloseButton ? (
              <AppPressable
                enableAnimation
                testID={TestIdEnums.DIALOG_CLOSE}
                onPress={() => sheetRef.current?.dismiss()}
                style={styles.closeBtn}
              >
                <CloseCircleIcon size={24} color={colors.grey[200]} />
              </AppPressable>
            ) : undefined
          }
        />
        <View style={{ height: 1, backgroundColor: colors.divider }} />
      </View>
    );
  }, [
    showHeader,
    header,
    showCloseButton,
    title,
    colors,
    typography,
    onHeaderLayout,
    handleHeaderLayout,
  ]);

  return (
    <BottomSheetModal
      accessible={false}
      {...rest}
      ref={sheetRef}
      style={style}
      topInset={insets.top}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior={keyboardBlurBehavior}
      android_keyboardInputMode={android_keyboardInputMode}
      enableDynamicSizing={usesDynamicSizing}
      snapPoints={resolvedSnapPoints}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      backgroundStyle={resolvedBackgroundStyle}
      onChange={handleChange}
      onDismiss={handleDismiss}
    >
      {scrollable ? (
        <BottomSheetScrollView
          style={styles.content}
          bounces={false}
          overScrollMode="never"
          stickyHeaderIndices={renderedHeader != null ? [0] : undefined}
        >
          {renderedHeader}
          <View style={contentContainerStyle}>{children}</View>
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView style={styles.content}>
          {renderedHeader}
          <View style={contentContainerStyle}>{children}</View>
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
});

AppBaseBottomSheetDialog.displayName = "AppBaseBottomSheetDialog";

const styles = StyleSheet.create({
  content: { flexShrink: 1 },
  toolbar: { marginHorizontal: 12, marginVertical: 12 },
  closeBtn: {
    width: 48,
    height: 48,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { paddingHorizontal: 16, paddingVertical: 12 },
});
