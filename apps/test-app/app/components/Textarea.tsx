import { FC } from "react";
import { useField } from "remix-validated-form";

export type TextareaProps = {
  name: string;
  label: string;
  value?: string;
  "data-testid"?: string;
};

export const Textarea: FC<TextareaProps> = ({
  name,
  label,
  value,
  "data-testid": dataTestId,
}) => {
  const { error, getInputProps } = useField(name);
  return (
    <>
      <label>{label}</label>
      <textarea {...getInputProps()} data-testid={dataTestId}>
        {value}
      </textarea>
      {error && <p>{error}</p>}
    </>
  );
};
