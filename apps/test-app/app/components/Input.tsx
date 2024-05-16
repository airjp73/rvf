import React, { forwardRef } from "react";
import { useField } from "@rvf/remix";
import { Rvf } from "@rvf/core";

type InputProps = {
  name: string | Rvf<string | boolean | string[]>;
  label: string;
  type?: string;
  value?: string;
  hideErrors?: boolean;
  "data-testid"?: string;
  form?: string;
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
    // Not actually breaking rules here
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const field = typeof name === "string" ? useField(name) : useField(name);
    return (
      <div>
        <label htmlFor={field.name()}>{label}</label>
        <input
          data-testid={dataTestId}
          id={field.name()}
          disabled={disabled}
          form={form}
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
