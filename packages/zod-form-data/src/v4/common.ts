import { z } from "zod";

export const stripEmpty = (empty?: null | undefined) =>
  z.literal("").transform(() => empty);
