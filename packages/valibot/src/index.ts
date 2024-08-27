import { type FieldErrors, type Validator, createValidator } from "@rvf/core";
import {
  BaseIssue,
  type Config,
  type GenericSchema,
  GenericSchemaAsync,
  type InferIssue,
  type InferOutput,
  safeParseAsync,
} from "valibot";

type MaybeAsyncSchema = GenericSchema | GenericSchemaAsync

function formatIssuePath(issue: BaseIssue<unknown>): string | null {
  if (!issue.path || issue.path.length === 0) return null;

  let result = '';
  
  for (const item of issue.path) {
    if (typeof item.key === 'string') {
      result += result === '' ? item.key : `.${item.key}`;
    } else if (typeof item.key === 'number') {
      result += `[${item.key}]`;
    } else {
      return null;
    }
  }

  return result;
}

function parseIssues<Schema extends GenericSchema>(
  issues: [InferIssue<Schema>, ...InferIssue<Schema>[]]
): FieldErrors {
  const parsedIssues: FieldErrors = {};

  for (const issue of issues) {
    const path = formatIssuePath(issue);
    if (path) {
      parsedIssues[path] = issue.message;
    }
  }

  return parsedIssues;
}

export function withValibot<Schema extends MaybeAsyncSchema>(
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
