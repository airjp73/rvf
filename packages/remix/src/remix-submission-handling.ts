import {
  FetcherWithComponents,
  SubmitOptions,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { GenericObject } from "@rvf/core";
import { useEffect, useRef } from "react";

export function useSubmitComplete(isSubmitting: boolean, callback: () => void) {
  const isPending = useRef(false);
  useEffect(() => {
    if (isSubmitting) {
      isPending.current = true;
    }

    if (!isSubmitting && isPending.current) {
      isPending.current = false;
      callback();
    }
  });
}

export const useHasActiveFormSubmit = (
  fetcher?: FetcherWithComponents<unknown>,
): boolean => {
  const navigation = useNavigation();
  const hasActiveSubmission = fetcher
    ? fetcher.state === "submitting"
    : navigation.state === "submitting" || navigation.state === "loading";
  return hasActiveSubmission;
};

export const useRemixSubmit = (fetcher?: FetcherWithComponents<unknown>) => {
  const hasActiveSubmission = useHasActiveFormSubmit(fetcher);
  const resolver = useRef<() => void>();
  useSubmitComplete(hasActiveSubmission, () => resolver.current?.());

  const submit = useSubmit();

  const handleSubmit = (
    modifiedFormData: FormData | GenericObject,
    submitOptions?: SubmitOptions,
  ) => {
    const { promise, resolve } = Promise.withResolvers<void>();
    resolver.current = resolve;

    if (fetcher) fetcher.submit(modifiedFormData, submitOptions);
    else submit(modifiedFormData, submitOptions);

    return promise;
  };

  return handleSubmit;
};
