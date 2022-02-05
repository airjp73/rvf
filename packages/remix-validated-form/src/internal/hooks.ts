import { useActionData, useTransition } from "@remix-run/react";
import { Atom, PrimitiveAtom } from "jotai";
import { useAtomValue } from "jotai/utils";
import { useContext, useMemo } from "react";
import { ValidationErrorResponseData } from "..";
import { InternalFormContext, InternalFormContextValue } from "./formContext";
import {
  defaultValuesAtom,
  formRegistry,
  FormState,
  isHydratedAtom,
} from "./state";

export const useInternalFormContext = (
  formId?: string | symbol,
  hookName?: string
) => {
  const formContext = useContext(InternalFormContext);

  if (formId) return { formId };
  if (formContext) return formContext;

  throw new Error(
    `Cannot determine form for ${hookName}. Please use the hook inside a form or pass a 'formId'.`
  );
};

export const useContextSelectAtom = <T>(
  formId: string | symbol,
  selectorAtomCreator: (formState: PrimitiveAtom<FormState>) => Atom<T>
) => {
  const formAtom = formRegistry(formId);
  const selectorAtom = useMemo(
    () => selectorAtomCreator(formAtom),
    [formAtom, selectorAtomCreator]
  );
  return useAtomValue(selectorAtom);
};

export const useUnknownFormContextSelectAtom = <T>(
  formId: string | symbol | undefined,
  selectorAtomCreator: (formState: PrimitiveAtom<FormState>) => Atom<T>,
  hookName: string
) => {
  const formContext = useInternalFormContext(formId, hookName);
  return useContextSelectAtom(formContext.formId, selectorAtomCreator);
};

export function useErrorResponseForForm({
  fetcher,
  subaction,
  formId,
}: InternalFormContextValue): ValidationErrorResponseData | null {
  const actionData = useActionData<any>();
  if (fetcher) {
    if ((fetcher.data as any)?.fieldErrors) return fetcher.data as any;
    return null;
  }

  if (!actionData?.fieldErrors) return null;

  // If there's an explicit id, we should ignore data that doesn't include it.
  if (typeof formId !== "string")
    return actionData.__rvfInternalFormId === formId ? actionData : null;

  if (
    (!subaction && !actionData.subaction) ||
    actionData.subaction === subaction
  )
    return actionData;

  return null;
}

export const useDefaultValuesForForm = (context: InternalFormContextValue) => {
  const { formId, defaultValuesProp } = context;
  const hydrated = useContextSelectAtom(formId, isHydratedAtom);
  const errorResponse = useErrorResponseForForm(context);
  const defaultValuesInState = useContextSelectAtom(formId, defaultValuesAtom);

  // Typical flow is:
  // - Default values only available from props
  // - State gets hydrated with default values
  // - After submit, we may need to use values from the error

  if (errorResponse?.repopulateFields) return errorResponse.repopulateFields;
  if (hydrated) return defaultValuesInState;
  return defaultValuesProp;
  // TODO: add response helper and pull default values from that
};

export const useHasActiveFormSubmit = ({
  fetcher,
}: InternalFormContextValue): boolean => {
  const transition = useTransition();
  const hasActiveSubmission = fetcher
    ? fetcher.state === "submitting"
    : !!transition.submission;
  return hasActiveSubmission;
};
