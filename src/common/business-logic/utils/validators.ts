import { AppStringKey } from "@/common/data-access/localization/strings";

/**
 * Validators return an `AppStringKey` (not a message) so the caller renders the
 * error in the active language, and so a rule can be reused in a screen that
 * has not mounted the localization hook yet.
 */
export type ValidationResult = AppStringKey | undefined;

// Deliberately permissive: the server is the authority on deliverability, and
// an over-strict client regex rejects valid addresses (+tags, new TLDs).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_PASSWORD_LENGTH = 8;

export const validateEmail = (value: string): ValidationResult => {
  if (!value.trim()) return "validation_email_empty";
  if (!EMAIL_PATTERN.test(value.trim())) return "validation_email_invalid";
  return undefined;
};

export const validatePassword = (value: string): ValidationResult => {
  if (!value) return "validation_password_empty";
  if (value.length < MIN_PASSWORD_LENGTH) return "validation_password_short";
  return undefined;
};

export const validateRequired = (value: string): ValidationResult =>
  value.trim() ? undefined : "validation_required";

export const validatePasswordConfirmation = (
  password: string,
  confirmation: string,
): ValidationResult => {
  const base = validatePassword(confirmation);
  if (base) return base;
  return password === confirmation ? undefined : "validation_password_mismatch";
};

/** Digits only, 7–15 — the E.164 range, without guessing at country rules. */
export const validatePhone = (value: string): ValidationResult => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "validation_phone_empty";
  if (digits.length < 7 || digits.length > 15)
    return "validation_phone_invalid";
  return undefined;
};
