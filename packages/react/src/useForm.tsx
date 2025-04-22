import { useEffect, useState, useId, ComponentProps } from "react";
import * as h from "hotscript";
import {
  FieldValues,
  ValidationBehaviorConfig,
  Validator,
  FormScope,
  createFormScope,
  registerFormElementEvents,
  StateSubmitHandler,
  DomSubmitHandler,
  BeforeSubmitApi,
  withStandardSchema,
  // NonContradictingSupertype,
} from "@rvf/core";
import { FormApi, useFormInternal } from "./base";
import { FieldErrors } from "@rvf/core";
import { StandardSchemaV1 } from "@standard-schema/spec";

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

type ObjInfo<T> = T extends object
  ? {
      keys: keyof T;
      value: T;
    }
  : never;

type HandleObjects<
  T,
  U,
  TInfo = ObjInfo<T>,
  UInfo = ObjInfo<U>,
> = TInfo extends { keys: keyof U; value: T }
  ? UInfo extends { keys: keyof T; value: U }
    ? {
        [K in UInfo["keys"]]: NonContradictingSupertype<
          TInfo["value"][K],
          K extends keyof UInfo["value"] ? UInfo["value"][K] : never
        >;
      }
    : T
  : T;

// keyof T extends keyof U
//   ? keyof U extends keyof T
//     ? { [K in keyof U]: NonContradictingSupertype<T[K], U[K]> }
//     : { [K in keyof U]: U[K] }
//   : { [K in keyof T]: T[K] };

// {
//   [K in keyof T | keyof U]: K extends keyof T
//     ? K extends keyof U
//       ? NonContradictingSupertype<T[K], U[K]>
//       : T[K]
//     : K extends keyof U
//       ? U[K]
//       : never;
// };

type AnyReadStatus<T> = T | Readonly<T>;
type HandleTuples<T, U> = T extends [infer THead, ...infer TTail]
  ? U extends AnyReadStatus<[infer UHead, ...infer UTail]>
    ? [NonContradictingSupertype<THead, UHead>, ...HandleTuples<TTail, UTail>]
    : [THead, ...TTail]
  : T;

type Primitive = string | number | boolean | symbol | bigint | null | undefined;

type NonDistributiveExtends<One, Two> = One extends Two ? true : false;
// type HandlePrimitives<T, U> = [T, U] extends [infer FullT, infer FullU]
//   ? T extends Primitive
//     ? U extends Primitive
//       ? [FullT & Primitive] extends [FullU & Primitive]
//         ? U
//         : T
//       : T
//     : never
//   : never;
// type HandlePrimitives<T, U> = [T, U] extends [infer FullT, infer FullU]
//   ? T extends Primitive
//     ? U extends Primitive
//       ? [FullT & Primitive] extends [FullU & Primitive]
//         ? U
//         : T
//       : T
//     : never
//   : never;

type Tuple = AnyReadStatus<[any, ...any[]]>;
type AnyArray<T = any> = AnyReadStatus<Array<T>>;

// type asdf = HandlePrimitives<string | number, string | number | boolean>;

// type HandleDifferences<T, U> =
//   [T, U] extends [Primitive, Primitive]
//     ? HandlePrimitives<T, U>
//   : [T, U] extends [Primitive, any] | [any, Primitive]
//     ? T
//   // : NonDistributiveExtends<T, U> extends true
//   //   ? U extends Readonly<infer B> ? B : U

// type Test<T, U> = [T, U] extends [Primitive, Primitive]
//   ? { primitive: T } | { uPrimitive: U }
//   : T | U;

type Brand<T, B> = T & { __brand: B };

// type Expands<T, U> = (T extends Primitive
//   ? T extends U ? true : false
//   : keyof T extends keyof U ?
// ) extends true ? true : false
//

type IsTuple<T> = T extends [any, ...any[]] ? true : false;
type IsObject<T> = T extends object ? true : false;
type IsArray<T> = T extends Array<any> ? true : false;

type MaybeDont<A, B> = [A, B] extends [B, A] ? A : B;
// prettier-ignore
type HandleDifferences<T, U, All = T | U | (T & U)> =
  // ? [T] extends [U] ? U
  // ? T extends Primitive
  //   ? U extends Primitive
  //     ? [T] extends [U] ? U
  //     : T
  //   : T
  // ? [T & Primitive] extends [U & Primitive]
  //   ? U extends Primitive ? U
  //   : T extends Primitive ? T
  //   : never
  // U extends Primitive ? U extends T ? U : never
  // : T extends Primitive ? T
  // ? T extends Primitive ? U extends Primitive
  //   ? [U] extends [FullT] ? U | T : T
  // : IsNever<FullU> extends true ? never


  // All extends any
  // ? [All, All] extends [T, U] ? T extends All ? U extends All ? T : never : never
  All extends Tuple ? T extends Tuple ? U extends Tuple
    ? HandleTuples<T, U> : T : never

  : All extends AnyArray ? T extends AnyArray<infer TItem> ? U extends AnyArray<infer UItem>
    ? IsNever<UItem> extends true // empty arrays can get inferred as never[]
      ? Array<TItem>
      : Array<NonContradictingSupertype<TItem, UItem>>
    : T : never
  // : [T, U] extends [AnyArray<infer TItem>, AnyArray<infer UItem>]
  //   ? IsNever<UItem> extends true // empty arrays can get inferred as never[]
  //     ? Array<TItem>
  //     : Array<NonContradictingSupertype<TItem, UItem>>
  // : [T, U] extends [AnyArray, any] | [any, AnyArray]
  //   ? T
  : All extends object ? T extends object ? U extends object
    ? Prettify<HandleObj2<T, U>>
    : T : never
  : [T] extends [U] ? U : T
// : never;

type HandleObj2<T, U> = {
  [K in keyof T | keyof U]: K extends keyof T
    ? K extends keyof U
      ? NonContradictingSupertype<T[K], U[K]>
      : T[K]
    : never;
};
// : Prettify<HandleObjects<T, U>>;

type R = HandleDifferences<
  string | number | { foo: string } | { bar: number },
  string | number | boolean | { foo: string | number } | { bar: string }
>;

type R2 = HandleDifferences<{ foo: string }, { foo: number }>;
type R4 = HandleDifferences<
  { field: { foo: string } },
  { field: { foo: string } | null }
>;

type R3 = HandleDifferences<
  { foo: string; bar: string },
  { foo: number | string }
>;

// type OverrideType<T, U> = U extends {
//   [RVF_BRAND]: "normal";
//   __type: infer Inner;
// }
//   ? NonDistributiveExtends<T, U> extends true
//     ? Inner
//     : T
//   : U extends { [RVF_BRAND]: "force"; __type: infer Inner }
//     ? Inner
//     : never;

// prettier-ignore
type LeastCommonSupertype<T, U> =
  T extends Primitive ? T
  : U extends Primitive ? U
  // : [T, U] extends [Tuple, Tuple]
  //   ? HandleTuples<T, U> : T

  // : T extends AnyArray<infer TItem> ? U extends AnyArray<infer UItem>
  //   ? IsNever<UItem> extends true // empty arrays can get inferred as never[]
  //     ? Array<TItem>
  //     : Array<NonContradictingSupertype<TItem, UItem>>
  //   : T
  // // : [T, U] extends [AnyArray<infer TItem>, AnyArray<infer UItem>]
  // //   ? IsNever<UItem> extends true // empty arrays can get inferred as never[]
  // //     ? Array<TItem>
  // //     : Array<NonContradictingSupertype<TItem, UItem>>
  // // : [T, U] extends [AnyArray, any] | [any, AnyArray]
  // //   ? T
  : Prettify<{
    [K in keyof T | keyof U]:
      K extends keyof T
        ? K extends keyof U
          ? LeastCommonSupertype<T[K], U[K]>
          : T[K]
        : K extends keyof U
          ? U[K]
          : never
  }>

// prettier-ignore
type ShallowExtends<T, U, FullT = T, FullU = U> =
  // T extends Primitive
  //   ? U extends Primitive
  //     ? [TPrimitives] extends [UPrimitives] ? true
  //     : [UPrimitives] extends [TPrimitives] ? true
  //     : false
  //   : never
  T extends [infer THead, ...infer TTail]
    ? U extends [infer UHead, ...infer UTail]
      // should only do length
      ? ShallowExtends<THead, UHead> | ShallowExtends<TTail, UTail>
      : false
  : T extends AnyArray<infer TItem>
    ? U extends AnyArray<infer UItem>
      ? ShallowExtends<TItem, UItem>
      : false
  : T extends object
    ? U extends object
      ? [keyof T] extends [keyof U] ? true
      : [keyof U] extends [keyof T] ? true
      : false
    : false
  : [T] extends [FullU] ? true
  : [U] extends [FullT] ? true
  : false

interface Context {
  T: unknown;
  U: unknown;
  result: unknown;
}

interface Tuplize extends h.Fn {
  return: this["arg0"] extends { U: infer U; T: infer T; result: infer Result }
    ? {
        U: h.Call<h.Unions.ToTuple, U>;
        T: h.Call<h.Unions.ToTuple, T>;
        result: Result;
      }
    : never;
}

interface Mapper<U> extends h.Fn {
  return: this["arg0"] extends { U: infer U; T: infer T; result: infer Result }
    ? {
        U: h.Call<h.Unions.ToTuple, U>;
        T: h.Call<h.Unions.ToTuple, T>;
        result: Result;
      }
    : never;
}

type IsEqual<T, U> = [T, U] extends [U, T] ? true : false;
type Exact<T> = { type: "exact"; value: T };
interface IsExactMatch extends h.Fn {
  return: this["arg0"] extends Exact<any> ? true : false;
}

type SameShape<T> = { type: "sameShape"; value: T };
interface IsSameShape extends h.Fn {
  return: this["arg0"] extends SameShape<any> ? true : false;
}

type OverlappingShape<T> = { type: "overlappingShape"; value: T };
interface IsOverlappingShape extends h.Fn {
  return: this["arg0"] extends OverlappingShape<any> ? true : false;
}

type NoRelation<T> = { type: "noRelation"; value: T };
interface IsNoRelation extends h.Fn {
  return: this["arg0"] extends NoRelation<any> ? true : false;
}

type Equals<T, U> = h.Apply<h.Booleans.Equals<T, U>, []>;

interface GetRelationship extends h.Fn {
  return: Equals<this["arg0"], this["arg1"]> extends true
    ? Exact<this["arg1"]>
    : [this["arg0"], this["arg1"]] extends [object, object]
      ? IsNever<keyof this["arg0"] & keyof this["arg1"]> extends true
        ? NoRelation<this["arg1"]>
        : IsEqual<keyof this["arg0"], keyof this["arg1"]> extends true
          ? SameShape<this["arg1"]>
          : OverlappingShape<this["arg1"]>
      : NoRelation<this["arg1"]>;
}

// interface Zip extends h.Fn {
//   return: this["arg0"] extends { U: infer U; T: infer T; result: infer Result }
//     ? {
//         U: U;
//         T: T;
//         result: Result;
//         zipped: [U, T];
//       }
//     : never;
// }

interface IfElse<Condition extends h.Fn, Then extends h.Fn, Else extends h.Fn>
  extends h.Fn {
  cond: h.Apply<Condition, this["args"]>;
  return: IsNever<this["cond"]> extends true
    ? h.Call<Else, this["args"]>
    : this["cond"] extends [any, ...any[]]
      ? h.Call<Then, this["cond"]>
      : h.Apply<Else, this["args"]>;
}

interface IfElseChain<Cases, Else extends h.Fn = h.Identity> extends h.Fn {
  return: Cases extends [infer Head, ...infer Tail]
    ? Head extends [infer Condition extends h.Fn, infer Then extends h.Fn]
      ? h.Apply<IfElse<Condition, Then, IfElseChain<Tail>>, this["args"]>
      : never
    : h.Apply<Else, this["args"]>;
}

interface ExtractMatch extends h.Fn {
  return: this["arg0"] extends { value: infer T } ? T : never;
}

interface CrossCompare<U> extends h.Fn {
  return: h.Pipe<
    U,
    [
      h.Tuples.Map<h.PartialApply<GetRelationship, [this["arg0"]]>>,
      IfElseChain<
        [
          [
            h.Tuples.Filter<IsExactMatch>,
            h.Compose<[h.Tuples.Map<ExtractMatch>]>,
          ],
          [
            h.Tuples.Filter<IsSameShape>,
            h.Compose<[h.Tuples.Map<ExtractMatch>]>,
          ],
          [
            h.Tuples.Filter<IsOverlappingShape>,
            h.Compose<[h.Tuples.Map<ExtractMatch>]>,
          ],
        ]
      >,
      h.Tuples.ToUnion,
    ]
  >;
}

interface MapT extends h.Fn {
  return: this["arg0"] extends { U: infer U; T: infer T }
    ? h.Pipe<T, [h.Tuples.Map<CrossCompare<U>>, h.Tuples.ToUnion]>
    : never;
}

interface MapU extends h.Fn {
  return: this["arg0"] extends { U: infer U; T: infer T; result: infer Result }
    ? h.Pipe<T, [h.Tuples.Map<CrossCompare<U>>, h.Tuples.ToUnion]>
    : never;
}

interface AssignResult<fn extends h.Fn> extends h.Fn {
  return: [h.Apply<fn, this["args"]>, this["arg0"]] extends [
    infer R,
    { T: infer T; U: infer U; result: infer Result },
  ]
    ? {
        T: T;
        U: U;
        result: R | Result;
      }
    : never;
}

interface Prop<Prop> extends h.Fn {
  return: Prop extends keyof this["arg0"] ? this["arg0"][Prop] : never;
}

interface Set<Prop extends PropertyKey, fn extends h.Fn> extends h.Fn {
  return: [h.Apply<fn, this["args"]>] extends [infer R]
    ? Prettify<Omit<this["arg0"], Prop> & { [K in Prop]: R }>
    : never;
}

interface PipeProp<P extends PropertyKey, fns extends h.Fn[]> extends h.Fn {
  return: h.Pipe<this["arg0"], [Set<P, h.ComposeLeft<[Prop<P>, ...fns]>>]>;
}

// type Work<C extends Context> = h.Pipe<C, [Tuplize, AssignResult<MapT>]>;
type Work<C extends Context> = h.Pipe<
  C,
  [
    PipeProp<"T", [h.Unions.ToTuple]>,
    PipeProp<"U", [h.Unions.ToTuple]>,
    // [Set<"T", Prop<"U">>]
  ]
>;

type t1 = Work<{
  T: string;
  U: string | number;
  result: never;
}>;

/**
 * Finds the least common supertype with some restrictions.
 */
export type NonContradictingSupertype<T, U> =
  IsUnknown<T> extends true ? U : Work<{ T: T; U: U; result: never }>;
// : // : T extends U
//   //   ? U extends T
//   //     ? U
//   //     : T
//   HandleDifferences<T, U>;
// NonDistributiveExtends<U, { [RVF_BRAND]: any }> extends true
//   ? OverrideType<T, U>
//   : IsUnknown<T> extends true
//     ? U
//     : T extends U
//       ? U extends T
//         ? U
//         : HandleDifferences<T, U>
//       : HandleDifferences<T, U>;

// type R = NonContradictingSupertype<string | number, number | boolean>;
// type R1 = HandlePrimitives<string | number, number | boolean>;

// export const RVF_BRAND: unique symbol = Symbol("rvf");
// export const RVF_BRAND_FORCE: unique symbol = Symbol("rvf");

// export type OverrideValueType<T, Force extends boolean = false> = T & {
//   [RVF_BRAND]: Force extends true ? "force" : "default";
//   __type: T;
// };
//

///////////

const noOp = () => {};

type FormSubmitOpts<FormOutputData, ResponseData> =
  | {
      submitSource: "state";
      handleSubmit: StateSubmitHandler<FormOutputData, ResponseData>;
    }
  | {
      submitSource?: "dom";
      handleSubmit?: DomSubmitHandler<FormOutputData, ResponseData>;
    };

export type internal_BaseFormOpts<
  FormInputData extends FieldValues = FieldValues,
  FormOutputData = never,
  SubmitResponseData = unknown,
> = {
  /**
   * Called before when the form is submitted before any validations are run.
   * Can be used to run custom, async validations and/or cancel the form submission.
   */
  onBeforeSubmit?: (
    beforeSubmitApi: BeforeSubmitApi<FormInputData, FormOutputData>,
  ) => void | Promise<void>;

  /**
   * Called after the form has been successfully submitted with whatever data was returned from the `handleSubmit` function.
   * Can be useful for showing a toast message or redirecting the user to a different page.
   * If you return a `Promise` from this callback, the `isSubmitting` state will still be `true` while this callback is running.
   *
   * If you''t using `handleSubmit`.
   */
  onSubmitSuccess?: (
    handleSubmitResponse: NoInfer<SubmitResponseData>,
  ) => void | Promise<void>;

  /**
   * Called when the `handleSubmit` function throws an error.
   * Can be useful for showing a toast message or redirecting the user to a different page.
   * If you return a `Promise` from this callback, the `isSubmitting` state will still be `true` while this callback is running.
   *
   * If you're using an adapter like `@rvf/react-router`, this will be called even if you aren't using `handleSubmit`.
   */
  onSubmitFailure?: (error: unknown) => void | Promise<void>;

  /**
   * Called when the user attempts to submit the form with invalid data.
   * This is called after the first invalid field is focused.
   * Can be useful if you want to take deeper control over how you handle invalid forms.
   */
  onInvalidSubmit?: () => void | Promise<void>;

  /**
   * A shortcut setting that resets the form to the default values after the form has been successfully submitted.
   * This is equivalent to calling `resetForm` in the `onSubmitSuccess` callback.
   */
  resetAfterSubmit?: boolean;

  /**
   * Allows you to customize the validation behavior of the form.
   */
  validationBehaviorConfig?: ValidationBehaviorConfig;

  /**
   * The action prop of the form element.
   * This will be automatically set on the form element if you use `getFormProps`.
   */
  action?: string;

  /**
   * The id of the form element.
   * This will be automatically set on the form element if you use `getFormProps`.
   */
  id?: string;

  /**
   * Disables the default behavior of focusing the first invalid field when a submit fails due to validation errors.
   */
  disableFocusOnError?: boolean;

  /**
   * When set to true, a valid form will be submitted natively with a full page reload.
   * _Note_: This is only supported in the `dom` submit source.
   */
  reloadDocument?: boolean;

  /**
   * Optionally, you can pass other props to the form element here.
   * This is primarily useful for writing custom hooks around `useForm`.
   * For most use-cases, you can simply pass the props directly to the form element.
   */
  otherFormProps?: Omit<ComponentProps<"form">, "id" | "action">;

  /**
   * Can be used to set the default errors of the entire form.
   * This is most useful went integrating with server-side validation.
   *
   * **CAREFUL**: this will cause an update every time the identity of `serverValidationErrors` changes.
   * So make sure the identity of `serverValidationErrors` is stable.
   */
  serverValidationErrors?: FieldErrors;
};

export type internal_ValidatorAndDefaultValueOpts<
  SchemaInput extends FieldValues,
  SchemaOutput,
  DefaultValues extends FieldValues,
  FormInputData extends FieldValues,
> =
  | ({
      /**
       * A validator object created by a validation adapter such a `withZod` or `withYup`.
       * See [these docs](https://rvf-js.io/validation-library-support) for more details
       * and information on how to create a validator for other validation libraries.
       *
       * This option is soft-deprecated. For libraries that support Standard Schema,
       * we recommend passing the schema directly to the `schema` option.
       * For `yup`, the `withYup` adapter will eventually return a Standard Schema intead of a custom validator.
       * If you have a custom adapter, we recommend using this approach as well, if the library doesn't support Standard Schema.
       */
      validator: Validator<SchemaOutput>;

      /**
       * Sets the default values of the form.
       *
       * For Typescript users, `defaultValues` is one of the most important props you'll use.
       * The type of the object you pass here, will determine the type of the data you get
       * when interacting with the form. For example, `form.value('myField')` will be typed based on
       * the type of `defaultValues.myField`.
       *
       * It's recommended that you provide a default value for every field in the form.
       */
      defaultValues?: FormInputData;
    } & { schema?: never })
  | ({
      /**
       * A [Standard Schema](https://standardschema.dev/) compliant schema.
       * The input type of this schema will be used to help make `defaultValues` typesafe,
       * as well as determine the types when using the `FormApi` returned from this hook.
       */
      schema: StandardSchemaV1<SchemaInput, SchemaOutput>;
      // Adding this intersection lets us still get the correct output inferred
      // even if `defaultValues` isn't provided yet
    } & {
      /**
       * Sets the default values of the form.
       *
       * For Typescript users, `defaultValues` is one of the most important props you'll use.
       * The type of the object you pass here, will determine the type of the data you get
       * when interacting with the form. For example, `form.value('myField')` will be typed based on
       * the type of `defaultValues.myField`.
       *
       * It's recommended that you provide a default value for every field in the form.
       */
      defaultValues: NonContradictingSupertype<
        NoInfer<SchemaInput>,
        Readonly<DefaultValues>
      >;
    });

export type FormOpts<
  SchemaInput extends FieldValues = any,
  SchemaOutput = unknown,
  SubmitResponseData = unknown,
  DefaultValues extends FieldValues = SchemaInput,
  FormInputData extends FieldValues = NonContradictingSupertype<
    NoInfer<SchemaInput>,
    DefaultValues
  >,
> = internal_ValidatorAndDefaultValueOpts<
  SchemaInput,
  SchemaOutput,
  DefaultValues,
  FormInputData
> &
  internal_BaseFormOpts<
    NoInfer<FormInputData>,
    NoInfer<SchemaOutput>,
    SubmitResponseData
  > &
  FormSubmitOpts<NoInfer<SchemaOutput>, SubmitResponseData>;

const maybeThen = <T,>(
  maybePromise: T | Promise<T>,
  then: (value: T) => void,
) => {
  if (maybePromise instanceof Promise) {
    return maybePromise.then(then);
  } else {
    return then(maybePromise);
  }
};

/**
 * Create and use a `FormScope`.
 */
export function useForm<
  SchemaInput extends FieldValues = any,
  SchemaOutput = unknown,
  SubmitResponseData = unknown,
  const DefaultValues extends FieldValues = SchemaInput,
  FormInputData extends FieldValues = NonContradictingSupertype<
    NoInfer<SchemaInput>,
    DefaultValues
  >,
>(
  options: FormOpts<
    SchemaInput,
    SchemaOutput,
    SubmitResponseData,
    DefaultValues,
    FormInputData
  >,
): FormApi<FormInputData> {
  // everything from below
  const {
    handleSubmit: onSubmit,
    onSubmitSuccess,
    onSubmitFailure,
    onBeforeSubmit,
    onInvalidSubmit,
    submitSource,
    action,
    disableFocusOnError,
    serverValidationErrors,
    resetAfterSubmit,
    otherFormProps,
    reloadDocument,
    validationBehaviorConfig,
    id,
  } = options as any;

  const validator =
    "schema" in options && !!options.schema
      ? withStandardSchema(options.schema)
      : "validator" in options
        ? options.validator
        : (undefined as never);

  const defaultFormId = useId();
  const [form] = useState<FormScope<unknown>>(() => {
    const rvf = createFormScope({
      defaultValues: options.defaultValues ?? {},
      serverValidationErrors: serverValidationErrors ?? {},
      validator,
      onBeforeSubmit: onBeforeSubmit as never,
      onSubmit: onSubmit as never,
      onSubmitSuccess: (data) => {
        onSubmitSuccess?.(data);
        if (resetAfterSubmit) {
          const formElement = form.__store__.formRef.current;
          if (formElement) formElement.reset();
          else form.__store__.store.getState().reset();
        }
      },
      onInvalidSubmit: onInvalidSubmit ?? noOp,
      onSubmitFailure: onSubmitFailure ?? noOp,
      validationBehaviorConfig: validationBehaviorConfig,
      submitSource: submitSource ?? "dom",
      formProps: {
        action,
        id,
        ...otherFormProps,
      },
      flags: {
        disableFocusOnError: disableFocusOnError ?? false,
        reloadDocument: reloadDocument ?? false,
      },
      defaultFormId,
    });
    return rvf;
  });

  useEffect(() => {
    return registerFormElementEvents(form.__store__);
  }, [form.__store__]);

  const { initial, whenSubmitted, whenTouched } =
    validationBehaviorConfig ?? {};

  useEffect(() => {
    Object.assign(form.__store__.mutableImplStore, {
      validator: validator as any,
      onBeforeSubmit,
      onSubmit,
      onSubmitSuccess: (data: unknown) => {
        const successResult = onSubmitSuccess?.(data);
        return maybeThen(successResult, () => {
          if (resetAfterSubmit) {
            const formElement = form.__store__.formRef.current;
            if (formElement) formElement.reset();
            else form.__store__.store.getState().reset();
          }
        });
      },
      onInvalidSubmit,
      onSubmitFailure,
    });
  }, [
    validator,
    onSubmit,
    form.__store__.mutableImplStore,
    onSubmitSuccess,
    onSubmitFailure,
    form.__store__.store,
    resetAfterSubmit,
    form.__store__.formRef,
    onInvalidSubmit,
    onBeforeSubmit,
  ]);

  useEffect(() => {
    form.__store__.store.getState().syncOptions({
      submitSource: submitSource ?? "dom",
      validationBehaviorConfig:
        initial && whenSubmitted && whenTouched
          ? {
              initial,
              whenSubmitted,
              whenTouched,
            }
          : undefined,
      formProps: {
        action,
        id,
        ...otherFormProps,
      },
      flags: {
        disableFocusOnError: disableFocusOnError ?? false,
        reloadDocument: reloadDocument ?? false,
      },
    });
  }, [
    form.__store__.store,
    initial,
    submitSource,
    whenSubmitted,
    whenTouched,
    action,
    id,
    disableFocusOnError,
    otherFormProps,
    reloadDocument,
  ]);

  useEffect(() => {
    if (!serverValidationErrors) return;
    form.__store__.store
      .getState()
      .syncServerValidationErrors(serverValidationErrors ?? {});
  }, [serverValidationErrors, form.__store__.store]);

  return useFormInternal(form) as never;
}
