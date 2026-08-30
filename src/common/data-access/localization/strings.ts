import { LanguageKey } from "@/common/data-access/localization/localizationTypes";

/**
 * The string catalog. `AppStringKey` is the source of truth — never cast a raw
 * string to it, and never let a user-facing literal reach a component.
 *
 * Keys read `<feature>_<subject>_<variant>`. Interpolate with positional
 * placeholders (`p0`, `p1`) and `.replace` at the call site.
 */
export type AppStringKey =
  | "shared_retry"
  | "shared_confirm"
  | "shared_cancel"
  | "shared_save"
  | "shared_error_generic"
  | "shared_error_network"
  | "shared_empty_title"
  | "shared_loading"
  | "home_title"
  | "home_subtitle"
  | "settings_title"
  | "settings_section_general"
  | "settings_row_language"
  | "settings_row_environment"
  | "settings_version"
  | "language_title"
  | "example_title"
  | "example_count_label"
  | "example_detail_title"
  // Validation
  | "validation_required"
  | "validation_email_empty"
  | "validation_email_invalid"
  | "validation_password_empty"
  | "validation_password_short"
  | "validation_password_mismatch"
  | "validation_phone_empty"
  | "validation_phone_invalid"
  // Bootstrap
  | "bootstrap_error_title"
  | "settings_row_notifications";

type LocalizationItem = Record<LanguageKey, string>;

export const AppStrings: Record<AppStringKey, LocalizationItem> = {
  shared_retry: { en: "Retry", ar: "إعادة المحاولة" },
  shared_confirm: { en: "Confirm", ar: "تأكيد" },
  shared_cancel: { en: "Cancel", ar: "إلغاء" },
  shared_save: { en: "Save", ar: "حفظ" },
  shared_error_generic: {
    en: "Something went wrong.",
    ar: "حدث خطأ ما.",
  },
  shared_error_network: {
    en: "Unable to reach the server.",
    ar: "تعذر الوصول إلى الخادم.",
  },
  shared_empty_title: { en: "Nothing here yet.", ar: "لا يوجد شيء هنا بعد." },
  shared_loading: { en: "Loading…", ar: "جارٍ التحميل…" },

  home_title: { en: "App Template", ar: "قالب التطبيق" },
  home_subtitle: {
    en: "Vertical Layered Feature Architecture, ready to build on.",
    ar: "بنية الميزات الطبقية العمودية، جاهزة للبناء عليها.",
  },

  settings_title: { en: "Settings", ar: "الإعدادات" },
  settings_section_general: { en: "General", ar: "عام" },
  settings_row_language: { en: "Language", ar: "اللغة" },
  settings_row_environment: { en: "Environment", ar: "البيئة" },
  settings_version: { en: "Version p0", ar: "الإصدار p0" },

  language_title: { en: "Language", ar: "اللغة" },

  example_title: { en: "Example", ar: "مثال" },
  example_count_label: { en: "p0 items", ar: "p0 عنصر" },
  example_detail_title: { en: "Detail", ar: "التفاصيل" },

  validation_required: {
    en: "This field is required.",
    ar: "هذا الحقل مطلوب.",
  },
  validation_email_empty: {
    en: "Enter your email address.",
    ar: "أدخل بريدك الإلكتروني.",
  },
  validation_email_invalid: {
    en: "Enter a valid email address.",
    ar: "أدخل بريدًا إلكترونيًا صالحًا.",
  },
  validation_password_empty: {
    en: "Enter your password.",
    ar: "أدخل كلمة المرور.",
  },
  validation_password_short: {
    en: "Use at least 8 characters.",
    ar: "استخدم 8 أحرف على الأقل.",
  },
  validation_password_mismatch: {
    en: "Passwords do not match.",
    ar: "كلمتا المرور غير متطابقتين.",
  },
  validation_phone_empty: {
    en: "Enter your phone number.",
    ar: "أدخل رقم هاتفك.",
  },
  validation_phone_invalid: {
    en: "Enter a valid phone number.",
    ar: "أدخل رقم هاتف صالحًا.",
  },

  bootstrap_error_title: {
    en: "Unable to reach the server.",
    ar: "تعذر الوصول إلى الخادم.",
  },
  settings_row_notifications: { en: "Notifications", ar: "الإشعارات" },
};
