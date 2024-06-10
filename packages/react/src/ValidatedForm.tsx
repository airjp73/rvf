import { FieldValues, AllProps } from "@rvf/core";
import { FormOpts, useForm } from "./useForm";
import { ReactFormApi } from "./base";
import { FormProvider } from "./context";

export type ValidatedFormProps<
  FormInputData extends FieldValues,
  FormOutputData,
> = Omit<FormOpts<FormInputData, FormOutputData>, "formId"> &
  Omit<React.ComponentProps<"form">, "children"> & {
    id?: string;

    /**
     * A ref to the form element.
     */
    formRef?: React.RefObject<HTMLFormElement>;

    children:
      | React.ReactNode
      | ((form: ReactFormApi<FormInputData>) => React.ReactNode);
  };

export const ValidatedForm = <
  FormInputData extends FieldValues,
  FormOutputData,
>({
  validator,
  formRef,
  defaultValues,
  serverValidationErrors,
  action,
  id,
  disableFocusOnError,
  handleSubmit,
  submitSource,
  validationBehaviorConfig,
  children,
  onSubmit,
  onReset,
  onSubmitSuccess,
  onSubmitFailure,
  resetAfterSubmit,
  otherFormProps,
  reloadDocument,
  ...rest
}: ValidatedFormProps<FormInputData, FormOutputData>) => {
  const rvf = useForm({
    defaultValues: defaultValues,
    serverValidationErrors,
    action,
    id,
    disableFocusOnError,
    validator,
    handleSubmit: handleSubmit as never,
    submitSource,
    onSubmitSuccess,
    onSubmitFailure,
    validationBehaviorConfig,
    resetAfterSubmit,
    otherFormProps,
    reloadDocument,
  } satisfies AllProps<FormOpts<FormInputData, FormOutputData, void>>);

  return (
    <FormProvider scope={rvf.scope()}>
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
    </FormProvider>
  );
};
