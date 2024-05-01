import * as R from "remeda";
import { getCheckboxChecked } from "./logic/getCheckboxChecked";
import { getRadioChecked } from "./logic/getRadioChecked";
import { useMemo } from "react";
import { RvfReact } from "@rvf/react";

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
  onChange?: ((...args: any[]) => void) | undefined;
  onBlur?: ((...args: any[]) => void) | undefined;
  defaultValue?: any;
  defaultChecked?: boolean | undefined;
  name?: string | undefined;
  type?: string | undefined;
};

export type GetInputProps = <T extends MinimalInputProps>(
  props?: Omit<T, HandledProps | Callbacks> & Partial<Pick<T, Callbacks>>,
) => T;

const useGetInputProps = (
  form: RvfReact<any>,
  name: string,
  validationBehavior?: ValidationBehaviorOptions,
) => {
  // const field = form.field(name);
  // return useMemo(() => {
  //   return <T extends MinimalInputProps>(props = {} as any) => {
  //     const inputProps: MinimalInputProps = {
  //       ...props,
  //       onChange: (eventOrValue: unknown) => {
  //         field.onChange(eventOrValue);
  //         if (behavior === "onChange") validate();
  //         else clearError();
  //         return props?.onChange?.(...args);
  //       },
  //       onBlur: (...args: unknown[]) => {
  //         if (behavior === "onBlur") validate();
  //         setTouched(true);
  //         return props?.onBlur?.(...args);
  //       },
  //       name,
  //     };
  //     if (props.type === "checkbox") {
  //       inputProps.defaultChecked = getCheckboxChecked(
  //         props.value,
  //         defaultValue,
  //       );
  //     } else if (props.type === "radio") {
  //       inputProps.defaultChecked = getRadioChecked(props.value, defaultValue);
  //     } else if (props.value === undefined) {
  //       // We should only set the defaultValue if the input is uncontrolled.
  //       inputProps.defaultValue = defaultValue;
  //     }
  //     return R.omitBy(inputProps, (value) => value === undefined) as T;
  //   };
  // }, [form]);
};
