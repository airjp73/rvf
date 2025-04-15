import { createValidator, FieldErrors, Validator } from "@rvf/core";
import type { z } from "zod";

const getIssuesForError = (err: z.ZodError<any>): z.ZodIssue[] => {
  return err.issues.flatMap((issue) => {
    if ("unionErrors" in issue) {
      return issue.unionErrors.flatMap((err) => getIssuesForError(err));
    } else {
      return [issue];
    }
  });
};

function pathToString(array: (string | number)[]): string {
  return array.reduce(function (string: string, item: string | number) {
    const prefix = string === "" ? "" : ".";
    return string + (isNaN(Number(item)) ? prefix + item : "[" + item + "]");
  }, "");
}

/**
 * Create a validator using a `zod` schema.
 *
 * @deprecated As of RVF 7.1.0, you can pass a `zod` schema directly to `useForm`or `ValidatedForm` via the `schema option.`
 */
export function withZod<T, U extends z.ZodTypeDef>(
  zodSchema: z.Schema<T, U, unknown>,
  parseParams?: Partial<z.ParseParams>,
): Validator<T> {
  return createValidator({
    validate: async (value) => {
      const result = await zodSchema.safeParseAsync(value, parseParams);
      if (result.success) return { data: result.data, error: undefined };

      const fieldErrors: FieldErrors = {};
      getIssuesForError(result.error).forEach((issue) => {
        const path = pathToString(issue.path);
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      });
      return { error: fieldErrors, data: undefined };
    },
  });
}
