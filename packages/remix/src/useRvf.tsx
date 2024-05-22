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
import { FetcherWithComponents, SubmitOptions } from "@remix-run/react";

type PartialProps<T, Props extends keyof T> = Omit<T, Props> &
  Partial<Pick<T, Props>>;

export type RvfRemixOpts<
  FormInputData extends FieldValues,
  FormOutputData,
> = PartialProps<
  Omit<RvfOpts<FormInputData, FormOutputData>, keyof SubmitOptions>,
  "handleSubmit"
> &
  SubmitOptions & {
    fetcher?: FetcherWithComponents<unknown>;
    resetAfterSubmit?: boolean;
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
  const submitWithRemix = useRemixSubmit();
  let rvf: RvfReact<FormInputData>;

  const fetcher = "fetcher" in optsOrForm ? optsOrForm.fetcher : undefined;
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

  const handleDomSubmit = (data: FormOutputData, formData: FormData) => {
    const handleSubmit = optsOrForm.handleSubmit as
      | ((data: FormOutputData, formData: FormData) => Promise<void>)
      | undefined;

    // when the user provides a handleSubmit, we should use that instead
    if (handleSubmit) {
      return handleSubmit(data, formData);
    }

    return submitWithRemix(formData, {
      method: optsOrForm.method,
      replace: optsOrForm.replace,
      preventScrollReset: optsOrForm.preventScrollReset,
      relative: optsOrForm.relative,
      action: optsOrForm.action,
      encType: optsOrForm.encType,
    });
  };

  const handleStateSubmit = (data: FormOutputData) => {
    const handleSubmit = optsOrForm.handleSubmit as
      | ((data: FormOutputData) => Promise<void>)
      | undefined;

    if (!handleSubmit) {
      throw new Error(
        "`state` submit source is only supported with `handleSubmit`",
      );
    }

    return handleSubmit(data);
  };

  const handleSubmit =
    submitSource === "state" ? handleStateSubmit : handleDomSubmit;

  rvf = useRvfReact<FormInputData, FormOutputData>({
    ...optsOrForm,
    submitSource,
    handleSubmit: handleSubmit as never,
  });
  return rvf;
  /* eslint-enable */
}
