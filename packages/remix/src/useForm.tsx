import {
  useForm as useFormReact,
  FieldValues,
  FormOpts,
  FormApi,
} from "@rvf/react";
import { useRemixSubmit } from "./remix-submission-handling";
import {
  FetcherWithComponents,
  FormEncType,
  SubmitOptions,
} from "@remix-run/react";
import { toPathObject } from "@rvf/set-get";
import {
  GenericObject,
  SubmitterOptions,
  FORM_ID_FIELD_NAME,
  StateSubmitHandler,
  DomSubmitHandler,
} from "@rvf/core";
import { useServerValidationErrors } from "./auto-server-hooks";

// Trying to manipulate the existing types for this breaks the type inference
// for the handleSubmit argument. So we'll just spell it out again
type FormSubmitOpts<FormOutputData, ResponseData> =
  | {
      submitSource: "state";
      handleSubmit?: StateSubmitHandler<FormOutputData, ResponseData>;
    }
  | {
      submitSource?: "dom";
      handleSubmit?: DomSubmitHandler<FormOutputData, ResponseData>;
    };

export type RemixFormOpts<
  FormInputData extends FieldValues,
  FormOutputData,
  FormResponseData,
> = Omit<
  FormOpts<FormInputData, FormOutputData, FormResponseData>,
  | keyof SubmitOptions
  | "serverValidationErrors"
  | "handleSubmit"
  | "submitSource"
> &
  Pick<
    SubmitOptions,
    | "method"
    | "action"
    | "encType"
    | "fetcherKey"
    | "replace"
    | "state"
    | "navigate"
    | "preventScrollReset"
    | "relative"
  > &
  FormSubmitOpts<FormOutputData, FormResponseData> & {
    fetcher?: FetcherWithComponents<unknown>;
  };

/**
 * Create and use an `FormScope`.
 */
export function useForm<
  FormInputData extends FieldValues,
  FormOutputData,
  FormResponseData,
>(
  rvfOpts: RemixFormOpts<FormInputData, FormOutputData, FormResponseData>,
): FormApi<FormInputData> {
  let rvf: FormApi<FormInputData>;

  const { fetcher, submitSource = "dom" } = rvfOpts;
  const serverStuff = useServerValidationErrors({
    formId: rvfOpts.id,
    defaultValues: rvfOpts.defaultValues as any,
    fetcher: rvfOpts.fetcher,
  });
  const submitWithRemix = useRemixSubmit(
    fetcher,
    serverStuff.serverValidationErrors,
  );

  const handleSubmission = (
    data: FormOutputData,
    formDataOrOptions?: FormData | SubmitterOptions,
    maybeOptions?: SubmitterOptions,
  ) => {
    const { formData, submitterOpts } =
      submitSource === "state"
        ? {
            formData: undefined,
            submitterOpts: formDataOrOptions as SubmitterOptions,
          }
        : {
            formData: formDataOrOptions as FormData,
            submitterOpts: maybeOptions,
          };

    const handleSubmit = rvfOpts?.handleSubmit as
      | ((data: FormOutputData, formData: FormData) => Promise<void>)
      | undefined;

    // when the user provides a handleSubmit, we should use that instead
    if (handleSubmit) {
      return handleSubmit(data, formData as never);
    }

    const getData = () => {
      if (submitSource === "dom") {
        if (!formData)
          throw new Error("Missing form data. This is likely a bug in RVF");
        if (rvfOpts.id) formData.set(FORM_ID_FIELD_NAME, rvfOpts.id);
        return formData;
      }

      if (rvfOpts.encType === "application/json") return data as GenericObject;
      const pathObj = toPathObject(data as GenericObject);
      if (rvfOpts.id) pathObj[FORM_ID_FIELD_NAME] = rvfOpts.id;
      return pathObj;
    };

    const getFormAction = () => {
      if (!submitterOpts?.formAction) return rvfOpts.action;
      const url = new URL(submitterOpts.formAction);
      // https://github.com/remix-run/remix/issues/4423#issuecomment-1293015814
      return url.pathname + url.search;
    };

    return submitWithRemix(getData(), {
      fetcherKey: rvfOpts.fetcherKey,
      state: rvfOpts.state,
      navigate: rvfOpts.navigate,
      replace: rvfOpts.replace,
      preventScrollReset: rvfOpts.preventScrollReset,
      relative: rvfOpts.relative,
      action: getFormAction(),

      // Technically not type safe, but it isn't really possible to make it so.
      // Can't really validate because remix doesn't provide a validator for it
      // and I don't want to hardcode the types.
      method:
        (submitterOpts?.formMethod as typeof rvfOpts.method) ?? rvfOpts.method,
      encType: (submitterOpts?.formEnctype as FormEncType) ?? rvfOpts.encType,
    });
  };

  rvf = useFormReact<FormInputData, FormOutputData, FormResponseData>({
    ...rvfOpts,
    ...serverStuff,
    otherFormProps: {
      method: rvfOpts.method,
      encType: rvfOpts.encType,
      ...rvfOpts.otherFormProps,
    },
    submitSource,
    handleSubmit:
      (rvfOpts.handleSubmit as never) ?? (handleSubmission as never),
  });
  return rvf;
}
