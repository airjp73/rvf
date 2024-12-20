import { AllProps, FieldValues } from "@rvf/core";
import { RemixFormOpts, useForm } from "./useForm";
import { FormProvider, FormApi } from "@rvf/react";

export type ValidatedFormProps<
  FormInputData extends FieldValues,
  FormOutputData,
  FormResponseData,
> = RemixFormOpts<FormInputData, FormOutputData> &
  Omit<React.ComponentProps<"form">, "children"> & {
    /**
     * A ref to the form element.
     */
    formRef?: React.RefObject<HTMLFormElement>;

    children:
      | React.ReactNode
      | ((form: FormApi<FormInputData>) => React.ReactNode);
  };

export const ValidatedForm = <
  FormInputData extends FieldValues,
  FormOutputData,
  FormResponseData,
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
  onBeforeSubmit,
  onSubmitSuccess,
  onSubmitFailure,
  onInvalidSubmit,
  disableFocusOnError,
  resetAfterSubmit,
  fetcherKey,
  navigate,
  otherFormProps,
  reloadDocument,
  viewTransition,
  ...rest
}: ValidatedFormProps<FormInputData, FormOutputData, FormResponseData>) => {
  const rvf = useForm<FormInputData, FormOutputData>({
    action,
    id,
    disableFocusOnError,
    validator,
    handleSubmit: handleSubmit as never,
    submitSource,
    onBeforeSubmit,
    onSubmitSuccess,
    onSubmitFailure,
    onInvalidSubmit,
    validationBehaviorConfig,
    method,
    replace,
    preventScrollReset,
    relative,
    encType,
    state,
    resetAfterSubmit,
    fetcherKey,
    navigate,
    otherFormProps,
    reloadDocument,
    defaultValues,
    viewTransition,
    fetcher,
  } satisfies AllProps<RemixFormOpts<FormInputData, FormOutputData>>);

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
        {rvf.renderFormIdInput()}
        {typeof children === "function" ? children(rvf) : children}
      </form>
    </FormProvider>
  );
};
