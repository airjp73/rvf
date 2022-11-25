import {
  FetcherWithComponents,
  Form as RemixForm,
  FormMethod,
  useFetcher,
  useSubmit,
} from "@remix-run/react";
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
import * as R from "remeda";
import { useIsSubmitting, useIsValid } from "./hooks";
import { FORM_ID_FIELD } from "./internal/constants";
import {
  InternalFormContext,
  InternalFormContextValue,
} from "./internal/formContext";
import {
  useDefaultValuesFromLoader,
  useErrorResponseForForm,
  useHasActiveFormSubmit,
  useSetFieldErrors,
} from "./internal/hooks";
import { MultiValueMap, useMultiValueMap } from "./internal/MultiValueMap";
import {
  SyncedFormProps,
  useRootFormStore,
} from "./internal/state/createFormStore";
import { useFormStore } from "./internal/state/storeHooks";
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
  fetcher?: FetcherWithComponents<any>;
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
      if (input instanceof HTMLElement && "name" in input)
        return (input as any).name;
      return null;
    })
    .filter(nonNull)
    .filter((name) => name in fieldErrors);
  const uniqueNamesInOrder = R.uniq(namesInOrder);

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

    if (elem instanceof HTMLElement) {
      if (elem instanceof HTMLInputElement && elem.type === "hidden") {
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

type HTMLSubmitEvent = React.BaseSyntheticEvent<
  SubmitEvent,
  Event,
  HTMLFormElement
>;

type HTMLFormSubmitter = HTMLButtonElement | HTMLInputElement;

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
  const setFieldErrors = useSetFieldErrors(formId);
  const setFieldError = useFormStore(formId, (state) => state.setFieldError);
  const reset = useFormStore(formId, (state) => state.reset);
  const startSubmit = useFormStore(formId, (state) => state.startSubmit);
  const endSubmit = useFormStore(formId, (state) => state.endSubmit);
  const syncFormProps = useFormStore(formId, (state) => state.syncFormProps);
  const setFormElementInState = useFormStore(
    formId,
    (state) => state.setFormElement
  );
  const cleanupForm = useRootFormStore((state) => state.cleanupForm);
  const registerForm = useRootFormStore((state) => state.registerForm);

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

  // TODO: all these hooks running at startup cause extra, unnecessary renders
  // There must be a nice way to avoid this.
  useLayoutEffect(() => {
    registerForm(formId);
    return () => cleanupForm(formId);
  }, [cleanupForm, formId, registerForm]);

  useLayoutEffect(() => {
    syncFormProps({
      action,
      defaultValues: providedDefaultValues ?? backendDefaultValues ?? {},
      subaction,
      registerReceiveFocus,
      validator,
    });
  }, [
    action,
    providedDefaultValues,
    registerReceiveFocus,
    subaction,
    syncFormProps,
    backendDefaultValues,
    validator,
  ]);

  useLayoutEffect(() => {
    setFormElementInState(formRef.current);
  }, [setFormElementInState]);

  useEffect(() => {
    setFieldErrors(backendError?.fieldErrors ?? {});
  }, [backendError?.fieldErrors, setFieldErrors, setFieldError]);

  useSubmitComplete(hasActiveSubmission, () => {
    endSubmit();
  });

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
    target: typeof e.currentTarget,
    nativeEvent: HTMLSubmitEvent["nativeEvent"]
  ) => {
    startSubmit();
    const submitter = nativeEvent.submitter as HTMLFormSubmitter | null;
    const formDataToValidate = getDataFromForm(e.currentTarget);
    if (submitter?.name) {
      formDataToValidate.append(submitter.name, submitter.value);
    }

    const result = await validator.validate(formDataToValidate);
    if (result.error) {
      setFieldErrors(result.error.fieldErrors);
      endSubmit();
      if (!disableFocusOnError) {
        focusFirstInvalidInput(
          result.error.fieldErrors,
          customFocusHandlers(),
          formRef.current!
        );
      }
    } else {
      setFieldErrors({});
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
      if (fetcher) fetcher.submit(submitter || e.currentTarget);
      else
        submit(submitter || target, {
          replace,
          method: (submitter?.formMethod as FormMethod) || method,
        });
    }
  };

  return (
    <Form
      ref={mergeRefs([formRef, formRefProp])}
      {...rest}
      id={id}
      action={action}
      method={method}
      replace={replace}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(
          e,
          e.currentTarget,
          (e as unknown as HTMLSubmitEvent).nativeEvent
        );
      }}
      onReset={(event) => {
        onReset?.(event);
        if (event.defaultPrevented) return;
        reset();
      }}
    >
      <InternalFormContext.Provider value={contextValue}>
        <>
          <FormResetter formRef={formRef} resetAfterSubmit={resetAfterSubmit} />
          {subaction && (
            <input type="hidden" value={subaction} name="subaction" />
          )}
          {id && <input type="hidden" value={id} name={FORM_ID_FIELD} />}
          {children}
        </>
      </InternalFormContext.Provider>
    </Form>
  );
}
