import { withZod } from "@rvf/zod";
import { z } from "zod";

export const validator = withZod(
  z.object({
    myTextInput: z.string(),
    myNumberInput: z.number(),
  }),
);
