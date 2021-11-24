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
import { omit, mergeRefs } from "./internal/util";
import { FormContext, FormContextValue } from "./internal/formContext";
import invariant from "tiny-invariant";
import { FieldErrors, Validator } from "./validation/types";

export type FormProps<DataType> = {
  validator: Validator<DataType>;
  onSubmit?: (data: DataType, event: React.FormEvent<HTMLFormElement>) => void;
  fetcher?: ReturnType<typeof useFetcher>;
  defaultValues?: Partial<DataType>;
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
  if (fetcher) console.log(fetcher);
  return fetcher
    ? fetcher.state === "submitting"
    : pendingFormSubmit &&
        pendingFormSubmit.action.endsWith(action ?? actionForCurrentPage);
};

export function ValidatedForm<DataType>({
  validator,
  onSubmit,
  children,
  fetcher,
  action,
  defaultValues,
  formRef: formRefProp,
  ...rest
}: FormProps<DataType>) {
  const [fieldErrors, setFieldErrors] = useFieldErrors(fetcher);
  const isSubmitting = useIsSubmitting(action, fetcher);

  const formRef = useRef<HTMLFormElement>(null);

  const contextValue = useMemo<FormContextValue>(
    () => ({
      fieldErrors,
      action,
      defaultValues,
      isSubmitting: isSubmitting ?? false,
      clearError: (fieldName) => {
        setFieldErrors((prev) => omit(prev, fieldName));
      },
      validateField: (fieldName) => {
        invariant(formRef.current, "Cannot find reference to form");
        const { error } = validator.validateField(
          new FormData(formRef.current),
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
      defaultValues,
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
        const result = validator.validateAll(new FormData(event.currentTarget));
        if (result.error) {
          event.preventDefault();
          setFieldErrors(result.error);
        } else {
          onSubmit?.(result.data, event);
        }
      }}
    >
      <FormContext.Provider value={contextValue}>
        {children}
      </FormContext.Provider>
    </Form>
  );
}
