import { AllProps, FieldValues } from "@rvf/core";
import { RemixFormOpts, useForm } from "./useForm";
import { FormProvider, FormApi } from "@rvf/react";

type SmudgeUnion = {
  validator?: any;
  schema?: any;
  defaultValues?: any;
};

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
>(
  props: ValidatedFormProps<FormInputData, FormOutputData, FormResponseData>,
) => {
  const {
    validator,
    schema,
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
  } = props as ValidatedFormProps<
    FormInputData,
    FormOutputData,
    FormResponseData
  > &
    SmudgeUnion;

  const opts = {
    action,
    id,
    disableFocusOnError,
    validator,
    schema,
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
  } satisfies AllProps<
    RemixFormOpts<FormInputData, FormOutputData> & SmudgeUnion
  >;
  const rvf = useForm<FormInputData, FormOutputData>(opts);

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
