import {
  Form as RemixForm,
  useActionData,
  useFetcher,
  useFormAction,
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
import { omit, mergeRefs } from "./internal/util";
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
  onSubmit?: (data: DataType, event: React.FormEvent<HTMLFormElement>) => void;
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
} & Omit<ComponentProps<typeof RemixForm>, "onSubmit">;

function useFieldErrors(
  fetcher?: ReturnType<typeof useFetcher>
): [FieldErrors, React.Dispatch<React.SetStateAction<FieldErrors>>] {
  const actionData = useActionData<any>();
  const dataToUse = fetcher ? fetcher.data : actionData;
  const fieldErrorsFromAction = dataToUse?.fieldErrors;

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(
    fieldErrorsFromAction ?? {}
  );
  useEffect(() => {
    if (fieldErrorsFromAction) setFieldErrors(fieldErrorsFromAction);
  }, [fieldErrorsFromAction]);

  return [fieldErrors, setFieldErrors];
}

const useIsSubmitting = (
  action?: string,
  fetcher?: ReturnType<typeof useFetcher>
) => {
  const actionForCurrentPage = useFormAction();
  const pendingFormSubmit = useTransition().submission;
  return fetcher
    ? fetcher.state === "submitting"
    : pendingFormSubmit &&
        pendingFormSubmit.action === (action ?? actionForCurrentPage);
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
function useDefaultValues<DataType>(defaultValues?: Partial<DataType>) {
  const actionData = useActionData();
  const defaultsFromValidationError = actionData?.fieldErrors?._submittedData;
  return defaultsFromValidationError ?? defaultValues;
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
  defaultValues,
  formRef: formRefProp,
  onReset,
  ...rest
}: FormProps<DataType>) {
  const [fieldErrors, setFieldErrors] = useFieldErrors(fetcher);
  const isSubmitting = useIsSubmitting(action, fetcher);
  const defaultsToUse = useDefaultValues(defaultValues);

  const formRef = useRef<HTMLFormElement>(null);

  const contextValue = useMemo<FormContextValue>(
    () => ({
      fieldErrors,
      action,
      defaultValues: defaultsToUse,
      isSubmitting: isSubmitting ?? false,
      clearError: (fieldName) => {
        setFieldErrors((prev) => omit(prev, fieldName));
      },
      validateField: (fieldName) => {
        invariant(formRef.current, "Cannot find reference to form");
        const { error } = validator.validateField(
          getDataFromForm(formRef.current),
          fieldName as any
        );
        if (error) {
          setFieldErrors((prev) => ({
            ...prev,
            [fieldName]: error,
          }));
        }
      },
    }),
    [
      fieldErrors,
      action,
      defaultsToUse,
      isSubmitting,
      setFieldErrors,
      validator,
    ]
  );

  const Form = fetcher?.Form ?? RemixForm;

  return (
    <Form
      ref={mergeRefs([formRef, formRefProp])}
      {...rest}
      action={action}
      onSubmit={(event) => {
        const result = validator.validate(getDataFromForm(event.currentTarget));
        if (result.error) {
          event.preventDefault();
          setFieldErrors(result.error);
        } else {
          onSubmit?.(result.data, event);
        }
      }}
      onReset={(event) => {
        onReset?.(event);
        if (event.defaultPrevented) return;
        setFieldErrors({});
      }}
    >
      <FormContext.Provider value={contextValue}>
        {children}
      </FormContext.Provider>
    </Form>
  );
}
