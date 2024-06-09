import {
  useForm as useFormReact,
  FieldValues,
  FormScope,
  FormOpts,
  ReactFormApi,
} from "@rvf/react";
import { useRemixSubmit } from "./remix-submission-handling";
import {
  FetcherWithComponents,
  FormEncType,
  SubmitOptions,
} from "@remix-run/react";
import { toPathObject } from "../../set-get";
import { GenericObject, SubmitterOptions } from "@rvf/core";

type PartialProps<T, Props extends keyof T> = Omit<T, Props> &
  Partial<Pick<T, Props>>;

export type FormScopeRemixOpts<
  FormInputData extends FieldValues,
  FormOutputData,
  FormResponseData,
> = PartialProps<
  Omit<
    FormOpts<FormInputData, FormOutputData, FormResponseData>,
    keyof SubmitOptions
  >,
  "handleSubmit"
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
  > & {
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
  rvfOpts: FormScopeRemixOpts<FormInputData, FormOutputData, FormResponseData>,
): ReactFormApi<FormInputData> {
  let rvf: ReactFormApi<FormInputData>;

  const {
    fetcher,
    serverValidationErrors: serverErrors,
    submitSource = "dom",
  } = rvfOpts;
  const submitWithRemix = useRemixSubmit(fetcher, serverErrors);

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
        return formData;
      }

      if (rvfOpts.encType === "application/json") return data as GenericObject;
      return toPathObject(data as GenericObject);
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
