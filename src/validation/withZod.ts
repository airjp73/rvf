import { isEqual, toPath } from "lodash";
import type { z } from "zod";
import { FieldErrors, Validator } from "..";
import { unflatten } from "../flatten";
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

export function withZod<T>(zodSchema: z.Schema<T>): Validator<T> {
  return createValidator({
    validate: (value) => {
      const flatValue = unflatten(value);
      const result = zodSchema.safeParse(flatValue);
      if (result.success) return { data: result.data, error: undefined };

      const fieldErrors: FieldErrors = {};
      getIssuesForError(result.error).forEach((issue) => {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      });
      return { error: fieldErrors, data: undefined };
    },
    validateField: (data, field) => {
      const flatData = unflatten(data);
      const result = zodSchema.safeParse(flatData);
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
