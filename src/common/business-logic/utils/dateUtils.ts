const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/;
const ZONED_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;

// Bare `"en"` resolves to en-US ordering ("March 5, 2026", "03/05/26"); the
// app's English copy is day-first and a GCC reader parses 03/05/26 as 3 May.
const INTL_LOCALES: Record<string, string> = {
  en: "en-GB",
  ar: "ar",
};

const LONG_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

// Typed `string`, but a backend field can still arrive as a number at runtime —
// `value.trim()` would crash the whole list render.
const trimmedString = (value: string | null | undefined): string => {
  if (value == null) return "";
  return typeof value === "string" ? value.trim() : `${value}`;
};

export const toIsoDate = (date: Date): string => {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export const isValidDate = (date?: Date | null): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime());

// `new Date(2026, 12, 45)` is not Invalid — it rolls over to 14 Feb 2027. Range
// checks plus one month read-back are the only way to reject such a value, and
// rejecting is what makes it render verbatim. Hours are range-checked rather
// than read back so a DST shift does not reject a legitimate timestamp.
const buildLocalDate = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): Date | undefined => {
  if (month < 1 || month > 12) return undefined;
  if (day < 1 || day > 31) return undefined;
  if (hour > 23 || minute > 59 || second > 59) return undefined;
  const date = new Date(year, month - 1, day, hour, minute, second);
  if (!isValidDate(date) || date.getMonth() !== month - 1) return undefined;
  return date;
};

export const fromIsoDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return buildLocalDate(year, month, day);
};

export const daysSince = (value?: string | null): number | undefined => {
  const start = fromIsoDate(value ?? undefined);
  if (!start) return undefined;
  const today = new Date();
  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  ).getTime();
  const currentDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  return Math.max(0, Math.round((currentDay - startDay) / 86400000));
};

// Only the shapes the backend actually sends parse. Anything else is free text
// and must render verbatim — `new Date("12")` would invent "1st Dec 2001".
export const parseDate = (value?: string | null): Date | undefined => {
  const raw = trimmedString(value);
  if (!raw) return undefined;

  if (DATE_ONLY_PATTERN.test(raw)) return fromIsoDate(raw);

  // "YYYY-MM-DD HH:MM:SS" is server time with no zone: build the parts
  // explicitly, since engines disagree on whether to read it as UTC or local.
  const parts = LOCAL_DATE_TIME_PATTERN.exec(raw);
  if (parts) {
    const [, year, month, day, hour, minute, second] = parts;
    return buildLocalDate(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute),
      Number(second ?? 0),
    );
  }

  if (!ZONED_DATE_TIME_PATTERN.test(raw)) return undefined;
  // Laravel emits the offset form space-separated; only `T` is valid ISO-8601.
  const zoned = new Date(raw.replace(" ", "T"));
  return isValidDate(zoned) ? zoned : undefined;
};

// Building an `Intl.DateTimeFormat` costs ~100x calling `.format()` on one, and
// these run per recycled list row.
const formatterCache = new Map<string, Intl.DateTimeFormat>();

export const dateFormatter = (
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const intlLocale = INTL_LOCALES[locale] ?? locale;
  const key = `${intlLocale}|${JSON.stringify(options)}`;
  const cached = formatterCache.get(key);
  if (cached) return cached;
  const formatter = new Intl.DateTimeFormat(intlLocale, options);
  formatterCache.set(key, formatter);
  return formatter;
};

// An `Intl` failure is a device-wide capability problem, not per-row data: one
// report says everything, and these run per row of a list that can be 50 long.
export const formatDateOrText = (
  value: string | null | undefined,
  format: (date: Date) => string,
): string => {
  const raw = trimmedString(value);
  if (!raw) return "";
  const date = parseDate(raw);
  if (!isValidDate(date)) return raw;
  try {
    return format(date);
  } catch (error) {
    console.log("formatDateOrText failed", raw, error);
    return raw;
  }
};

export const formatLongDate = (
  value: string | null | undefined,
  locale: string,
): string =>
  formatDateOrText(value, (date) =>
    dateFormatter(locale, LONG_DATE_OPTIONS).format(date),
  );

export const formatLongDateOrUndefined = (
  value: string | null | undefined,
  locale: string,
): string | undefined => formatLongDate(value, locale) || undefined;
