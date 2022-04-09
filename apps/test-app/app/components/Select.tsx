import { FC } from "react";
import { useField } from "remix-validated-form";

export type SelectProps = {
  name: string;
  label: string;
  multiple?: boolean;
  "data-testid"?: string;
};

export const Select: FC<SelectProps> = ({
  name,
  multiple,
  label,
  "data-testid": dataTestId,
  children,
}) => {
  const { error, getInputProps } = useField(name);
  return (
    <>
      <label>
        {label}
        <select {...getInputProps({ multiple })} data-testid={dataTestId}>
          {children}
        </select>
        {error && <p>{error}</p>}
      </label>
    </>
  );
};
