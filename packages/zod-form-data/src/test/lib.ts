import { expect } from "vitest";
import * as core from "zod/v4/core";

export const expectError = <
  Output,
  Input,
  Schema extends core.$ZodType<Output, Input>,
>(
  schema: Schema,
  val: unknown,
  error?: core.$ZodError,
) => {
  expect(core.safeParse(schema, val)).toMatchObject({
    error: error ? error : expect.any(core.$ZodError),
    success: false,
  });
};

export const expectValid = <
  Output,
  Input,
  Schema extends core.$ZodType<Output, Input>,
>(
  schema: Schema,
  val: unknown,
) => {
  expect(core.safeParse(schema, val)).toEqual({
    success: true,
    data: val,
  });
};
