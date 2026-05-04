import { z } from "zod/mini";
import * as core from "zod/v4/core";

const _file = <Schema extends core.$ZodType<File | undefined | null>>(
  schema: Schema,
  empty?: null | undefined,
) =>
  z.pipe(
    z.transform((val) =>
      // Empty File object on no user input, so convert to empty
      val instanceof File && val.size === 0 ? empty : val,
    ),
    schema,
  );

const _defaultFile = (empty?: null | undefined) =>
  _file(z.instanceof(File), empty);

export function file(empty?: null | undefined): ReturnType<typeof _defaultFile>;
export function file<Schema extends core.$ZodType<File | undefined | null>>(
  schema: Schema,
  empty?: null | undefined,
): ReturnType<typeof _file<Schema>>;
export function file<Schema extends core.$ZodType<File | undefined | null>>(
  schemaOrEmpty?: Schema | null | undefined,
  empty?: null | undefined,
) {
  if (schemaOrEmpty == null) return _defaultFile(schemaOrEmpty);
  else return _file(schemaOrEmpty, empty);
}
