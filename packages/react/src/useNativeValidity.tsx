import {
  FormScope,
  getElementsWithNames,
  isFormControl,
  sortByPosition,
} from "@rvf/core";
import { RefObject, useEffect } from "react";

export const useNativeValidity = (
  ref: RefObject<HTMLElement & { setCustomValidity: (error: string) => void }>,
  error?: string | null,
) => {
  useEffect(() => {
    if (!ref.current) return;
    ref.current.setCustomValidity(error ?? "");
  }, [error, ref]);
};

/**
 * UNSTABLE: This is an unstable API and may change in the future.
 *
 * Automatically sets the validity of all form controls in the form using the
 * native HTML `setCustomValidity` method.
 *
 * If you need more granular control over which fields use this method,
 * you can use `useNativeValidity` instead for each input.
 */
export const useNativeValidityForForm = (scope: FormScope<any>) => {
  useEffect(() => {
    let abortController: AbortController | undefined;

    const unsubscribe = scope.__store__.store.subscribe((state, prevState) => {
      // Clean up any previously applied event listeners
      abortController?.abort();

      // New abort controller for each run of `subscribe`
      abortController = new AbortController();
      const signal = abortController.signal;

      const currentErrors = state.validationErrors;
      const prevErrors = prevState.validationErrors;

      const getElements = (field: string) => {
        const allRefs = [
          ...scope.__store__.transientFieldRefs.getRefs(field),
          ...scope.__store__.controlledFieldRefs.getRefs(field),
        ];

        if (allRefs.length > 0) {
          const registeredFormControls = sortByPosition(
            allRefs.filter(isFormControl),
          );
          return registeredFormControls;
        }

        const formElement = scope.__store__.formRef.current;
        if (!formElement) return [];

        const unregisteredFormControls = sortByPosition(
          getElementsWithNames([field], formElement),
        );
        return unregisteredFormControls;
      };

      Object.keys(currentErrors).forEach((field) => {
        getElements(field).forEach((element) => {
          element.setCustomValidity(currentErrors[field]);
          if (element === document.activeElement) {
            element.reportValidity();
          }
          element.addEventListener("focus", () => element.reportValidity(), {
            signal,
          });
        });
      });

      Object.keys(prevErrors)
        .filter((key) => !currentErrors[key])
        .forEach((field) => {
          getElements(field).forEach((element) =>
            element.setCustomValidity(""),
          );
        });
    });

    return () => {
      unsubscribe();
      abortController?.abort();
    };
  }, [scope]);
};
