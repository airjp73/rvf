import { Ref } from "react";
import * as R from "remeda";
import { getCheckboxChecked, getRadioChecked } from "@rvf/core";

export type CreateGetInputPropsOptions = {
  onChange: (value: unknown) => void;
  onBlur: () => void;
  defaultValue?: any;
  name: string;
  createRef: () => Ref<HTMLElement>;
  formId?: string;
};

type HandledProps = "name" | "defaultValue" | "defaultChecked";
type Callbacks = "onChange" | "onBlur";

export type MinimalInputProps = {
  onChange?: ((...args: any[]) => void) | undefined;
  onBlur?: ((...args: any[]) => void) | undefined;
  defaultValue?: any;
  defaultChecked?: boolean | undefined;
  name?: string | undefined;
  type?: string | undefined;
  ref?: Ref<any>;
  value?: string;
  form?: string;
};

export type ValidInputPropsValues = string | string[] | number | boolean;

export type GetInputPropsParam<T extends MinimalInputProps> = Omit<
  T,
  HandledProps | Callbacks
> &
  Partial<Pick<T, Callbacks>>;

export type GetInputProps = <T extends MinimalInputProps>(
  props?: GetInputPropsParam<T>,
) => T;

export const createGetInputProps = ({
  onChange,
  onBlur,
  defaultValue,
  name,
  createRef,
  formId,
}: CreateGetInputPropsOptions): GetInputProps => {
  return <T extends MinimalInputProps>(props = {} as any) => {
    const inputProps: MinimalInputProps = {
      ...props,
      form: formId,
      onChange: (...args: unknown[]) => {
        props?.onChange?.(...args);
        onChange(args[0]);
      },
      onBlur: (...args: unknown[]) => {
        onBlur();
        return props?.onBlur?.(...args);
      },
      name,
      ref: createRef(),
    };

    if (props.type === "checkbox") {
      inputProps.defaultChecked = getCheckboxChecked(props.value, defaultValue);
    } else if (props.type === "radio") {
      inputProps.defaultChecked = getRadioChecked(props.value, defaultValue);
    } else if (props.value === undefined && inputProps.type !== "file") {
      // We should only set the defaultValue if the input is uncontrolled.
      inputProps.defaultValue = defaultValue;
    }

    if (props.type === "file" && !!defaultValue) {
      console.warn("File inputs cannot have a default value.");
    }

    return R.omitBy(inputProps, (value) => value === undefined) as T;
  };
};
