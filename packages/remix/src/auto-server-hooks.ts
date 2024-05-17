import {
  FetcherWithComponents,
  useActionData,
  useMatches,
} from "@remix-run/react";
import { formDefaultValuesKey } from "./constants";
import { ValidationErrorResponseData } from "@rvf/core";

export const useDefaultValuesFromLoader = ({ formId }: { formId: string }) => {
  const matches = useMatches();
  const dataKey = formDefaultValuesKey(formId);
  // If multiple loaders declare the same default values,
  // we should use the data from the deepest route.
  const match = matches
    .reverse()
    .find(
      (match) =>
        match.data && typeof match.data === "object" && dataKey in match.data,
    );
  return (match as any)?.data[dataKey];
};

type ErrorResponseContext = {
  fetcher?: FetcherWithComponents<unknown>;
  subaction?: string;
  formId: string;
};

export function useErrorResponseForForm({
  fetcher,
  subaction,
  formId,
}: ErrorResponseContext): ValidationErrorResponseData | null {
  const actionData = useActionData<any>();
  if (fetcher) {
    if ((fetcher.data as any)?.fieldErrors) return fetcher.data as any;
    return null;
  }

  if (!actionData?.fieldErrors) return null;

  // If there's an explicit id, we should ignore data that has the wrong id
  if (typeof formId === "string" && actionData.formId)
    return actionData.formId === formId ? actionData : null;

  if (
    (!subaction && !actionData.subaction) ||
    actionData.subaction === subaction
  )
    return actionData;

  return null;
}
