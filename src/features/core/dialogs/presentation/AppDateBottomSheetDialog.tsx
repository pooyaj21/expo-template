import { forwardRef, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useAppSafeAreaInsets } from "@/common/business-logic/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import {
  dateFormatter,
  fromIsoDate,
  toIsoDate,
} from "@/common/business-logic/utils/dateUtils";
import { AppButton } from "@/common/presentation/components/AppButton";
import { AppPressable } from "@/common/presentation/components/AppPressable";
import { ChevronRight } from "@/common/presentation/icons/ChevronRight";
import { AppBaseBottomSheetDialog } from "@/features/core/dialogs/presentation/AppBaseBottomSheetDialog";

const DEFAULT_YEARS_BACK = 100;
const MONTH_YEAR_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  year: "numeric",
};
const WEEKDAY_OPTIONS: Intl.DateTimeFormatOptions = { weekday: "narrow" };
const FUTURE_YEARS_WITHOUT_MAX = 10;
const DAY_CELL_SIZE = 36;

export type AppDateBottomSheetDialogProps = {
  title: string;
  /** ISO YYYY-MM-DD, matching what onApply returns. */
  selectedDate?: string;
  /** Latest selectable day. Omit to allow future dates. */
  maxDate?: Date;
  /** Earliest selectable day. Omit to allow any past date. */
  minDate?: Date;
  /** Years offered when `minDate` does not bound the range. */
  yearsBack?: number;
  applyTitle?: string;
  /** Renders a Cancel button beside Apply. Omit for apply-only. */
  cancelTitle?: string;
  onCancel?: () => void;
  onApply?: (date: string) => void;
  onDismiss?: () => void;
  onClose?: () => void;
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const AppDateBottomSheetDialog = forwardRef<
  BottomSheetModal,
  AppDateBottomSheetDialogProps
>(function AppDateBottomSheetDialog(props, ref) {
  const {
    title,
    selectedDate,
    maxDate,
    minDate,
    yearsBack = DEFAULT_YEARS_BACK,
    applyTitle,
    cancelTitle,
    onCancel,
    onApply,
    onDismiss,
    onClose,
  } = props;

  const { colors, typography } = useAppTheme();
  const { getString, language, getDirection } = useLocalization();
  const { bottom } = useAppSafeAreaInsets();

  const today = useMemo(() => startOfDay(new Date()), []);
  const limit = maxDate ? startOfDay(maxDate) : undefined;
  const floor = minDate ? startOfDay(minDate) : undefined;
  const initial = fromIsoDate(selectedDate) ?? floor ?? limit ?? today;

  const [selected, setSelected] = useState<Date>(initial);
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  const locale = language;
  const isRtl = getDirection() === "rtl";

  const monthLabel = useMemo(
    () => dateFormatter(locale, MONTH_YEAR_OPTIONS).format(visibleMonth),
    [locale, visibleMonth],
  );

  // Week starts on Sunday, matching S-M-T-W-T-F-S header.
  const weekdayLabels = useMemo(() => {
    const formatter = dateFormatter(locale, WEEKDAY_OPTIONS);
    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(new Date(2024, 0, 7 + index)),
    );
  }, [locale]);

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const leading = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: leading }, () => undefined),
      ...Array.from({ length: total }, (_, index) => index + 1),
    ];
  }, [visibleMonth]);

  const years = useMemo(() => {
    const latest = limit
      ? limit.getFullYear()
      : today.getFullYear() + FUTURE_YEARS_WITHOUT_MAX;
    const earliest = floor ? floor.getFullYear() : latest - yearsBack + 1;
    const count = Math.max(1, latest - earliest + 1);
    return Array.from({ length: count }, (_, index) => latest - index);
  }, [limit, floor, today, yearsBack]);

  const shiftMonth = (offset: number) =>
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );

  const isSameDay = (day: number) =>
    selected.getFullYear() === visibleMonth.getFullYear() &&
    selected.getMonth() === visibleMonth.getMonth() &&
    selected.getDate() === day;

  const isDisabledDay = (day: number) => {
    const date = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day,
    );
    return (limit != null && date > limit) || (floor != null && date < floor);
  };

  const renderDay = (day: number | undefined, index: number) => {
    if (day === undefined) {
      return <View key={`empty-${index}`} style={{ width: `${100 / 7}%` }} />;
    }

    const isSelected = isSameDay(day);
    const isDisabled = isDisabledDay(day);

    return (
      <View
        key={day}
        style={{
          width: `${100 / 7}%`,
          alignItems: "center",
          paddingVertical: 4,
        }}
      >
        <AppPressable
          enableAnimation
          accessibilityRole="button"
          accessibilityLabel={`${day}`}
          onPress={
            isDisabled
              ? undefined
              : () =>
                  setSelected(
                    new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth(),
                      day,
                    ),
                  )
          }
          style={{
            width: DAY_CELL_SIZE,
            height: DAY_CELL_SIZE,
            borderRadius: DAY_CELL_SIZE / 2,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isSelected ? colors.primary.main : "transparent",
          }}
        >
          <Text
            style={{
              ...typography.medium[14],
              color: isSelected
                ? colors.primary.contrast
                : isDisabled
                  ? colors.text.disabled
                  : colors.text.primary,
            }}
          >
            {day}
          </Text>
        </AppPressable>
      </View>
    );
  };

  return (
    <AppBaseBottomSheetDialog
      ref={ref}
      title={title}
      onDismiss={onDismiss}
      onClose={onClose}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: bottom + 24,
        gap: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <AppPressable
          accessibilityRole="button"
          accessibilityLabel={monthLabel}
          onPress={() => setIsYearPickerOpen((open) => !open)}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <Text
            style={{ ...typography.medium[16], color: colors.text.primary }}
          >
            {monthLabel}
          </Text>
          <View style={{ transform: [{ rotate: "90deg" }] }}>
            <ChevronRight size={16} color={colors.text.secondary} />
          </View>
        </AppPressable>
        {!isYearPickerOpen && (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <AppPressable
              enableAnimation
              accessibilityRole="button"
              accessibilityLabel={monthLabel}
              onPress={() => shiftMonth(-1)}
              style={{
                padding: 8,
                transform: [{ scaleX: isRtl ? 1 : -1 }],
              }}
            >
              <ChevronRight size={20} color={colors.text.primary} />
            </AppPressable>
            <AppPressable
              enableAnimation
              accessibilityRole="button"
              accessibilityLabel={monthLabel}
              onPress={() => shiftMonth(1)}
              style={{
                padding: 8,
                transform: [{ scaleX: isRtl ? -1 : 1 }],
              }}
            >
              <ChevronRight size={20} color={colors.text.primary} />
            </AppPressable>
          </View>
        )}
      </View>

      {isYearPickerOpen ? (
        <ScrollView
          style={{ maxHeight: DAY_CELL_SIZE * 6 }}
          contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap" }}
        >
          {years.map((year) => {
            const isSelected = visibleMonth.getFullYear() === year;
            return (
              <View
                key={year}
                style={{ width: "25%", padding: 4, alignItems: "center" }}
              >
                <AppPressable
                  enableAnimation
                  accessibilityRole="button"
                  accessibilityLabel={`${year}`}
                  onPress={() => {
                    setVisibleMonth(
                      (current) => new Date(year, current.getMonth(), 1),
                    );
                    setIsYearPickerOpen(false);
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: isSelected
                      ? colors.primary.main
                      : colors.background.level2,
                  }}
                >
                  <Text
                    style={{
                      ...typography.regular[14],
                      color: isSelected
                        ? colors.primary.contrast
                        : colors.text.primary,
                    }}
                  >
                    {year}
                  </Text>
                </AppPressable>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View>
          <View style={{ flexDirection: "row" }}>
            {weekdayLabels.map((label, index) => (
              <View
                key={`${label}-${index}`}
                style={{ width: `${100 / 7}%`, alignItems: "center" }}
              >
                <Text
                  style={{
                    ...typography.regular[12],
                    color: colors.text.placeholder,
                  }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {days.map(renderDay)}
          </View>
        </View>
      )}

      <View style={{ flexDirection: "row", gap: 12 }}>
        {onCancel != null && (
          <AppButton
            style={{ flex: 1 }}
            buttonType="outlined"
            buttonBaseColor={colors.text.primary}
            title={cancelTitle ?? getString("common.cancel")}
            onPress={onCancel}
          />
        )}
        <AppButton
          style={{ flex: 1 }}
          title={applyTitle ?? getString("datePicker.apply")}
          onPress={() => {
            onApply?.(toIsoDate(selected));
            onClose?.();
          }}
        />
      </View>
    </AppBaseBottomSheetDialog>
  );
});

export default AppDateBottomSheetDialog;
