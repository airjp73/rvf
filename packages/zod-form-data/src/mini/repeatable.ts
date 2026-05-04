import { z, type ZodMiniArray } from "zod/mini";
import type * as core from "zod/v4/core";

import { text } from "./text";

const _repeatable = <
  Output,
  Input,
  InternalSchema extends core.$ZodType<Output, Input>,
  Schema extends core.$ZodArray<InternalSchema>,
>(
  schema: Schema,
) =>
  z.pipe(
    z.transform((val) => {
      if (Array.isArray(val)) return val;
      if (val == null) return []; // null or undefined
      return [val];
    }),
    schema,
  );

const _defaultRepeatable = _repeatable(z.array(text()));

export function repeatable(): typeof _defaultRepeatable;
export function repeatable<
  Output,
  Input,
  InternalSchema extends core.$ZodType<Output, Input>,
  Schema extends core.$ZodArray<InternalSchema>,
>(
  schema: Schema,
): ReturnType<typeof _repeatable<Output, Input, InternalSchema, Schema>>;
/**
 * Preprocesses a field where you expect multiple values could be present for the same field name
 * and transforms the value of that field to always be an array.
 * If you don't provide a schema, it will assume the field is an array of zfd.text fields
 * and will not require any values to be present.
 */
export function repeatable<
  Output,
  Input,
  InternalSchema extends core.$ZodType<Output, Input>,
  Schema extends core.$ZodArray<InternalSchema>,
>(schema?: Schema) {
  if (schema == null) return _defaultRepeatable;
  else return _repeatable(schema);
}

export function repeatableOfType(): typeof _defaultRepeatable;
export function repeatableOfType<
  Output,
  Input,
  Schema extends core.$ZodType<Output, Input>,
>(
  schema: Schema,
): ReturnType<typeof _repeatable<Output, Input, Schema, ZodMiniArray<Schema>>>;

/**
 * A convenience wrapper for repeatable.
 * Instead of passing the schema for an entire array, you pass in the schema for the item type.
 */
export function repeatableOfType<
  Output,
  Input,
  Schema extends core.$ZodType<Output, Input>,
>(schema?: Schema) {
  if (schema == null) return repeatable();
  else return repeatable(z.array(schema));
}
