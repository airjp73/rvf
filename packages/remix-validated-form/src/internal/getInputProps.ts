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

export type MinimalInputProps = {
  onChange?: (...args: any[]) => void;
  onBlur?: (...args: any[]) => void;
};

export type MinimalResult = {
  name: string;
  onChange: (...args: any[]) => void;
  onBlur: (...args: any[]) => void;
  defaultValue?: any;
};

export type GetInputProps = <T extends {}>(
  props?: T & MinimalInputProps
) => T & MinimalResult;

const defaultValidationBehavior: ValidationBehaviorOptions = {
  initial: "onBlur",
  whenTouched: "onChange",
  whenSubmitted: "onChange",
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

  return (props = {} as any) => {
    const behavior = hasBeenSubmitted
      ? validationBehaviors.whenSubmitted
      : touched
      ? validationBehaviors.whenTouched
      : validationBehaviors.initial;
    return {
      ...props,
      onChange: (...args) => {
        if (behavior === "onChange") validate();
        else clearError();
        return props?.onChange?.(...args);
      },
      onBlur: (...args) => {
        if (behavior === "onBlur") validate();
        setTouched(true);
        return props?.onBlur?.(...args);
      },
      defaultValue,
      name,
    };
  };
};
