import {
  createValidator,
  FieldErrors,
  Validator,
  withStandardSchema,
} from "@rvf/core";
import { pathArrayToString } from "@rvf/set-get";
import type { z } from "zod";

const getIssuesForError = (err: z.ZodError<any>): z.core.$ZodIssue[] => {
  return err.issues.flatMap(getIssuesForIssue);
};

const getIssuesForIssue = (issue: z.core.$ZodIssue): z.core.$ZodIssue[] => {
  if (issue.code === "invalid_union") {
    return issue.errors.flatMap((err) =>
      err.flatMap((issues) => getIssuesForIssue(issues)),
    );
  } else {
    return [issue];
  }
};

const sanitizePath = (path: readonly PropertyKey[]) => {
  const sanitized: (string | number)[] = [];

  for (const key of path) {
    if (typeof key === "string" || typeof key === "number") {
      sanitized.push(key);
    } else {
      console.error(
        `RVF doesn't support path segments that aren't strings or numbers. Got ${typeof key}.` +
          ` Path prefix was ${pathArrayToString(sanitized)}.`,
      );
      return undefined;
    }
  }

  return sanitized;
};

/**
 * Create a validator using a `zod` schema.
 *
 * @deprecated As of RVF 7.1.0, you can pass a `zod` schema directly to `useForm`or `ValidatedForm` via the `schema option.`
 * At this point, this function is actually just
 */
export function withZod<Output>(
  zodSchema: z.ZodType<Output>,
  parseParams?: Partial<z.core.ParseContext<z.core.$ZodIssue>>,
): Validator<Output> {
  return createValidator({
    validate: async (value) => {
      const result = await zodSchema.safeParseAsync(value, parseParams);
      if (result.success) return { data: result.data, error: undefined };

      const fieldErrors: FieldErrors = {};
      getIssuesForError(result.error).forEach((issue) => {
        console.log(issue);
        const sanitized = sanitizePath(issue.path);
        if (!sanitized) return;

        const path = pathArrayToString(sanitized);
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      });
      return { error: fieldErrors, data: undefined };
    },
  });
}
