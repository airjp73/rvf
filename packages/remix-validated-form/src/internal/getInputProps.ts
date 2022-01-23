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

type HandledProps = "name" | "defaultValue";
type Callbacks = "onChange" | "onBlur";

export type GetInputProps = <T extends Record<string, any>>(
  props?: Omit<T, HandledProps | Callbacks> & Partial<Pick<T, Callbacks>>
) => T;

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

  return <T extends Record<string, any>>(props = {} as any) => {
    const behavior = hasBeenSubmitted
      ? validationBehaviors.whenSubmitted
      : touched
      ? validationBehaviors.whenTouched
      : validationBehaviors.initial;

    const result: T = {
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
      defaultValue,
      name,
    };

    return result;
  };
};
