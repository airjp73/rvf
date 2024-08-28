import { type FieldErrors, type Validator, createValidator } from "@rvf/core";
import { pathArrayToString } from "@rvf/set-get";
import {
  type BaseIssue,
  type Config,
  type GenericSchema,
  type GenericSchemaAsync,
  type InferIssue,
  type InferOutput,
  safeParseAsync,
} from "valibot";

type MaybeAsyncSchema = GenericSchema | GenericSchemaAsync;

function formatIssuePath(issue: BaseIssue<unknown>): string | null {
  if (!issue.path || issue.path.length === 0) return null;
  const pathArray = issue.path.map((path) => path.key as string | number);

  return pathArrayToString(pathArray);
}

function parseIssues<Schema extends GenericSchema>(
  issues: [InferIssue<Schema>, ...InferIssue<Schema>[]],
): FieldErrors {
  const parsedIssues: FieldErrors = {};

  for (const issue of issues) {
    // More about unions: https://valibot.dev/guides/unions/
    if (issue.type === "union" && issue.issues) {
      const unionIssues = parseIssues(issue.issues);
      Object.assign(parsedIssues, unionIssues);
    }

    const path = formatIssuePath(issue);
    if (path) parsedIssues[path] = issue.message;
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
