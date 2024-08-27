import { type FieldErrors, type Validator, createValidator } from "@rvf/core";
import {
  type Config,
  type GenericSchema,
  type InferIssue,
  type InferOutput,
  flatten,
  safeParseAsync,
} from "valibot";

function parseIssues<Schema extends GenericSchema>(
  issues: [InferIssue<Schema>, ...InferIssue<Schema>[]],
): FieldErrors {
  const transformedObj: FieldErrors = {};
  const flattenErrors = flatten<Schema>(issues);

  if (!flattenErrors.nested) return transformedObj;

  const regex = /\.(\d+)/g;

  for (const [key, value] of Object.entries(flattenErrors.nested)) {
    const transformedKey = key.replace(regex, "[$1]");
    const transformedValue = Array.isArray(value) ? value[0] : "";

    if (!transformedValue) continue;

    transformedObj[transformedKey] = transformedValue;
  }

  return transformedObj;
}

export function withValibot<Schema extends GenericSchema>(
  schema: Schema,
  config?: Config<InferIssue<Schema>>,
): Validator<InferOutput<Schema>> {
  return createValidator({
    validate: async (input) => {
      const result = await safeParseAsync(schema, input, config);

      if (result.success) return { data: result.output, error: undefined };

      return { data: undefined, error: parseIssues(result.issues) };
    },
  });
}
