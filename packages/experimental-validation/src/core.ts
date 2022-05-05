import { MaybePromise, PossiblyPromise } from "./maybePromise";

/**
 * Some options
 *
 * const s = u
 *   .meta("label", "A label")
 *   .string()
 *   .check(s.minLength(3))
 *   .check(s.maxLength(4))
 *   .transform(s.toNumber)
 *   .check(n.max(999)));
 *
 * const s = u
 *   .label("A label")
 *   .string()
 *   .minLength(3)
 *   .maxLength(4)
 *   .toNumber()
 *   .as(numberSchema)
 *   .min(100);
 *   .max(9999);
 *
 * const s = string()
 *   .check(
 *     s.minLength(3),
 *     s.maxLength(4),
 *   )
 *   .transform(s.toNumber)
 *   .check(
 *     n.min(100),
 *     n.max(100),
 *   )
 *
 * const s = t(
 *   meta("label", "123")
 *   typecheck(val => typeof val === "string"),
 *   check(val => val.length > 3),
 *   transform(val => val.toNumber()),
 * )
 * which becomes
 * const s = t(
 *   label("123"),
 *   str,
 *   str.minLength(3),
 *   str.toNumber(),
 *   num.min(100),
 * )
 */

type AssertType<T, Meta extends AnyMeta = AnyMeta> = (
  value: unknown,
  meta: Meta
) => asserts value is T;
type Check<T, Meta extends AnyMeta = AnyMeta> = (
  value: T,
  meta: Meta
) => PossiblyPromise<void>;
type Transform<T, U, Meta = AnyMeta> = (
  value: T,
  meta: Meta
) => PossiblyPromise<U>;

type AnySchema = Schema<any, any, {}, {}>;
type AnyMeta = Record<any, any>;

type ChecksAndTransforms<InType> = Record<
  string,
  Check<InType> | Transform<InType, any>
>;

/**
 * Improves readability of the tooltip for object intersections.
 * Instead of { a: string } & { b: string } you can get { a: string, b: string }
 */
type MergeIntersection<T> = {} & { [K in keyof T]: T[K] };
type Merge<T, U> = MergeIntersection<Omit<T, keyof U> & U>;

type SchemaTypeAfterCheck<T extends AnySchema> = T extends Schema<
  infer TypeAfterCheck,
  any,
  {},
  {}
>
  ? TypeAfterCheck
  : never;

type SchemaTypeAfterTransform<T extends AnySchema> = T extends Schema<
  any,
  infer TypeAfterTransform,
  {},
  {}
>
  ? TypeAfterTransform
  : never;

type SchemaMeta<T extends AnySchema> = T extends Schema<
  any,
  any,
  infer Meta,
  {}
>
  ? Meta
  : never;

type SchemaMethods<T extends AnySchema> = T extends Schema<
  any,
  any,
  {},
  infer Methods
>
  ? Methods
  : never;

type SchemaOptions<
  TypeAfterCheck,
  TypeAfterTransform,
  Meta extends AnyMeta,
  Methods extends ChecksAndTransforms<TypeAfterCheck>
> = {
  parent?: AnySchema;
  typecheck: AssertType<TypeAfterCheck>;
  checks: Check<TypeAfterCheck>[];
  transform: Transform<TypeAfterCheck, TypeAfterTransform>;
  meta: Meta;
  methods: Methods;
};

const noOpTransform = <T>(value: T): T => value;

class Schema<
  TypeAfterCheck,
  TypeAfterTransform,
  Meta extends AnyMeta,
  Methods extends ChecksAndTransforms<TypeAfterCheck>
> {
  private _parent: AnySchema | undefined;
  private _typecheck: AssertType<TypeAfterCheck>;
  private _checks: Check<TypeAfterCheck>[];
  private _transform: Transform<TypeAfterCheck, TypeAfterTransform>;
  private _meta: Meta;
  private _methods: Methods;

  constructor({
    parent,
    typecheck,
    checks,
    transform,
    meta,
    methods,
  }: SchemaOptions<TypeAfterCheck, TypeAfterTransform, Meta, Methods>) {
    this._parent = parent;
    this._typecheck = typecheck;
    this._checks = checks;
    this._transform = transform;
    this._meta = meta;
    this._methods = methods;
  }

  validateMaybeAsync(
    input: unknown,
    meta: AnyMeta
  ): MaybePromise<TypeAfterTransform> {
    const combinedMeta = { ...this._meta, ...meta };
    const validateParent = () =>
      this._parent?.validateMaybeAsync?.(input, combinedMeta) ?? input;
    return MaybePromise.of(validateParent)
      .then((val) => {
        this._typecheck(val, combinedMeta);
        const checks = this._checks.map((check) => check(val, combinedMeta));
        return MaybePromise.all(checks).then(() => val);
      })
      .then((val) => this._transform(val, combinedMeta));
  }

  validateSync(input: unknown): TypeAfterTransform {
    try {
      return MaybePromise.of(() =>
        this.validateMaybeAsync(input, {})
      ).assertSync();
    } catch (err) {
      if (err instanceof Error) Error.captureStackTrace(err, this.validateSync);
      throw err;
    }
  }

  validateAsync(input: unknown): Promise<TypeAfterTransform> {
    return MaybePromise.of(() => this.validateMaybeAsync(input, {})).await();
  }

  check(
    check: Check<TypeAfterCheck, Meta>
  ): Schema<TypeAfterCheck, TypeAfterTransform, Meta, Methods> {
    return new Schema({
      typecheck: this._typecheck,
      checks: [...this._checks, check],
      meta: this._meta,
      methods: this._methods,
      transform: this._transform,
    });
  }
}

const makeType = <T>(typecheck: AssertType<T>) =>
  new Schema({
    typecheck,
    checks: [],
    transform: noOpTransform,
    meta: {},
    methods: {},
  });

///// Implementations

const unknownType = makeType<unknown>((value) => {});
const stringType = makeType<string>((value) => {
  if (typeof value !== "string") throw new Error("Expected string");
});
const numberType = makeType<number>((value) => {
  if (typeof value !== "number") throw new Error("Expected number");
});

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("types", () => {
    it("should typecheck", () => {
      expect(unknownType.validateSync("123")).toEqual("123");
      expect(stringType.validateSync("123")).toEqual("123");
      expect(() => stringType.validateSync(123)).toThrow();
      expect(numberType.validateSync(123)).toEqual(123);
      expect(() => numberType.validateSync("123")).toThrow();
    });

    it("should verify checks", () => {
      const s = numberType
        .check((val) => {
          if (val > 10) throw new Error("Can't be more than 10");
        })
        .check((val) => {
          if (val < 5) throw new Error("Can't be less than 5");
        });
      expect(() => s.validateSync(11)).toThrow();
      expect(s.validateSync(10)).toEqual(10);
      expect(s.validateSync(5)).toEqual(5);
      expect(() => s.validateSync(4)).toThrow();
    });
  });
}
