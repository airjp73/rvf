import { FieldValues } from "@rvf/core";
import { RvfRemixOpts, useRvf } from "./useRvf";
import { RvfProvider, RvfReact } from "@rvf/react";

export type ValidatedFormProps<
  FormInputData extends FieldValues,
  FormOutputData,
> = RvfRemixOpts<FormInputData, FormOutputData> &
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
  action,
  method,
  replace,
  id,
  preventScrollReset,
  relative,
  encType,
  state,
  fetcher,
  ...rest
}: ValidatedFormProps<FormInputData, FormOutputData>) => {
  const rvf = useRvf<FormInputData, FormOutputData>({
    defaultValues: defaultValues,
    validator,
    handleSubmit: handleSubmit as never,
    submitSource,
    validationBehaviorConfig,
    action,
    method,
    replace,
    preventScrollReset,
    relative,
    encType,
    state,
    fetcher,
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
        ref={formRef}
      >
        {typeof children === "function" ? children(rvf) : children}
      </form>
    </RvfProvider>
  );
};
