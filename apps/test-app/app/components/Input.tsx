import React, { forwardRef } from "react";
import { useField, FormScope } from "@rvf/remix";

type InputProps = {
  name: string | FormScope<string | boolean | string[]>;
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
    const field =
      // Not actually breaking rules here
      // eslint-disable-next-line react-hooks/rules-of-hooks
      typeof name === "string" ? useField<string>(name) : useField(name);

    return (
      <div>
        <label htmlFor={field.name()}>{label}</label>
        <input
          data-testid={dataTestId}
          {...field.getInputProps({
            form,
            disabled,
            id: field.name(),
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
