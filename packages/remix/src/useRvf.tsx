import {
  useRvf as useRvfReact,
  FieldValues,
  Rvf,
  RvfOpts,
  RvfReact,
} from "@rvf/react";
import { useRemixSubmit } from "./remix-submission-handling";
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

  // We're not actually breaking the rules here, because both branches have the same hook calls.
  // it's just easier for the types to put the whole hook call in the conditional.
  /* eslint-disable react-hooks/rules-of-hooks */
  if ("__brand__" in optsOrForm) {
    return useRvfReact(optsOrForm);
  }

  // For remix, it makes sense to default to "dom" for submitSource
  const submitSource = optsOrForm.submitSource ?? ("dom" as const);

  const handleDomSubmit = (_data: FormOutputData, formData: FormData) => {
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
    if (!optsOrForm.handleSubmit) {
      throw new Error(
        "`state` submit source is only supported with `handleSubmit`",
      );
    }

    return optsOrForm.handleSubmit(data);
  };

  const handleSubmit =
    submitSource === "state" ? handleStateSubmit : handleDomSubmit;

  return useRvfReact<FormInputData, FormOutputData>({
    defaultValues: optsOrForm.defaultValues,
    validator: optsOrForm.validator,
    validationBehaviorConfig: optsOrForm.validationBehaviorConfig,

    submitSource,
    handleSubmit: handleSubmit as never,
  });
  /* eslint-enable */
}
