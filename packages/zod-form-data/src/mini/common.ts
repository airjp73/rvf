import { z } from "zod/mini";

export const stripEmpty = (empty?: null | undefined) =>
  z.pipe(
    z.literal(""),
    z.transform(() => empty),
  );
