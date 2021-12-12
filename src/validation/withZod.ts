import isEqual from "lodash/isEqual";
import toPath from "lodash/toPath";
import type { z } from "zod";
import { FieldErrors, Validator } from "..";
import { createValidator } from "./createValidator";

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

export function withZod<T>(zodSchema: z.Schema<T>): Validator<T> {
  return createValidator({
    validate: (value) => {
      const result = zodSchema.safeParse(value);
      if (result.success) return { data: result.data, error: undefined };

      const fieldErrors: FieldErrors = {};
      getIssuesForError(result.error).forEach((issue) => {
        const path = pathToString(issue.path);
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      });
      return { error: fieldErrors, data: undefined };
    },
    validateField: (data, field) => {
      const result = zodSchema.safeParse(data);
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
