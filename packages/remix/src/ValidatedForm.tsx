import { FieldValues } from "@rvf/core";
import { RvfRemixOpts, useRvf } from "./useRvf";
import { RvfProvider, RvfReact } from "@rvf/react";
import { FORM_ID_FIELD_NAME } from "./constants";
import {
  useDefaultValuesFromLoader,
  useErrorResponseForForm,
} from "./auto-server-hooks";
import { useId } from "react";

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
  Subaction extends string | undefined,
> = Omit<
  RvfRemixOpts<FormInputData, FormOutputData>,
  "submitSource" | "handleSubmit"
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
  ...rest
}: ValidatedFormProps<FormInputData, FormOutputData, Subaction>) => {
  const defaultFormId = useId();
  const formId = id ?? defaultFormId;

  const actualDefaultValues = useDefaultValuesFromLoader({ formId });
  const errorsFromServer = useErrorResponseForForm({
    fetcher,
    subaction,
    formId,
  });

  const rvf = useRvf<FormInputData, FormOutputData>({
    defaultValues: actualDefaultValues ?? defaultValues,
    serverValidationErrors: errorsFromServer?.fieldErrors,
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
    formId,
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
        <input type="hidden" name={FORM_ID_FIELD_NAME} value={formId} />

        {!!subaction && (
          <input type="hidden" name="subaction" value={subaction} />
        )}

        {typeof children === "function" ? children(rvf) : children}
      </form>
    </RvfProvider>
  );
};
