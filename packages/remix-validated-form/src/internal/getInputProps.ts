export type ValidationBehavior = "onBlur" | "onChange" | "onSubmit";

export type ValidationBehaviorOptions = {
  initial: ValidationBehavior;
  whenTouched: ValidationBehavior;
  whenSubmitted: ValidationBehavior;
};

export type CreateGetInputPropsOptions = {
  clearError: () => void;
  validate: () => void;
  defaultValue?: any;
  touched: boolean;
  setTouched: (touched: boolean) => void;
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

const getCheckboxDefaultChecked = (value: string, defaultValue: any) => {
  if (Array.isArray(defaultValue)) return defaultValue.includes(value);
  if (typeof defaultValue === "boolean") return defaultValue;
  if (typeof defaultValue === "string") return defaultValue === value;
  return undefined;
};

export const createGetInputProps = ({
  clearError,
  validate,
  defaultValue,
  touched,
  setTouched,
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

    const inputProps: T = {
      ...props,
      onChange: (...args: unknown[]) => {
        if (behavior === "onChange") validate();
        else clearError();
        return props?.onChange?.(...args);
      },
      onBlur: (...args: unknown[]) => {
        if (behavior === "onBlur") validate();
        setTouched(true);
        return props?.onBlur?.(...args);
      },
      name,
    };

    if (inputProps.type === "checkbox") {
      const value = props.value ?? "on";
      inputProps.defaultChecked = getCheckboxDefaultChecked(
        value,
        defaultValue
      );
    } else if (inputProps.type === "radio") {
      const value = props.value ?? "on";
      inputProps.defaultChecked = defaultValue === value;
    } else {
      inputProps.defaultValue = defaultValue;
    }

    return inputProps;
  };
};
