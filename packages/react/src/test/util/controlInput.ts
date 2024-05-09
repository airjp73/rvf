import { RvfField } from "../../field";

export const controlInput = (field: RvfField<any>) => {
  const props = field.getControlProps();
  return {
    ...props,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      props.onChange?.(e.target.value),
  };
};

export const controlNumberInput = (field: RvfField<any>) => {
  const props = field.getControlProps();
  return {
    ...props,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      props.onChange?.(Number(e.target.value)),
  };
};
