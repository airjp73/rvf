import { FC, PropsWithChildren } from "react";
import { useField } from "@rvf/react-router";

export type SelectProps = PropsWithChildren<{
  name: string;
  label: string;
  multiple?: boolean;
  "data-testid"?: string;
}>;

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
        {error() && <p>{error()}</p>}
      </label>
    </>
  );
};
