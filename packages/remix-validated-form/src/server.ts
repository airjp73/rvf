import { json } from "@remix-run/server-runtime";
import { FieldErrors } from "./validation/types";

/**
 * Takes the errors from a `Validator` and returns a `Response`.
 * The `ValidatedForm` on the frontend will automatically display the errors
 * if this is returned from the action.
 */
export const validationError = (errors: FieldErrors, submittedData?: unknown) =>
  json(
    { fieldErrors: { ...errors, _submittedData: submittedData } },
    { status: 422 }
  );
