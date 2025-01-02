import { StandardSchemaV1 } from "@standard-schema/spec";
import { pathArrayToString } from "@rvf/set-get";
import { createValidator } from "./createValidator";
import { FieldErrors } from "./types";

const sanitizePath = (
  path: readonly (StandardSchemaV1.PathSegment | PropertyKey)[],
) => {
  const sanitized: (string | number)[] = [];

  for (const segment of path) {
    const key =
      typeof segment === "object" && "key" in segment ? segment.key : segment;

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
 * Used internally when you pass a Standard Schema to RVF.
 * This will be removed in a future version.
 */
export const withStandardSchema = <T>(schema: StandardSchemaV1<any, T>) =>
  createValidator<T>({
    validate: async (value) => {
      const result = await schema["~standard"].validate(value);
      if (result.issues) {
        const fieldErrors: FieldErrors = {};

        result.issues.forEach((issue) => {
          const sanitizedPath = sanitizePath(issue.path ?? []);
          if (!sanitizedPath) return;

          const pathString = pathArrayToString(sanitizedPath);
          if (!fieldErrors[pathString]) fieldErrors[pathString] = issue.message;
        });

        return { data: undefined, error: fieldErrors };
      }
      return { data: result.value, error: undefined };
    },
  });
