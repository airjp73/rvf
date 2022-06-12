import { makeType, SchemaOf, SchemaOutput } from "../core";
import { errorMessage, ErrorMessage, ValidationError } from "../errors";
import { MaybePromise, MaybePromiseSettledResult } from "../maybePromise";
import { MergeIntersection } from "../typeHelpers";
import { commonMethods } from "./common";

type ObjectKey = string | number;
type SchemaObject = Record<ObjectKey, SchemaOf<any>>;

type SchemaOutputs<T extends SchemaObject> = MergeIntersection<{
  [K in keyof T]: SchemaOutput<T[K]>;
}>;

export const record = (typeError?: ErrorMessage) =>
  makeType(
    (val): val is Record<ObjectKey, unknown> =>
      typeof val === "object" && val !== null,
    errorMessage(
      typeError,
      Symbol("Move this"),
      (label) => `Expected ${label} to be a string`,
      "Expected a record"
    ),
    { ...commonMethods }
  );

export const object = <T extends SchemaObject>(
  schemas: T
): SchemaOf<SchemaOutputs<T>> =>
  record().transform((val, meta) => {
    const entries = Object.entries(schemas);
    const results = entries.map(
      ([key, schema]): MaybePromise<any> =>
        schema.validateMaybeAsync(val[key], meta)
    );

    return MaybePromise.allSettled(results).then(
      (settled): SchemaOutputs<T> => {
        const settledObj: Record<string, MaybePromiseSettledResult> =
          Object.fromEntries(
            settled.map((result, index) => [entries[index][0], result])
          );

        const errors = Object.keys(settledObj).filter(
          (key) => settledObj[key].status === "rejected"
        );

        if (errors.length) {
          throw new ValidationError({
            message: "Object validation failed",
            nested: errors.map((key) => {
              const res = settledObj[key];
              if (res.status !== "rejected") {
                throw new Error(
                  "Expected result to be rejected. This is likely a bug."
                );
              }

              const reason = res.reason;
              if (reason instanceof ValidationError)
                return reason.prependPath(key);
              if (reason instanceof Error)
                return new ValidationError({
                  message: reason.message,
                  pathSegments: [key],
                });
              return new ValidationError({
                message: "Unknown error",
                pathSegments: [key],
              });
            }),
          });
        }

        return Object.fromEntries(
          Object.entries(settledObj).map(([key, result]) => {
            if (result.status !== "fulfilled") {
              throw new Error(
                "Expected result to be fulfilled. This is likely a bug."
              );
            }
            return [key, result.value];
          })
        ) as SchemaOutputs<T>;
      }
    );
  });
