import { FC } from "react";
import { useField } from "@rvf/react-router";

export type TextareaProps = {
  name: string;
  label: string;
  value?: string;
  hideErrors?: boolean;
  "data-testid"?: string;
};

export const Textarea: FC<TextareaProps> = ({
  name,
  label,
  "data-testid": dataTestId,
  hideErrors,
}) => {
  const { error, getInputProps } = useField(name);
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <textarea
        {...getInputProps({ id: name })}
        data-testid={dataTestId}
      ></textarea>
      {!hideErrors && error() && <p>{error()}</p>}
    </>
  );
};
