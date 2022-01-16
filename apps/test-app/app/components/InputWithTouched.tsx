import React, { forwardRef } from "react";
import { useField } from "remix-validated-form";

type InputProps = {
  name: string;
  label: string;
};

export const InputWithTouched = forwardRef(
  ({ name, label }: InputProps, ref: React.ForwardedRef<HTMLInputElement>) => {
    const { validate, clearError, defaultValue, error, touched, setTouched } =
      useField(name);
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          name={name}
          onBlur={() => {
            setTouched(true);
            validate();
          }}
          onChange={() => {
            if (touched) validate();
            else clearError();
          }}
          defaultValue={defaultValue}
          ref={ref}
        />
        {touched && <span>{name} touched</span>}
        {error && <span style={{ color: "red" }}>{error}</span>}
      </div>
    );
  }
);
