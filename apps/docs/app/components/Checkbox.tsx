import { FC } from "react";
import { useField } from "@rvf/remix";

export type CheckboxProps = {
  label: string;
  name: string;
  value?: string;
};

export const Checkbox: FC<CheckboxProps> = ({
  label,
  name,
  value,
}) => {
  const { getInputProps } = useField(name);
  return (
    <div>
      <label>
        {label}
        <input
          {...getInputProps({ type: "checkbox", value })}
        />
      </label>
    </div>
  );
};
