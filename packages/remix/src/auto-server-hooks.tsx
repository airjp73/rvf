import { FetcherWithComponents, useActionData } from "@remix-run/react";
import {
  ValidationErrorResponseData,
  FORM_ID_FIELD_NAME,
  FieldValues,
} from "@rvf/core";

type ErrorResponseContext = {
  fetcher?: FetcherWithComponents<unknown>;
  formId?: string;
};

function useErrorResponseForForm({
  fetcher,
  formId,
}: ErrorResponseContext): ValidationErrorResponseData | null {
  const actionData = useActionData<any>();
  const data = (fetcher?.data as any) ?? actionData;
  if (!data?.fieldErrors) return null;

  const bothFormAndResponseHaveNoId = (formId ?? null) && (data.formId ?? null);
  if (bothFormAndResponseHaveNoId || formId === data.formId) return data;
  return null;
}

export type ServerValidationErrorOpts<DefaultValues> = {
  formId?: string;
  fetcher?: FetcherWithComponents<unknown>;
  defaultValues: DefaultValues;
};

export const useServerValidationErrors = <DefaultValues extends FieldValues>(
  opts: ServerValidationErrorOpts<DefaultValues>,
) => {
  const { defaultValues } = opts;
  const formId = "formId" in opts ? opts.formId : undefined;
  const fetcher = "fetcher" in opts ? opts.fetcher : undefined;

  const errorsFromServer = useErrorResponseForForm({
    fetcher,
    formId,
  });
  const errorDefaultValues = errorsFromServer?.repopulateFields;

  return {
    serverValidationErrors: errorsFromServer?.fieldErrors,
    id: formId,
    fetcher,
    defaultValues: (errorDefaultValues ?? defaultValues) as DefaultValues,
  };
};
