import { json } from "@remix-run/server-runtime";
import { FieldErrors } from "./validation/types";

export const fieldErrors = (errors: FieldErrors) =>
  json({ fieldErrors: errors }, { status: 422 });
