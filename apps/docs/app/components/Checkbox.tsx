import { FC } from "react";
import { useField } from "remix-validated-form";

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
  const { defaultValue } = useField(name);
  return (
    <div>
      <label>
        {label}
        <input
          type="checkbox"
          name={name}
          value={value}
          defaultChecked={defaultValue.includes(value)}
        />
      </label>
    </div>
  );
};
