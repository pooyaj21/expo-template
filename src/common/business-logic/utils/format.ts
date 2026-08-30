/**
 * Money arrives as a decimal string. Keep it a string — parsing to a float to
 * add a currency symbol is how a cart total ends up at 19.989999999999998.
 */
export const formatPrice = (amount: string, currency: string): string =>
  `${currency} ${amount}`;

export const formatCount = (value: number, locale = "en"): string =>
  new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(value);

/** `125` → `"2:05"`, for countdowns and durations. */
export const formatDuration = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const formatDate = (
  iso: string,
  locale = "en",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    ...options,
    // Pin the zone: a server timestamp rendered in the device zone silently
    // shifts an order's date by a day for anyone east or west of the office.
    timeZone: "UTC",
  }).format(date);
};

export const truncate = (value: string, maxLength: number): string =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
