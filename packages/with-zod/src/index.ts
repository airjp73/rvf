import isEqual from "lodash/isEqual";
import toPath from "lodash/toPath";
import { createValidator, FieldErrors, Validator } from "remix-validated-form";
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
    var prefix = string === "" ? "" : ".";
    return string + (isNaN(Number(item)) ? prefix + item : "[" + item + "]");
  }, "");
}

/**
 * Create a validator using a `zod` schema.
 */
export function withZod<T, U>(
  zodSchema: z.Schema<T, U, unknown>
): Validator<T> {
  return createValidator({
    validate: async (value) => {
      const result = await zodSchema.safeParseAsync(value);
      if (result.success) return { data: result.data, error: undefined };

      const fieldErrors: FieldErrors = {};
      getIssuesForError(result.error).forEach((issue) => {
        const path = pathToString(issue.path);
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      });
      return { error: fieldErrors, data: undefined };
    },
    validateField: async (data, field) => {
      const result = await zodSchema.safeParseAsync(data);
      if (result.success) return { error: undefined };
      return {
        error: getIssuesForError(result.error).find((issue) => {
          const allPathsAsString = issue.path.map((p) => `${p}`);
          return isEqual(allPathsAsString, toPath(field));
        })?.message,
      };
    },
  });
}
