import React, {
  ComponentProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Form as RemixForm,
  useActionData,
  useFetcher,
  useFormAction,
  useTransition,
} from "@remix-run/react";
import { omit, mergeRefs, validationErrorToFieldErrors } from "./util";
import type * as yup from "yup";
import { ValidationError } from "yup";
import { FormContext, FormContextValue } from "./formContext";
import invariant from "tiny-invariant";

export type FormProps<T> = {
  validationSchema: yup.SchemaOf<T>;
  onSubmit?: (
    data: yup.InferType<yup.SchemaOf<T>>,
    event: React.FormEvent<HTMLFormElement>
  ) => void;
  fetcher?: ReturnType<typeof useFetcher>;
  defaultValues?: Partial<T>;
  formRef?: React.RefObject<HTMLFormElement>;
} & Omit<ComponentProps<typeof RemixForm>, "onSubmit">;

const formDataObject = (formElement: HTMLFormElement) =>
  Object.fromEntries(new FormData(formElement));

const useFieldErrors = (
  fetcher?: ReturnType<typeof useFetcher>
): [
  Record<string, yup.ValidationError>,
  React.Dispatch<React.SetStateAction<Record<string, yup.ValidationError>>>
] => {
  const actionData = useActionData<any>();
  const dataToUse = fetcher ? fetcher.data : actionData;
  const fieldErrorsFromAction = dataToUse?.fieldErrors;

  const [fieldErrors, setFieldErrors] = useState<
    FormContextValue["fieldErrors"]
  >(fieldErrorsFromAction ?? {});
  useEffect(() => {
    if (fieldErrorsFromAction) setFieldErrors(fieldErrorsFromAction);
  }, [fieldErrorsFromAction]);

  return [fieldErrors, setFieldErrors];
};

const useIsSubmitting = (
  action?: string,
  fetcher?: ReturnType<typeof useFetcher>
) => {
  const actionForCurrentPage = useFormAction();
  const pendingFormSubmit = useTransition().submission;
  const isSubmitting =
    fetcher?.state === "submitting" ||
    (pendingFormSubmit &&
      pendingFormSubmit.action.endsWith(action ?? actionForCurrentPage));

  return isSubmitting;
};

export function ValidatedForm<T>({
  validationSchema,
  onSubmit,
  children,
  fetcher,
  action,
  defaultValues,
  formRef: formRefProp,
  ...rest
}: FormProps<T>) {
  const [fieldErrors, setFieldErrors] = useFieldErrors(fetcher);
  const isSubmitting = useIsSubmitting(action, fetcher);

  const formRef = useRef<HTMLFormElement>(null);

  const contextValue = useMemo<FormContextValue>(
    () => ({
      insideFormContext: true,
      fieldErrors,
      action,
      defaultValues,
      isSubmitting: isSubmitting ?? false,
      clearError: (fieldName) => {
        setFieldErrors((prev) => omit(prev, fieldName));
      },
      validateField: (fieldName) => {
        invariant(formRef.current, "Cannot find reference to form");
        const data = formDataObject(formRef.current);
        try {
          validationSchema.validateSyncAt(fieldName, data);
        } catch (err) {
          if (err instanceof ValidationError) {
            const error = err;
            setFieldErrors((prev) => ({
              ...prev,
              [fieldName]: error,
            }));
          }
        }
      },
    }),
    [
      fieldErrors,
      action,
      defaultValues,
      isSubmitting,
      setFieldErrors,
      validationSchema,
    ]
  );

  const Form = fetcher?.Form ?? RemixForm;

  return (
    <Form
      ref={mergeRefs([formRef, formRefProp])}
      {...rest}
      action={action}
      onSubmit={(event) => {
        const data = formDataObject(event.currentTarget);
        try {
          const validated = validationSchema.validateSync(data, {
            abortEarly: false,
          });
          onSubmit?.(validated, event);
        } catch (err) {
          event.preventDefault();
          if (err instanceof ValidationError) {
            setFieldErrors(validationErrorToFieldErrors(err));
          }
        }
      }}
    >
      <FormContext.Provider value={contextValue}>
        {children}
      </FormContext.Provider>
    </Form>
  );
}
