import * as core from "zod/v4/core";

export const isSchema = <
  Output,
  Input,
  Schema extends core.$ZodType<Output, Input>,
  Shape extends core.$ZodLooseShape,
>(
  schemaOrShape: Schema | Shape,
): schemaOrShape is Schema => "_zod" in schemaOrShape;
