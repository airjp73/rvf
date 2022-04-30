// Goals:
// Infinitely composable
// User can create their own schemas
// Creates a chainable API

import { ArgumentsType } from "vitest";
import { ParseReturnType } from "zod";

type ValidationContext = {
  value: unknown;
};

const call;

type Validate<T> = (context: ValidationContext) => T;

//// Internal helper types

const unknownRecord: Validate<Record<any, any>> = ({ value }) => {
  // Method taken from io-ts
  // https://github.com/gcanti/io-ts/blob/master/src/index.ts#L995-L996
  const stringRepresentation = Object.prototype.toString.call(value);
  const isRecord =
    stringRepresentation === "[object Object]" ||
    stringRepresentation === "[object Window]";

  if (!isRecord) throw new Error(`Expected a record but got ${value}`);
  return value as Record<any, any>;
};

const literal =
  <T>(expected: T): Validate<T> =>
  ({ value }) => {
    if (value === expected) return value as T;
    throw new Error(`Expected ${expected} but got ${value}`);
  };

type FieldValidators<Fields extends Record<string, any>> = {
  [K in keyof Fields]: Validate<Fields[K]>;
};

const object =
  <Fields extends Record<string, any>>(
    schema: FieldValidators<Fields>
  ): Validate<Fields> =>
  ({ value }) => {
    return {} as any;
  };

const test = object({ a: literal(1), b: literal("hi") });
const test2 = test({ value: { a: 1, b: "hi" } });

const withChainables = <
  Chainables extends Record<string, (...args: any[]) => Validate<any>>
>(
  chainables: Chainables
) => {
  const chainFuncs = {};
  for (const [key, value] of Object.entries(chainables)) {
  }
};

type Schema<
  Args extends any[],
  ReturnType,
  Chainables extends Record<string, (...args: any[]) => Validate<any>>
> = {
  make: (...args: Args) => Validate<ReturnType>;
  chainables: Chainables;
};

const makeValidator = <Args extends any[], ReturnType>(
  make: (...args: Args) => Validate<ReturnType>
): Schema<Args, ReturnType, {}> => {
  return {
    chainables: {},
    make,
  };
};
