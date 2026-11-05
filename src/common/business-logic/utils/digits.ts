export const toAsciiDigits = (value: string): string =>
  value.replace(/[٠-٩۰-۹]/g, (digit) => String(digit.charCodeAt(0) & 0xf));
