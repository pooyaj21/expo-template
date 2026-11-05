import { Platform, TextInputProps } from "react-native";

export enum AutofillFieldEnums {
  USERNAME = "username",
  EMAIL = "email",
  NAME = "name",
  CURRENT_PASSWORD = "currentPassword",
  NEW_PASSWORD = "newPassword",
  ONE_TIME_CODE = "oneTimeCode",
}

export type AutofillFieldProps = Pick<
  TextInputProps,
  | "autoComplete"
  | "textContentType"
  | "importantForAutofill"
  | "autoCapitalize"
  | "autoCorrect"
  | "spellCheck"
  | "keyboardType"
  | "passwordRules"
>;

export const AUTOFILL_PASSWORD_RULES = "minlength: 6;";

const AUTOFILL_FIELD_PROPS: Record<AutofillFieldEnums, AutofillFieldProps> = {
  [AutofillFieldEnums.USERNAME]: {
    autoComplete: "username",
    textContentType: "username",
    importantForAutofill: "yes",
    autoCapitalize: "none",
    autoCorrect: false,
    spellCheck: false,
    keyboardType: "email-address",
  },
  [AutofillFieldEnums.EMAIL]: {
    autoComplete: "email",
    textContentType: "emailAddress",
    importantForAutofill: "yes",
    autoCapitalize: "none",
    autoCorrect: false,
    spellCheck: false,
    keyboardType: "email-address",
  },
  [AutofillFieldEnums.NAME]: {
    autoComplete: "name",
    textContentType: "name",
    importantForAutofill: "yes",
    autoCapitalize: "words",
    autoCorrect: false,
    keyboardType: "name-phone-pad",
  },
  [AutofillFieldEnums.CURRENT_PASSWORD]: {
    autoComplete: "current-password",
    textContentType: "password",
    importantForAutofill: "yes",
    autoCapitalize: "none",
    autoCorrect: false,
    spellCheck: false,
  },
  [AutofillFieldEnums.NEW_PASSWORD]: {
    autoComplete: "new-password",
    textContentType: "newPassword",
    importantForAutofill: "yes",
    autoCapitalize: "none",
    autoCorrect: false,
    spellCheck: false,
    passwordRules: AUTOFILL_PASSWORD_RULES,
  },
  [AutofillFieldEnums.ONE_TIME_CODE]: {
    autoComplete: Platform.select({
      ios: "one-time-code",
      android: "sms-otp",
    }) as TextInputProps["autoComplete"],
    textContentType: "oneTimeCode",
    importantForAutofill: "yes",
    autoCapitalize: "none",
    autoCorrect: false,
    keyboardType: "number-pad",
  },
};

export const getAutofillFieldProps = (
  field: AutofillFieldEnums,
): AutofillFieldProps => AUTOFILL_FIELD_PROPS[field];
