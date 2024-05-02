type PathKey = string | number;

/**
 * Checks whether the type is any
 * See {@link https://stackoverflow.com/a/49928360/3406963}
 * @typeParam T - type which may be any
 * ```
 * IsAny<any> = true
 * IsAny<string> = false
 * ```
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

export type ValidStringPaths<Obj> = StringPaths<PathsOfObject<Obj, []>, true>;

export type ValidStringPathsToArrays<Obj> = StringPaths<
  PathsOfObject<Obj, [], Array<any>>,
  true
>;

type PathSegment<
  Segment extends PathKey,
  Root extends boolean,
> = Root extends true
  ? `${Segment}`
  : Segment extends number
    ? `[${Segment}]`
    : `.${Segment}`;

type StringPaths<
  Tuple extends PathKey[],
  Root extends boolean = false,
> = Tuple extends [infer Item extends PathKey]
  ? PathSegment<Item, Root>
  : Tuple extends [infer Head extends PathKey, ...infer Rest extends PathKey[]]
    ? `${PathSegment<Head, Root>}${StringPaths<Rest>}`
    : never;

type CoerceNumbers<Str extends string> =
  Str extends `${infer Num extends number}` ? Num : Str;

type NormalizePath<Str extends string> =
  Str extends `${infer Head}[${infer Prop extends number}]`
    ? `${Head}.${Prop}`
    : Str extends `${infer Head}[${infer Prop extends number}]${infer Tail}`
      ? `${Head}.${Prop}${NormalizePath<Tail>}`
      : Str;

type StringToPathTupleImpl<S extends string> =
  S extends `${infer Head}.${infer Tail}`
    ? [CoerceNumbers<Head>, ...StringToPathTupleImpl<Tail>]
    : [CoerceNumbers<S>];

export type StringToPathTuple<S extends string> = StringToPathTupleImpl<
  NormalizePath<S>
>;

type Path<Obj, Prefix extends Array<PathKey> = [], AssignableTo = any> =
  | (Obj extends AssignableTo ? Prefix : never)
  | (Obj extends Primitive
      ? never
      : IsAny<Obj> extends true // prevent infinite recursion when using `any` (usually for generic base types)
        ? never
        : Obj extends Array<infer Item>
          ? Path<Item, [...Prefix, number], AssignableTo>
          : PathsOfObject<Obj, Prefix, AssignableTo>);

type PathsOfObject<
  Obj,
  Prefix extends Array<PathKey>,
  AssignableTo = any,
> = Prefix["length"] extends 10
  ? never
  : {
      [K in keyof Obj]: K extends PathKey
        ? Path<Obj[K], [...Prefix, K], AssignableTo>
        : never;
    }[keyof Obj];

export type ValueAtPath<
  Obj,
  ObjPath extends Array<PathKey> = [],
> = ObjPath extends []
  ? Obj
  : ObjPath extends [infer Head, ...infer Tail]
    ? Tail extends Array<PathKey>
      ? Head extends keyof Obj
        ? ValueAtPath<Obj[Head], Tail>
        : never
      : never
    : never;

export type SupportsValueAtPath<Obj, P extends Array<PathKey>, Value> =
  Value extends ValueAtPath<Obj, P> ? Obj : never;

type Primitive = boolean | number | string | symbol | null | undefined;
