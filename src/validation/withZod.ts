import type { z } from "zod";
import { FieldErrors, Validator } from "..";

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
  return {
    validate: (value: unknown) => {
      const result = zodSchema.safeParse(value);
      if (result.success) return { data: result.data, error: undefined };

      const fieldErrors: FieldErrors = {};
      getIssuesForError(result.error).forEach((issue) => {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      });
      return { error: fieldErrors, data: undefined };
    },
    validateField: (data, field) => {
      const result = zodSchema.safeParse(data);
      if (result.success) return { error: undefined };
      return {
        error: getIssuesForError(result.error).find(
          (issue) => issue.path.join(".") === field
        )?.message,
      };
    },
  };
}
