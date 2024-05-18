import { FieldValues } from "@rvf/core";
import { RvfOpts, useRvf } from "./useRvf";
import { RvfReact } from "./base";
import { RvfProvider } from "./context";

export type ValidatedFormProps<
  FormInputData extends FieldValues,
  FormOutputData,
> = RvfOpts<FormInputData, FormOutputData> &
  Omit<React.ComponentProps<"form">, "children"> & {
    /**
     * A ref to the form element.
     */
    formRef?: React.RefObject<HTMLFormElement>;

    children:
      | React.ReactNode
      | ((form: RvfReact<FormInputData>) => React.ReactNode);
  };

export const ValidatedForm = <
  FormInputData extends FieldValues,
  FormOutputData,
>({
  validator,
  formRef,
  defaultValues,
  handleSubmit,
  submitSource,
  validationBehaviorConfig,
  children,
  onSubmit,
  onReset,
  ...rest
}: ValidatedFormProps<FormInputData, FormOutputData>) => {
  const rvf = useRvf<FormInputData, FormOutputData>({
    defaultValues: defaultValues,
    validator,
    handleSubmit: handleSubmit as never,
    submitSource,
    validationBehaviorConfig,
  });

  return (
    <RvfProvider scope={rvf.scope()}>
      <form
        {...rvf.getFormProps({
          onSubmit,
          onReset,
          ref: formRef,
        })}
        {...rest}
      >
        {typeof children === "function" ? children(rvf) : children}
      </form>
    </RvfProvider>
  );
};
