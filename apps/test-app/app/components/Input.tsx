import React, { forwardRef } from "react";
import { useField } from "@rvf/remix";
import { Rvf } from "@rvf/core";

type InputProps = {
  name: string;
  label: string;
  type?: string;
  value?: string;
  hideErrors?: boolean;
  "data-testid"?: string;
  form?: Rvf<string>;
  disabled?: boolean;
};

export const Input = forwardRef(
  (
    {
      name,
      label,
      type = "text",
      value,
      hideErrors: noErrors,
      "data-testid": dataTestId,
      form,
      disabled,
    }: InputProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => {
    const field = useField(form ?? name);
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <input
          data-testid={dataTestId}
          id={name}
          disabled={disabled}
          {...field.getInputProps({
            type,
            value,
            ref,
          })}
        />
        {field.error() && !noErrors && (
          <span style={{ color: "red" }}>{field.error()}</span>
        )}
      </div>
    );
  },
);
