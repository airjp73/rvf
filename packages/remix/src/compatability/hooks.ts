import {
  Rvf,
  ValidationBehaviorConfig,
  useRvf,
  useRvfOrContext,
} from "@rvf/react";
import { useCallback, useMemo } from "react";

/**
 * Returns whether or not the parent form is currently being submitted.
 * This is different from Remix's `useNavigation()` in that it
 * is aware of what form it's in and when _that_ form is being submitted.
 *
 * Can optionally accept an `Rvf` to grab the data from that instead.
 *
 * @deprecated Provided for backwards compatibility with `remix-validated-form`.
 * You can instead get this data directly off of the `useRvf` hook.
 */
export const useIsSubmitting = (rvf?: Rvf<any>) =>
  useRvfOrContext(rvf).formState.isSubmitting;

/**
 * Returns whether or not the current form is valid.
 *
 * Can optionally accept an `Rvf` to grab the data from that instead.
 *
 * @deprecated Provided for backwards compatibility with `remix-validated-form`.
 * You can instead get this data directly off of the `useRvf` hook.
 */
export const useIsValid = (rvf?: Rvf<any>) =>
  useRvfOrContext(rvf).formState.isValid;

/**
 * @deprecated Can get the value and set the value directly off of the `useRvf` hook.
 */
export const useControlField = <T>(name: string, rvf?: Rvf<any>) => {
  const form = useRvfOrContext(rvf);
  const value: T = form.value(name);
  const setValue = useCallback(
    (value: T) => form.setValue(name, value),
    [form, name],
  );
  return [value, setValue] as const;
};

/**
 * @deprecated Can set the value directly off of the `useRvf` hook.
 */
export const useUpdateControlledField = (rvf?: Rvf<any>) => {
  const form = useRvfOrContext(rvf);
  return useCallback(
    (name: string, value: any) => form.setValue(name, value),
    [form],
  );
};

export type FieldProps = {
  /**
   * The validation error message if there is one.
   */
  error?: string;
  /**
   * Clears the error message.
   */
  clearError: () => void;
  /**
   * Validates the field.
   */
  validate: () => void;
  /**
   * The default value of the field, if there is one.
   */
  defaultValue?: any;
  /**
   * Whether or not the field has been touched.
   */
  touched: boolean;
  /**
   * Helper to set the touched state of the field.
   */
  setTouched: (touched: boolean) => void;
};

export const useField = (
  name: string,
  options?: {
    rvf?: Rvf<any>;
    validationBehavior?: Partial<ValidationBehaviorConfig>;
  },
) => {
  // const form = useRvfOrContext(options?.rvf);
  // const field = useMemo<FieldProps>(() => {
  //   const helpers = {
  //     error: form.error(name),
  //     clearError: () => form.setError(name, null),
  //     validate: () => form.validate(),
  //     defaultValue: form.defaultValue(name),
  //     touched: form.touched(name),
  //     setTouched: (touched: boolean) => form.setTouched(name, touched),
  //   };
  // const validationBehaviors = {
  //   ...defaultValidationBehavior,
  //   ...validationBehavior,
  // };
  // const getInputProps = <T extends MinimalInputProps>(props = {} as any) => {
  //   const behavior = hasBeenSubmitted
  //     ? validationBehaviors.whenSubmitted
  //     : touched
  //       ? validationBehaviors.whenTouched
  //       : validationBehaviors.initial;
  //   const inputProps: MinimalInputProps = {
  //     ...props,
  //     onChange: (...args: unknown[]) => {
  //       if (behavior === "onChange") validate();
  //       else clearError();
  //       return props?.onChange?.(...args);
  //     },
  //     onBlur: (...args: unknown[]) => {
  //       if (behavior === "onBlur") validate();
  //       setTouched(true);
  //       return props?.onBlur?.(...args);
  //     },
  //     name,
  //   };
  //   if (props.type === "checkbox") {
  //     inputProps.defaultChecked = getCheckboxChecked(props.value, defaultValue);
  //   } else if (props.type === "radio") {
  //     inputProps.defaultChecked = getRadioChecked(props.value, defaultValue);
  //   } else if (props.value === undefined) {
  //     // We should only set the defaultValue if the input is uncontrolled.
  //     inputProps.defaultValue = defaultValue;
  //   }
  //   // return R.omitBy(inputProps, (value) => value === undefined) as T;
  //   return {
  //     ...helpers,
  //     getInputProps,
  //   };
  // }, [form, name, options?.validationBehavior]);
  // return field;
};
