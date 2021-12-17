import React, { forwardRef } from "react";
import { useField } from "remix-validated-form";

type InputProps = {
  name: string;
  label: string;
  validateOnBlur?: boolean;
};

export const Input = forwardRef(
  (
    { name, label, validateOnBlur }: InputProps,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
    const { validate, clearError, defaultValue, error } = useField(name);
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          onBlur={validateOnBlur ? validate : undefined}
          onChange={clearError}
          defaultValue={defaultValue}
          ref={ref}
        />
        {error && <span style={{ color: "red" }}>{error}</span>}
      </div>
    );
  }
);
