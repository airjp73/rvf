import { Form as RemixForm, useFetcher, useSubmit } from "@remix-run/react";
import uniq from "lodash/uniq";
import React, {
  ComponentProps,
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
import {
  addErrorAtom,
  clearErrorAtom,
  endSubmitAtom,
  formRegistry,
  FormState,
  resetAtom,
  setFieldErrorsAtom,
  startSubmitAtom,
  syncFormContextAtom,
} from "./internal/state";
import { useSubmitComplete } from "./internal/submissionCallbacks";
import {
  mergeRefs,
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
  ) => Promise<void>;
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

/**
 * The primary form component of `remix-validated-form`.
 */
export function ValidatedForm<DataType>({
  validator,
  onSubmit,
  children,
  fetcher,
  action,
  defaultValues: providedDefaultValues,
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
  const formAtom = formRegistry(formId);
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
  const clearError = useFormUpdateAtom(clearErrorAtom);
  const addError = useFormUpdateAtom(addErrorAtom);
  const setFieldErrors = useFormUpdateAtom(setFieldErrorsAtom);
  const reset = useFormUpdateAtom(resetAtom);
  const startSubmit = useFormUpdateAtom(startSubmitAtom);
  const endSubmit = useFormUpdateAtom(endSubmitAtom);
  const syncFormContext = useFormUpdateAtom(syncFormContextAtom);

  const validateField: FormState["validateField"] = useCallback(
    async (fieldName) => {
      invariant(formRef.current, "Cannot find reference to form");
      const { error } = await validator.validateField(
        getDataFromForm(formRef.current),
        fieldName as any
      );

      if (error) {
        addError({ formAtom, name: fieldName, error });
        return error;
      } else {
        clearError({ name: fieldName, formAtom });
        return null;
      }
    },
    [addError, clearError, formAtom, validator]
  );

  const customFocusHandlers = useMultiValueMap<string, () => void>();
  const registerReceiveFocus: FormState["registerReceiveFocus"] = useCallback(
    (fieldName, handler) => {
      customFocusHandlers().add(fieldName, handler);
      return () => {
        customFocusHandlers().remove(fieldName, handler);
      };
    },
    [customFocusHandlers]
  );

  useLayoutEffect(() => {
    syncFormContext({
      formAtom,
      action,
      defaultValues: providedDefaultValues ?? backendDefaultValues,
      subaction,
      validateField,
      registerReceiveFocus,
    });
  }, [
    action,
    formAtom,
    providedDefaultValues,
    registerReceiveFocus,
    subaction,
    syncFormContext,
    validateField,
    backendDefaultValues,
  ]);

  useEffect(() => {
    setFieldErrors({
      fieldErrors: backendError?.fieldErrors ?? {},
      formAtom,
    });
  }, [backendError?.fieldErrors, formAtom, setFieldErrors]);

  useSubmitComplete(hasActiveSubmission, () => {
    endSubmit({ formAtom });
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

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <Form
      ref={mergeRefs([formRef, formRefProp])}
      {...rest}
      id={id}
      action={action}
      method={method}
      replace={replace}
      onSubmit={async (e) => {
        e.preventDefault();
        startSubmit({ formAtom });
        const result = await validator.validate(
          getDataFromForm(e.currentTarget)
        );
        if (result.error) {
          endSubmit({ formAtom });
          setFieldErrors({ fieldErrors: result.error.fieldErrors, formAtom });
          if (!disableFocusOnError) {
            focusFirstInvalidInput(
              result.error.fieldErrors,
              customFocusHandlers(),
              formRef.current!
            );
          }
        } else {
          onSubmit && onSubmit(result.data, e);
          if (fetcher)
            fetcher.submit(clickedButtonRef.current || e.currentTarget);
          else
            submit(clickedButtonRef.current || e.currentTarget, {
              method,
              replace,
            });
          clickedButtonRef.current = null;
        }
      }}
      onReset={(event) => {
        onReset?.(event);
        if (event.defaultPrevented) return;
        reset({ formAtom });
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
