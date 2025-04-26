import * as h from "hotscript";
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

// https://github.com/sindresorhus/type-fest/blob/86a3a6929f87948f708126083bfb760582e48989/source/is-never.d.ts#L42
type IsNever<T> = [T] extends [never] ? true : false;
interface IsNeverFn extends h.Fn {
  return: IsNever<this["arg0"]>;
}

// https://github.com/sindresorhus/type-fest/blob/main/source/is-any.d.ts
export type IsAny<T> = 0 extends 1 & NoInfer<T> ? true : false;

type Tuple<T = any> = [...T[]];

interface IsExtendedBy<ToMatch> extends h.Fn {
  return: ToMatch extends this["arg0"] ? true : false;
}

interface ExtendsSomethingIn<T extends Tuple> extends h.Fn {
  return: h.Pipe<
    T,
    [h.Tuples.Find<IsExtendedBy<this["arg0"]>, T>, IsNeverFn, h.Booleans.Not]
  >;
}

interface IsExtendedBySomethingIn<T extends Tuple> extends h.Fn {
  return: h.Pipe<
    T,
    [
      h.Tuples.Find<h.Booleans.Extends<this["arg0"]>, T>,
      IsNeverFn,
      h.Booleans.Not,
    ]
  >;
}

type ToUnion<T extends Tuple> = h.Call<h.Tuples.ToUnion<T>>;

type ReconcileObjects<T extends object, U extends object> = {
  [K in keyof T]: K extends keyof U
    ? NonContradictingSupertype<T[K], U[K]>
    : T[K];
};

// prettier-ignore
type ReconcileTuple<T extends Tuple, U extends Tuple> =
  U extends [] ? T
  : T extends [] ? []
  : [T, U] extends [
      [infer THead, ...infer TTail],
      [infer UHead, ...infer UTail],
    ]
    ? [
        NonContradictingSupertype<THead, UHead>,
        ...ReconcileTuple<TTail, UTail>,
      ]
  : never;

// prettier-ignore
type Reconcile<T, U> =
  T extends Primitive ? U extends Primitive
    ? T extends U ? U : T
    : T
  : T extends AnyReadStatus<[infer THead, ...infer TTail]>
    ? U extends AnyReadStatus<[infer UHead, ...infer UTail]>
      ? ReconcileTuple<[THead, ...TTail], [UHead, ...UTail]>
    : T
  : T extends AnyReadStatus<Array<infer TItem>>
    ? U extends AnyReadStatus<Array<infer UItem>>
      ? Array<NonContradictingSupertype<TItem, UItem>>
    : U extends AnyReadStatus<[infer UHead, ...infer UTail]>
      ? Array<NonContradictingSupertype<TItem, ToUnion<[UHead, ...UTail]>>>
    : T
  : T extends object
    ? U extends object ? ReconcileObjects<T, U>
    : T
  : T

type HandleDifferences<T extends Tuple, U extends Tuple> = T extends []
  ? ToUnion<U>
  : [T, U] extends [[infer TOnly], [infer UOnly]]
    ? Reconcile<TOnly, UOnly>
    : ToUnion<T>;

type Work<
  T,
  U,
  TTuple extends Tuple = h.Call<h.Unions.ToTuple, T>,
  UTuple extends Tuple = h.Call<h.Unions.ToTuple, U>,
> = [
  h.Pipe<TTuple, [h.Tuples.Partition<IsExtendedBySomethingIn<UTuple>>]>,
  h.Pipe<UTuple, [h.Tuples.Partition<ExtendsSomethingIn<TTuple>>]>,
] extends [
  [infer TExact, infer TDiff extends Tuple],
  [any, infer UDiff extends Tuple],
]
  ? h.Call<h.Tuples.ToUnion, TExact> | Prettify<HandleDifferences<TDiff, UDiff>>
  : never;

/**
 * Widens the the type of the second argument while still applying some restrictions from T.
 */
export type NonContradictingSupertype<T, U> =
  IsUnknown<T> extends true
    ? U
    : IsAny<T> extends true
      ? T
      : Prettify<Work<T, U>>;

type AnyReadStatus<T> = T | Readonly<T>;

type Primitive = string | number | boolean | symbol | bigint | null | undefined;
