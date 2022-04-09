import { json } from '@remix-run/server-runtime';

import {
  FORM_DEFAULTS_FIELD,
  formDefaultValuesKey,
} from './internal/constants';
import {
  ValidationErrorResponseData,
  ValidatorError,
} from './validation/types';

/**
 * Takes the errors from a `Validator` and returns a `Response`.
 * When you return this from your action, `ValidatedForm` on the frontend will automatically
 * display the errors on the correct fields on the correct form.
 *
 * You can also provide a second argument to `validationError`
 * to specify how to repopulate the form when JS is disabled.
 *
 * @example
 * ```ts
 * const result = validator.validate(await request.formData());
 * if (result.error) return validationError(result.error, result.submittedData);
 * ```
 */
export function validationError(
  error: ValidatorError,
  repopulateFields?: unknown,
  init?: ResponseInit
): Response {
  return json<ValidationErrorResponseData>(
    {
      fieldErrors: error.fieldErrors,
      subaction: error.subaction,
      repopulateFields,
      formId: error.formId,
    },
    { status: 422, ...init, }
  );
}

export type FormDefaults = {
  [formDefaultsKey: `${typeof FORM_DEFAULTS_FIELD}_${string}`]: any;
};

export const setFormDefaults = <DataType = any>(
  formId: string,
  defaultValues: Partial<DataType>
): FormDefaults => ({
  [formDefaultValuesKey(formId)]: defaultValues,
});