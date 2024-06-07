import {
  useRvf as useRvfReact,
  FieldValues,
  Rvf,
  RvfOpts,
  RvfReact,
} from "@rvf/react";
import {
  useHasActiveFormSubmit,
  useRemixSubmit,
  useSubmitComplete,
} from "./remix-submission-handling";
import {
  FetcherWithComponents,
  FormEncType,
  SubmitOptions,
} from "@remix-run/react";
import { toPathObject } from "../../set-get";
import { GenericObject, SubmitterOptions } from "@rvf/core";

type PartialProps<T, Props extends keyof T> = Omit<T, Props> &
  Partial<Pick<T, Props>>;

export type RvfRemixOpts<
  FormInputData extends FieldValues,
  FormOutputData,
> = PartialProps<
  Omit<RvfOpts<FormInputData, FormOutputData>, keyof SubmitOptions>,
  "handleSubmit" | "onSubmitSuccess" | "onSubmitFailure"
> &
  SubmitOptions & {
    fetcher?: FetcherWithComponents<unknown>;
    resetAfterSubmit?: boolean;
    onSubmitSuccess?: () => void;
    onSubmitFailure?: () => void;
  };

/**
 * Create and use an `Rvf`.
 */
export function useRvf<FormInputData extends FieldValues, FormOutputData>(
  options: RvfRemixOpts<FormInputData, FormOutputData>,
): RvfReact<FormInputData>;

/**
 * Interprets an `Rvf` created via `form.scope`, for use in a subcomponent.
 */
export function useRvf<FormInputData>(
  form: Rvf<FormInputData>,
): RvfReact<FormInputData>;

export function useRvf<FormInputData extends FieldValues, FormOutputData>(
  optsOrForm: RvfRemixOpts<FormInputData, FormOutputData> | Rvf<FormInputData>,
): RvfReact<FormInputData> {
  let rvf: RvfReact<FormInputData>;

  const fetcher = "fetcher" in optsOrForm ? optsOrForm.fetcher : undefined;
  const submitWithRemix = useRemixSubmit(fetcher);
  const resetAfterSubmit =
    "resetAfterSubmit" in optsOrForm ? optsOrForm.resetAfterSubmit : undefined;
  const hasActiveSubmission = useHasActiveFormSubmit(fetcher);
  useSubmitComplete(hasActiveSubmission, () => {
    if (resetAfterSubmit) {
      rvf.resetForm();
    }
  });

  // We're not actually breaking the rules here, because both branches have the same hook calls.
  // it's just easier for the types to put the whole hook call in the conditional.
  /* eslint-disable react-hooks/rules-of-hooks */
  if ("__brand__" in optsOrForm) {
    rvf = useRvfReact(optsOrForm);
    return rvf;
  }

  const submitSource = optsOrForm.submitSource ?? ("dom" as const);

  const handleSubmission = (
    data: FormOutputData,
    formDataOrOptions?: FormData | SubmitterOptions,
    maybeOptions?: SubmitterOptions,
  ) => {
    const { formData, options } =
      submitSource === "state"
        ? {
            formData: undefined,
            options: formDataOrOptions as SubmitterOptions,
          }
        : {
            formData: formDataOrOptions as FormData,
            options: maybeOptions,
          };

    const handleSubmit = optsOrForm.handleSubmit as
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

      if (optsOrForm.encType === "application/json")
        return data as GenericObject;
      return toPathObject(data as GenericObject);
    };

    const getFormAction = () => {
      if (!options?.formAction) return optsOrForm.action;
      const url = new URL(options.formAction);
      // https://github.com/remix-run/remix/issues/4423#issuecomment-1293015814
      return url.pathname + url.search;
    };

    return submitWithRemix(getData(), {
      replace: optsOrForm.replace,
      preventScrollReset: optsOrForm.preventScrollReset,
      relative: optsOrForm.relative,
      action: getFormAction(),

      // Technically not type safe, but it isn't really possible to make it so.
      // Can't really validate because remix doesn't provide a validator for it
      // and I don't want to hardcode the types.
      method:
        (options?.formMethod as typeof optsOrForm.method) ?? optsOrForm.method,
      encType: (options?.formEnctype as FormEncType) ?? optsOrForm.encType,
    });
  };

  rvf = useRvfReact<FormInputData, FormOutputData, void>({
    ...optsOrForm,
    submitSource,
    handleSubmit:
      (optsOrForm.handleSubmit as never) ?? (handleSubmission as never),
  });
  return rvf;
  /* eslint-enable */
}
