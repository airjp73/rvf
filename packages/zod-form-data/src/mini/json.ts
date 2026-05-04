import { z } from "zod/mini";
import * as core from "zod/v4/core";

import { stripEmpty } from "./common";

const safeParseJson = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return jsonString;
  }
};

export const json = <
  Output,
  Input,
  Schema extends core.$ZodType<Output, Input>,
>(
  schema: Schema,
  empty?: null | undefined,
) =>
  z.pipe(
    z.union([
      stripEmpty(empty),
      z.pipe(
        z.string(),
        z.transform((val) => safeParseJson(val)),
      ),
    ]),
    schema,
  );
