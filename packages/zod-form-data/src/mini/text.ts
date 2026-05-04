import { z } from "zod/mini";

import type * as core from "zod/v4/core";
import { stripEmpty } from "./common";

const _text = <Output, Input, Schema extends core.$ZodType<Output, Input>>(
  schema: Schema,
  empty?: null | undefined,
) => z.pipe(z.union([stripEmpty(empty), z.unknown()]), schema);

const _defaultText = (empty?: null | undefined) => _text(z.string(), empty);

export function text(empty?: null | undefined): ReturnType<typeof _defaultText>;
export function text<
  Output,
  Input,
  Schema extends core.$ZodType<Output, Input>,
>(
  schema: Schema,
  empty?: null | undefined,
): ReturnType<typeof _text<Output, Input, Schema>>;

/**
 * Transforms any empty strings to `undefined` before validating.
 * This makes it so empty strings will fail required checks,
 * allowing you to use `optional` for optional fields instead of `nonempty` for required fields.
 * If you call `zfd.text` with no arguments, it will assume the field is a required string by default.
 * If you want to customize the schema, you can pass that as an argument.
 */
export function text<
  Output,
  Input,
  Schema extends core.$ZodType<Output, Input>,
>(schemaOrEmpty?: Schema | null | undefined, empty?: null | undefined) {
  if (schemaOrEmpty == null) return _defaultText(schemaOrEmpty);
  else return _text(schemaOrEmpty, empty);
}
