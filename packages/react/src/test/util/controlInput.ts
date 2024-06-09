import { GetControlPropsResult, FieldApi } from "../../field";

export const controlInput = (field: FieldApi<any>) => {
  const props = field.getControlProps();
  return controlInputProps(props);
};

export const controlInputProps = (props: GetControlPropsResult<string>) => {
  return {
    ...props,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      props.onChange?.(e.target.value),
  };
};

export const controlNumberInput = (field: FieldApi<any>) => {
  const props = field.getControlProps();
  return {
    ...props,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      props.onChange?.(Number(e.target.value)),
  };
};
