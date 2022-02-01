import {
  Form as RemixForm,
  useActionData,
  useFetcher,
  useFormAction,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import React, {
  ComponentProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import invariant from "tiny-invariant";
import { FormContext, FormContextValue } from "./internal/formContext";
import { MultiValueMap, useMultiValueMap } from "./internal/MultiValueMap";
import { useSubmitComplete } from "./internal/submissionCallbacks";
import { omit, mergeRefs } from "./internal/util";
import {
  FieldErrors,
  Validator,
  FieldErrorsWithData,
  TouchedFields,
} from "./validation/types";

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

function useFieldErrorsFromBackend(
  fetcher?: ReturnType<typeof useFetcher>,
  subaction?: string
): FieldErrorsWithData | null {
  const actionData = useActionData<any>();
  if (fetcher) return (fetcher.data as any)?.fieldErrors;
  if (!actionData) return null;
  if (actionData.fieldErrors) {
    const submittedData = actionData.fieldErrors?._submittedData;
    const subactionsMatch = subaction
      ? subaction === submittedData?.subaction
      : !submittedData?.subaction;
    return subactionsMatch ? actionData.fieldErrors : null;
  }
  return null;
}

function useFieldErrors(
  fieldErrorsFromBackend?: any
): [FieldErrors, React.Dispatch<React.SetStateAction<FieldErrors>>] {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(
    fieldErrorsFromBackend ?? {}
  );
  useEffect(() => {
    if (fieldErrorsFromBackend) setFieldErrors(fieldErrorsFromBackend);
  }, [fieldErrorsFromBackend]);

  return [fieldErrors, setFieldErrors];
}

const useIsSubmitting = (
  action?: string,
  subaction?: string,
  fetcher?: ReturnType<typeof useFetcher>
) => {
  const actionForCurrentPage = useFormAction();
  const pendingFormSubmit = useTransition().submission;

  if (fetcher) return fetcher.state === "submitting";
  if (!pendingFormSubmit) return false;

  const { formData, action: pendingAction } = pendingFormSubmit;
  const pendingSubAction = formData.get("subaction");
  const expectedAction = action ?? actionForCurrentPage;
  if (subaction)
    return expectedAction === pendingAction && subaction === pendingSubAction;
  return expectedAction === pendingAction && !pendingSubAction;
};

const getDataFromForm = (el: HTMLFormElement) => new FormData(el);

/**
 * The purpose for this logic is to handle validation errors when javascript is disabled.
 * Normally (without js), when a form is submitted and the action returns the validation errors,
 * the form will be reset. The errors will be displayed on the correct fields,
 * but all the values in the form will be gone. This is not good UX.
 *
 * To get around this, we return the submitted form data from the server,
 * and use those to populate the form via `defaultValues`.
 * This results in a more seamless UX akin to what you would see when js is enabled.
 *
 * One potential downside is that resetting the form will reset the form
 * to the _new_ default values that were returned from the server with the validation errors.
 * However, this case is less of a problem than the janky UX caused by losing the form values.
 * It will only ever be a problem if the form includes a `<button type="reset" />`
 * and only if JS is disabled.
 */
function useDefaultValues<DataType>(
  fieldErrors?: FieldErrorsWithData | null,
  defaultValues?: Partial<DataType>
) {
  const defaultsFromValidationError = fieldErrors?._submittedData;
  return defaultsFromValidationError ?? defaultValues;
}

const focusFirstInvalidInput = (
  fieldErrors: FieldErrors,
  customFocusHandlers: MultiValueMap<string, () => void>,
  formElement: HTMLFormElement
) => {
  const invalidInputSelector = Object.keys(fieldErrors)
    .map((fieldName) => `input[name="${fieldName}"]`)
    .join(",");
  const invalidInputs = formElement.querySelectorAll(invalidInputSelector);
  for (const element of invalidInputs) {
    const input = element as HTMLInputElement;

    if (customFocusHandlers.has(input.name)) {
      customFocusHandlers.getAll(input.name).forEach((handler) => {
        handler();
      });
      break;
    }

    // We don't filter these out ahead of time because
    // they could have a custom focus handler
    if (input.type === "hidden") {
      continue;
    }

    input.focus();
    break;
  }
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
  defaultValues,
  formRef: formRefProp,
  onReset,
  subaction,
  resetAfterSubmit,
  disableFocusOnError,
  ...rest
}: FormProps<DataType>) {
  const fieldErrorsFromBackend = useFieldErrorsFromBackend(fetcher, subaction);
  const [fieldErrors, setFieldErrors] = useFieldErrors(fieldErrorsFromBackend);
  const isSubmitting = useIsSubmitting(action, subaction, fetcher);
  const defaultsToUse = useDefaultValues(fieldErrorsFromBackend, defaultValues);
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  useSubmitComplete(isSubmitting, () => {
    if (!fieldErrorsFromBackend && resetAfterSubmit) {
      formRef.current?.reset();
    }
  });
  const customFocusHandlers = useMultiValueMap<string, () => void>();

  const contextValue = useMemo<FormContextValue>(
    () => ({
      fieldErrors,
      action,
      defaultValues: defaultsToUse,
      isSubmitting: isSubmitting ?? false,
      validationState:
        Object.keys(fieldErrors).length === 0 ? "valid" : "invalid",
      touchedFields,
      setFieldTouched: (fieldName: string, touched: boolean) =>
        setTouchedFields((prev) => ({
          ...prev,
          [fieldName]: touched,
        })),
      clearError: (fieldName) => {
        setFieldErrors((prev) => omit(prev, fieldName));
      },
      validateField: async (fieldName) => {
        invariant(formRef.current, "Cannot find reference to form");
        const { error } = await validator.validateField(
          getDataFromForm(formRef.current),
          fieldName as any
        );

        // By checking and returning `prev` here, we can avoid a re-render
        // if the validation state is the same.
        if (error) {
          setFieldErrors((prev) => {
            if (prev[fieldName] === error) return prev;
            return {
              ...prev,
              [fieldName]: error,
            };
          });
        } else {
          setFieldErrors((prev) => {
            if (!(fieldName in prev)) return prev;
            return omit(prev, fieldName);
          });
        }
      },
      registerReceiveFocus: (fieldName, handler) => {
        customFocusHandlers().add(fieldName, handler);
        return () => {
          customFocusHandlers().remove(fieldName, handler);
        };
      },
      hasBeenSubmitted,
    }),
    [
      fieldErrors,
      action,
      defaultsToUse,
      isSubmitting,
      touchedFields,
      hasBeenSubmitted,
      setFieldErrors,
      validator,
      customFocusHandlers,
    ]
  );

  const Form = fetcher?.Form ?? RemixForm;

  let clickedButtonRef = React.useRef<any>();
  useEffect(() => {
    let form = formRef.current;
    if (!form) return;

    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof HTMLElement)) return;
      let submitButton = event.target.closest<
        HTMLButtonElement | HTMLInputElement
      >("button,input[type=submit]");

      if (submitButton && submitButton.type === "submit") {
        clickedButtonRef.current = submitButton;
      }
    }

    form.addEventListener("click", handleClick);
    return () => {
      form && form.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <Form
      ref={mergeRefs([formRef, formRefProp])}
      {...rest}
      action={action}
      onSubmit={async (e) => {
        e.preventDefault();
        setHasBeenSubmitted(true);
        const result = await validator.validate(
          getDataFromForm(e.currentTarget)
        );
        if (result.error) {
          setFieldErrors(result.error);
          if (!disableFocusOnError) {
            focusFirstInvalidInput(
              result.error,
              customFocusHandlers(),
              formRef.current!
            );
          }
        } else {
          onSubmit && onSubmit(result.data, e);
          if (fetcher)
            fetcher.submit(clickedButtonRef.current || e.currentTarget);
          else submit(clickedButtonRef.current || e.currentTarget);
          clickedButtonRef.current = null;
        }
      }}
      onReset={(event) => {
        onReset?.(event);
        if (event.defaultPrevented) return;
        setFieldErrors({});
        setTouchedFields({});
        setHasBeenSubmitted(false);
      }}
    >
      <FormContext.Provider value={contextValue}>
        {subaction && (
          <input type="hidden" value={subaction} name="subaction" />
        )}
        {children}
      </FormContext.Provider>
    </Form>
  );
}
