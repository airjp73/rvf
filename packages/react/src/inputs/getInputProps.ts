import { RefCallback, Ref } from "react";
import * as R from "remeda";
import {
  getCheckboxChecked,
  getNextCheckboxValue,
} from "./logic/getCheckboxChecked";
import { getRadioChecked } from "./logic/getRadioChecked";
import { getEventValue } from "../event";

export type CreateGetInputPropsOptions = {
  onChange: (value: unknown) => void;
  onBlur: () => void;
  defaultValue?: any;
  name: string;
  getCurrentValue: () => unknown;
  ref: Ref<HTMLElement>;
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
  ref?: RefCallback<any>;
  value?: string;
};

export type GetInputProps = <T extends MinimalInputProps>(
  props?: Omit<T, HandledProps | Callbacks> & Partial<Pick<T, Callbacks>>,
) => T;

export const createGetInputProps = ({
  onChange,
  onBlur,
  defaultValue,
  name,
  ref,
  getCurrentValue,
}: CreateGetInputPropsOptions): GetInputProps => {
  return <T extends MinimalInputProps>(props = {} as any) => {
    const inputProps: MinimalInputProps = {
      ...props,
      onChange: (...args: unknown[]) => {
        const value = getEventValue(args[0]);

        if (props.type === "radio") {
          onChange(props.value);
        } else if (props.type === "checkbox") {
          onChange(
            getNextCheckboxValue({
              derivedValue: value,
              valueProp: props.value,
              currentValue: getCurrentValue(),
            }),
          );
        } else {
          onChange(value);
        }
        props?.onChange?.(...args);
      },
      onBlur: (...args: unknown[]) => {
        onBlur();
        return props?.onBlur?.(...args);
      },
      name,
      ref,
    };

    if (props.type === "checkbox") {
      inputProps.defaultChecked = getCheckboxChecked(props.value, defaultValue);
    } else if (props.type === "radio") {
      inputProps.defaultChecked = getRadioChecked(props.value, defaultValue);
    } else if (props.value === undefined) {
      // We should only set the defaultValue if the input is uncontrolled.
      inputProps.defaultValue = defaultValue;
    }

    return R.omitBy(inputProps, (value) => value === undefined) as T;
  };
};
