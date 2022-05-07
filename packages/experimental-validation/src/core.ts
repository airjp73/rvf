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

export const typecheck = <T>(
  doCheck: (val: unknown, meta: AnyMeta) => val is T,
  makeError: (val: unknown, meta: AnyMeta) => string
): ValidationPipeline<unknown, T> =>
  makeValidator((val, meta) => {
    if (doCheck(val, meta)) return val as T;
    throw new Error(makeError(val, meta));
  });

export const check = <Input>(
  doCheck: (val: Input) => PossiblyPromise<boolean>,
  makeError: (val: Input, meta: AnyMeta) => string
): ValidationPipeline<Input, Input> =>
  makeValidator((val, meta) => {
    if (doCheck(val)) return val;
    throw new Error(makeError(val, meta));
  });

export const transform = <Input, Output>(
  doTransform: (val: Input, meta: AnyMeta) => PossiblyPromise<Output>
): ValidationPipeline<Input, Output> => makeValidator(doTransform);

export const setMeta = <M extends AnyMeta>(meta: M) =>
  makeValidator((val) => val, meta);
