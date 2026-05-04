import { z } from "zod";
import * as core from "zod/v4/core";

import { stripEmpty } from "./common";

const _numeric = <Output, Input, Schema extends core.$ZodType<Output, Input>>(
  schema: Schema,
  empty?: null | undefined,
) =>
  z.pipe(z.union([stripEmpty(empty), z.coerce.number(), z.unknown()]), schema);

const _defaultNumeric = (empty?: null | undefined) =>
  _numeric(z.number(), empty);

export function numeric(
  empty?: null | undefined,
): ReturnType<typeof _defaultNumeric>;
export function numeric<
  Output,
  Input,
  Schema extends core.$ZodType<Output, Input>,
>(
  schema: Schema,
  empty?: null | undefined,
): ReturnType<typeof _numeric<Output, Input, Schema>>;

/**
 * Coerces numerical strings to numbers transforms empty strings to `undefined` before validating.
 * If you call `zfd.number` with no arguments,
 * it will assume the field is a required number by default.
 * If you want to customize the schema, you can pass that as an argument.
 */
export function numeric<
  Output,
  Input,
  Schema extends core.$ZodType<Output, Input>,
>(schemaOrEmpty?: Schema | null | undefined, empty?: null | undefined) {
  if (schemaOrEmpty == null) return _defaultNumeric(schemaOrEmpty);
  else return _numeric(schemaOrEmpty, empty);
}
