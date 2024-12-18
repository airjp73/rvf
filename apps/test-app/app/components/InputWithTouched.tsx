import React, { forwardRef } from "react";
import { useField } from "@rvf/react-router";

type InputProps = {
  name: string;
  label: string;
};

export const InputWithTouched = forwardRef(
  ({ name, label }: InputProps, ref: React.ForwardedRef<HTMLInputElement>) => {
    const field = useField(name);
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <input
          {...field.getInputProps({
            id: name,
            ref,
          })}
        />
        {field.touched() && <span>{name} touched</span>}
        {field.error() && <span style={{ color: "red" }}>{field.error()}</span>}
      </div>
    );
  },
);
