import { makeType } from "../core";

export const unknownType = makeType(
  (val): val is unknown => true,
  (val, meta) => {
    throw new Error(
      "Unknown type should never be invalid. This is likely a bug."
    );
  },
  {}
);
