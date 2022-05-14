import omitBy from "lodash/omitBy";
import { getCheckboxChecked } from "./logic/getCheckboxChecked";
import { getRadioChecked } from "./logic/getRadioChecked";
import { isControlledField } from "./state/controlledFields";
import { getRawFieldValue } from "./state/createFormStore";
import { InternalFormId } from "./state/types";

export type ValidationBehavior = "onBlur" | "onChange" | "onSubmit";

export type ValidationBehaviorOptions = {
  initial: ValidationBehavior;
  whenTouched: ValidationBehavior;
  whenSubmitted: ValidationBehavior;
};

export type CreateGetInputPropsOptions = {
  formId: InternalFormId;
  clearError: () => void;
  validate: () => void;
  defaultValue?: any;
  touched: boolean;
  setTouched: (touched: boolean) => void;
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
  hasBeenSubmitted: boolean;
  validationBehavior?: Partial<ValidationBehaviorOptions>;
  name: string;
};

type HandledProps = "name" | "defaultValue" | "defaultChecked";
type Callbacks = "onChange" | "onBlur";

type MinimalInputProps = {
  onChange?: (...args: any[]) => void;
  onBlur?: (...args: any[]) => void;
  defaultValue?: any;
  defaultChecked?: boolean;
  name?: string;
  type?: string;
};

export type GetInputProps = <T extends MinimalInputProps>(
  props?: Omit<T, HandledProps | Callbacks> & Partial<Pick<T, Callbacks>>
) => T;

const defaultValidationBehavior: ValidationBehaviorOptions = {
  initial: "onBlur",
  whenTouched: "onChange",
  whenSubmitted: "onChange",
};

export const createGetInputProps = ({
  formId,
  clearError,
  validate,
  defaultValue,
  touched,
  setTouched,
  dirty,
  setDirty,
  hasBeenSubmitted,
  validationBehavior,
  name,
}: CreateGetInputPropsOptions): GetInputProps => {
  const validationBehaviors = {
    ...defaultValidationBehavior,
    ...validationBehavior,
  };

  return <T extends MinimalInputProps>(props = {} as any) => {
    const behavior = hasBeenSubmitted
      ? validationBehaviors.whenSubmitted
      : touched
      ? validationBehaviors.whenTouched
      : validationBehaviors.initial;

    const isFieldNowDirty = () => {
      const value = getRawFieldValue(formId, name).filter((raw) => {
        // Treat empty string as no value
        if (typeof raw === "string") return raw.length > 0;
        // Treat empty file as no value
        return raw.size > 0;
      });

      if (defaultValue === undefined) return value.length !== 0;

      const defaultAsArray = Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue];
      if (value.length !== defaultAsArray.length) return true;

      // Not sure there's a reliable equality check we can make for files
      if (value.some((val) => val instanceof File)) return true;
      if (defaultAsArray.some((val) => val instanceof File)) return true;

      // At this point, values should all be able to be cast to strings
      const typedValue = value.map(String).sort();
      const typedDefault = defaultAsArray.map(String).sort();

      return typedDefault.every(
        (defaultVal, index) => typedValue[index] === defaultVal
      );
    };

    const maybeUpdateDirty = () => {
      // Allow the controlled field hook to handle dirty state when possible
      // One common case is when the first argument is a change event
      if (!isControlledField(formId, name)) {
        setDirty(isFieldNowDirty());
      }
    };

    const inputProps: MinimalInputProps = {
      ...props,
      onChange: (...args: unknown[]) => {
        if (behavior === "onChange") validate();
        else clearError();
        maybeUpdateDirty();
        return props?.onChange?.(...args);
      },
      onBlur: (...args: unknown[]) => {
        if (behavior === "onBlur") validate();
        setTouched(true);
        maybeUpdateDirty();
        return props?.onBlur?.(...args);
      },
      name,
    };

    if (props.type === "checkbox") {
      inputProps.defaultChecked = getCheckboxChecked(props.value, defaultValue);
    } else if (props.type === "radio") {
      inputProps.defaultChecked = getRadioChecked(props.value, defaultValue);
    } else if (props.value === undefined) {
      // We should only set the defaultValue if the input is uncontrolled.
      inputProps.defaultValue = defaultValue;
    }

    return omitBy(inputProps, (value) => value === undefined) as T;
  };
};
