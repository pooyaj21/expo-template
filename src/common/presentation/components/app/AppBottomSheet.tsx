import { forwardRef, ReactNode, useCallback, useEffect, useMemo } from "react";
import {
  BackHandler,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { radius, spacing } from "@/common/presentation/theme/AppSpacing";
import { AppText } from "@/common/presentation/components/app/AppText";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";

export type AppBottomSheetProps = Omit<
  BottomSheetModalProps,
  "children" | "snapPoints"
> & {
  title?: string;
  snapPoints?: (string | number)[];
  /** Grow and shrink with the content. Default when no `snapPoints` are given. */
  dynamicSizing?: boolean;
  /** Scrollable body, for content that can exceed the sheet height. */
  scrollable?: boolean;
  showCloseButton?: boolean;
  /** Replaces the default header entirely. */
  header?: ReactNode;
  /** Sticky footer, kept above the safe area. */
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onClose?: () => void;
  children?: ReactNode;
};

/**
 * The one bottom-sheet shell. Every dialog composes this rather than reaching
 * for `BottomSheetModal` directly, so the handle, backdrop, header and safe-area
 * behaviour stay identical across the app.
 */
export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  function AppBottomSheet(
    {
      title,
      snapPoints,
      dynamicSizing,
      scrollable = false,
      showCloseButton = true,
      header,
      footer,
      contentContainerStyle,
      onClose,
      children,
      ...rest
    },
    ref,
  ) {
    const { colors } = useAppTheme();
    const insets = useSafeAreaInsets();

    const enableDynamicSizing =
      dynamicSizing ?? (snapPoints == null && !scrollable);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      [],
    );

    // Android's hardware back should close the sheet, not pop the screen behind it.
    useEffect(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          onClose?.();
          return true;
        },
      );
      return () => subscription.remove();
    }, [onClose]);

    const Body = scrollable ? BottomSheetScrollView : BottomSheetView;

    const body = useMemo(
      () => (
        <>
          {header ?? (
            <View style={styles.header}>
              <AppText size={16} weight="semiBold" style={{ flex: 1 }}>
                {title}
              </AppText>
              {showCloseButton && (
                <AppPressable enableAnimation onPress={onClose} hitSlop={12}>
                  <Ionicons
                    name="close-circle"
                    size={26}
                    color={colors.text.placeholder}
                  />
                </AppPressable>
              )}
            </View>
          )}

          <View
            style={[
              { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
              contentContainerStyle,
            ]}
          >
            {children}
          </View>

          {footer}
          <View style={{ height: insets.bottom }} />
        </>
      ),
      [
        header,
        title,
        showCloseButton,
        onClose,
        colors.text.placeholder,
        contentContainerStyle,
        children,
        footer,
        insets.bottom,
      ],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: colors.background.white,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
        }}
        handleIndicatorStyle={{ backgroundColor: colors.border.default }}
        {...rest}
      >
        <Body>{body}</Body>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
});
