import { describe, expect, it } from "vitest";
import { MaybePromise, PossiblyPromise } from "./maybePromise";
import { Merge } from "./typeHelpers";

export type AnyMeta = Record<string | number | symbol, any>;
export type AnyProps = any;

export interface ValidationPipeline<Input, Output, Meta extends AnyMeta = {}> {
  perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>;
  validateMaybeAsync: (input: Input, meta: AnyMeta) => MaybePromise<Output>;
  validateSync: (input: Input) => Output;
  validateAsync: (input: Input) => Promise<Output>;
  meta: Meta;
  props?: AnyProps;

  e<NewMeta extends AnyMeta>(
    pipeline: ValidationPipeline<unknown, unknown, NewMeta>
  ): ValidationPipeline<Input, Output, Merge<Meta, NewMeta>>;
  e<NewOutput, NewMeta extends AnyMeta>(
    pipeline: ValidationPipeline<Output, NewOutput, NewMeta>
  ): ValidationPipeline<Input, NewOutput, Merge<Meta, NewMeta>>;
}

/**
 * Picks the last entry from the tuple or array.
 */
export type Last<T extends any[]> = T extends [...any[], infer L] ? L : any;

export function makeValidator<Input, Output>(
  perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>
): ValidationPipeline<Input, Output, {}>;
export function makeValidator<Input, Output, Meta extends AnyMeta>(
  perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>,
  meta: Meta
): ValidationPipeline<Input, Output, Meta>;
export function makeValidator<
  Input,
  Output,
  Meta extends AnyMeta,
  Props extends AnyProps
>(
  perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>,
  meta: Meta,
  props: Props
): ValidationPipeline<Input, Output, Meta>;
export function makeValidator<Input, Output>(
  perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>,
  meta: AnyMeta = {},
  props?: AnyProps
): ValidationPipeline<Input, Output, AnyMeta> {
  const validateMaybeAsync = (input: Input, passedMeta: AnyMeta) =>
    MaybePromise.of(() => perform(input, passedMeta));
  return {
    perform,
    validateMaybeAsync,
    meta,
    props,
    validateSync: (input) => validateMaybeAsync(input, meta).assertSync(),
    validateAsync: (input) => validateMaybeAsync(input, meta).await(),
    e(pipe: any) {
      return makeValidator(
        (input: Input, passedMeta) =>
          validateMaybeAsync(input, passedMeta).then((res) =>
            pipe.validateMaybeAsync(res, passedMeta)
          ),
        { ...meta, ...pipe.meta },
        { parent: this }
      );
    },
  };
}

const typecheck = <T>(
  doCheck: (val: unknown, meta: AnyMeta) => val is T,
  makeError: (val: unknown, meta: AnyMeta) => string
): ValidationPipeline<unknown, T> =>
  makeValidator((val, meta) => {
    if (doCheck(val, meta)) return val as T;
    throw new Error(makeError(val, meta));
  });

const check = <Input>(
  doCheck: (val: Input) => PossiblyPromise<boolean>,
  makeError: (val: Input, meta: AnyMeta) => string
): ValidationPipeline<Input, Input> =>
  makeValidator((val, meta) => {
    if (doCheck(val)) return val;
    throw new Error(makeError(val, meta));
  });

const transform = <Input, Output>(
  doTransform: (val: Input, meta: AnyMeta) => PossiblyPromise<Output>
): ValidationPipeline<Input, Output> => makeValidator(doTransform);

const setMeta = <M extends AnyMeta>(meta: M) =>
  makeValidator((val) => val, meta);

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
const label = (label: string) => setMeta({ label });

if (import.meta.vitest) {
  describe("functional", () => {
    describe("builder", () => {
      it("should be able to compose pipelines together", () => {
        const pipeline = isString()
          .e(maxLength(5))
          .e(toNumber())
          .e(max(55555))
          .e(transform((val: number) => val - 100));
        expect(pipeline.validateSync("10100")).toEqual(10000);
        expect(() => pipeline.validateSync("123456")).toThrow();
        expect(() => pipeline.validateSync("55556")).toThrow();
        expect(() => pipeline.validateSync(123)).toThrow();
      });

      it("should be able to set meta", () => {
        const pipeline = isString().e(setMeta({ label: "hi" }));
        expect(pipeline.meta).toEqual({ label: "hi" });
      });

      it("should be able to use metadata in errors in any order", () => {
        const raiseError = check(
          () => false,
          (_, meta) => `This error is for field ${meta.label}`
        );
        const testLabel = label("MyField");

        const pipeline1 = isString().e(raiseError).e(testLabel);
        const pipeline2 = isString().e(testLabel).e(raiseError);

        expect(() => pipeline1.validateSync("123")).toThrow(
          "This error is for field MyField"
        );
        expect(() => pipeline2.validateSync("123")).toThrow(
          "This error is for field MyField"
        );
      });

      it("should use last metadata when set in 2 places", () => {
        const testCheck = check(
          (val: string) => val.length >= 5,
          (val, meta) => `${meta.label} must be at least 5 characters`
        );
        const longString = isString().e(label("longString")).e(testCheck);
        const myString = longString.e(label("myString"));

        expect(() => myString.validateSync("1")).toThrow(
          "myString must be at least 5 characters"
        );

        const string2 = isString().e(longString).e(label("myString"));
        expect(() => string2.validateSync("1")).toThrow(
          "myString must be at least 5 characters"
        );
      });
    });
  });
}
