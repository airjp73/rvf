import React, { forwardRef } from "react";
import { useField } from "@rvf/remix";

type InputProps = {
  name: string;
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
    const { getInputProps, error } = useField(name, {
      formId: form,
    });
    const actualValue = value ?? (type === "checkbox" ? "on" : undefined);
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <input
          data-testid={dataTestId}
          {...getInputProps({
            form,
            type,
            ref,
            id: name,
            value: actualValue,
            disabled,
          })}
        />
        {error && !noErrors && <span style={{ color: "red" }}>{error}</span>}
      </div>
    );
  },
);
