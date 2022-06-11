import { MaybePromise, PossiblyPromise } from "./maybePromise";
import { Merge } from "./typeHelpers";

export type AnyMeta = Record<string | number | symbol, any>;
export type AnyMethods = Record<string, any>;
export type AnySchema = Schema<any, any, any, any>;
export type SchemaOf<T> = Schema<any, T, any, any>;

type SchemaType<Input, Output, Meta, Methods> = Schema<
  Input,
  Output,
  Meta,
  Methods
> &
  Methods;

type SchemaInput<T> = T extends BaseSchema<infer U, any, {}, {}> ? U : never;
type SchemaOutput<T> = T extends BaseSchema<any, infer U, {}, {}> ? U : never;
type SchemaMeta<T> = T extends BaseSchema<any, any, infer U, {}> ? U : never;
type SchemaMethods<T> = T extends BaseSchema<any, any, {}, infer U> ? U : never;

export class BaseSchema<
  Input,
  Output,
  Meta extends AnyMeta,
  Methods extends AnyMethods
> {
  protected _perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>;
  protected _methods: Methods;
  protected _meta: Meta;
  protected _parent: AnySchema | undefined;

  /**
   * The metadata of the schema.
   */
  get meta() {
    return this._meta;
  }

  protected constructor(
    perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>,
    meta: Meta,
    methods: Methods,
    parent?: Schema<Input, Output, Meta, Methods>
  ) {
    this._meta = meta;
    this._perform = perform;
    this._methods = methods;
    this._parent = parent;
  }
}

/**
 * A validation schema.
 */
export class Schema<
  Input,
  Output,
  Meta extends AnyMeta,
  Methods extends AnyMethods
> extends BaseSchema<Input, Output, Meta, Methods> {
  static of<Input, Output, Meta extends AnyMeta, Methods extends AnyMethods>(
    perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>,
    meta: Meta,
    methods: Methods,
    parent?: AnySchema
  ): Schema<Input, Output, Meta, Methods> & Methods {
    // There really isn't a way to do this in a truly typesafe way as far as I can tell.
    // Object.keys isn't typesafe, so we have to hand wave a bit here.
    return new Schema(perform, meta, methods, parent) as any;
  }

  private constructor(
    perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>,
    meta: Meta,
    methods: Methods,
    parent?: Schema<Input, Output, Meta, Methods>
  ) {
    super(perform, meta, methods, parent);

    for (const [key, value] of Object.entries(methods)) {
      Object.defineProperty(this, key, {
        value,
        writable: false,
      });
    }
  }

  /**
   * Add or change schema metadata. This creates a new schema with the updated metadata.
   *
   * @param nextMeta - Additonal meta to add to the schema's meta. Can also overwrite existing meta.
   * @returns A new schema with the updated meta.
   */
  withMeta<NextMeta extends AnyMeta>(
    nextMeta: NextMeta
  ): SchemaType<
    SchemaInput<this>,
    SchemaOutput<this>,
    Merge<SchemaMeta<this>, NextMeta>,
    SchemaMethods<this>
  > {
    return Schema.of(
      this._perform as any,
      { ...this.meta, ...nextMeta } as any,
      this._methods as any,
      this
    );
  }

  /**
   * Augment the schema with additional methods. This creates a new schema with the updated methods.
   *
   * @param nextMethods - Methods to add to the schema's methods. Can also overwrite existing methods.
   * @returns A new schema with the updated methods.
   */
  withMethods<NextMethods extends AnyMethods>(
    nextMethods: NextMethods
  ): SchemaType<
    SchemaInput<this>,
    SchemaOutput<this>,
    SchemaMeta<this>,
    Merge<SchemaMethods<this>, NextMethods>
  > {
    return Schema.of(
      this._perform as any,
      this.meta as SchemaMeta<this>,
      { ...this._methods, ...nextMethods } as any,
      this
    );
  }

  /**
   * Adds an additional check when validating.
   * Checks performed this way will not modify the output type.
   * This creates a new schema with the additional check..
   *
   * @param doCheck - A function that returns a boolean indicating whether the value is valid.
   * @param makeError - A function that returns an error message if the value is invalid.
   * @returns A new schema that validates the input using the given function.
   */
  check(
    doCheck: (val: Output, meta: Meta) => PossiblyPromise<boolean>,
    makeError: (val: Output, meta: Meta) => string
  ): this {
    return Schema.of<Input, Output, Meta, Methods>(
      (input, meta) =>
        this.validateMaybeAsync(input, meta).then((output) => {
          if (doCheck(output, meta)) return output;
          throw new Error(makeError(output, meta));
        }),
      this.meta,
      this._methods,
      this
    ) as this;
  }

  /**
   * Adds a transformation to the schema. This creates a new schema with the transformation applied.
   *
   * @param nextPerform - A function that returns a transformed value.
   * @returns A new schema that transforms the output of the original schema.
   */
  transform<NextOutput>(
    nextPerform: (input: Output, meta: Meta) => PossiblyPromise<NextOutput>
  ): SchemaType<
    SchemaInput<this>,
    NextOutput,
    SchemaMeta<this>,
    Record<string, never>
  > {
    return Schema.of<
      SchemaInput<this>,
      NextOutput,
      SchemaMeta<this>,
      Record<string, never>
    >(
      (input, meta) =>
        this.validateMaybeAsync(input, meta).then((output) =>
          nextPerform(output, meta)
        ),
      this.meta as SchemaMeta<this>,
      {},
      this
    );
  }

  /**
   * "Casts" the schema to another type of schema.
   * When validating, the output of the original schema will also be validated with the new schema.
   * This creates a new schema with all the methods of the provided schema, allowing you to continue chaining.
   * This is useful after a transform.
   *
   * @example The implementation of `toString` on the number schema works like this.
   * ```tsx
   * const schema = number().transform(num => String(num)).as(string());
   * ```
   *
   * @param castTo - Another schema to "cast" the value to.
   * @returns A new schema with all the methods and the output type of the given schema.
   */
  as<NextOutput, NextMeta extends AnyMeta, NextMethods extends AnyMethods>(
    castTo: Schema<Output, NextOutput, NextMeta, NextMethods>
  ): SchemaType<
    SchemaInput<this>,
    NextOutput,
    Merge<SchemaMeta<this>, NextMeta>,
    NextMethods
  > {
    return Schema.of<
      SchemaInput<this>,
      NextOutput,
      Merge<SchemaMeta<this>, NextMeta>,
      NextMethods
    >(
      (input, meta) =>
        this.validateMaybeAsync(input, meta).then((output) =>
          castTo.validateMaybeAsync(output, meta)
        ),
      { ...(this.meta as SchemaMeta<this>), ...castTo.meta },
      castTo._methods,
      this
    );
  }

  /**
   * Validates the input using the schema and returns a `MaybePromise` of the output.
   * This is primarily used for schemas that call other schemas (e.g. object()).
   *
   * @param input - The input to validate.
   * @param meta - Optionally override the metadata.
   * @returns A `MaybePromise` that resolves to the output of the schema.
   */
  validateMaybeAsync(
    input: Input,
    meta: AnyMeta = this.meta
  ): MaybePromise<Output> {
    return MaybePromise.of(() => this._perform(input, meta));
  }

  /**
   * Validates the input asynchronously and returns the data.
   *
   * @param input - The input to validate.
   * @returns A Promise that resolves to the output of the schema.
   */
  validate(input: Input): Promise<Output> {
    return this.validateMaybeAsync(input, this.meta).await();
  }

  /**
   * Validates the input synchronously and returns the data.
   * If the schema contains asynchronous validations, this will throw an error.
   *
   * @param input - The input to validate.
   * @returns The output of the schema
   */
  validateSync(input: Input): Output {
    return this.validateMaybeAsync(input, this.meta).assertSync();
  }
}

export const makeType = <Output, Methods extends AnyMethods>(
  doCheck: (val: unknown, meta: AnyMeta) => val is Output,
  makeError: (val: unknown, meta: AnyMeta) => string,
  methods: Methods
) =>
  Schema.of(
    (input: unknown, meta: AnyMeta) => {
      if (doCheck(input, meta)) return input;
      throw new Error(makeError(input, meta));
    },
    {},
    methods
  );
