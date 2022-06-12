import { SchemaOf, SchemaOutput } from "../core";
import { unknownType } from "./unknown";

type SchemaOutputs<T extends SchemaOf<any>[]> = {
  [K in keyof T]: SchemaOutput<T[K]>;
}[number];

export const union = <T extends SchemaOf<any>[]>(
  schemas: T
): SchemaOf<SchemaOutputs<T>> =>
  unknownType.transform((val, meta) => {
    const [first, ...rest] = schemas;
    return rest.reduce(
      (acc, schema) => acc.catch(() => schema.validateMaybeAsync(val, meta)),
      first.validateMaybeAsync(val, meta)
    );
  });
