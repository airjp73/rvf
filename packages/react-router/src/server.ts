import { ValidationErrorResponseData, ValidatorError } from "@rvf/core";
import { data } from "react-router";

/**
 * Takes the errors from a `Validator` and returns a `Response`.
 * When you return this from your action, `ValidatedForm` on the frontend will automatically
 * display the errors on the correct fields on the correct form.
 *
 * You can also provide a second argument to `validationError`
 * to specify how to repopulate the form when JS is disabled.
 *
 * *NOTE*: If you're using `useForm`, you still need to pull the errors out of `useActionData` yourself.
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
  return data(
    {
      fieldErrors: error.fieldErrors,
      repopulateFields,
      formId: error.formId,
      formError: null,
    } satisfies ValidationErrorResponseData,
    {
      status: 422,
      ...init,
      headers: {
        "Content-Type": "application/json; utf-8",
      },
    },
  );
}
