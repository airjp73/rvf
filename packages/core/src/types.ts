import { GenericObject } from "./native-form-data/flatten";

export type FieldValues = Record<string | number, any>;

export type SubmitStatus = "idle" | "submitting" | "error" | "success";

export type FieldErrors = Record<string, string>;
export type Valid<DataType> = { data: DataType; error: undefined };
export type Invalid = { error: FieldErrors; data: undefined };

type BaseResult = { submittedData: GenericObject; formId?: string };
export type ErrorResult = BaseResult & {
  error: ValidatorError;
  data: undefined;
};
export type SuccessResult<DataType> = BaseResult & {
  data: DataType;
  error: undefined;
};

/**
 * The result when validating a form.
 */
export type ValidationResult<DataType> = SuccessResult<DataType> | ErrorResult;

export type ValidationBehavior = "onSubmit" | "onChange" | "onBlur";

export type ValidationBehaviorConfig = {
  /**
   * When the form first mounts, when should the validation be triggered?
   */
  initial: ValidationBehavior;

  /**
   * Once a given field has been touched, when should the validation be triggered?
   */
  whenTouched: ValidationBehavior;

  /**
   * Once the form has been submitted unnsuccessfully, when should the validation be triggered?
   */
  whenSubmitted: ValidationBehavior;
};

export type FieldArrayValidationBehavior = "onSubmit" | "onChange";

export type FieldArrayValidationBehaviorConfig = {
  /**
   * When the form first mounts, when should the validation be triggered?
   */
  initial: FieldArrayValidationBehavior;

  /**
   * Once the form has been submitted unnsuccessfully, when should the validation be triggered?
   */
  whenSubmitted: FieldArrayValidationBehavior;
};

/**
 * An RVF `Validator`. Can be used by `useForm` or by calling it directly.
 */
export type Validator<DataType> = {
  validate: (
    unvalidatedData: GenericObject | FormData,
  ) => Promise<ValidationResult<DataType>>;
};

export type CreateValidatorArg<DataType> = {
  validate: (
    unvalidatedData: GenericObject,
  ) => Promise<Valid<DataType> | Invalid>;
};

export type ValidatorData<T extends Validator<any>> =
  T extends Validator<infer U> ? U : never;

export type ValidatorError = {
  formId?: string;
  fieldErrors: FieldErrors;
};

export type ValidationErrorResponseData = {
  formId?: string;
  fieldErrors: FieldErrors;
  repopulateFields?: unknown;
};

export type AllProps<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>>
    ? T[P]
    : T[P] | undefined;
};

///////////////////////////////////////////////////
/////////////// Schema & Default Values ///////////
///////////////////////////////////////////////////

type Prettify<T> = {
  [K in keyof T]: T[K];
  // necessary for this type
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

// https://github.com/sindresorhus/type-fest/blob/44c1766504a2a5024f063ac83bc67d28ec52cba9/source/is-null.d.ts
type IsNull<T> = [T] extends [null] ? true : false;
// https://github.com/sindresorhus/type-fest/blob/44c1766504a2a5024f063ac83bc67d28ec52cba9/source/is-unknown.d.ts
type IsUnknown<T> = unknown extends T // `T` can be `unknown` or `any`
  ? IsNull<T> extends false // `any` can be `null`, but `unknown` can't be
    ? true
    : false
  : false;

type HandleObjects<T, U> = {
  [K in keyof T | keyof U]: K extends keyof T
    ? K extends keyof U
      ? NonContradictingSupertype<T[K], U[K]>
      : T[K]
    : K extends keyof U
      ? U[K]
      : never;
};

type AnyReadStatus<T> = T | Readonly<T>;
type HandleTuples<T, U> = T extends [infer THead, ...infer TTail]
  ? U extends AnyReadStatus<[infer UHead, ...infer UTail]>
    ? [NonContradictingSupertype<THead, UHead>, ...HandleTuples<TTail, UTail>]
    : [THead, ...TTail]
  : T;

type Primitive = string | number | boolean | symbol | bigint | null | undefined;

type NonDistributiveExtends<One, Two> = One extends Two ? true : false;
type HandlePrimitives<T, U> = NonDistributiveExtends<T, U> extends true ? U : T;
type Tuple = AnyReadStatus<[any, ...any[]]>;
type AnyArray<T = any> = AnyReadStatus<Array<T>>;

// prettier-ignore
type HandleDifferences<T, U> =
  [T, U] extends [Primitive, Primitive]
    ? HandlePrimitives<T, U>
  : [T, U] extends [Primitive, any] | [any, Primitive]
    ? T
  : [T, U] extends [Tuple, Tuple]
    ? HandleTuples<T, U>
  : [T, U] extends [Tuple, any] | [any, Tuple]
    ? T
  : [T, U] extends [AnyArray<infer TItem>, AnyArray<infer UItem>]
    ? Array<NonContradictingSupertype<TItem, UItem>>
  : [T, U] extends [AnyArray, any] | [any, AnyArray]
    ? T
  : Prettify<HandleObjects<T, U>>;

/**
 * Finds the least common supertype with some restrictions.
 */
export type NonContradictingSupertype<T, U> =
  IsUnknown<T> extends true
    ? U
    : T extends U
      ? U extends T
        ? U
        : HandleDifferences<T, U>
      : HandleDifferences<T, U>;
