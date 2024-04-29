import { Valid } from "@rvf/core";

export const successValidator = <T>(data: T) =>
  Promise.resolve({ data, error: undefined } satisfies Valid<T>);
