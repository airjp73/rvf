import { AllProps, FieldValues } from "@rvf/core";
import { RemixFormOpts, useForm } from "./useForm";
import { FormProvider, ReactFormApi } from "@rvf/react";

export type ValidatedFormProps<
  FormInputData extends FieldValues,
  FormOutputData,
  FormResponseData,
> = RemixFormOpts<FormInputData, FormOutputData, FormResponseData> &
  Omit<React.ComponentProps<"form">, "children"> & {
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
  onSubmitSuccess,
  onSubmitFailure,
  disableFocusOnError,
  resetAfterSubmit,
  fetcherKey,
  navigate,
  otherFormProps,
  reloadDocument,
  ...rest
}: ValidatedFormProps<FormInputData, FormOutputData, FormResponseData>) => {
  const rvf = useForm<FormInputData, FormOutputData, FormResponseData>({
    action,
    id,
    disableFocusOnError,
    validator,
    handleSubmit: handleSubmit as never,
    submitSource,
    onSubmitSuccess,
    onSubmitFailure,
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
    fetcher,
  } satisfies AllProps<
    RemixFormOpts<FormInputData, FormOutputData, FormResponseData>
  >);

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
