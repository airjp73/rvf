import { AllProps, FieldValues } from "@rvf/core";
import { RvfRemixOpts, useRvf } from "./useRvf";
import { RvfProvider, RvfReact } from "@rvf/react";
import { useRemixFormResponse } from "./auto-server-hooks";

type ScopeToSubaction<
  Data,
  Subaction extends string | undefined,
> = Subaction extends undefined ? Data : Data & { subaction: Subaction };

type RvfRemixSubmitOpts<FormOutputData, Subaction extends string | undefined> =
  | {
      submitSource: "state";
      handleSubmit: (
        data: ScopeToSubaction<FormOutputData, Subaction>,
      ) => Promise<void> | void;
    }
  | {
      submitSource?: "dom";
      handleSubmit?: (
        data: ScopeToSubaction<FormOutputData, Subaction>,
        formData: FormData,
      ) => Promise<void> | void;
    };

export type ValidatedFormProps<
  FormInputData extends FieldValues,
  FormOutputData,
  FormResponseData,
  Subaction extends string | undefined,
> = Omit<
  RvfRemixOpts<FormInputData, FormOutputData, FormResponseData>,
  "submitSource" | "handleSubmit" | "serverValidationErrors"
> &
  Omit<React.ComponentProps<"form">, "children"> & {
    /**
     * A ref to the form element.
     */
    formRef?: React.RefObject<HTMLFormElement>;

    /**
     * Adds a hidden input to the form with the name `subaction` and the value of the subaction.
     * This can be used to handle multiple forms in the same action function.
     */
    subaction?: Subaction;

    children:
      | React.ReactNode
      | ((form: RvfReact<FormInputData>) => React.ReactNode);
  } & RvfRemixSubmitOpts<FormOutputData, Subaction>;

export const ValidatedForm = <
  FormInputData extends FieldValues,
  FormOutputData,
  FormResponseData,
  Subaction extends string | undefined,
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
  subaction,
  onSubmitSuccess,
  onSubmitFailure,
  disableFocusOnError,
  resetAfterSubmit,
  fetcherKey,
  navigate,
  otherFormProps,
  reloadDocument,
  ...rest
}: ValidatedFormProps<
  FormInputData,
  FormOutputData,
  FormResponseData,
  Subaction
>) => {
  const remix = useRemixFormResponse({
    formId: id,
    fetcher,
    subaction,
    defaultValues,
  });

  const rvf = useRvf<FormInputData, FormOutputData, FormResponseData>({
    ...remix.getRvfOpts(),
    action,
    formId: id,
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
  } satisfies AllProps<
    RvfRemixOpts<FormInputData, FormOutputData, FormResponseData>
  >);

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
        {remix.renderHiddenInputs()}

        {typeof children === "function" ? children(rvf) : children}
      </form>
    </RvfProvider>
  );
};
