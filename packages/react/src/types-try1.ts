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
  IsUnknown<T> extends true
    ? U
  : [T, U] extends [Primitive, Primitive]
    ? HandlePrimitives<T, U>
  : [T, U] extends [Primitive, any] | [any, Primitive]
    ? T
  // : NonDistributiveExtends<T, U> extends true
  //   ? U extends Readonly<infer B> ? B : U
  : [T, U] extends [Tuple, Tuple]
    ? HandleTuples<T, U>
  : [T, U] extends [Tuple, any] | [any, Tuple]
    ? T
  : [T, U] extends [AnyArray<infer TItem>, AnyArray<infer UItem>]
    ? IsNever<UItem> extends true // empty arrays can get inferred as never[]
      ? Array<TItem>
      : Array<NonContradictingSupertype<TItem, UItem>>
  : [T, U] extends [AnyArray, any] | [any, AnyArray]
    ? T
  : Prettify<HandleObjects<T, U>>;

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

/**
 * Finds the least common supertype with some restrictions.
 */
export type NonContradictingSupertype<T, U> = HandleDifferences<T, U>;
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

///////////
