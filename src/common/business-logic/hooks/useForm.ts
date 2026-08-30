import { useCallback, useMemo, useState } from "react";
import { AppStringKey } from "@/common/data-access/localization/strings";
import { ValidationResult } from "@/common/business-logic/utils/validators";

type Validators<T> = Partial<
  Record<keyof T, (value: string, values: T) => ValidationResult>
>;

/**
 * A small form controller: values, per-field errors, and validation that only
 * starts complaining after a field has been touched or the form submitted.
 *
 * Validators return an `AppStringKey`, so the screen renders the message in the
 * active language — see `common/business-logic/utils/validators.ts`.
 *
 * Deliberately dependency-free — react-hook-form + zod is the right call once a
 * project has a dozen forms, and swapping this out then is a per-screen change.
 */
export const useForm = <T extends Record<string, string>>(
  initialValues: T,
  validators: Validators<T>,
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    const next: Partial<Record<keyof T, AppStringKey>> = {};
    (Object.keys(validators) as (keyof T)[]).forEach((field) => {
      const error = validators[field]?.(values[field] ?? "", values);
      if (error) next[field] = error;
    });
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const setValue = useCallback(
    (field: keyof T, value: string) =>
      setValues((previous) => ({ ...previous, [field]: value })),
    [],
  );

  const setFieldTouched = useCallback(
    (field: keyof T) =>
      setTouched((previous) => ({ ...previous, [field]: true })),
    [],
  );

  /** An error the user should see now, as opposed to one that merely exists. */
  const visibleError = useCallback(
    (field: keyof T): AppStringKey | undefined =>
      submitted || touched[field] ? errors[field] : undefined,
    [errors, touched, submitted],
  );

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = useCallback(
    (onValid: (values: T) => void) => () => {
      setSubmitted(true);
      if (Object.keys(errors).length > 0) return;
      onValid(values);
    },
    [errors, values],
  );

  return {
    values,
    errors,
    isValid,
    setValue,
    setFieldTouched,
    visibleError,
    handleSubmit,
  };
};
