import { type TypedResponse } from "@remix-run/server-runtime";
import { ValidationErrorResponseData, ValidatorError } from "@rvf/core";
import { FormDefaultsKey, formDefaultValuesKey } from "./constants";

/**
 * Takes the errors from a `Validator` and returns a `Response`.
 * When you return this from your action, `ValidatedForm` on the frontend will automatically
 * display the errors on the correct fields on the correct form.
 *
 * You can also provide a second argument to `validationError`
 * to specify how to repopulate the form when JS is disabled.
 *
 * *NOTE*: If you're using `useRvf`, you still need to pull the errors out of `useActionData` yourself.
 * Only `ValidatedForm` will automatically do this for you.
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
  init?: ResponseInit,
) {
  return new Response(
    JSON.stringify({
      fieldErrors: error.fieldErrors,
      subaction: error.subaction,
      repopulateFields,
      formId: error.formId,
    }),
    {
      status: 422,
      ...init,
      headers: {
        "Content-Type": "application/json; utf-8",
      },
    },
  ) as TypedResponse<ValidationErrorResponseData>;
}

export type FormDefaults = {
  [formDefaultsKey: FormDefaultsKey]: any;
};
/**
 * @deprecated This was a workaround for features in the old version of `remix-validated-form` that don't exist anymore.
 * Directly setting the `defaultValues` with data returned from your loader is now the preferred way to set the default values.
 *
 * This only works with the `ValidatedForm` component and not with `useRvf`.
 */
export const setFormDefaults = <DataType = any>(
  formId: string,
  defaultValues: Partial<DataType>,
): FormDefaults => ({
  [formDefaultValuesKey(formId)]: defaultValues,
});
