// Taken from here
// https://github.com/drizzer14/fnts/blob/main/src/pipe.ts

import { describe, expect, it } from "vitest";
import { MaybePromise, PossiblyPromise } from "./maybePromise";

export type ValidationPipeline<Input, Output> = {
  perform: (input: Input) => PossiblyPromise<Output>;
  validateMaybeAsync: (input: Input) => MaybePromise<Output>;
  validateSync: (input: Input) => Output;
  validateAsync: (input: Input) => Promise<Output>;
};

export type AnyValidationPipeline = ValidationPipeline<any, any>;

export type PipeOutput<Pipeline> = Pipeline extends ValidationPipeline<
  any,
  infer Out
>
  ? Out
  : never;

export type PipeInput<Pipeline> = Pipeline extends ValidationPipeline<
  infer In,
  any
>
  ? In
  : never;

/**
 * Picks the last entry from the tuple or array.
 */
export type Last<T extends any[]> = T extends [...any[], infer L] ? L : any;

/**
 * Creates a `Pipeline` type which parses all of the provided functions' types.
 * Any function with either an incorrect argument or a return type will not fit
 * into the pipeline and should be typed according to it, so that its argument's
 * type matches the return type of the previous function and its return type
 * matches the type of the next function's argument.
 */
export type Pipeline<
  Validations extends AnyValidationPipeline[],
  Length extends number = Validations["length"]
> = Length extends 1
  ? Validations
  : Validations extends [infer First, infer Second, ...infer Rest]
  ? [
      First,
      ...Pipeline<
        First extends AnyValidationPipeline
          ? Second extends AnyValidationPipeline
            ? Rest extends AnyValidationPipeline[]
              ? [
                  ValidationPipeline<PipeOutput<First>, PipeOutput<Second>>,
                  ...Rest
                ]
              : never
            : never
          : never
      >
    ]
  : Validations;

export const makeValidator = <Input, Output>(
  perform: (input: Input) => PossiblyPromise<Output>
): ValidationPipeline<Input, Output> => {
  const validateMaybeAsync = (input: Input) =>
    MaybePromise.of(() => perform(input));
  return {
    perform,
    validateMaybeAsync,
    validateSync: (input) => validateMaybeAsync(input).assertSync(),
    validateAsync: (input) => validateMaybeAsync(input).await(),
  };
};

/**
 * Applies all of the provided `functions` one-by-one in left-to-right order
 * starting from the `argument`.
 */
export default function pipe<Pipes extends AnyValidationPipeline[]>(
  ...pipelines: Pipeline<Pipes>
): ValidationPipeline<PipeInput<Pipes[0]>, PipeOutput<Last<Pipes>>> {
  return makeValidator((val) => {
    let res: any = val;
    for (const pipe of pipelines) {
      res = pipe.perform(res);
    }
    return res;
  });
}

const typecheck = <T>(
  doCheck: (val: unknown) => val is T,
  makeError: () => string
): ValidationPipeline<unknown, T> =>
  makeValidator((val) => {
    if (doCheck(val)) return val as T;
    throw new Error(makeError());
  });

const check = <Input>(
  doCheck: (val: Input) => PossiblyPromise<boolean>,
  makeError: () => string
): ValidationPipeline<Input, Input> =>
  makeValidator((val) => {
    if (doCheck(val)) return val;
    throw new Error(makeError());
  });

const transform = <Input, Output>(
  doTransform: (val: Input) => PossiblyPromise<Output>
): ValidationPipeline<Input, Output> => makeValidator(doTransform);

////////// Implementations

const isNumber = () =>
  typecheck(
    (val): val is number => typeof val === "number",
    () => "Expected a number"
  );

const isString = () =>
  typecheck(
    (val): val is string => typeof val === "string",
    () => "Expected a string"
  );

const maxLength = (max: number) =>
  check<string>(
    (val) => val.length <= max,
    () => `Expected a string with length <= ${max}`
  );

const toNumber = () => transform<string, number>((val) => Number(val));

const max = (max: number) =>
  check<number>(
    (val) => val <= max,
    () => `Expected a number <= ${max}`
  );

if (import.meta.vitest) {
  describe("functional", () => {
    describe("composition", () => {
      it("should be able to pass pipelines to other pipelines", () => {
        const pipeline = pipe(isString(), maxLength(5), toNumber(), max(55555));
        const minus100 = transform((val: number) => val - 100);
        const merged = pipe(pipeline, minus100);
        expect(merged.validateSync("10100")).toEqual(10000);
      });
    });

    describe("sync", () => {
      it("should work synchronously", () => {
        const pipeline = pipe(isString(), maxLength(5), toNumber(), max(55555));
        expect(pipeline.validateSync("12345")).toEqual(12345);
        expect(() => pipeline.validateSync("123456")).toThrow(
          "Expected a string with length <= 5"
        );
        expect(() => pipeline.validateSync(123)).toThrow("Expected a string");
        expect(() => pipeline.validateSync("66666")).toThrow(
          "Expected a number <= 55555"
        );
      });
    });

    describe("async", () => {
      const userExists = check(
        () => Promise.resolve(true),
        () => "User does not exist"
      );
      const makeUser = transform(() => Promise.resolve({ id: 123 }));
      const pipeline = pipe(isString(), userExists, makeUser);

      it("should support async checks and transforms", () => {
        expect(pipeline.validateAsync("123")).resolves.toEqual({ id: 123 });
      });

      it("should throw if trying to validate synchronously", () => {
        expect(() => pipeline.validateSync("123")).toThrow();
      });
    });
  });
}
