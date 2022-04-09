import { Form as RemixForm, useFetcher, useSubmit } from "@remix-run/react";
import { useAtomCallback } from "jotai/utils";
import uniq from "lodash/uniq";
import React, {
  ComponentProps,
  FormEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import invariant from "tiny-invariant";
import { useIsSubmitting, useIsValid } from "./hooks";
import { FORM_ID_FIELD } from "./internal/constants";
import {
  InternalFormContext,
  InternalFormContextValue,
} from "./internal/formContext";
import {
  useDefaultValuesFromLoader,
  useErrorResponseForForm,
  useFormUpdateAtom,
  useHasActiveFormSubmit,
} from "./internal/hooks";
import { MultiValueMap, useMultiValueMap } from "./internal/MultiValueMap";
import { resetAtom } from "./internal/reset";
import {
  cleanupFormState,
  endSubmitAtom,
  fieldErrorsAtom,
  formElementAtom,
  formPropsAtom,
  isHydratedAtom,
  setFieldErrorAtom,
  startSubmitAtom,
  SyncedFormProps,
} from "./internal/state";
import { useAwaitValue } from "./internal/state/controlledFields";
import { useSubmitComplete } from "./internal/submissionCallbacks";
import {
  mergeRefs,
  useDeepEqualsMemo,
  useIsomorphicLayoutEffect as useLayoutEffect,
} from "./internal/util";
import { FieldErrors, Validator } from "./validation/types";

export type FormProps<DataType> = {
  /**
   * A `Validator` object that describes how to validate the form.
   */
  validator: Validator<DataType>;
  /**
   * A submit callback that gets called when the form is submitted
   * after all validations have been run.
   */
  onSubmit?: (
    data: DataType,
    event: React.FormEvent<HTMLFormElement>
  ) => void | Promise<void>;
  /**
   * Allows you to provide a `fetcher` from remix's `useFetcher` hook.
   * The form will use the fetcher for loading states, action data, etc
   * instead of the default form action.
   */
  fetcher?: ReturnType<typeof useFetcher>;
  /**
   * Accepts an object of default values for the form
   * that will automatically be propagated to the form fields via `useField`.
   */
  defaultValues?: Partial<DataType>;
  /**
   * A ref to the form element.
   */
  formRef?: React.RefObject<HTMLFormElement>;
  /**
   * An optional sub-action to use for the form.
   * Setting a value here will cause the form to be submitted with an extra `subaction` value.
   * This can be useful when there are multiple forms on the screen handled by the same action.
   */
  subaction?: string;
  /**
   * Reset the form to the default values after the form has been successfully submitted.
   * This is useful if you want to submit the same form multiple times,
   * and don't redirect in-between submissions.
   */
  resetAfterSubmit?: boolean;
  /**
   * Normally, the first invalid input will be focused when the validation fails on form submit.
   * Set this to `false` to disable this behavior.
   */
  disableFocusOnError?: boolean;
} & Omit<ComponentProps<typeof RemixForm>, "onSubmit">;

const getDataFromForm = (el: HTMLFormElement) => new FormData(el);

function nonNull<T>(value: T | null | undefined): value is T {
  return value !== null;
}

const focusFirstInvalidInput = (
  fieldErrors: FieldErrors,
  customFocusHandlers: MultiValueMap<string, () => void>,
  formElement: HTMLFormElement
) => {
  const namesInOrder = [...formElement.elements]
    .map((el) => {
      const input = el instanceof RadioNodeList ? el[0] : el;
      if (input instanceof HTMLInputElement) return input.name;
      return null;
    })
    .filter(nonNull)
    .filter((name) => name in fieldErrors);
  const uniqueNamesInOrder = uniq(namesInOrder);

  for (const fieldName of uniqueNamesInOrder) {
    if (customFocusHandlers.has(fieldName)) {
      customFocusHandlers.getAll(fieldName).forEach((handler) => {
        handler();
      });
      break;
    }

    const elem = formElement.elements.namedItem(fieldName);
    if (!elem) continue;

    if (elem instanceof RadioNodeList) {
      const selectedRadio =
        [...elem]
          .filter(
            (item): item is HTMLInputElement => item instanceof HTMLInputElement
          )
          .find((item) => item.value === elem.value) ?? elem[0];
      if (selectedRadio && selectedRadio instanceof HTMLInputElement) {
        selectedRadio.focus();
        break;
      }
    }

    if (elem instanceof HTMLInputElement) {
      if (elem.type === "hidden") {
        continue;
      }

      elem.focus();
      break;
    }
  }
};

const useFormId = (providedId?: string): string | symbol => {
  // We can use a `Symbol` here because we only use it after hydration
  const [symbolId] = useState(() => Symbol("remix-validated-form-id"));
  return providedId ?? symbolId;
};

/**
 * Use a component to access the state so we don't cause
 * any extra rerenders of the whole form.
 */
const FormResetter = ({
  resetAfterSubmit,
  formRef,
}: {
  resetAfterSubmit: boolean;
  formRef: RefObject<HTMLFormElement>;
}) => {
  const isSubmitting = useIsSubmitting();
  const isValid = useIsValid();
  useSubmitComplete(isSubmitting, () => {
    if (isValid && resetAfterSubmit) {
      formRef.current?.reset();
    }
  });
  return null;
};

function formEventProxy<T extends object>(event: T): T {
  let defaultPrevented = false;
  return new Proxy(event, {
    get: (target, prop) => {
      if (prop === "preventDefault") {
        return () => {
          defaultPrevented = true;
        };
      }

      if (prop === "defaultPrevented") {
        return defaultPrevented;
      }

      return target[prop as keyof T];
    },
  }) as T;
}

/**
 * The primary form component of `remix-validated-form`.
 */
export function ValidatedForm<DataType>({
  validator,
  onSubmit,
  children,
  fetcher,
  action,
  defaultValues: unMemoizedDefaults,
  formRef: formRefProp,
  onReset,
  subaction,
  resetAfterSubmit = false,
  disableFocusOnError,
  method,
  replace,
  id,
  ...rest
}: FormProps<DataType>) {
  const formId = useFormId(id);
  const providedDefaultValues = useDeepEqualsMemo(unMemoizedDefaults);
  const contextValue = useMemo<InternalFormContextValue>(
    () => ({
      formId,
      action,
      subaction,
      defaultValuesProp: providedDefaultValues,
      fetcher,
    }),
    [action, fetcher, formId, providedDefaultValues, subaction]
  );
  const backendError = useErrorResponseForForm(contextValue);
  const backendDefaultValues = useDefaultValuesFromLoader(contextValue);
  const hasActiveSubmission = useHasActiveFormSubmit(contextValue);
  const formRef = useRef<HTMLFormElement>(null);
  const Form = fetcher?.Form ?? RemixForm;

  const submit = useSubmit();
  const setFieldErrors = useFormUpdateAtom(fieldErrorsAtom(formId));
  const setFieldError = useFormUpdateAtom(setFieldErrorAtom(formId));
  const reset = useFormUpdateAtom(resetAtom(formId));
  const startSubmit = useFormUpdateAtom(startSubmitAtom(formId));
  const endSubmit = useFormUpdateAtom(endSubmitAtom(formId));
  const syncFormProps = useFormUpdateAtom(formPropsAtom(formId));
  const setHydrated = useFormUpdateAtom(isHydratedAtom(formId));
  const setFormElementInState = useFormUpdateAtom(formElementAtom(formId));

  useEffect(() => {
    setHydrated(true);
    return () => cleanupFormState(formId);
  }, [formId, setHydrated]);

  const awaitValue = useAwaitValue(formId);
  const validateField: SyncedFormProps["validateField"] = useCallback(
    async (field) => {
      invariant(formRef.current, "Cannot find reference to form");
      await awaitValue(field);
      const { error } = await validator.validateField(
        getDataFromForm(formRef.current),
        field
      );

      if (error) {
        setFieldError({ field, error });
        return error;
      } else {
        setFieldError({ field, error: undefined });
        return null;
      }
    },
    [awaitValue, setFieldError, validator]
  );

  const customFocusHandlers = useMultiValueMap<string, () => void>();
  const registerReceiveFocus: SyncedFormProps["registerReceiveFocus"] =
    useCallback(
      (fieldName, handler) => {
        customFocusHandlers().add(fieldName, handler);
        return () => {
          customFocusHandlers().remove(fieldName, handler);
        };
      },
      [customFocusHandlers]
    );

  useLayoutEffect(() => {
    syncFormProps({
      action,
      defaultValues: providedDefaultValues ?? backendDefaultValues ?? {},
      subaction,
      validateField,
      registerReceiveFocus,
    });
  }, [
    action,
    providedDefaultValues,
    registerReceiveFocus,
    subaction,
    syncFormProps,
    validateField,
    backendDefaultValues,
  ]);

  useEffect(() => {
    setFieldErrors(backendError?.fieldErrors ?? {});
  }, [backendError?.fieldErrors, setFieldErrors, setFieldError]);

  useSubmitComplete(hasActiveSubmission, () => {
    endSubmit();
  });

  let clickedButtonRef = React.useRef<any>();
  useEffect(() => {
    let form = formRef.current;
    if (!form) return;

    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof HTMLElement)) return;
      let submitButton = event.target.closest<
        HTMLButtonElement | HTMLInputElement
      >("button,input[type=submit]");

      if (
        submitButton &&
        submitButton.form === form &&
        submitButton.type === "submit"
      ) {
        clickedButtonRef.current = submitButton;
      }
    }

    window.addEventListener("click", handleClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    startSubmit();
    const result = await validator.validate(getDataFromForm(e.currentTarget));
    if (result.error) {
      endSubmit();
      setFieldErrors(result.error.fieldErrors);
      if (!disableFocusOnError) {
        focusFirstInvalidInput(
          result.error.fieldErrors,
          customFocusHandlers(),
          formRef.current!
        );
      }
    } else {
      const eventProxy = formEventProxy(e);
      await onSubmit?.(result.data, eventProxy);
      if (eventProxy.defaultPrevented) {
        endSubmit();
        return;
      }

      // We deviate from the remix code here a bit because of our async submit.
      // In remix's `FormImpl`, they use `event.currentTarget` to get the form,
      // but we already have the form in `formRef.current` so we can just use that.
      // If we use `event.currentTarget` here, it will break because `currentTarget`
      // will have changed since the start of the submission.
      if (fetcher) fetcher.submit(clickedButtonRef.current || formRef.current);
      else
        submit(clickedButtonRef.current || formRef.current, {
          method,
          replace,
        });

      clickedButtonRef.current = null;
    }
  };

  return (
    <Form
      ref={mergeRefs([formRef, formRefProp, setFormElementInState])}
      {...rest}
      id={id}
      action={action}
      method={method}
      replace={replace}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
      onReset={(event) => {
        onReset?.(event);
        if (event.defaultPrevented) return;
        reset();
      }}
    >
      <InternalFormContext.Provider value={contextValue}>
        <FormResetter formRef={formRef} resetAfterSubmit={resetAfterSubmit} />
        {subaction && (
          <input type="hidden" value={subaction} name="subaction" />
        )}
        {id && <input type="hidden" value={id} name={FORM_ID_FIELD} />}
        {children}
      </InternalFormContext.Provider>
    </Form>
  );
}
