import { FetcherWithComponents, useActionData } from "@remix-run/react";
import { ValidationErrorResponseData, FORM_ID_FIELD_NAME } from "@rvf/core";

type ErrorResponseContext = {
  fetcher?: FetcherWithComponents<unknown>;
  formId?: string;
};

function useErrorResponseForForm({
  fetcher,
  formId,
}: ErrorResponseContext): ValidationErrorResponseData | null {
  const actionData = useActionData<any>();
  if (fetcher) {
    if ((fetcher.data as any)?.fieldErrors) return fetcher.data as any;
    return null;
  }

  if (!actionData?.fieldErrors) return null;

  return actionData.formId === formId ? actionData : null;
}

export const useServerValidationErrors = (
  formIdOrFetcher: string | FetcherWithComponents<any>,
) => {
  const formId =
    typeof formIdOrFetcher === "string" ? formIdOrFetcher : undefined;
  const fetcher =
    typeof formIdOrFetcher === "string" ? undefined : formIdOrFetcher;
  const errorsFromServer = useErrorResponseForForm({
    fetcher,
    formId,
  });

  return {
    getFormOpts: () => ({
      serverValidationErrors: errorsFromServer?.fieldErrors,
      formId,
      fetcher,
    }),
    renderHiddenInput: () => (
      <input type="hidden" name={FORM_ID_FIELD_NAME} value={formId} />
    ),
  };
};
